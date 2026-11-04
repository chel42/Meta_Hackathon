"""allow unknown provider cost to remain unknown

Revision ID: 0002_nullable_budget_cost
Revises: 0001_initial
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0002_nullable_budget_cost"
down_revision: Union[str, Sequence[str], None] = "0001_initial"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table("runs") as batch_op:
        batch_op.alter_column(
            "budget_used",
            existing_type=sa.Float(),
            nullable=True,
            existing_server_default="0",
            server_default=None,
        )


def downgrade() -> None:
    op.execute("UPDATE runs SET budget_used = 0 WHERE budget_used IS NULL")
    with op.batch_alter_table("runs") as batch_op:
        batch_op.alter_column(
            "budget_used",
            existing_type=sa.Float(),
            nullable=False,
            existing_server_default="0",
            server_default="0",
        )
