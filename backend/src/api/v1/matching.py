from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from src.config.database import get_db
from src.api.deps import get_current_user
from src.schemas.matching import UserMatchResponse, MoodReplayResponse
from src.services.matching_service import find_emotional_matches, get_mood_replay
from src.models.user import User

router = APIRouter(prefix="/matching", tags=["AI Matching & Journeys"])

@router.get("/people-like-you", response_model=UserMatchResponse)
def get_people_like_you(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Find users who have shared similar emotional states in the last 3 days.
    """
    return find_emotional_matches(db, current_user.id)

@router.get("/replay", response_model=MoodReplayResponse)
def get_replay(
    months: int = Query(6, ge=1, le=12),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generate a mood replay timeline for the user's emotional journey.
    """
    return get_mood_replay(db, current_user.id, months)
