"""Add measurements and goals tables

Revision ID: ba6e0deabfa8
Revises: 001_create_users
Create Date: 2025-10-23 22:43:21.706617

"""
from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = 'ba6e0deabfa8'
down_revision: Union[str, None] = '001_create_users'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create new enum types for goals using raw SQL
    op.execute(
        """
        DO $$ BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM pg_type WHERE typname = 'goaltype'
            ) THEN
                CREATE TYPE goaltype AS ENUM ('CUTTING', 'BULKING');
            END IF;
        END $$;
        """
    )
    op.execute(
        """
        DO $$ BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM pg_type WHERE typname = 'goalstatus'
            ) THEN
                CREATE TYPE goalstatus AS ENUM (
                    'ACTIVE', 'COMPLETED', 'CANCELLED'
                );
            END IF;
        END $$;
        """
    )
    
    # Create body_measurements table using raw SQL to avoid enum auto-creation
    op.execute(
        """
        CREATE TABLE body_measurements (
            id UUID PRIMARY KEY,
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            weight_kg NUMERIC(5,2) NOT NULL CHECK (
                weight_kg > 0 AND weight_kg >= 30 AND weight_kg <= 300
            ),
            calculation_method calculationmethod NOT NULL,
            waist_cm NUMERIC(5,2) CHECK (
                waist_cm IS NULL OR (waist_cm >= 10 AND waist_cm <= 200)
            ),
            neck_cm NUMERIC(5,2) CHECK (
                neck_cm IS NULL OR (neck_cm >= 10 AND neck_cm <= 200)
            ),
            hip_cm NUMERIC(5,2) CHECK (
                hip_cm IS NULL OR (hip_cm >= 10 AND hip_cm <= 200)
            ),
            chest_mm NUMERIC(5,2) CHECK (
                chest_mm IS NULL OR (chest_mm >= 1 AND chest_mm <= 70)
            ),
            abdomen_mm NUMERIC(5,2) CHECK (
                abdomen_mm IS NULL OR (abdomen_mm >= 1 AND abdomen_mm <= 70)
            ),
            thigh_mm NUMERIC(5,2) CHECK (
                thigh_mm IS NULL OR (thigh_mm >= 1 AND thigh_mm <= 70)
            ),
            tricep_mm NUMERIC(5,2) CHECK (
                tricep_mm IS NULL OR (tricep_mm >= 1 AND tricep_mm <= 70)
            ),
            suprailiac_mm NUMERIC(5,2) CHECK (
                suprailiac_mm IS NULL OR (
                    suprailiac_mm >= 1 AND suprailiac_mm <= 70
                )
            ),
            midaxillary_mm NUMERIC(5,2) CHECK (
                midaxillary_mm IS NULL OR (
                    midaxillary_mm >= 1 AND midaxillary_mm <= 70
                )
            ),
            subscapular_mm NUMERIC(5,2) CHECK (
                subscapular_mm IS NULL OR (
                    subscapular_mm >= 1 AND subscapular_mm <= 70
                )
            ),
            calculated_body_fat_percentage NUMERIC(4,2) NOT NULL CHECK (
                calculated_body_fat_percentage >= 3 AND
                calculated_body_fat_percentage <= 50
            ),
            notes TEXT,
            measured_at TIMESTAMP NOT NULL,
            created_at TIMESTAMP NOT NULL
        )
        """
    )
    
    # Create indexes for body_measurements
    op.create_index(
        'ix_body_measurements_measured_at',
        'body_measurements',
        ['measured_at']
    )
    op.create_index(
        'ix_body_measurements_user_id',
        'body_measurements',
        ['user_id']
    )
    op.create_index(
        'ix_body_measurements_user_measured',
        'body_measurements',
        ['user_id', 'measured_at']
    )
    
    # Create goals table using raw SQL
    op.execute(
        """
        CREATE TABLE goals (
            id UUID PRIMARY KEY,
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            initial_measurement_id UUID NOT NULL
                REFERENCES body_measurements(id) ON DELETE RESTRICT,
            goal_type goaltype NOT NULL,
            status goalstatus NOT NULL DEFAULT 'ACTIVE',
            initial_body_fat_percentage NUMERIC(4,2) NOT NULL CHECK (
                initial_body_fat_percentage >= 3 AND
                initial_body_fat_percentage <= 50
            ),
            initial_weight_kg NUMERIC(5,2) NOT NULL CHECK (
                initial_weight_kg > 0 AND
                initial_weight_kg >= 30 AND
                initial_weight_kg <= 300
            ),
            target_body_fat_percentage NUMERIC(4,2) CHECK (
                target_body_fat_percentage IS NULL OR (
                    target_body_fat_percentage >= 3 AND
                    target_body_fat_percentage <= 50
                )
            ),
            ceiling_body_fat_percentage NUMERIC(4,2) CHECK (
                ceiling_body_fat_percentage IS NULL OR (
                    ceiling_body_fat_percentage >= 3 AND
                    ceiling_body_fat_percentage <= 50
                )
            ),
            target_calories INTEGER NOT NULL CHECK (
                target_calories > 0 AND
                target_calories >= 1200 AND
                target_calories <= 5000
            ),
            estimated_weeks_to_goal INTEGER CHECK (
                estimated_weeks_to_goal IS NULL OR
                estimated_weeks_to_goal > 0
            ),
            started_at TIMESTAMP NOT NULL,
            completed_at TIMESTAMP,
            created_at TIMESTAMP NOT NULL,
            updated_at TIMESTAMP NOT NULL
        )
        """
    )
    
    # Create indexes for goals
    op.create_index('ix_goals_user_id', 'goals', ['user_id'])
    op.create_index(
        'ix_goals_user_started',
        'goals',
        ['user_id', 'started_at']
    )
    op.create_index(
        'ix_goals_user_status',
        'goals',
        ['user_id', 'status']
    )


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index('ix_goals_user_status', table_name='goals')
    op.drop_index('ix_goals_user_started', table_name='goals')
    op.drop_index(op.f('ix_goals_user_id'), table_name='goals')
    op.drop_table('goals')
    op.drop_index(
        'ix_body_measurements_user_measured',
        table_name='body_measurements'
    )
    op.drop_index(
        op.f('ix_body_measurements_user_id'),
        table_name='body_measurements'
    )
    op.drop_index(
        op.f('ix_body_measurements_measured_at'),
        table_name='body_measurements'
    )
    op.drop_table('body_measurements')
    # ### end Alembic commands ###
