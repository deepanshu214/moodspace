import uuid
from sqlalchemy import Column, String, Boolean, DateTime, Text, text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from src.models.base import Base

class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=text("gen_random_uuid()"))
    type = Column(String(20), nullable=False, default="direct")
    last_message_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())

class ConversationParticipant(Base):
    __tablename__ = "conversation_participants"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=text("gen_random_uuid()"))
    conversation_id = Column(UUID(as_uuid=True), nullable=False)
    user_id = Column(UUID(as_uuid=True), nullable=False)
    is_muted = Column(Boolean, nullable=False, default=False)
    last_read_message_id = Column(UUID(as_uuid=True), nullable=True)
    joined_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())

class Message(Base):
    __tablename__ = "messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=text("gen_random_uuid()"))
    conversation_id = Column(UUID(as_uuid=True), nullable=False)
    sender_id = Column(UUID(as_uuid=True), nullable=False)
    encrypted_content = Column(Text, nullable=False)
    encryption_metadata = Column(JSONB, nullable=False)
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
