import asyncio
from uuid import uuid4
from sqlalchemy.orm import Session
from src.config.database import SessionLocal
from src.models.user import User
from src.models.mood import MoodEntry, MoodEmotion
from src.schemas.map import BoundingBox
from src.services.map_service import get_emotional_heatmap, get_global_pulse
from src.services.matching_service import find_emotional_matches, get_mood_replay
import random

def setup_test_data(db: Session):
    # Clear old data for deterministic testing
    db.query(MoodEmotion).delete()
    db.query(MoodEntry).delete()
    db.query(User).filter(User.email.like("test_stage5_%@example.com")).delete()
    db.commit()

    # Create 3 users
    from datetime import date
    u1 = User(id=uuid4(), email="test_stage5_a@example.com", display_name="User A", password_hash="dummy", date_of_birth=date(1990, 1, 1))
    u2 = User(id=uuid4(), email="test_stage5_b@example.com", display_name="User B", password_hash="dummy", date_of_birth=date(1992, 1, 1))
    u3 = User(id=uuid4(), email="test_stage5_c@example.com", display_name="User C", password_hash="dummy", date_of_birth=date(1994, 1, 1))
    db.add_all([u1, u2, u3])
    db.commit()

    # Create Mood Entries with geospatial points
    # Format: POINT(lon lat)
    # London: -0.1276, 51.5074
    # NY: -74.0060, 40.7128
    
    e1 = MoodEntry(id=uuid4(), user_id=u1.id, privacy_level="public", location_city="London", location_geom="SRID=4326;POINT(-0.1276 51.5074)")
    e2 = MoodEntry(id=uuid4(), user_id=u2.id, privacy_level="public", location_city="London", location_geom="SRID=4326;POINT(-0.1300 51.5100)")
    e3 = MoodEntry(id=uuid4(), user_id=u3.id, privacy_level="public", location_city="New York", location_geom="SRID=4326;POINT(-74.0060 40.7128)")
    db.add_all([e1, e2, e3])
    db.commit()

    # Add Emotions
    m1 = MoodEmotion(mood_entry_id=e1.id, primary_emotion="Anxiety", secondary_emotion="Nervous", intensity=8)
    m2 = MoodEmotion(mood_entry_id=e2.id, primary_emotion="Anxiety", secondary_emotion="Stressed", intensity=7)
    m3 = MoodEmotion(mood_entry_id=e3.id, primary_emotion="Joy", secondary_emotion="Happy", intensity=9)
    db.add_all([m1, m2, m3])
    db.commit()
    
    return u1, u2, u3

def test_map_and_matching():
    db = SessionLocal()
    try:
        print("Setting up test data...")
        u1, u2, u3 = setup_test_data(db)
        
        print("Testing Map API: Global Pulse...")
        pulse = get_global_pulse(db)
        print(f"Global Dominant Emotion: {pulse.dominant_emotion_global} (Avg Intensity: {pulse.average_intensity:.1f})")
        assert pulse.dominant_emotion_global == "Anxiety", "Expected Anxiety due to 2/3 votes"
        
        print("Testing Map API: Heatmap (London Bounding Box)...")
        # Bounding box around London
        bbox = BoundingBox(min_lon=-0.5, min_lat=51.0, max_lon=0.5, max_lat=52.0)
        heatmap = get_emotional_heatmap(db, bbox, days=7)
        print(f"Heatmap returned {len(heatmap.points)} points in London area.")
        assert len(heatmap.points) > 0, "Expected heatmap data points"
        assert any(p.dominant_emotion == "Anxiety" for p in heatmap.points), "Expected Anxiety in London"
        
        print("Testing Matching API: People Like You...")
        # User 1 logged Anxiety. User 2 also logged Anxiety. They should match.
        matches = find_emotional_matches(db, u1.id)
        print(f"Found {len(matches.matches)} match(es) for User A.")
        assert len(matches.matches) == 1, "Expected exactly 1 match (User B)"
        assert matches.matches[0].user.id == u2.id, "Expected match with User B"
        assert matches.matches[0].shared_emotion == "Anxiety", "Expected shared emotion to be Anxiety"
        
        print("Testing Matching API: Mood Replay...")
        replay = get_mood_replay(db, u1.id, months=1)
        print(f"Mood Replay generated. Top Emotion: {replay.top_emotion_overall}, Timeline size: {len(replay.timeline)}")
        assert replay.top_emotion_overall == "Anxiety"
        assert len(replay.timeline) == 1
        
        print("Test passed! Cleaning up test data...")
        db.query(MoodEmotion).delete()
        db.query(MoodEntry).delete()
        db.query(User).filter(User.email.like("test_stage5_%@example.com")).delete()
        db.commit()
        print("Cleanup successful.")

    except Exception as e:
        print(f"Test failed with error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    test_map_and_matching()
