"""initial vera schema

Revision ID: 0001_initial
Revises:
Create Date: 2026-11-03
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0001_initial"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("email", sa.String(320), nullable=False, unique=True),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("display_name", sa.String(120), nullable=False, server_default=""),
        sa.Column("language", sa.String(8), nullable=False, server_default="fr"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    op.create_table(
        "sessions",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("user_id", sa.String(36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("token_hash", sa.String(64), nullable=False, unique=True),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("user_agent", sa.String(512), nullable=False, server_default=""),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_sessions_user_id", "sessions", ["user_id"])
    op.create_index("ix_sessions_token_hash", "sessions", ["token_hash"], unique=True)
    op.create_index("ix_sessions_expires_at", "sessions", ["expires_at"])

    op.create_table(
        "submissions",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("user_id", sa.String(36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("type", sa.String(16), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("language", sa.String(8), nullable=False, server_default="fr"),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_submissions_user_id", "submissions", ["user_id"])
    op.create_index("ix_submissions_expires_at", "submissions", ["expires_at"])

    op.create_table(
        "runs",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("user_id", sa.String(36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("submission_id", sa.String(36), sa.ForeignKey("submissions.id", ondelete="CASCADE"), nullable=False),
        sa.Column("status", sa.String(16), nullable=False, server_default="queued"),
        sa.Column("current_step", sa.String(32), nullable=False, server_default="intake"),
        sa.Column("budget_used", sa.Float(), nullable=False, server_default="0"),
        sa.Column("report_id", sa.String(36), nullable=True),
        sa.Column("error_code", sa.String(64), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("finished_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_runs_user_created", "runs", ["user_id", "created_at"])
    op.create_index("ix_runs_status", "runs", ["status"])

    op.create_table(
        "claims",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("run_id", sa.String(36), sa.ForeignKey("runs.id", ondelete="CASCADE"), nullable=False),
        sa.Column("claim_id", sa.String(32), nullable=False),
        sa.Column("text", sa.String(300), nullable=False),
        sa.Column("verdict", sa.String(16), nullable=False),
        sa.Column("rationale", sa.Text(), nullable=False, server_default=""),
    )
    op.create_index("ix_claims_run_id", "claims", ["run_id"])

    op.create_table(
        "sources",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("run_id", sa.String(36), sa.ForeignKey("runs.id", ondelete="CASCADE"), nullable=False),
        sa.Column("source_id", sa.String(32), nullable=False),
        sa.Column("url", sa.Text(), nullable=False),
        sa.Column("title", sa.String(500), nullable=False, server_default=""),
        sa.Column("publisher", sa.String(255), nullable=False, server_default=""),
        sa.Column("support_status", sa.String(16), nullable=False),
        sa.Column("snippet", sa.Text(), nullable=False, server_default=""),
    )
    op.create_index("ix_sources_run_id", "sources", ["run_id"])

    op.create_table(
        "evidence",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("claim_pk", sa.String(36), sa.ForeignKey("claims.id", ondelete="CASCADE"), nullable=False),
        sa.Column("source_id", sa.String(32), nullable=False),
        sa.Column("stance", sa.String(16), nullable=False),
        sa.Column("excerpt", sa.String(300), nullable=False),
    )
    op.create_index("ix_evidence_claim_pk", "evidence", ["claim_pk"])

    op.create_table(
        "reports",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("run_id", sa.String(36), sa.ForeignKey("runs.id", ondelete="CASCADE"), nullable=False, unique=True),
        sa.Column("schema_version", sa.String(16), nullable=False, server_default="1.0"),
        sa.Column("payload", sa.JSON(), nullable=False),
    )

    op.create_table(
        "trace_events",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("run_id", sa.String(36), sa.ForeignKey("runs.id", ondelete="CASCADE"), nullable=False),
        sa.Column("seq", sa.Integer(), nullable=False),
        sa.Column("type", sa.String(64), nullable=False),
        sa.Column("payload", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint("run_id", "seq", name="uq_trace_events_run_seq"),
    )
    op.create_index("ix_trace_events_run_id", "trace_events", ["run_id"])


def downgrade() -> None:
    op.drop_table("trace_events")
    op.drop_table("reports")
    op.drop_table("evidence")
    op.drop_table("sources")
    op.drop_table("claims")
    op.drop_table("runs")
    op.drop_table("submissions")
    op.drop_table("sessions")
    op.drop_table("users")
