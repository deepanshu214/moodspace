from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.config.database import get_db
from src.api.deps import get_current_user
from src.models.user import User
from src.schemas.support import SupportUserView, SuspendUserRequest
from src.services.support_service import get_user_for_support, suspend_user, force_logout_user
from uuid import UUID

router = APIRouter(tags=["Customer Support"])

@router.get("/users/{user_id}", response_model=SupportUserView)
def get_user(
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get user profile data for support agent view.
    Strips out sensitive and personal data.
    """
    return get_user_for_support(db, user_id, current_user)

@router.post("/users/{user_id}/suspend")
def suspend_account(
    user_id: UUID,
    req: SuspendUserRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Suspend or permanently ban a user account.
    """
    return suspend_user(db, user_id, req, current_user)

@router.post("/users/{user_id}/logout")
def force_logout(
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Force logout a user by invalidating all active sessions.
    """
    return force_logout_user(db, user_id, current_user)
