"""Message metadata and reactions so direct messaging works end to end

The conversations/messages tables existed but had no API and no room for the
fields the app sends (message type, emotion tag, icebreaker) or reactions.

Revision ID: d5a2c7e13f88
Revises: c3f8a1b52d47
Create Date: 2026-09-20 02:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

# revision identifiers, used by Alembic.
revision: str = 'd5a2c7e13f88'
down_revision: Union[str, None] = 'c3f8a1b52d47'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        'messages',
        sa.Column('message_type', sa.String(length=20), nullable=False, server_default='text'),
    )
    op.add_column('messages', sa.Column('emotion_tag', sa.String(length=30), nullable=True))
    op.add_column('messages', sa.Column('icebreaker_id', sa.String(length=60), nullable=True))
    op.create_index('ix_messages_conversation_created', 'messages', ['conversation_id', 'created_at'])

    op.create_table(
        'message_reactions',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('message_id', UUID(as_uuid=True), sa.ForeignKey('messages.id', ondelete='CASCADE'), nullable=False),
        sa.Column('user_id', UUID(as_uuid=True), nullable=False),
        sa.Column('emoji', sa.String(length=16), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        # One reaction of a given emoji per person per message.
        sa.UniqueConstraint('message_id', 'user_id', 'emoji', name='uq_message_reaction'),
    )
    op.create_index('ix_message_reactions_message', 'message_reactions', ['message_id'])


def downgrade() -> None:
    op.drop_index('ix_message_reactions_message', table_name='message_reactions')
    op.drop_table('message_reactions')
    op.drop_index('ix_messages_conversation_created', table_name='messages')
    op.drop_column('messages', 'icebreaker_id')
    op.drop_column('messages', 'emotion_tag')
    op.drop_column('messages', 'message_type')
