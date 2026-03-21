"""add_performance_indexes

Revision ID: 839c284c0d22
Revises: 52ab4596e6d9
Create Date: 2025-10-29 09:50:24.781540

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '839c284c0d22'
down_revision: Union[str, None] = '52ab4596e6d9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Index on users.email for login queries
    op.execute("""
        CREATE INDEX IF NOT EXISTS ix_users_email
        ON users (email)
    """)
    
    # Index on goals.user_id for user's goals queries
    op.execute("""
        CREATE INDEX IF NOT EXISTS ix_goals_user_id
        ON goals (user_id)
    """)
    
    # Composite index on measurements for time-series queries
    op.execute("""
        CREATE INDEX IF NOT EXISTS ix_measurements_user_time
        ON body_measurements (user_id, measured_at)
    """)
    
    # Composite index on progress_entries for goal progress tracking
    op.execute("""
        CREATE INDEX IF NOT EXISTS ix_progress_goal_time
        ON progress_entries (goal_id, logged_at)
    """)
    
    # Index on goals.status for filtering active goals
    op.execute("""
        CREATE INDEX IF NOT EXISTS ix_goals_status
        ON goals (status)
    """)


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS ix_goals_status")
    op.execute("DROP INDEX IF EXISTS ix_progress_goal_time")
    op.execute("DROP INDEX IF EXISTS ix_measurements_user_time")
    op.execute("DROP INDEX IF EXISTS ix_goals_user_id")
    op.execute("DROP INDEX IF EXISTS ix_users_email")
