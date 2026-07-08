from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime
from uuid import UUID

class AuthorResponse(BaseModel):
    id: UUID
    display_name: str
    avatar_url: Optional[str] = None

class FeedContent(BaseModel):
    emotions: List[Dict[str, Any]]
    journal_excerpt: Optional[str] = None
    context_tags: List[str] = []

class FeedReaction(BaseModel):
    total: int = 0
    types: Dict[str, int] = {}
    user_reacted: List[str] = []

class FeedItemResponse(BaseModel):
    type: str
    id: UUID
    author: Optional[AuthorResponse] = None
    content: Dict[str, Any]
    reactions: Optional[FeedReaction] = None
    comment_count: int = 0
    created_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)

class FeedPagination(BaseModel):
    page: int
    limit: int
    has_next: bool
    next_cursor: Optional[str] = None

class FeedResponse(BaseModel):
    items: List[FeedItemResponse]
    pagination: FeedPagination
