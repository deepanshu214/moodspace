from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime
from uuid import UUID

class EmotionCreate(BaseModel):
    primary: str
    secondary: str
    intensity: int = Field(ge=1, le=10)

class Location(BaseModel):
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)

class MoodCreate(BaseModel):
    emotions: List[EmotionCreate] = Field(min_length=1, max_length=5)
    context_tags: Optional[List[str]] = Field(default=None, max_length=10)
    custom_tags: Optional[List[str]] = Field(default=None, max_length=5)
    journal_note: Optional[str] = Field(default=None, max_length=2000)
    privacy_level: str = Field(default="private", pattern="^(private|friends|community|public)$")
    location: Optional[Location] = None
    city: Optional[str] = Field(default=None, max_length=100)
    weather_condition: Optional[str] = None
    weather_temp_celsius: Optional[int] = None
    is_incognito: bool = False
    # Bubbles dissolve after this many hours. 0 or None keeps it forever
    # (journal entries); the map defaults to a 24 hour float.
    expires_in_hours: Optional[int] = Field(default=24, ge=0, le=720)


class AttachmentResponse(BaseModel):
    id: UUID
    kind: str
    url: str
    mime_type: Optional[str] = None
    duration_ms: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)


class AnchorCreate(BaseModel):
    label: str = Field(min_length=1, max_length=80)
    city: Optional[str] = Field(default=None, max_length=120)
    note: Optional[str] = Field(default=None, max_length=400)
    emotion: Optional[str] = Field(default=None, max_length=30)
    latitude: Optional[float] = Field(default=None, ge=-90, le=90)
    longitude: Optional[float] = Field(default=None, ge=-180, le=180)


class AnchorResponse(BaseModel):
    id: UUID
    label: str
    city: Optional[str] = None
    note: Optional[str] = None
    emotion: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    drops_count: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class EmotionResponse(BaseModel):
    primary: str
    secondary: str
    intensity: int
    
    model_config = ConfigDict(from_attributes=True)

class MoodResponse(BaseModel):
    id: UUID
    user_id: UUID
    emotions: List[EmotionResponse]
    context_tags: List[str]
    privacy_level: str
    journal_excerpt: Optional[str] = None
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class MoodCheckinResponse(BaseModel):
    mood_entry: MoodResponse
    crisis_detected: bool
    supportive_message: Optional[str] = None
    crisis_resources: Optional[dict] = None
