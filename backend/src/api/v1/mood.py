import os
import uuid as uuid_lib
from datetime import datetime, timedelta, timezone
from typing import Any, Optional

from fastapi import APIRouter, File, Form, HTTPException, Query, UploadFile, status
from sqlalchemy.orm import Session
from sqlalchemy import func, or_

from src.api.deps import CurrentUser, SessionDep
from src.schemas.mood import MoodCreate, MoodCheckinResponse, MoodResponse
from src.models.mood import MoodEntry, MoodEmotion, MoodContextTag, MoodAttachment
from src.models.user import User
from src.core.security import encrypt_note, decrypt_note
from src.services.mood_service import (
    analyze_crisis_risk,
    generate_supportive_message,
    get_crisis_resources,
    purge_dissolved_bubbles,
    live_bubbles_filter,
    media_url_for,
    save_upload,
    MAX_PHOTO_BYTES,
    MAX_VOICE_BYTES,
)

router = APIRouter()

@router.post("/checkin", status_code=status.HTTP_201_CREATED)
def create_mood_checkin(
    *,
    db: SessionDep,
    current_user: CurrentUser,
    mood_in: MoodCreate
) -> Any:
    """
    Create a new mood check-in with optional geospatial location and encrypted journal note.
    """
    # 1. Analyze for crisis (unencrypted)
    is_crisis = analyze_crisis_risk(mood_in.journal_note)
    
    # 2. Encrypt journal note
    encrypted_note = None
    note_iv = None
    if mood_in.journal_note:
        encrypted_note, note_iv = encrypt_note(mood_in.journal_note)
        
    # 3. Handle Geospatial Point
    geom_point = None
    if mood_in.location:
        # PostGIS uses Lon/Lat order for ST_MakePoint
        geom_point = f"SRID=4326;POINT({mood_in.location.longitude} {mood_in.location.latitude})"
        
    # 4. Create Entry
    #    A bubble floats for expires_in_hours and then dissolves; 0/None keeps
    #    it indefinitely (a private journal entry rather than a map bubble).
    expires_at = None
    if mood_in.expires_in_hours:
        expires_at = datetime.now(timezone.utc) + timedelta(hours=mood_in.expires_in_hours)

    entry = MoodEntry(
        user_id=current_user.id,
        privacy_level=mood_in.privacy_level,
        journal_note_encrypted=encrypted_note,
        journal_note_iv=note_iv,
        location_geom=geom_point,
        location_city=mood_in.city,
        weather_condition=mood_in.weather_condition,
        weather_temp_celsius=mood_in.weather_temp_celsius,
        is_incognito=mood_in.is_incognito,
        expires_at=expires_at,
    )
    db.add(entry)
    db.flush() # Get the entry ID for relationships
    
    # 5. Add Emotions
    for e in mood_in.emotions:
        db.add(MoodEmotion(
            mood_entry_id=entry.id,
            primary_emotion=e.primary,
            secondary_emotion=e.secondary,
            intensity=e.intensity
        ))
        
    # 6. Add Context Tags
    if mood_in.context_tags:
        for tag in mood_in.context_tags:
            db.add(MoodContextTag(mood_entry_id=entry.id, tag=tag, is_custom=False))
            
    if mood_in.custom_tags:
        for tag in mood_in.custom_tags:
            db.add(MoodContextTag(mood_entry_id=entry.id, tag=tag, is_custom=True))
            
    db.commit()
    db.refresh(entry)
    
    # 7. Build Response
    primary_emotion = mood_in.emotions[0].primary
    intensity = mood_in.emotions[0].intensity
    
    response = MoodCheckinResponse(
        mood_entry=MoodResponse(
            id=entry.id,
            user_id=entry.user_id,
            emotions=mood_in.emotions,
            context_tags=mood_in.context_tags or [],
            privacy_level=entry.privacy_level,
            journal_excerpt=mood_in.journal_note[:100] + "..." if mood_in.journal_note and len(mood_in.journal_note) > 100 else mood_in.journal_note,
            created_at=entry.created_at
        ),
        crisis_detected=is_crisis,
        supportive_message=None if is_crisis else generate_supportive_message(primary_emotion, intensity),
        crisis_resources=get_crisis_resources() if is_crisis else None
    )

    # The app reads the bubble's own fields off the top level; the nested
    # mood_entry and crisis_* keys above stay exactly as they were.
    payload = response.model_dump()
    payload.update({
        "id": str(entry.id),
        "user_id": str(entry.user_id),
        "primary_emotion": primary_emotion,
        "secondary_emotion": mood_in.emotions[0].secondary,
        "intensity": intensity,
        "notes": mood_in.journal_note,
        "city": entry.location_city,
        "weather_condition": entry.weather_condition,
        "weather_temp": entry.weather_temp_celsius,
        "is_incognito": entry.is_incognito,
        "latitude": mood_in.location.latitude if mood_in.location else None,
        "longitude": mood_in.location.longitude if mood_in.location else None,
        "tags": (mood_in.context_tags or []) + (mood_in.custom_tags or []),
        "attachments": [],
        "reactions_count": 0,
        "comments_count": 0,
        "created_at": entry.created_at.isoformat() if entry.created_at else None,
        "expires_at": entry.expires_at.isoformat() if entry.expires_at else None,
    })

    return payload


@router.get("/history")
def get_mood_history(
    db: SessionDep,
    current_user: CurrentUser,
    page: int = 1,
    limit: int = 20
) -> Any:
    """
    Get user's mood check-in history.
    """
    purge_dissolved_bubbles(db)

    skip = (page - 1) * limit
    entries = db.query(MoodEntry).filter(
        MoodEntry.user_id == current_user.id,
        live_bubbles_filter(),
    ).order_by(MoodEntry.created_at.desc()).offset(skip).limit(limit).all()
        
    # Decrypt notes for the owner
    results = []
    for entry in entries:
        decrypted = None
        if entry.journal_note_encrypted and entry.journal_note_iv:
            decrypted = decrypt_note(entry.journal_note_encrypted, entry.journal_note_iv)
            
        results.append({
            "id": entry.id,
            "created_at": entry.created_at,
            "privacy_level": entry.privacy_level,
            "journal_excerpt": decrypted[:100] + "..." if decrypted and len(decrypted) > 100 else decrypted,
            "emotions": [{"primary": e.primary_emotion, "secondary": e.secondary_emotion, "intensity": e.intensity} for e in entry.emotions]
        })
        
    return {"success": True, "data": {"entries": results}}


@router.get("/nearby")
def get_nearby_moods(
    db: SessionDep,
    current_user: CurrentUser,
    latitude: Optional[float] = Query(None, ge=-90, le=90),
    longitude: Optional[float] = Query(None, ge=-180, le=180),
    lat: Optional[float] = Query(None, ge=-90, le=90),
    lng: Optional[float] = Query(None, ge=-180, le=180),
    radius_km: float = Query(5.0, ge=0.1, le=50.0),
) -> Any:
    """
    Find public/community mood bubbles nearby using PostGIS ST_DWithin.
    radius is converted to meters (approx) for geographic queries.

    Accepts latitude/longitude or the shorter lat/lng the app sends.
    """
    center_lat = latitude if latitude is not None else lat
    center_lng = longitude if longitude is not None else lng
    if center_lat is None or center_lng is None:
        raise HTTPException(status_code=422, detail="latitude/longitude (or lat/lng) are required")

    # Bubbles past their dissolve time are gone for good, not just hidden.
    purge_dissolved_bubbles(db)

    center_pt = f"SRID=4326;POINT({center_lng} {center_lat})"
    radius_meters = radius_km * 1000

    # Query using PostGIS ST_DWithin against the geography type
    # Since we defined it as Geometry, we cast to Geography to do accurate meter distance
    entries = db.query(MoodEntry).filter(
        MoodEntry.privacy_level.in_(["public", "community"]),
        live_bubbles_filter(),
        func.ST_DWithin(
            func.Geography(MoodEntry.location_geom),
            func.Geography(func.ST_GeomFromText(center_pt, 4326)),
            radius_meters
        )
    ).order_by(MoodEntry.created_at.desc()).limit(50).all()

    # Resolve author names in one query rather than per bubble.
    author_ids = {e.user_id for e in entries}
    authors = {}
    if author_ids:
        for u in db.query(User).filter(User.id.in_(author_ids)).all():
            authors[u.id] = u

    results = []
    for entry in entries:
        # A cloaked bubble never leaks its author's name or avatar, and an
        # unknown author falls back to the same anonymous persona rather than
        # exposing a raw user id.
        author = authors.get(entry.user_id)
        if entry.is_incognito or not author:
            author_name = "Wandering Spirit"
            author_avatar = None
        else:
            author_name = author.display_name
            author_avatar = author.avatar_url

        # A public bubble's note is the post itself, so it is shown. Anything
        # narrower than public stays sealed here, whoever is asking.
        note = None
        if entry.privacy_level == "public" and entry.journal_note_encrypted and entry.journal_note_iv:
            note = decrypt_note(entry.journal_note_encrypted, entry.journal_note_iv)

        point = db.scalar(func.ST_AsGeoJSON(entry.location_geom)) if entry.location_geom is not None else None
        coords = None
        if point:
            import json as _json
            try:
                coords = _json.loads(point).get("coordinates")
            except Exception:
                coords = None

        emotion = entry.emotions[0] if entry.emotions else None
        results.append({
            "id": str(entry.id),
            "user_id": str(entry.user_id),
            "author_name": author_name,
            "author_avatar": author_avatar,
            "primary_emotion": emotion.primary_emotion if emotion else "neutral",
            "secondary_emotion": emotion.secondary_emotion if emotion else None,
            "intensity": emotion.intensity if emotion else 5,
            "notes": note,
            "city": entry.location_city,
            "weather_condition": entry.weather_condition,
            "weather_temp": entry.weather_temp_celsius,
            "is_incognito": entry.is_incognito,
            "latitude": coords[1] if coords else None,
            "longitude": coords[0] if coords else None,
            "tags": [t.tag for t in entry.context_tags],
            "attachments": [
                {
                    "id": str(a.id),
                    "kind": a.kind,
                    "url": media_url_for(a.storage_path),
                    "mime_type": a.mime_type,
                    "duration_ms": a.duration_ms,
                }
                for a in entry.attachments
            ],
            "reactions_count": 0,
            "comments_count": 0,
            "created_at": entry.created_at.isoformat() if entry.created_at else None,
            "expires_at": entry.expires_at.isoformat() if entry.expires_at else None,
            # kept for the original nested clients
            "emotions": [
                {"primary": e.primary_emotion, "secondary": e.secondary_emotion, "intensity": e.intensity}
                for e in entry.emotions
            ],
        })

    return {"success": True, "data": {"bubbles": results}}


@router.post("/{entry_id}/attachments", status_code=status.HTTP_201_CREATED)
async def attach_keepsake(
    entry_id: str,
    db: SessionDep,
    current_user: CurrentUser,
    file: UploadFile = File(...),
    kind: str = Form("photo"),
    duration_ms: Optional[int] = Form(None),
) -> Any:
    """
    Attach a photo or voice keepsake to one of your own bubbles.
    """
    if kind not in ("photo", "voice"):
        raise HTTPException(status_code=422, detail="kind must be 'photo' or 'voice'")

    try:
        entry_uuid = uuid_lib.UUID(entry_id)
    except ValueError:
        raise HTTPException(status_code=422, detail="invalid bubble id")

    entry = db.query(MoodEntry).filter(MoodEntry.id == entry_uuid).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Bubble not found")
    if entry.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only attach keepsakes to your own bubble")

    limit = MAX_PHOTO_BYTES if kind == "photo" else MAX_VOICE_BYTES
    stored_path, size, mime = await save_upload(file, kind=kind, limit_bytes=limit)

    attachment = MoodAttachment(
        mood_entry_id=entry.id,
        user_id=current_user.id,
        kind=kind,
        storage_path=stored_path,
        mime_type=mime,
        byte_size=size,
        duration_ms=duration_ms,
    )
    db.add(attachment)
    db.commit()
    db.refresh(attachment)

    return {
        "id": str(attachment.id),
        "kind": attachment.kind,
        "url": media_url_for(attachment.storage_path),
        "mime_type": attachment.mime_type,
        "duration_ms": attachment.duration_ms,
    }
