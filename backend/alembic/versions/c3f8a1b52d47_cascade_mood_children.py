"""Cascade mood children so dissolved bubbles really delete

Without ON DELETE CASCADE the auto-dissolve sweep hits a foreign key violation
and the expired row survives — hidden from reads but still on disk, which is
the opposite of "leaves zero trace".

Revision ID: c3f8a1b52d47
Revises: b7c1d9e4a210
Create Date: 2026-09-20 00:30:00.000000

"""
from typing import Sequence, Union

from alembic import op

# revision identifiers, used by Alembic.
revision: str = 'c3f8a1b52d47'
down_revision: Union[str, None] = 'b7c1d9e4a210'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_constraint('mood_emotions_mood_entry_id_fkey', 'mood_emotions', type_='foreignkey')
    op.create_foreign_key(
        'mood_emotions_mood_entry_id_fkey',
        'mood_emotions', 'mood_entries',
        ['mood_entry_id'], ['id'],
        ondelete='CASCADE',
    )

    op.drop_constraint('mood_context_tags_mood_entry_id_fkey', 'mood_context_tags', type_='foreignkey')
    op.create_foreign_key(
        'mood_context_tags_mood_entry_id_fkey',
        'mood_context_tags', 'mood_entries',
        ['mood_entry_id'], ['id'],
        ondelete='CASCADE',
    )


def downgrade() -> None:
    op.drop_constraint('mood_context_tags_mood_entry_id_fkey', 'mood_context_tags', type_='foreignkey')
    op.create_foreign_key(
        'mood_context_tags_mood_entry_id_fkey',
        'mood_context_tags', 'mood_entries',
        ['mood_entry_id'], ['id'],
    )

    op.drop_constraint('mood_emotions_mood_entry_id_fkey', 'mood_emotions', type_='foreignkey')
    op.create_foreign_key(
        'mood_emotions_mood_entry_id_fkey',
        'mood_emotions', 'mood_entries',
        ['mood_entry_id'], ['id'],
    )
