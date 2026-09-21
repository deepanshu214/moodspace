import json
import uuid as uuid_lib
from typing import Any, List

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import func

from src.api.deps import CurrentUser, SessionDep
from src.models.mood import PinnedAnchor
from src.schemas.mood import AnchorCreate

router = APIRouter()


def _serialize(db, anchor: PinnedAnchor) -> dict:
    latitude = longitude = None
    if anchor.location_geom is not None:
        raw = db.scalar(func.ST_AsGeoJSON(anchor.location_geom))
        if raw:
            try:
                coords = json.loads(raw).get("coordinates")
                if coords:
                    longitude, latitude = coords[0], coords[1]
            except (ValueError, TypeError):
                pass

    return {
        "id": str(anchor.id),
        "label": anchor.label,
        "city": anchor.city,
        "note": anchor.note,
        "emotion": anchor.emotion,
        "latitude": latitude,
        "longitude": longitude,
        "drops_count": anchor.drops_count,
        "created_at": anchor.created_at.isoformat() if anchor.created_at else None,
    }


@router.get("")
def list_anchors(db: SessionDep, current_user: CurrentUser) -> Any:
    """Places this person has pinned, most-visited first."""
    anchors = (
        db.query(PinnedAnchor)
        .filter(PinnedAnchor.user_id == current_user.id)
        .order_by(PinnedAnchor.drops_count.desc(), PinnedAnchor.created_at.desc())
        .all()
    )
    return {"success": True, "data": {"anchors": [_serialize(db, a) for a in anchors]}}


@router.post("", status_code=status.HTTP_201_CREATED)
def create_anchor(db: SessionDep, current_user: CurrentUser, anchor_in: AnchorCreate) -> Any:
    """
    Pin a place. Pinning somewhere already pinned bumps its drop count instead
    of creating a duplicate row.
    """
    existing = (
        db.query(PinnedAnchor)
        .filter(PinnedAnchor.user_id == current_user.id, PinnedAnchor.label == anchor_in.label)
        .first()
    )
    if existing:
        existing.drops_count += 1
        if anchor_in.note:
            existing.note = anchor_in.note
        if anchor_in.emotion:
            existing.emotion = anchor_in.emotion
        db.commit()
        db.refresh(existing)
        return _serialize(db, existing)

    geom = None
    if anchor_in.latitude is not None and anchor_in.longitude is not None:
        geom = f"SRID=4326;POINT({anchor_in.longitude} {anchor_in.latitude})"

    anchor = PinnedAnchor(
        user_id=current_user.id,
        label=anchor_in.label,
        city=anchor_in.city,
        note=anchor_in.note,
        emotion=anchor_in.emotion,
        location_geom=geom,
        drops_count=1,
    )
    db.add(anchor)
    db.commit()
    db.refresh(anchor)
    return _serialize(db, anchor)


@router.delete("/{anchor_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_anchor(anchor_id: str, db: SessionDep, current_user: CurrentUser) -> None:
    try:
        anchor_uuid = uuid_lib.UUID(anchor_id)
    except ValueError:
        raise HTTPException(status_code=422, detail="invalid anchor id")

    anchor = db.query(PinnedAnchor).filter(PinnedAnchor.id == anchor_uuid).first()
    if not anchor:
        raise HTTPException(status_code=404, detail="Anchor not found")
    if anchor.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your anchor")

    db.delete(anchor)
    db.commit()
