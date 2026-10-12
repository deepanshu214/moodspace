from sqlalchemy.orm import Session
from sqlalchemy import func, text
from src.models.mood import MoodEntry, MoodEmotion
from src.schemas.map import BoundingBox, HeatmapDataPoint, HeatmapResponse, GlobalPulseResponse
from src.services.mood_service import live_bubbles_filter
from datetime import datetime, timedelta

# Only these two levels are shareable. `!= 'private'` reads equivalent but is
# not: privacy_level also accepts 'friends', which a blacklist silently lets
# through to strangers.
SHAREABLE_PRIVACY = ['public', 'community']

# Heatmap cells, in degrees (~1.1 km). Check-ins are snapped to this grid
# before aggregation: a heatmap needs density, not somebody's front door, and
# grouping on the raw point made every count-of-1 row an exact GPS fix.
HEATMAP_GRID_DEGREES = 0.01

def get_emotional_heatmap(db: Session, bbox: BoundingBox, days: int = 7) -> HeatmapResponse:
    # Query to fetch aggregated emotions within the bounding box
    # Since PostGIS geometry ST_X is lon, ST_Y is lat.
    # We will approximate this using ST_MakeEnvelope if available, 
    # but since SQLAlchemy might be tricky without full geoalchemy mapping,
    # we can use ST_MakeEnvelope directly via func.
    
    time_threshold = datetime.utcnow() - timedelta(days=days)

    # We need to get the dominant emotion per location or just aggregate points
    # For a heatmap, we want points with their dominant emotion
    
    cell = func.ST_SnapToGrid(MoodEntry.location_geom, HEATMAP_GRID_DEGREES)

    query = db.query(
        func.ST_Y(cell).label('lat'),
        func.ST_X(cell).label('lon'),
        MoodEmotion.primary_emotion,
        func.avg(MoodEmotion.intensity).label('avg_intensity'),
        func.count(MoodEntry.id).label('count')
    ).join(
        MoodEmotion, MoodEntry.id == MoodEmotion.mood_entry_id
    ).filter(
        MoodEntry.privacy_level.in_(SHAREABLE_PRIVACY),
        MoodEntry.is_incognito.is_(False),
        MoodEntry.deleted_at.is_(None),
        live_bubbles_filter(),
        MoodEntry.created_at >= time_threshold,
        MoodEntry.location_geom.isnot(None),
        func.ST_Intersects(
            func.ST_SetSRID(MoodEntry.location_geom, 4326), 
            func.ST_MakeEnvelope(bbox.min_lon, bbox.min_lat, bbox.max_lon, bbox.max_lat, 4326)
        )
    ).group_by(
        func.ST_Y(cell),
        func.ST_X(cell),
        MoodEmotion.primary_emotion
    ).all()

    points = []
    for row in query:
        points.append(HeatmapDataPoint(
            lat=row.lat,
            lon=row.lon,
            dominant_emotion=row.primary_emotion,
            intensity=int(row.avg_intensity),
            count=row.count
        ))
        
    return HeatmapResponse(points=points)


def get_global_pulse(db: Session) -> GlobalPulseResponse:
    time_threshold = datetime.utcnow() - timedelta(hours=24)
    
    # Calculate global dominant emotion
    dominant = db.query(
        MoodEmotion.primary_emotion,
        func.avg(MoodEmotion.intensity).label('avg_intensity'),
        func.count(MoodEntry.id).label('count')
    ).join(
        MoodEntry, MoodEntry.id == MoodEmotion.mood_entry_id
    ).filter(
        MoodEntry.privacy_level.in_(SHAREABLE_PRIVACY),
        MoodEntry.deleted_at.is_(None),
        MoodEntry.created_at >= time_threshold
    ).group_by(
        MoodEmotion.primary_emotion
    ).order_by(
        func.count(MoodEntry.id).desc()
    ).first()

    if not dominant:
        return GlobalPulseResponse(
            dominant_emotion_global="Calm",
            average_intensity=5.0,
            total_checkins_24h=0,
            most_supportive_city=None
        )

    # Find the most active city
    city = db.query(
        MoodEntry.location_city,
        func.count(MoodEntry.id).label('count')
    ).filter(
        MoodEntry.privacy_level.in_(SHAREABLE_PRIVACY),
        MoodEntry.deleted_at.is_(None),
        MoodEntry.created_at >= time_threshold,
        MoodEntry.location_city.isnot(None)
    ).group_by(
        MoodEntry.location_city
    ).order_by(
        func.count(MoodEntry.id).desc()
    ).first()

    return GlobalPulseResponse(
        dominant_emotion_global=dominant.primary_emotion,
        average_intensity=float(dominant.avg_intensity),
        total_checkins_24h=dominant.count,
        most_supportive_city=city.location_city if city else None
    )
