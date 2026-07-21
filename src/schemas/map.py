from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from uuid import UUID

class BoundingBox(BaseModel):
    min_lon: float = Field(..., ge=-180, le=180)
    min_lat: float = Field(..., ge=-90, le=90)
    max_lon: float = Field(..., ge=-180, le=180)
    max_lat: float = Field(..., ge=-90, le=90)

class HeatmapDataPoint(BaseModel):
    lat: float
    lon: float
    dominant_emotion: str
    intensity: int
    count: int

class HeatmapResponse(BaseModel):
    points: List[HeatmapDataPoint]
    generated_at: datetime = Field(default_factory=datetime.utcnow)

class GlobalPulseResponse(BaseModel):
    dominant_emotion_global: str
    average_intensity: float
    total_checkins_24h: int
    most_supportive_city: Optional[str] = None
    generated_at: datetime = Field(default_factory=datetime.utcnow)
