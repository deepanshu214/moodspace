from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List

from src.db.session import get_db
from src.api.deps import get_current_user
from src.models.user import User
from src.schemas.notification import NotificationResponse
from src.services.notification_service import get_user_notifications, mark_as_read

router = APIRouter()

@router.get("", response_model=List[NotificationResponse])
def read_notifications(
    skip: int = 0, 
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all in-app notifications for the user."""
    return get_user_notifications(db, current_user.id, limit=limit, offset=skip)

@router.post("/{notification_id}/read", response_model=NotificationResponse)
def read_notification(
    notification_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark a specific notification as read."""
    notif = mark_as_read(db, notification_id, current_user.id)
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    return notif
