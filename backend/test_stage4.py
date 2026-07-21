import os

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from src.models.base import Base
from src.models.user import User
from src.models.mood import MoodEntry
from src.models.community import Community, CommunityMembership
from src.services.social_service import send_connection_request, respond_connection_request, react_to_target, add_comment
from src.services.community_service import create_community_post, get_communities, get_community_posts
from src.services.notification_service import get_user_notifications
from src.core.security import get_password_hash

from dotenv import load_dotenv
load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL must be set")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

from datetime import date

def test_stage4_features():
    db = SessionLocal()
    try:
        # 1. Create two test users
        user_a = User(
            email="testA_stage4@example.com", 
            password_hash=get_password_hash("pass"),
            display_name="User A",
            date_of_birth=date(1990, 1, 1)
        )
        user_b = User(
            email="testB_stage4@example.com", 
            password_hash=get_password_hash("pass"),
            display_name="User B",
            date_of_birth=date(1990, 1, 1)
        )
        db.add_all([user_a, user_b])
        db.commit()
        db.refresh(user_a)
        db.refresh(user_b)
        
        print(f"Created Users A ({user_a.id}) and B ({user_b.id})")

        # 2. User A sends connection request to User B
        print("User A sending connection request to User B...")
        conn_req = send_connection_request(db, user_a.id, user_b.id, message="Hi let's connect!")
        
        # Check that a notification was generated for User B
        b_notifs = get_user_notifications(db, user_b.id)
        assert len(b_notifs) == 1
        assert b_notifs[0].type == "connection_request"
        print("Notification verified for connection request.")

        # 3. User B accepts the request
        print("User B accepting connection request...")
        respond_connection_request(db, conn_req.id, user_b.id, "accept")
        
        # Check that a notification was generated for User A
        a_notifs = get_user_notifications(db, user_a.id)
        assert len(a_notifs) == 1
        assert a_notifs[0].type == "connection_accepted"
        print("Notification verified for connection acceptance.")

        # 4. Create a public community
        comm = Community(
            name="Test Community",
            description="A place for testing",
            category="Mental Health",
            creator_id=user_a.id
        )
        db.add(comm)
        db.commit()
        db.refresh(comm)
        print(f"Created Community '{comm.name}'")

        # 5. User A creates a post in the community
        print("User A creating a community post...")
        post = create_community_post(db, user_a.id, comm.id, content="Hello community! How is everyone doing?")
        
        # 6. User B reacts to User A's post with a Hug
        print("User B reacting to User A's post with a Hug...")
        react_to_target(db, user_b.id, "post", post.id, "hug")
        
        # Check User A got a reaction notification
        a_notifs_after = get_user_notifications(db, user_a.id)
        assert len(a_notifs_after) == 2
        assert a_notifs_after[0].type == "reaction_received"
        print("Notification verified for reaction received.")
        
        # 7. User B leaves a comment
        print("User B commenting on the post...")
        add_comment(db, user_b.id, "post", post.id, content="I'm doing great, thanks for asking!")
        
        # Check User A got a comment notification
        a_notifs_final = get_user_notifications(db, user_a.id)
        assert len(a_notifs_final) == 3
        assert a_notifs_final[0].type == "comment_received"
        print("Notification verified for comment received.")

        # Clean up
        print("Test passed! Cleaning up test data...")
        # Since this is a real DB, let's delete what we just created to keep it clean.
        db.execute(comm.__table__.delete().where(comm.__table__.c.id == comm.id))
        db.execute(user_a.__table__.delete().where(user_a.__table__.c.id == user_a.id))
        db.execute(user_b.__table__.delete().where(user_b.__table__.c.id == user_b.id))
        db.commit()
        print("Cleanup successful.")

    except Exception as e:
        db.rollback()
        print(f"TEST FAILED: {str(e)}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    test_stage4_features()
