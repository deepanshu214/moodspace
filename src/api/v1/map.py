from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from src.config.database import get_db
from src.api.deps import get_current_user
from src.schemas.map import BoundingBox, HeatmapResponse, GlobalPulseResponse
from src.services.map_service import get_emotional_heatmap, get_global_pulse
from src.models.user import User

router = APIRouter(prefix="/map", tags=["Global Emotional Map"])

@router.get("/heatmap", response_model=HeatmapResponse)
def get_heatmap(
    min_lon: float = Query(..., ge=-180, le=180),
    min_lat: float = Query(..., ge=-90, le=90),
    max_lon: float = Query(..., ge=-180, le=180),
    max_lat: float = Query(..., ge=-90, le=90),
    days: int = Query(7, ge=1, le=30),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get aggregated emotional data for a geographical bounding box.
    """
    bbox = BoundingBox(
        min_lon=min_lon,
        min_lat=min_lat,
        max_lon=max_lon,
        max_lat=max_lat
    )
    return get_emotional_heatmap(db, bbox, days)

@router.get("/pulse", response_model=GlobalPulseResponse)
def get_pulse(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get the global emotional pulse over the last 24 hours.
    """
    return get_global_pulse(db)
