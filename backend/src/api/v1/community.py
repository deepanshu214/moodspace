from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List

from src.config.database import get_db
from src.api.deps import get_current_user
from src.models.user import User
from src.schemas.community import CommunityResponse, PostCreate, PostResponse
from src.services.community_service import get_communities, get_community_posts, create_community_post

router = APIRouter()

@router.get("", response_model=List[CommunityResponse])
def read_communities(
    skip: int = 0, 
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Browse available public communities."""
    return get_communities(db, skip=skip, limit=limit)

@router.get("/{community_id}/posts", response_model=List[PostResponse])
def read_community_posts(
    community_id: UUID,
    skip: int = 0, 
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get the feed of posts for a specific community."""
    return get_community_posts(db, community_id, skip=skip, limit=limit)

@router.post("/{community_id}/posts", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
def create_post(
    community_id: UUID,
    post: PostCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new post in a community."""
    return create_community_post(
        db, 
        current_user.id, 
        community_id, 
        post.content, 
        post.post_type, 
        post.is_anonymous, 
        post.has_content_warning
    )
