import uuid
from sqlalchemy import Column, String, Boolean, Integer, DateTime, Text, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from src.models.base import Base

class Community(Base):
    __tablename__ = "communities"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=text("gen_random_uuid()"))
    name = Column(String(50), nullable=False)
    description = Column(String(500), nullable=False)
    category = Column(String(50), nullable=False)
    privacy = Column(String(20), nullable=False, default="public")
    rules = Column(Text, nullable=True)
    welcome_message = Column(String(500), nullable=True)
    creator_id = Column(UUID(as_uuid=True), nullable=False)
    member_count = Column(Integer, nullable=False, default=0)
    status = Column(String(20), nullable=False, default="pending_review")
    approved_at = Column(DateTime(timezone=True), nullable=True)
    approved_by = Column(UUID(as_uuid=True), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())

class CommunityMembership(Base):
    __tablename__ = "community_memberships"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=text("gen_random_uuid()"))
    community_id = Column(UUID(as_uuid=True), nullable=False)
    user_id = Column(UUID(as_uuid=True), nullable=False)
    role = Column(String(20), nullable=False, default="member")
    status = Column(String(20), nullable=False, default="active")
    muted_until = Column(DateTime(timezone=True), nullable=True)
    joined_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())

class Post(Base):
    __tablename__ = "posts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=text("gen_random_uuid()"))
    community_id = Column(UUID(as_uuid=True), nullable=False)
    user_id = Column(UUID(as_uuid=True), nullable=False)
    post_type = Column(String(20), nullable=False, default="discussion")
    content = Column(Text, nullable=False)
    is_anonymous = Column(Boolean, nullable=False, default=False)
    has_content_warning = Column(Boolean, nullable=False, default=False)
    is_pinned = Column(Boolean, nullable=False, default=False)
    is_locked = Column(Boolean, nullable=False, default=False)
    reaction_count = Column(Integer, nullable=False, default=0)
    comment_count = Column(Integer, nullable=False, default=0)
    moderation_status = Column(String(20), nullable=False, default="published")
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())
