from sqlalchemy.orm import Session
from src.models.user import User, UserSession
from src.schemas.support import SupportUserView, SuspendUserRequest
from src.api.exceptions import ResourceNotFoundError, AuthorizationError, BusinessLogicError
from datetime import datetime, timedelta
from uuid import UUID

def get_user_for_support(db: Session, user_id: UUID, agent: User) -> SupportUserView:
    if agent.role not in ["admin", "moderator"]:
        raise AuthorizationError("Only support agents can access this information.")
        
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise ResourceNotFoundError("User not found")
        
    return SupportUserView(
        id=user.id,
        email=user.email,
        display_name=user.display_name,
        status=user.status,
        role=user.role,
        subscription_tier=user.subscription_tier,
        onboarding_completed=user.onboarding_completed,
        locale=user.locale,
        last_active_at=user.last_active_at,
        created_at=user.created_at
    )

def suspend_user(db: Session, user_id: UUID, req: SuspendUserRequest, agent: User):
    if agent.role not in ["admin", "moderator"]:
        raise AuthorizationError("Only support agents can suspend users.")
        
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise ResourceNotFoundError("User not found")
        
    if user.role == "admin" and agent.role != "admin":
        raise AuthorizationError("Moderators cannot suspend admins.")
        
    user.status = "suspended"
    user.suspension_reason = req.reason
    if req.duration_days:
        user.suspended_until = datetime.utcnow() + timedelta(days=req.duration_days)
    else:
        user.status = "banned" # Permanent
        
    # Invalidate all sessions immediately
    db.query(UserSession).filter(UserSession.user_id == user_id).delete()
    
    db.commit()
    return {"message": f"User successfully {user.status}"}

def force_logout_user(db: Session, user_id: UUID, agent: User):
    if agent.role not in ["admin", "moderator"]:
        raise AuthorizationError("Only support agents can force logout users.")
        
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise ResourceNotFoundError("User not found")
        
    deleted = db.query(UserSession).filter(UserSession.user_id == user_id).delete()
    db.commit()
    return {"message": f"User forcefully logged out of {deleted} session(s)."}
