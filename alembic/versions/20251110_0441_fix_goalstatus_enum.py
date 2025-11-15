"""fix_goalstatus_enum

Revision ID: ad8704a390ce
Revises: 839c284c0d22
Create Date: 2025-11-10 04:41:32.706758

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ad8704a390ce'
down_revision: Union[str, None] = '839c284c0d22'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add 'active' value to goalstatus enum if it doesn't exist
    op.execute("ALTER TYPE goalstatus ADD VALUE IF NOT EXISTS 'active'")
    op.execute("ALTER TYPE goalstatus ADD VALUE IF NOT EXISTS 'completed'")
    op.execute("ALTER TYPE goalstatus ADD VALUE IF NOT EXISTS 'cancelled'")


def downgrade() -> None:
    # Cannot remove enum values in PostgreSQL without recreating the type
    # This would require dropping the column, recreating the enum,
    # and restoring data
    pass
