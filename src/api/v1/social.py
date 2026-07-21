from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List

from src.db.session import get_db
from src.api.deps import get_current_user
from src.models.user import User
from src.schemas.social import (
    ReactionCreate, ReactionResponse,
    ConnectionRequestCreate, ConnectionResponse, ConnectionRespond,
    CommentCreate, CommentResponse
)
from src.services.social_service import react_to_target, send_connection_request, respond_connection_request, add_comment

router = APIRouter()

@router.post("/reactions", response_model=ReactionResponse, status_code=status.HTTP_201_CREATED)
def create_reaction(
    reaction: ReactionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """React to a mood entry, post, or comment with empathy."""
    res = react_to_target(db, current_user.id, reaction.target_type, reaction.target_id, reaction.reaction_type)
    if res is None:
        raise HTTPException(status_code=204, detail="Reaction removed")
    return res

@router.post("/connections/request", response_model=ConnectionResponse, status_code=status.HTTP_201_CREATED)
def request_connection(
    req: ConnectionRequestCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send a connection request to another user."""
    return send_connection_request(db, current_user.id, req.recipient_id, req.message)

@router.post("/connections/{connection_id}/respond", response_model=ConnectionResponse)
def respond_connection(
    connection_id: UUID,
    res: ConnectionRespond,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Accept or decline a connection request."""
    return respond_connection_request(db, connection_id, current_user.id, res.action)

@router.post("/comments", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
def create_comment(
    comment: CommentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Leave a supportive comment."""
    return add_comment(
        db, 
        current_user.id, 
        comment.target_type, 
        comment.target_id, 
        comment.content, 
        comment.is_anonymous, 
        comment.parent_comment_id
    )
