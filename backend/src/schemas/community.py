from pydantic import BaseModel, Field, model_validator
from typing import Optional, List
from uuid import UUID
from datetime import datetime

# Communities
class CommunityCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=50)
    description: str = Field(..., max_length=500)
    category: str
    privacy: str = Field(default="public", description="public, restricted, private")
    rules: Optional[str] = None
    welcome_message: Optional[str] = None

class CommunityResponse(BaseModel):
    id: UUID
    name: str
    description: str
    category: str
    privacy: str
    rules: Optional[str]
    welcome_message: Optional[str]
    creator_id: UUID
    member_count: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

# Memberships
class MembershipResponse(BaseModel):
    id: UUID
    community_id: UUID
    user_id: UUID
    role: str
    status: str
    joined_at: datetime

    class Config:
        from_attributes = True

# Posts
class PostCreate(BaseModel):
    content: str
    post_type: str = "discussion"
    is_anonymous: bool = False
    has_content_warning: bool = False

class PostResponse(BaseModel):
    id: UUID
    community_id: UUID
    # Optional because an anonymous post has no author to report.
    user_id: Optional[UUID] = None
    post_type: str
    content: str
    is_anonymous: bool
    has_content_warning: bool
    is_pinned: bool
    reaction_count: int
    comment_count: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

    @model_validator(mode="after")
    def redact_anonymous_author(self):
        """
        An anonymous post must not carry its author's id.

        The UI already renders these as "Wandering Spirit", so shipping the id
        made the anonymity cosmetic: it links straight back to the same
        person's signed posts.
        """
        if self.is_anonymous:
            self.user_id = None
        return self
