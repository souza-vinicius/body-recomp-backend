"""Create users table

Revision ID: 001_create_users
Revises: 
Create Date: 2025-10-23

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001_create_users'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Create users table with all required fields."""
    op.create_table(
        'users',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('hashed_password', sa.String(length=255), nullable=False),
        sa.Column('full_name', sa.String(length=255), nullable=False),
        sa.Column('date_of_birth', sa.DateTime(), nullable=False),
        sa.Column('gender', sa.Enum('male', 'female', name='gender'), nullable=False),
        sa.Column('height_cm', sa.Numeric(precision=5, scale=2), nullable=False),
        sa.Column(
            'preferred_calculation_method',
            sa.Enum('navy', '3_site', '7_site', name='calculationmethod'),
            nullable=False
        ),
        sa.Column(
            'activity_level',
            sa.Enum(
                'sedentary',
                'lightly_active',
                'moderately_active',
                'very_active',
                'extremely_active',
                name='activitylevel'
            ),
            nullable=False
        ),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email'),
        sa.CheckConstraint('height_cm >= 120 AND height_cm <= 250', name='height_check')
    )
    
    # Create indexes
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_created_at'), 'users', ['created_at'], unique=False)


def downgrade() -> None:
    """Drop users table and related objects."""
    op.drop_index(op.f('ix_users_created_at'), table_name='users')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')
    
    # Drop enums
    op.execute('DROP TYPE IF EXISTS gender')
    op.execute('DROP TYPE IF EXISTS calculationmethod')
    op.execute('DROP TYPE IF EXISTS activitylevel')
