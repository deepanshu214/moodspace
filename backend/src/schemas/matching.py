from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from uuid import UUID
from src.schemas.user import PublicUserResponse

class MatchedUser(BaseModel):
    user: PublicUserResponse
    shared_emotion: str
    match_score: float # 0 to 1

class UserMatchResponse(BaseModel):
    matches: List[MatchedUser]
    generated_at: datetime = Field(default_factory=datetime.utcnow)

class MoodReplayPoint(BaseModel):
    date: datetime
    primary_emotion: str
    intensity: int
    context: Optional[str] = None

class MoodReplayResponse(BaseModel):
    timeline: List[MoodReplayPoint]
    top_emotion_overall: str
    average_intensity: float
    start_date: datetime
    end_date: datetime
