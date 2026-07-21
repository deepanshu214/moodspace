from sqlalchemy.orm import Session
from uuid import UUID
from fastapi import HTTPException
from src.models.community import Community, Post, CommunityMembership
from src.models.user import User
from src.services.notification_service import create_notification

def get_communities(db: Session, skip: int = 0, limit: int = 20):
    return db.query(Community).filter(Community.privacy == "public").offset(skip).limit(limit).all()

def get_community_posts(db: Session, community_id: UUID, skip: int = 0, limit: int = 20):
    # Simply return posts by created_at desc (chronological) for now
    return db.query(Post).filter(Post.community_id == community_id, Post.deleted_at == None).order_by(Post.created_at.desc()).offset(skip).limit(limit).all()

def create_community_post(db: Session, user_id: UUID, community_id: UUID, content: str, post_type: str = "discussion", is_anonymous: bool = False, has_content_warning: bool = False):
    comm = db.query(Community).filter(Community.id == community_id).first()
    if not comm:
        raise HTTPException(status_code=404, detail="Community not found")
        
    # Check if user is member
    membership = db.query(CommunityMembership).filter(
        CommunityMembership.community_id == community_id,
        CommunityMembership.user_id == user_id
    ).first()
    
    # Allow posting if community is public or user is member
    if comm.privacy != "public" and not membership:
        raise HTTPException(status_code=403, detail="Must be a member to post in this community")
        
    post = Post(
        community_id=community_id,
        user_id=user_id,
        post_type=post_type,
        content=content,
        is_anonymous=is_anonymous,
        has_content_warning=has_content_warning
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    
    return post
