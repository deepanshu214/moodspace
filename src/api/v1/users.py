from typing import Any
from fastapi import APIRouter
from sqlalchemy.orm import Session

from src.api.deps import CurrentUser, SessionDep
from src.schemas.user import UserResponse, UserUpdate

router = APIRouter()

@router.get("/me", response_model=UserResponse)
def read_user_me(current_user: CurrentUser) -> Any:
    """
    Get current user profile.
    """
    return current_user

@router.patch("/me", response_model=UserResponse)
def update_user_me(
    user_in: UserUpdate, db: SessionDep, current_user: CurrentUser
) -> Any:
    """
    Update current user profile.
    """
    if user_in.display_name is not None:
        current_user.display_name = user_in.display_name
    if user_in.bio is not None:
        current_user.bio = user_in.bio
    if user_in.avatar_url is not None:
        current_user.avatar_url = user_in.avatar_url
        
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user
