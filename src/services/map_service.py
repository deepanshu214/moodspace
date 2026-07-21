from sqlalchemy.orm import Session
from sqlalchemy import func, text
from src.models.mood import MoodEntry, MoodEmotion
from src.schemas.map import BoundingBox, HeatmapDataPoint, HeatmapResponse, GlobalPulseResponse
from datetime import datetime, timedelta

def get_emotional_heatmap(db: Session, bbox: BoundingBox, days: int = 7) -> HeatmapResponse:
    # Query to fetch aggregated emotions within the bounding box
    # Since PostGIS geometry ST_X is lon, ST_Y is lat.
    # We will approximate this using ST_MakeEnvelope if available, 
    # but since SQLAlchemy might be tricky without full geoalchemy mapping,
    # we can use ST_MakeEnvelope directly via func.
    
    time_threshold = datetime.utcnow() - timedelta(days=days)

    # We need to get the dominant emotion per location or just aggregate points
    # For a heatmap, we want points with their dominant emotion
    
    query = db.query(
        func.ST_Y(MoodEntry.location_geom).label('lat'),
        func.ST_X(MoodEntry.location_geom).label('lon'),
        MoodEmotion.primary_emotion,
        func.avg(MoodEmotion.intensity).label('avg_intensity'),
        func.count(MoodEntry.id).label('count')
    ).join(
        MoodEmotion, MoodEntry.id == MoodEmotion.mood_entry_id
    ).filter(
        MoodEntry.privacy_level != 'private',
        MoodEntry.created_at >= time_threshold,
        MoodEntry.location_geom.isnot(None),
        func.ST_Intersects(
            func.ST_SetSRID(MoodEntry.location_geom, 4326), 
            func.ST_MakeEnvelope(bbox.min_lon, bbox.min_lat, bbox.max_lon, bbox.max_lat, 4326)
        )
    ).group_by(
        func.ST_Y(MoodEntry.location_geom),
        func.ST_X(MoodEntry.location_geom),
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
        MoodEntry.privacy_level != 'private',
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
        MoodEntry.privacy_level != 'private',
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
