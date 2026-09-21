"""Add bubble auto-dissolve, media attachments and pinned anchors

Revision ID: b7c1d9e4a210
Revises: fcdf956aa2f0
Create Date: 2026-09-20 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

import geoalchemy2

# revision identifiers, used by Alembic.
revision: str = 'b7c1d9e4a210'
down_revision: Union[str, None] = 'fcdf956aa2f0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── Auto-dissolve + incognito on mood entries ──────────────────────────
    op.add_column('mood_entries', sa.Column('expires_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column(
        'mood_entries',
        sa.Column('is_incognito', sa.Boolean(), nullable=False, server_default=sa.text('false')),
    )
    # Every nearby/feed read filters on this, so it needs an index.
    op.create_index('ix_mood_entries_expires_at', 'mood_entries', ['expires_at'])

    # ── Media keepsakes attached to a bubble ───────────────────────────────
    op.create_table(
        'mood_attachments',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('mood_entry_id', UUID(as_uuid=True), sa.ForeignKey('mood_entries.id', ondelete='CASCADE'), nullable=False),
        sa.Column('user_id', UUID(as_uuid=True), nullable=False),
        sa.Column('kind', sa.String(length=10), nullable=False),  # photo | voice
        sa.Column('storage_path', sa.String(length=300), nullable=False),
        sa.Column('mime_type', sa.String(length=80), nullable=True),
        sa.Column('byte_size', sa.Integer(), nullable=True),
        sa.Column('duration_ms', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index('ix_mood_attachments_entry', 'mood_attachments', ['mood_entry_id'])

    # ── Places a person keeps returning to ─────────────────────────────────
    op.create_table(
        'pinned_anchors',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', UUID(as_uuid=True), nullable=False),
        sa.Column('label', sa.String(length=80), nullable=False),
        sa.Column('city', sa.String(length=120), nullable=True),
        sa.Column('note', sa.String(length=400), nullable=True),
        sa.Column('emotion', sa.String(length=30), nullable=True),
        sa.Column('location_geom', geoalchemy2.types.Geometry(geometry_type='POINT', srid=4326), nullable=True),
        sa.Column('drops_count', sa.Integer(), nullable=False, server_default=sa.text('0')),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index('ix_pinned_anchors_user', 'pinned_anchors', ['user_id'])


def downgrade() -> None:
    op.drop_index('ix_pinned_anchors_user', table_name='pinned_anchors')
    op.drop_table('pinned_anchors')
    op.drop_index('ix_mood_attachments_entry', table_name='mood_attachments')
    op.drop_table('mood_attachments')
    op.drop_index('ix_mood_entries_expires_at', table_name='mood_entries')
    op.drop_column('mood_entries', 'is_incognito')
    op.drop_column('mood_entries', 'expires_at')
