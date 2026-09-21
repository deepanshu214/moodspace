import json

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session
from src.config.database import get_db
from src.api.deps import get_current_user
from src.schemas.map import BoundingBox, HeatmapResponse, GlobalPulseResponse
from src.services.map_service import get_emotional_heatmap, get_global_pulse
from src.models.user import User

router = APIRouter(tags=["Global Emotional Map"])

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


@router.get("/hotspots")
def get_hotspots(
    radius_km: float = Query(2.0, ge=0.2, le=50.0),
    min_bubbles: int = Query(2, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Live emotional clusters: public bubbles that have not dissolved, grouped by
    proximity with PostGIS ST_ClusterDBSCAN and labelled with their dominant
    emotion. This is what the app calls a "hotspot".
    """
    from src.services.mood_service import purge_dissolved_bubbles

    purge_dissolved_bubbles(db)

    # eps is in degrees; ~111km per degree of latitude is close enough for
    # neighbourhood-sized clusters and keeps the query index-friendly.
    eps_degrees = radius_km / 111.0

    sql = """
        WITH live AS (
            SELECT e.id,
                   e.location_geom,
                   e.location_city,
                   em.primary_emotion,
                   em.intensity
            FROM mood_entries e
            JOIN mood_emotions em ON em.mood_entry_id = e.id
            WHERE e.privacy_level IN ('public', 'community')
              AND e.location_geom IS NOT NULL
              AND (e.expires_at IS NULL OR e.expires_at > now())
        ),
        clustered AS (
            SELECT *,
                   ST_ClusterDBSCAN(location_geom, eps := :eps, minpoints := 1)
                       OVER () AS cluster_id
            FROM live
        ),
        ranked AS (
            SELECT cluster_id,
                   primary_emotion,
                   COUNT(*) AS emotion_count,
                   ROW_NUMBER() OVER (PARTITION BY cluster_id ORDER BY COUNT(*) DESC) AS rn
            FROM clustered
            GROUP BY cluster_id, primary_emotion
        )
        SELECT c.cluster_id,
               COUNT(*) AS bubble_count,
               AVG(c.intensity) AS avg_intensity,
               ST_Y(ST_Centroid(ST_Collect(c.location_geom))) AS latitude,
               ST_X(ST_Centroid(ST_Collect(c.location_geom))) AS longitude,
               MAX(c.location_city) AS city,
               MAX(r.primary_emotion) AS dominant_emotion
        FROM clustered c
        JOIN ranked r ON r.cluster_id = c.cluster_id AND r.rn = 1
        GROUP BY c.cluster_id
        HAVING COUNT(*) >= :min_bubbles
        ORDER BY bubble_count DESC
        LIMIT 20
    """

    from sqlalchemy import text as _text

    rows = db.execute(_text(sql), {"eps": eps_degrees, "min_bubbles": min_bubbles}).mappings().all()

    hotspots = [
        {
            "id": f"hotspot-{row['cluster_id']}",
            "latitude": float(row["latitude"]) if row["latitude"] is not None else None,
            "longitude": float(row["longitude"]) if row["longitude"] is not None else None,
            "city": row["city"],
            "bubble_count": int(row["bubble_count"]),
            "dominant_emotion": row["dominant_emotion"],
            "avg_intensity": round(float(row["avg_intensity"]), 1) if row["avg_intensity"] is not None else None,
        }
        for row in rows
    ]

    return {"success": True, "data": {"hotspots": hotspots}}
