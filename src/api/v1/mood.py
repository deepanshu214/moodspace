from typing import Any
from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from src.api.deps import CurrentUser, SessionDep
from src.schemas.mood import MoodCreate, MoodCheckinResponse, MoodResponse
from src.models.mood import MoodEntry, MoodEmotion, MoodContextTag
from src.core.security import encrypt_note, decrypt_note
from src.services.mood_service import analyze_crisis_risk, generate_supportive_message, get_crisis_resources

router = APIRouter()

@router.post("/checkin", response_model=MoodCheckinResponse, status_code=status.HTTP_201_CREATED)
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
    entry = MoodEntry(
        user_id=current_user.id,
        privacy_level=mood_in.privacy_level,
        journal_note_encrypted=encrypted_note,
        journal_note_iv=note_iv,
        location_geom=geom_point,
        weather_condition=mood_in.weather_condition,
        weather_temp_celsius=mood_in.weather_temp_celsius
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
    
    return response


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
    skip = (page - 1) * limit
    entries = db.query(MoodEntry).filter(MoodEntry.user_id == current_user.id)\
        .order_by(MoodEntry.created_at.desc()).offset(skip).limit(limit).all()
        
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
    latitude: float = Query(..., ge=-90, le=90),
    longitude: float = Query(..., ge=-180, le=180),
    radius_km: float = Query(5.0, ge=0.1, le=50.0)
) -> Any:
    """
    Find public/community mood bubbles nearby using PostGIS ST_DWithin.
    radius is converted to meters (approx) for geographic queries.
    """
    # Create the center point
    center_pt = f"SRID=4326;POINT({longitude} {latitude})"
    radius_meters = radius_km * 1000
    
    # Query using PostGIS ST_DWithin against the geography type
    # Since we defined it as Geometry, we cast to Geography to do accurate meter distance
    entries = db.query(MoodEntry).filter(
        MoodEntry.privacy_level.in_(["public", "community"]),
        func.ST_DWithin(
            func.Geography(MoodEntry.location_geom),
            func.Geography(func.ST_GeomFromText(center_pt, 4326)),
            radius_meters
        )
    ).order_by(MoodEntry.created_at.desc()).limit(50).all()
    
    results = []
    for entry in entries:
        # Note: We NEVER decrypt the journal note for nearby queries unless authorized,
        # but for safety we don't expose it at all here.
        results.append({
            "id": entry.id,
            "user_id": entry.user_id,
            "created_at": entry.created_at,
            "emotions": [{"primary": e.primary_emotion, "secondary": e.secondary_emotion, "intensity": e.intensity} for e in entry.emotions]
        })
        
    return {"success": True, "data": {"bubbles": results}}
