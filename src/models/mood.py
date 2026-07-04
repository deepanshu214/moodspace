import uuid
from sqlalchemy import Column, String, Boolean, SmallInteger, DateTime, Text, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from pgvector.sqlalchemy import Vector
from geoalchemy2 import Geometry
from src.models.base import Base

class MoodEntry(Base):
    __tablename__ = "mood_entries"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=text("gen_random_uuid()"))
    user_id = Column(UUID(as_uuid=True), nullable=False)
    privacy_level = Column(String(20), nullable=False, default="private")
    journal_note_encrypted = Column(Text, nullable=True)
    journal_note_iv = Column(String(50), nullable=True)
    location_city = Column(String(100), nullable=True)
    location_country = Column(String(10), nullable=True)
    location_geom = Column(Geometry('POINT'), nullable=True) # geospatial feature
    weather_condition = Column(String(30), nullable=True)
    weather_temp_celsius = Column(SmallInteger, nullable=True)
    device_platform = Column(String(20), nullable=True)
    is_edited = Column(Boolean, nullable=False, default=False)
    embedding = Column(Vector(1536), nullable=True) # vector feature for AI
    edited_at = Column(DateTime(timezone=True), nullable=True)
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())

class MoodEmotion(Base):
    __tablename__ = "mood_emotions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=text("gen_random_uuid()"))
    mood_entry_id = Column(UUID(as_uuid=True), nullable=False)
    primary_emotion = Column(String(30), nullable=False)
    secondary_emotion = Column(String(30), nullable=False)
    intensity = Column(SmallInteger, nullable=False)

class MoodContextTag(Base):
    __tablename__ = "mood_context_tags"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=text("gen_random_uuid()"))
    mood_entry_id = Column(UUID(as_uuid=True), nullable=False)
    tag = Column(String(30), nullable=False)
    is_custom = Column(Boolean, nullable=False, default=False)
