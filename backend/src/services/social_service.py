from sqlalchemy.orm import Session
from uuid import UUID
from fastapi import HTTPException
from src.models.social import Reaction, Connection, Follow, BlockedUser, Comment
from src.models.mood import MoodEntry
from src.models.community import Post
from src.models.user import User
from src.services.notification_service import create_notification

# Reactions
def react_to_target(db: Session, user_id: UUID, target_type: str, target_id: UUID, reaction_type: str):
    valid_reactions = {"heart", "hug", "strength", "understanding", "inspiration", "growth"}
    if reaction_type not in valid_reactions:
        raise HTTPException(status_code=400, detail="Invalid reaction type")

    # Check if target exists and author is not self
    target_author_id = None
    if target_type == "mood_entry":
        target = db.query(MoodEntry).filter(MoodEntry.id == target_id).first()
        if not target:
            raise HTTPException(status_code=404, detail="Mood entry not found")
        target_author_id = target.user_id
    elif target_type == "post":
        target = db.query(Post).filter(Post.id == target_id).first()
        if not target:
            raise HTTPException(status_code=404, detail="Post not found")
        target_author_id = target.user_id
    elif target_type == "comment":
        target = db.query(Comment).filter(Comment.id == target_id).first()
        if not target:
            raise HTTPException(status_code=404, detail="Comment not found")
        target_author_id = target.user_id
    else:
        raise HTTPException(status_code=400, detail="Invalid target type")

    if target_author_id == user_id:
        raise HTTPException(status_code=400, detail="Cannot react to your own content")

    # Check for existing reaction of SAME type by this user
    existing = db.query(Reaction).filter(
        Reaction.user_id == user_id,
        Reaction.target_type == target_type,
        Reaction.target_id == target_id,
        Reaction.reaction_type == reaction_type
    ).first()

    if existing:
        # Toggle: remove existing reaction
        db.delete(existing)
        db.commit()
        return None
    
    # Create new reaction
    reaction = Reaction(
        user_id=user_id,
        target_type=target_type,
        target_id=target_id,
        reaction_type=reaction_type
    )
    db.add(reaction)
    db.commit()
    db.refresh(reaction)
    
    # Trigger notification
    actor = db.query(User).filter(User.id == user_id).first()
    create_notification(
        db=db,
        user_id=target_author_id,
        notif_type="reaction_received",
        title=f"{actor.display_name} sent you a {reaction_type.capitalize()}",
        body=f"on your {target_type.replace('_', ' ')}",
        data={
            "actor_id": str(actor.id),
            "target_type": target_type,
            "target_id": str(target_id),
            "reaction_type": reaction_type
        }
    )
    
    return reaction

# Connections
def send_connection_request(db: Session, requester_id: UUID, recipient_id: UUID, message: str = None):
    if requester_id == recipient_id:
        raise HTTPException(status_code=400, detail="Cannot connect with yourself")
        
    # Check block status
    is_blocked = db.query(BlockedUser).filter(
        (BlockedUser.blocker_id == recipient_id) & (BlockedUser.blocked_id == requester_id)
    ).first()
    if is_blocked:
        raise HTTPException(status_code=403, detail="Not permitted")
        
    existing = db.query(Connection).filter(
        ((Connection.requester_id == requester_id) & (Connection.recipient_id == recipient_id)) |
        ((Connection.requester_id == recipient_id) & (Connection.recipient_id == requester_id))
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail=f"Connection already exists with status: {existing.status}")
        
    conn = Connection(
        requester_id=requester_id,
        recipient_id=recipient_id,
        status="pending",
        message=message
    )
    db.add(conn)
    db.commit()
    db.refresh(conn)
    
    # Send Notification
    actor = db.query(User).filter(User.id == requester_id).first()
    create_notification(
        db=db,
        user_id=recipient_id,
        notif_type="connection_request",
        title="New Connection Request",
        body=f"{actor.display_name} wants to connect with you",
        data={"connection_id": str(conn.id), "requester_id": str(actor.id)}
    )
    
    return conn

def respond_connection_request(db: Session, connection_id: UUID, user_id: UUID, action: str):
    conn = db.query(Connection).filter(Connection.id == connection_id).first()
    if not conn:
        raise HTTPException(status_code=404, detail="Connection request not found")
        
    if conn.recipient_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to respond to this request")
        
    if conn.status != "pending":
        raise HTTPException(status_code=400, detail="Request is already processed")
        
    if action == "accept":
        conn.status = "accepted"
        
        # Send Notification back to requester
        actor = db.query(User).filter(User.id == user_id).first()
        create_notification(
            db=db,
            user_id=conn.requester_id,
            notif_type="connection_accepted",
            title="Connection Accepted",
            body=f"{actor.display_name} accepted your connection request",
            data={"connection_id": str(conn.id), "recipient_id": str(actor.id)}
        )
    elif action == "decline":
        conn.status = "declined"
    else:
        raise HTTPException(status_code=400, detail="Invalid action")
        
    db.commit()
    db.refresh(conn)
    return conn

# Comments
def add_comment(db: Session, user_id: UUID, target_type: str, target_id: UUID, content: str, is_anonymous: bool = False, parent_id: UUID = None):
    # Verify target
    target_author_id = None
    if target_type == "mood_entry":
        target = db.query(MoodEntry).filter(MoodEntry.id == target_id).first()
        if target: target_author_id = target.user_id
    elif target_type == "post":
        target = db.query(Post).filter(Post.id == target_id).first()
        if target: 
            target_author_id = target.user_id
            # update post comment count
            target.comment_count += 1
    
    if not target_author_id:
        raise HTTPException(status_code=404, detail="Target not found")
        
    comment = Comment(
        user_id=user_id,
        target_type=target_type,
        target_id=target_id,
        parent_comment_id=parent_id,
        content=content,
        is_anonymous=is_anonymous
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    
    if target_author_id != user_id:
        actor = db.query(User).filter(User.id == user_id).first()
        actor_name = "Someone" if is_anonymous else actor.display_name
        create_notification(
            db=db,
            user_id=target_author_id,
            notif_type="comment_received",
            title=f"{actor_name} commented",
            body=f"on your {target_type.replace('_', ' ')}",
            data={"comment_id": str(comment.id), "target_id": str(target_id)}
        )
        
    return comment
