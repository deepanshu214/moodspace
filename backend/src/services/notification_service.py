from sqlalchemy.orm import Session
from uuid import UUID
from datetime import datetime, timezone
from src.models.notification import Notification
from typing import Dict, Any, Optional

def create_notification(db: Session, user_id: UUID, notif_type: str, title: str, body: str, data: Optional[Dict[str, Any]] = None):
    """
    Creates an in-app notification in the database.
    (Follows rules from 13_NOTIFICATION_SYSTEM.md)
    """
    notif = Notification(
        user_id=user_id,
        type=notif_type,
        title=title,
        body=body,
        data=data or {}
    )
    db.add(notif)
    db.commit()
    db.refresh(notif)
    
    # Note: In a full production system, we would also emit this to a Kafka event queue
    # for the Notification Router to push via FCM/APNs and WebSockets.
    
    return notif

def mark_as_read(db: Session, notification_id: UUID, user_id: UUID):
    notif = db.query(Notification).filter(Notification.id == notification_id, Notification.user_id == user_id).first()
    if notif:
        notif.is_read = True
        notif.read_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(notif)
    return notif

def get_user_notifications(db: Session, user_id: UUID, limit: int = 20, offset: int = 0):
    return db.query(Notification).filter(Notification.user_id == user_id).order_by(Notification.created_at.desc()).offset(offset).limit(limit).all()
