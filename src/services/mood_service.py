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
