import uuid
from sqlalchemy import Column, String, DateTime, Text, text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from src.models.base import Base

class ModerationReport(Base):
    __tablename__ = "moderation_reports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=text("gen_random_uuid()"))
    reporter_id = Column(UUID(as_uuid=True), nullable=False)
    target_type = Column(String(20), nullable=False)
    target_id = Column(UUID(as_uuid=True), nullable=False)
    reason = Column(String(50), nullable=False)
    description = Column(String(500), nullable=True)
    status = Column(String(20), nullable=False, default="pending")
    priority = Column(String(10), nullable=False, default="standard")
    assigned_to = Column(UUID(as_uuid=True), nullable=True)
    resolution = Column(String(50), nullable=True)
    resolution_notes = Column(Text, nullable=True)
    resolved_by = Column(UUID(as_uuid=True), nullable=True)
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())

class ModerationAction(Base):
    __tablename__ = "moderation_actions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=text("gen_random_uuid()"))
    admin_id = Column(UUID(as_uuid=True), nullable=False)
    target_user_id = Column(UUID(as_uuid=True), nullable=True)
    target_content_type = Column(String(20), nullable=True)
    target_content_id = Column(UUID(as_uuid=True), nullable=True)
    action_type = Column(String(30), nullable=False)
    reason = Column(Text, nullable=False)
    metadata_json = Column(JSONB, nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
