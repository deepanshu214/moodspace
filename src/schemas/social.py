from pydantic import BaseModel, Field
from typing import Optional, List
from uuid import UUID
from datetime import datetime

# Reactions
class ReactionCreate(BaseModel):
    target_type: str = Field(..., description="E.g., 'mood_entry', 'post', 'comment'")
    target_id: UUID
    reaction_type: str = Field(..., description="One of: heart, hug, strength, understanding, inspiration, growth")

class ReactionResponse(BaseModel):
    id: UUID
    user_id: UUID
    target_type: str
    target_id: UUID
    reaction_type: str
    created_at: datetime

    class Config:
        from_attributes = True

# Connections (Requests)
class ConnectionRequestCreate(BaseModel):
    recipient_id: UUID
    message: Optional[str] = None

class ConnectionRespond(BaseModel):
    action: str = Field(..., description="'accept' or 'decline'")

class ConnectionResponse(BaseModel):
    id: UUID
    requester_id: UUID
    recipient_id: UUID
    status: str
    message: Optional[str]
    responded_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True

# Follows
class FollowCreate(BaseModel):
    followed_id: UUID

class FollowResponse(BaseModel):
    id: UUID
    follower_id: UUID
    followed_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

# Comments
class CommentCreate(BaseModel):
    target_type: str = Field(..., description="E.g., 'mood_entry', 'post'")
    target_id: UUID
    parent_comment_id: Optional[UUID] = None
    content: str = Field(..., max_length=500)
    is_anonymous: bool = False

class CommentResponse(BaseModel):
    id: UUID
    user_id: UUID
    target_type: str
    target_id: UUID
    parent_comment_id: Optional[UUID]
    content: str
    is_anonymous: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
