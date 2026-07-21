from sqlalchemy.orm import Session
from sqlalchemy import func
from src.models.mood import MoodEntry, MoodEmotion
from src.models.user import User
from src.schemas.matching import UserMatchResponse, MatchedUser, MoodReplayResponse, MoodReplayPoint
from src.schemas.user import UserResponse
from datetime import datetime, timedelta
from uuid import UUID

def find_emotional_matches(db: Session, user_id: UUID) -> UserMatchResponse:
    # 1. Get requesting user's recent emotions
    time_threshold = datetime.utcnow() - timedelta(days=3)
    
    user_emotions = db.query(MoodEmotion.primary_emotion).join(
        MoodEntry, MoodEntry.id == MoodEmotion.mood_entry_id
    ).filter(
        MoodEntry.user_id == user_id,
        MoodEntry.created_at >= time_threshold
    ).all()
    
    if not user_emotions:
        return UserMatchResponse(matches=[])
        
    emotions_list = [e.primary_emotion for e in user_emotions]
    
    # 2. Find users with similar emotions in the last 3 days
    # (Exclude self, privacy must be public or friends)
    matched_query = db.query(
        User,
        MoodEmotion.primary_emotion,
        func.count(MoodEntry.id).label('match_count')
    ).join(
        MoodEntry, MoodEntry.user_id == User.id
    ).join(
        MoodEmotion, MoodEmotion.mood_entry_id == MoodEntry.id
    ).filter(
        User.id != user_id,
        MoodEntry.created_at >= time_threshold,
        MoodEntry.privacy_level != 'private',
        MoodEmotion.primary_emotion.in_(emotions_list)
    ).group_by(
        User.id, MoodEmotion.primary_emotion
    ).order_by(
        func.count(MoodEntry.id).desc()
    ).limit(10).all()

    matches = []
    for user, emotion, count in matched_query:
        matches.append(MatchedUser(
            user=UserResponse(
                id=user.id,
                email=user.email,
                display_name=user.display_name,
                status=user.status,
                role=user.role,
                bio=user.bio,
                created_at=user.created_at
            ),
            shared_emotion=emotion,
            match_score=min(1.0, count * 0.2) # Simple heuristic for demo
        ))
        
    return UserMatchResponse(matches=matches)

def get_mood_replay(db: Session, user_id: UUID, months: int = 6) -> MoodReplayResponse:
    time_threshold = datetime.utcnow() - timedelta(days=30 * months)
    
    entries = db.query(
        MoodEntry, MoodEmotion
    ).join(
        MoodEmotion, MoodEmotion.mood_entry_id == MoodEntry.id
    ).filter(
        MoodEntry.user_id == user_id,
        MoodEntry.created_at >= time_threshold
    ).order_by(
        MoodEntry.created_at.asc()
    ).all()
    
    timeline = []
    emotion_counts = {}
    total_intensity = 0
    
    for entry, emotion in entries:
        timeline.append(MoodReplayPoint(
            date=entry.created_at,
            primary_emotion=emotion.primary_emotion,
            intensity=emotion.intensity,
            context=None # Could fetch from context_tags if needed
        ))
        
        total_intensity += emotion.intensity
        emotion_counts[emotion.primary_emotion] = emotion_counts.get(emotion.primary_emotion, 0) + 1
        
    if not timeline:
        return MoodReplayResponse(
            timeline=[],
            top_emotion_overall="None",
            average_intensity=0.0,
            start_date=time_threshold,
            end_date=datetime.utcnow()
        )
        
    top_emotion = max(emotion_counts, key=emotion_counts.get)
    avg_intensity = total_intensity / len(timeline)
    
    return MoodReplayResponse(
        timeline=timeline,
        top_emotion_overall=top_emotion,
        average_intensity=avg_intensity,
        start_date=timeline[0].date,
        end_date=timeline[-1].date
    )
