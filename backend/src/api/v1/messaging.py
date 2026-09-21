import uuid as uuid_lib
from datetime import datetime, timezone
from typing import Any, List, Optional

from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy import func, or_

from src.api.deps import CurrentUser, SessionDep
from src.core.security import encrypt_note, decrypt_note
from src.models.messaging import Conversation, ConversationParticipant, Message, MessageReaction
from src.models.user import User

router = APIRouter()


# ── Schemas ───────────────────────────────────────────────────────────────────

class ConversationCreate(BaseModel):
    user_id: str


class MessageCreate(BaseModel):
    content: str = Field(min_length=1, max_length=4000)
    message_type: str = Field(default="text", pattern="^(text|icebreaker|mood_share|reaction_echo)$")
    emotion_tag: Optional[str] = Field(default=None, max_length=30)
    icebreaker_id: Optional[str] = Field(default=None, max_length=60)


class ReactionCreate(BaseModel):
    message_id: str
    emoji: str = Field(min_length=1, max_length=16)


class MarkRead(BaseModel):
    conversation_id: str
    up_to_message_id: Optional[str] = None


# ── Helpers ───────────────────────────────────────────────────────────────────

def _as_uuid(value: str, label: str) -> uuid_lib.UUID:
    try:
        return uuid_lib.UUID(str(value))
    except (ValueError, AttributeError, TypeError):
        raise HTTPException(status_code=422, detail=f"invalid {label}")


def _require_participant(db, conversation_id: uuid_lib.UUID, user_id) -> None:
    """A conversation is readable only by the people in it."""
    member = (
        db.query(ConversationParticipant)
        .filter(
            ConversationParticipant.conversation_id == conversation_id,
            ConversationParticipant.user_id == user_id,
        )
        .first()
    )
    if not member:
        raise HTTPException(status_code=403, detail="You are not part of this conversation")


def _serialize_message(db, message: Message, recipient_id: Optional[str] = None) -> dict:
    content = ""
    if message.encrypted_content:
        iv = (message.encryption_metadata or {}).get("iv")
        content = decrypt_note(message.encrypted_content, iv) if iv else ""

    reactions = [
        {
            "id": str(r.id),
            "message_id": str(r.message_id),
            "user_id": str(r.user_id),
            "emoji": r.emoji,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        }
        for r in (message.reactions or [])
    ]

    return {
        "id": str(message.id),
        "conversation_id": str(message.conversation_id),
        "sender_id": str(message.sender_id),
        "recipient_id": recipient_id or "",
        "content": "" if message.deleted_at else content,
        "message_type": message.message_type,
        "status": "sent",
        "emotion_tag": message.emotion_tag,
        "icebreaker_id": message.icebreaker_id,
        "is_deleted": message.deleted_at is not None,
        "reactions": reactions,
        "created_at": message.created_at.isoformat() if message.created_at else None,
    }


def _other_participant(db, conversation_id: uuid_lib.UUID, me) -> dict:
    row = (
        db.query(ConversationParticipant)
        .filter(
            ConversationParticipant.conversation_id == conversation_id,
            ConversationParticipant.user_id != me,
        )
        .first()
    )
    if not row:
        return {"user_id": "", "display_name": "Wandering Spirit", "avatar_url": None}

    user = db.query(User).filter(User.id == row.user_id).first()
    return {
        "user_id": str(row.user_id),
        "display_name": user.display_name if user else "Wandering Spirit",
        "avatar_url": user.avatar_url if user else None,
        "is_online": False,
    }


def _serialize_conversation(db, conversation: Conversation, me) -> dict:
    participants = (
        db.query(ConversationParticipant)
        .filter(ConversationParticipant.conversation_id == conversation.id)
        .all()
    )
    other = _other_participant(db, conversation.id, me)

    last = (
        db.query(Message)
        .filter(Message.conversation_id == conversation.id, Message.deleted_at.is_(None))
        .order_by(Message.created_at.desc())
        .first()
    )

    # Unread = messages from the other person newer than my last read marker.
    mine = next((p for p in participants if p.user_id == me), None)
    unread_q = db.query(func.count(Message.id)).filter(
        Message.conversation_id == conversation.id,
        Message.sender_id != me,
        Message.deleted_at.is_(None),
    )
    if mine and mine.last_read_message_id:
        marker = db.query(Message).filter(Message.id == mine.last_read_message_id).first()
        if marker:
            unread_q = unread_q.filter(Message.created_at > marker.created_at)
    unread = unread_q.scalar() or 0

    return {
        "id": str(conversation.id),
        "participant_ids": [str(p.user_id) for p in participants],
        "other_participant": other,
        "last_message": _serialize_message(db, last, other.get("user_id")) if last else None,
        "unread_count": int(unread),
        "created_at": conversation.created_at.isoformat() if conversation.created_at else None,
        "updated_at": (conversation.last_message_at or conversation.created_at).isoformat()
        if (conversation.last_message_at or conversation.created_at)
        else None,
    }


# ── Conversations ─────────────────────────────────────────────────────────────

@router.get("/conversations")
def list_conversations(db: SessionDep, current_user: CurrentUser) -> Any:
    """Every conversation this person is part of, most recently active first."""
    ids = [
        row.conversation_id
        for row in db.query(ConversationParticipant)
        .filter(ConversationParticipant.user_id == current_user.id)
        .all()
    ]
    if not ids:
        return []

    conversations = (
        db.query(Conversation)
        .filter(Conversation.id.in_(ids))
        .order_by(Conversation.last_message_at.desc().nullslast(), Conversation.created_at.desc())
        .all()
    )
    return [_serialize_conversation(db, c, current_user.id) for c in conversations]


@router.post("/conversations", status_code=status.HTTP_201_CREATED)
def get_or_create_conversation(
    db: SessionDep, current_user: CurrentUser, payload: ConversationCreate
) -> Any:
    """Open the direct thread with someone, reusing it if it already exists."""
    other_id = _as_uuid(payload.user_id, "user_id")
    if other_id == current_user.id:
        raise HTTPException(status_code=422, detail="You cannot open a thread with yourself")

    if not db.query(User).filter(User.id == other_id).first():
        raise HTTPException(status_code=404, detail="That person could not be found")

    mine = db.query(ConversationParticipant.conversation_id).filter(
        ConversationParticipant.user_id == current_user.id
    )
    existing = (
        db.query(Conversation)
        .join(ConversationParticipant, ConversationParticipant.conversation_id == Conversation.id)
        .filter(
            ConversationParticipant.user_id == other_id,
            Conversation.id.in_(mine),
            Conversation.type == "direct",
        )
        .first()
    )
    if existing:
        return _serialize_conversation(db, existing, current_user.id)

    conversation = Conversation(type="direct")
    db.add(conversation)
    db.flush()
    db.add(ConversationParticipant(conversation_id=conversation.id, user_id=current_user.id))
    db.add(ConversationParticipant(conversation_id=conversation.id, user_id=other_id))
    db.commit()
    db.refresh(conversation)

    return _serialize_conversation(db, conversation, current_user.id)


# ── Messages ──────────────────────────────────────────────────────────────────

@router.get("/conversations/{conversation_id}/messages")
def list_messages(
    conversation_id: str,
    db: SessionDep,
    current_user: CurrentUser,
    cursor: Optional[str] = Query(None),
    limit: int = Query(30, ge=1, le=100),
) -> Any:
    """Messages oldest-last, paged backwards from `cursor`."""
    conv_id = _as_uuid(conversation_id, "conversation id")
    _require_participant(db, conv_id, current_user.id)

    query = db.query(Message).filter(Message.conversation_id == conv_id)
    if cursor:
        anchor = db.query(Message).filter(Message.id == _as_uuid(cursor, "cursor")).first()
        if anchor:
            query = query.filter(Message.created_at < anchor.created_at)

    rows = query.order_by(Message.created_at.desc()).limit(limit + 1).all()
    has_more = len(rows) > limit
    rows = rows[:limit]

    other = _other_participant(db, conv_id, current_user.id)
    messages = [_serialize_message(db, m, other.get("user_id")) for m in reversed(rows)]

    return {
        "messages": messages,
        "next_cursor": str(rows[-1].id) if has_more and rows else None,
        "has_more": has_more,
    }


@router.post("/conversations/{conversation_id}/messages", status_code=status.HTTP_201_CREATED)
def send_message(
    conversation_id: str, db: SessionDep, current_user: CurrentUser, payload: MessageCreate
) -> Any:
    """Send a message. Content is encrypted at rest with the server key."""
    conv_id = _as_uuid(conversation_id, "conversation id")
    _require_participant(db, conv_id, current_user.id)

    ciphertext, iv = encrypt_note(payload.content)
    message = Message(
        conversation_id=conv_id,
        sender_id=current_user.id,
        encrypted_content=ciphertext,
        encryption_metadata={"iv": iv, "alg": "aes-256-cbc"},
        message_type=payload.message_type,
        emotion_tag=payload.emotion_tag,
        icebreaker_id=payload.icebreaker_id,
    )
    db.add(message)

    conversation = db.query(Conversation).filter(Conversation.id == conv_id).first()
    if conversation:
        conversation.last_message_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(message)

    other = _other_participant(db, conv_id, current_user.id)
    return _serialize_message(db, message, other.get("user_id"))


@router.delete("/conversations/{conversation_id}/messages/{message_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_message(
    conversation_id: str, message_id: str, db: SessionDep, current_user: CurrentUser
) -> None:
    conv_id = _as_uuid(conversation_id, "conversation id")
    _require_participant(db, conv_id, current_user.id)

    message = db.query(Message).filter(Message.id == _as_uuid(message_id, "message id")).first()
    if not message or message.conversation_id != conv_id:
        raise HTTPException(status_code=404, detail="Message not found")
    if message.sender_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only delete your own messages")

    # Soft delete: the thread keeps its shape, the words go.
    message.deleted_at = datetime.now(timezone.utc)
    db.commit()


# ── Reactions ─────────────────────────────────────────────────────────────────

@router.post("/reactions", status_code=status.HTTP_201_CREATED)
def react_to_message(db: SessionDep, current_user: CurrentUser, payload: ReactionCreate) -> Any:
    message = db.query(Message).filter(Message.id == _as_uuid(payload.message_id, "message id")).first()
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    _require_participant(db, message.conversation_id, current_user.id)

    existing = (
        db.query(MessageReaction)
        .filter(
            MessageReaction.message_id == message.id,
            MessageReaction.user_id == current_user.id,
            MessageReaction.emoji == payload.emoji,
        )
        .first()
    )
    if existing:
        return {
            "id": str(existing.id),
            "message_id": str(existing.message_id),
            "user_id": str(existing.user_id),
            "emoji": existing.emoji,
            "created_at": existing.created_at.isoformat() if existing.created_at else None,
        }

    reaction = MessageReaction(message_id=message.id, user_id=current_user.id, emoji=payload.emoji)
    db.add(reaction)
    db.commit()
    db.refresh(reaction)

    return {
        "id": str(reaction.id),
        "message_id": str(reaction.message_id),
        "user_id": str(reaction.user_id),
        "emoji": reaction.emoji,
        "created_at": reaction.created_at.isoformat() if reaction.created_at else None,
    }


@router.delete("/reactions/{reaction_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_reaction(reaction_id: str, db: SessionDep, current_user: CurrentUser) -> None:
    reaction = db.query(MessageReaction).filter(MessageReaction.id == _as_uuid(reaction_id, "reaction id")).first()
    if not reaction:
        raise HTTPException(status_code=404, detail="Reaction not found")
    if reaction.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your reaction")

    db.delete(reaction)
    db.commit()


# ── Read receipts ─────────────────────────────────────────────────────────────

@router.post("/read", status_code=status.HTTP_204_NO_CONTENT)
def mark_read(db: SessionDep, current_user: CurrentUser, payload: MarkRead) -> None:
    conv_id = _as_uuid(payload.conversation_id, "conversation id")
    _require_participant(db, conv_id, current_user.id)

    member = (
        db.query(ConversationParticipant)
        .filter(
            ConversationParticipant.conversation_id == conv_id,
            ConversationParticipant.user_id == current_user.id,
        )
        .first()
    )
    if not member:
        return

    if payload.up_to_message_id:
        member.last_read_message_id = _as_uuid(payload.up_to_message_id, "message id")
    else:
        latest = (
            db.query(Message)
            .filter(Message.conversation_id == conv_id)
            .order_by(Message.created_at.desc())
            .first()
        )
        if latest:
            member.last_read_message_id = latest.id

    db.commit()
