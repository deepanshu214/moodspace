import uuid
from sqlalchemy import Column, String, Boolean, Date, DateTime, Text, text, Time
from sqlalchemy.dialects.postgresql import UUID, INET, JSONB
from sqlalchemy.sql import func
from src.models.base import Base

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=text("gen_random_uuid()"))
    email = Column(String(254), unique=True, nullable=False)
    email_verified = Column(Boolean, nullable=False, default=False)
    password_hash = Column(String(255), nullable=True)
    display_name = Column(String(50), nullable=False)
    avatar_url = Column(String(500), nullable=True)
    bio = Column(String(200), nullable=True)
    date_of_birth = Column(Date, nullable=False)
    status = Column(String(20), nullable=False, default="pending_verification")
    role = Column(String(20), nullable=False, default="user")
    subscription_tier = Column(String(20), nullable=False, default="free")
    subscription_expires_at = Column(DateTime(timezone=True), nullable=True)
    onboarding_completed = Column(Boolean, nullable=False, default=False)
    two_factor_enabled = Column(Boolean, nullable=False, default=False)
    two_factor_secret = Column(String(255), nullable=True)
    recovery_codes = Column(Text, nullable=True)
    locale = Column(String(10), nullable=False, default="en-US")
    timezone = Column(String(50), nullable=True)
    last_active_at = Column(DateTime(timezone=True), nullable=True)
    suspended_until = Column(DateTime(timezone=True), nullable=True)
    suspension_reason = Column(Text, nullable=True)
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())

class UserSocialAccount(Base):
    __tablename__ = "user_social_accounts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=text("gen_random_uuid()"))
    user_id = Column(UUID(as_uuid=True), nullable=False)
    provider = Column(String(20), nullable=False)
    provider_user_id = Column(String(255), nullable=False)
    provider_email = Column(String(254), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())

class UserSession(Base):
    __tablename__ = "user_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=text("gen_random_uuid()"))
    user_id = Column(UUID(as_uuid=True), nullable=False)
    refresh_token_hash = Column(String(255), nullable=False)
    device_name = Column(String(100), nullable=True)
    device_os = Column(String(50), nullable=True)
    browser = Column(String(50), nullable=True)
    ip_address = Column(INET, nullable=True)
    location_city = Column(String(100), nullable=True)
    location_country = Column(String(10), nullable=True)
    last_active_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())

class UserSetting(Base):
    __tablename__ = "user_settings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=text("gen_random_uuid()"))
    user_id = Column(UUID(as_uuid=True), unique=True, nullable=False)
    profile_visibility = Column(String(20), nullable=False, default="friends_only")
    default_mood_privacy = Column(String(20), nullable=False, default="private")
    mood_matching_enabled = Column(Boolean, nullable=False, default=False)
    searchable_profile = Column(Boolean, nullable=False, default=True)
    read_receipts_enabled = Column(Boolean, nullable=False, default=False)
    online_status_visible = Column(Boolean, nullable=False, default=False)
    activity_status_visible = Column(Boolean, nullable=False, default=False)
    ai_insights_enabled = Column(Boolean, nullable=False, default=True)
    research_data_enabled = Column(Boolean, nullable=False, default=False)
    location_enabled = Column(Boolean, nullable=False, default=False)
    theme = Column(String(10), nullable=False, default="system")
    quiet_hours_start = Column(Time, nullable=True, default="22:00:00")
    quiet_hours_end = Column(Time, nullable=True, default="08:00:00")
    notification_mood_reminders = Column(Boolean, nullable=False, default=True)
    notification_social = Column(Boolean, nullable=False, default=True)
    notification_messages = Column(Boolean, nullable=False, default=True)
    notification_community = Column(Boolean, nullable=False, default=True)
    notification_wellness = Column(Boolean, nullable=False, default=True)
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())
