from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from uuid import UUID

class SupportUserView(BaseModel):
    id: UUID
    email: EmailStr
    display_name: str
    status: str
    role: str
    subscription_tier: str
    onboarding_completed: bool
    locale: str
    last_active_at: Optional[datetime]
    created_at: datetime
    # Note: No private data like bio, dob, or avatars here to protect privacy

class SuspendUserRequest(BaseModel):
    reason: str = Field(..., min_length=10, max_length=500)
    duration_days: Optional[int] = Field(None, ge=1, le=365) # If None, permanent ban
