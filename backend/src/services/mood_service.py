import re
from typing import Optional, Tuple

# Basic list of crisis keywords. Can be expanded or moved to DB later.
CRISIS_KEYWORDS = [
    r"\bkill\b", r"\bkill myself\b", r"\bsuicide\b", r"\bend it all\b", 
    r"\bdon't want to go on\b", r"\bnobody would miss me\b", r"\bwant to die\b"
]

# Exceptions to reduce false positives
SAFE_IDIOMS = [
    r"\bdying of laughter\b", r"\bkiller outfit\b", r"\bdead tired\b", 
    r"\bkilled me\b", r"\bkill this bug\b"
]

def analyze_crisis_risk(journal_note: Optional[str]) -> bool:
    """
    Analyzes unencrypted journal note for crisis keywords.
    Returns True if a crisis is detected.
    """
    if not journal_note:
        return False
        
    text = journal_note.lower()
    
    # Check for safe idioms first (basic exclusion)
    for idiom in SAFE_IDIOMS:
        text = re.sub(idiom, "", text)
        
    # Check for crisis keywords
    for keyword in CRISIS_KEYWORDS:
        if re.search(keyword, text):
            return True
            
    return False

def generate_supportive_message(primary_emotion: str, intensity: int) -> str:
    """
    Generates a supportive message based on the primary emotion and intensity.
    """
    positive_emotions = ["joy", "trust", "anticipation", "surprise"]
    negative_emotions = ["sadness", "fear", "anger", "disgust"]
    
    emotion_lower = primary_emotion.lower()
    
    if emotion_lower in positive_emotions:
        return "That's wonderful! Keep shining! ✨"
        
    if emotion_lower in negative_emotions:
        if intensity <= 6:
            return "It's okay to feel this way. You're not alone. 💙"
        else:
            if emotion_lower == "anger":
                return "It sounds like a frustrating moment. Would a quick breathing exercise help? 🌿"
            return "We see you're going through a tough time. Remember to be gentle with yourself. 🌿"
            
    return "Thank you for checking in and honoring your emotions today. 🌱"

def get_crisis_resources() -> dict:
    return {
        "message": "We noticed you might be going through a tough time. These resources are here for you.",
        "hotlines": [
            {
                "name": "988 Suicide & Crisis Lifeline",
                "phone": "988",
                "country": "US"
            },
            {
                "name": "Crisis Text Line",
                "text": "HOME to 741741",
                "country": "US"
            }
        ]
    }


# ── Auto-dissolve ─────────────────────────────────────────────────────────────
# A bubble floats for a fixed window and then leaves no trace. Reads filter on
# the expiry, and every read also sweeps anything already past it, so a dissolved
# bubble is deleted rather than merely hidden.

import logging
import os
import uuid as _uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional, Tuple

from sqlalchemy import or_, delete
from sqlalchemy.orm import Session

MEDIA_ROOT = Path(os.getenv("MEDIA_ROOT", Path(__file__).resolve().parents[3] / "media"))
MEDIA_URL_PREFIX = "/media"

logger = logging.getLogger(__name__)
MAX_PHOTO_BYTES = 8 * 1024 * 1024
MAX_VOICE_BYTES = 4 * 1024 * 1024
_ALLOWED_PHOTO = {"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/heic": ".heic"}
_ALLOWED_VOICE = {"audio/m4a": ".m4a", "audio/mp4": ".m4a", "audio/mpeg": ".mp3", "audio/aac": ".aac", "audio/wav": ".wav", "audio/x-wav": ".wav"}


def live_bubbles_filter():
    """SQLAlchemy filter matching bubbles that have not dissolved yet."""
    from src.models.mood import MoodEntry

    return or_(MoodEntry.expires_at.is_(None), MoodEntry.expires_at > datetime.now(timezone.utc))


def purge_dissolved_bubbles(db: Session) -> int:
    """
    Hard-delete bubbles past their dissolve time. Returns rows removed.

    Child rows go via ON DELETE CASCADE. A failure here is logged rather than
    swallowed: silently returning 0 once made expired bubbles look purged while
    they were still on disk.
    """
    from src.models.mood import MoodEntry

    try:
        result = db.execute(
            delete(MoodEntry).where(
                MoodEntry.expires_at.isnot(None),
                MoodEntry.expires_at <= datetime.now(timezone.utc),
            )
        )
        db.commit()
        return result.rowcount or 0
    except Exception:
        db.rollback()
        logger.exception("Failed to purge dissolved bubbles")
        return 0


# ── Media keepsakes ───────────────────────────────────────────────────────────

def media_url_for(storage_path: str) -> str:
    return f"{MEDIA_URL_PREFIX}/{storage_path}"


async def save_upload(file, *, kind: str, limit_bytes: int) -> Tuple[str, int, Optional[str]]:
    """
    Stream an upload to disk under MEDIA_ROOT/<kind>/, rejecting anything over
    the size limit or of an unexpected type. Returns (relative path, size, mime).
    """
    from fastapi import HTTPException

    allowed = _ALLOWED_PHOTO if kind == "photo" else _ALLOWED_VOICE
    mime = (file.content_type or "").split(";")[0].lower()
    if mime not in allowed:
        raise HTTPException(status_code=415, detail=f"Unsupported {kind} type: {mime or 'unknown'}")

    target_dir = MEDIA_ROOT / kind
    target_dir.mkdir(parents=True, exist_ok=True)
    name = f"{_uuid.uuid4().hex}{allowed[mime]}"
    target = target_dir / name

    size = 0
    try:
        with target.open("wb") as out:
            while True:
                chunk = await file.read(1024 * 256)
                if not chunk:
                    break
                size += len(chunk)
                if size > limit_bytes:
                    out.close()
                    target.unlink(missing_ok=True)
                    raise HTTPException(
                        status_code=413,
                        detail=f"{kind} exceeds {limit_bytes // (1024 * 1024)}MB limit",
                    )
                out.write(chunk)
    except HTTPException:
        raise
    except Exception:
        target.unlink(missing_ok=True)
        raise HTTPException(status_code=500, detail="Could not store the upload")

    return f"{kind}/{name}", size, mime
