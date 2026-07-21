from typing import Any
from fastapi import APIRouter
from sqlalchemy.orm import Session

from src.api.deps import CurrentUser, SessionDep
from src.schemas.feed import FeedResponse
from src.models.mood import MoodEntry

router = APIRouter()

@router.get("/", response_model=FeedResponse)
def get_feed(
    db: SessionDep,
    current_user: CurrentUser,
    page: int = 1,
    limit: int = 10
) -> Any:
    """
    Get the user's personalized emotional feed.
    (Simplified chronological feed of public/friends posts for Stage 3)
    """
    skip = (page - 1) * limit
    
    # In a full implementation, this would query a complex FeedScore algorithm
    # For now, we return recent public entries
    entries = db.query(MoodEntry).filter(
        MoodEntry.privacy_level.in_(["public", "community"])
    ).order_by(MoodEntry.created_at.desc()).offset(skip).limit(limit).all()
    
    items = []
    for entry in entries:
        # Avoid sending encrypted journal note.
        # If it was a friend's post, we'd check permission to decrypt.
        
        items.append({
            "type": "shared_mood",
            "id": entry.id,
            "author": {
                "id": entry.user_id,
                "display_name": "Anonymous User", # Mock for privacy unless explicitly shared
            },
            "content": {
                "emotions": [{"primary": e.primary_emotion, "secondary": e.secondary_emotion, "intensity": e.intensity} for e in entry.emotions],
                "context_tags": [tag.tag for tag in entry.context_tags]
            },
            "created_at": entry.created_at
        })
        
    return {
        "items": items,
        "pagination": {
            "page": page,
            "limit": limit,
            "has_next": len(items) == limit
        }
    }
