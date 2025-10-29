"""add_performance_indexes

Revision ID: 52ab4596e6d9
Revises: acef2c47b80c
Create Date: 2025-10-29 09:27:31.693396

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '52ab4596e6d9'
down_revision: Union[str, None] = 'acef2c47b80c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
