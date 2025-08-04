"""Add goal progress tracking

Revision ID: fffcc21cbe39
Revises: e3618f4ab82d
Create Date: 2025-07-29 22:40:22.971052

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mssql

# revision identifiers, used by Alembic.
revision: str = 'fffcc21cbe39'
down_revision: Union[str, Sequence[str], None] = 'e3618f4ab82d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add progress fields to goals table
    op.add_column('goals', sa.Column('progress', sa.Numeric(5, 2), nullable=False, server_default='0.00'))
    op.add_column('goals', sa.Column('progress_updated_at', sa.DateTime(), nullable=True))
    
    # Create goal_progress_history table
    op.create_table('goal_progress_history',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('goal_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('progress', sa.Numeric(5, 2), nullable=False),
        sa.Column('comments', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['goal_id'], ['goals.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_goal_progress_history_id'), 'goal_progress_history', ['id'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    # Drop goal_progress_history table
    op.drop_index(op.f('ix_goal_progress_history_id'), table_name='goal_progress_history')
    op.drop_table('goal_progress_history')
    
    # Remove progress fields from goals table
    op.drop_column('goals', 'progress_updated_at')
    op.drop_column('goals', 'progress')
