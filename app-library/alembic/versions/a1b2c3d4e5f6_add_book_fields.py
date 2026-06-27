"""add description, image, price fields to books table

Revision ID: a1b2c3d4e5f6
Revises: e1926166defe
Create Date: 2026-06-27 23:26:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = 'e1926166defe'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('books', sa.Column('description', sa.String(length=200), nullable=True))
    op.add_column('books', sa.Column('image', sa.String(length=500), nullable=True))
    op.add_column('books', sa.Column('price', sa.Numeric(precision=12, scale=3), nullable=True, server_default=sa.text('0.000')))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('books', 'price')
    op.drop_column('books', 'image')
    op.drop_column('books', 'description')
