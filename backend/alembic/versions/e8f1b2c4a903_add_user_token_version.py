"""Add users.token_version so issued JWTs can be revoked

Authentication is stateless: get_current_user trusted any correctly signed,
unexpired token. Admin "force logout" deleted from a user_sessions table that
nothing ever writes to, so it always affected zero rows while reporting
success. This column is the revocation point — bumping it invalidates every
token already handed out for that user.

Revision ID: e8f1b2c4a903
Revises: d5a2c7e13f88
Create Date: 2026-10-13 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'e8f1b2c4a903'
down_revision: Union[str, None] = 'd5a2c7e13f88'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # server_default keeps existing rows valid; tokens minted before this
    # migration carry no "tv" claim and are rejected, which logs everyone out
    # once. That is the intended behaviour for a revocation mechanism.
    op.add_column(
        'users',
        sa.Column('token_version', sa.Integer(), nullable=False, server_default=sa.text('0')),
    )


def downgrade() -> None:
    op.drop_column('users', 'token_version')
