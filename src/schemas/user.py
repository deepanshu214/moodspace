from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional
from datetime import datetime
from uuid import UUID

class UserBase(BaseModel):
    email: EmailStr
    display_name: str = Field(min_length=2, max_length=50)
    
class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=128)
    date_of_birth: datetime

class UserUpdate(BaseModel):
    display_name: Optional[str] = Field(None, min_length=2, max_length=50)
    bio: Optional[str] = Field(None, max_length=500)
    avatar_url: Optional[str] = None

class UserResponse(UserBase):
    id: UUID
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    status: str
    role: str
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    
class TokenPayload(BaseModel):
    sub: Optional[str] = None
