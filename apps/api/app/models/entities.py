from datetime import datetime, timezone
from uuid import uuid4

from sqlalchemy import DateTime, Float, ForeignKey, Index, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import JSON

from app.db.base import Base


def _uuid() -> str:
    return str(uuid4())


def _now() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    email: Mapped[str] = mapped_column(String(320), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    display_name: Mapped[str] = mapped_column(String(120), default="")
    language: Mapped[str] = mapped_column(String(8), default="fr")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)

    sessions: Mapped[list["AuthSession"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    submissions: Mapped[list["Submission"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    runs: Mapped[list["Run"]] = relationship(back_populates="user", cascade="all, delete-orphan")


class AuthSession(Base):
    __tablename__ = "sessions"
    __table_args__ = (Index("ix_sessions_user_id", "user_id"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    token_hash: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    user_agent: Mapped[str] = mapped_column(String(512), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)

    user: Mapped[User] = relationship(back_populates="sessions")


class Submission(Base):
    __tablename__ = "submissions"
    __table_args__ = (Index("ix_submissions_user_id", "user_id"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    type: Mapped[str] = mapped_column(String(16))
    content: Mapped[str] = mapped_column(Text)
    language: Mapped[str] = mapped_column(String(8), default="fr")
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)

    user: Mapped[User] = relationship(back_populates="submissions")
    runs: Mapped[list["Run"]] = relationship(back_populates="submission", cascade="all, delete-orphan")


class Run(Base):
    __tablename__ = "runs"
    __table_args__ = (Index("ix_runs_user_created", "user_id", "created_at"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    submission_id: Mapped[str] = mapped_column(ForeignKey("submissions.id", ondelete="CASCADE"))
    status: Mapped[str] = mapped_column(String(16), default="queued", index=True)
    current_step: Mapped[str] = mapped_column(String(32), default="intake")
    budget_used: Mapped[float | None] = mapped_column(Float, nullable=True, default=None)
    report_id: Mapped[str | None] = mapped_column(String(36), nullable=True)
    error_code: Mapped[str | None] = mapped_column(String(64), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    finished_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    user: Mapped[User] = relationship(back_populates="runs")
    submission: Mapped[Submission] = relationship(back_populates="runs")
    claims: Mapped[list["ClaimRecord"]] = relationship(back_populates="run", cascade="all, delete-orphan")
    sources: Mapped[list["SourceRecord"]] = relationship(back_populates="run", cascade="all, delete-orphan")
    report: Mapped["Report | None"] = relationship(back_populates="run", cascade="all, delete-orphan", uselist=False)
    events: Mapped[list["TraceEvent"]] = relationship(back_populates="run", cascade="all, delete-orphan")


class ClaimRecord(Base):
    __tablename__ = "claims"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    run_id: Mapped[str] = mapped_column(ForeignKey("runs.id", ondelete="CASCADE"), index=True)
    claim_id: Mapped[str] = mapped_column(String(32))
    text: Mapped[str] = mapped_column(String(300))
    verdict: Mapped[str] = mapped_column(String(16))
    rationale: Mapped[str] = mapped_column(Text, default="")

    run: Mapped[Run] = relationship(back_populates="claims")
    evidence: Mapped[list["EvidenceRecord"]] = relationship(back_populates="claim", cascade="all, delete-orphan")


class SourceRecord(Base):
    __tablename__ = "sources"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    run_id: Mapped[str] = mapped_column(ForeignKey("runs.id", ondelete="CASCADE"), index=True)
    source_id: Mapped[str] = mapped_column(String(32))
    url: Mapped[str] = mapped_column(Text)
    title: Mapped[str] = mapped_column(String(500), default="")
    publisher: Mapped[str] = mapped_column(String(255), default="")
    support_status: Mapped[str] = mapped_column(String(16))
    snippet: Mapped[str] = mapped_column(Text, default="")

    run: Mapped[Run] = relationship(back_populates="sources")


class EvidenceRecord(Base):
    __tablename__ = "evidence"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    claim_pk: Mapped[str] = mapped_column(ForeignKey("claims.id", ondelete="CASCADE"), index=True)
    source_id: Mapped[str] = mapped_column(String(32))
    stance: Mapped[str] = mapped_column(String(16))
    excerpt: Mapped[str] = mapped_column(String(300))

    claim: Mapped[ClaimRecord] = relationship(back_populates="evidence")


class Report(Base):
    __tablename__ = "reports"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    run_id: Mapped[str] = mapped_column(ForeignKey("runs.id", ondelete="CASCADE"), unique=True)
    schema_version: Mapped[str] = mapped_column(String(16), default="1.0")
    payload: Mapped[dict] = mapped_column(JSON)

    run: Mapped[Run] = relationship(back_populates="report")


class TraceEvent(Base):
    __tablename__ = "trace_events"
    __table_args__ = (UniqueConstraint("run_id", "seq", name="uq_trace_events_run_seq"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    run_id: Mapped[str] = mapped_column(ForeignKey("runs.id", ondelete="CASCADE"), index=True)
    seq: Mapped[int] = mapped_column(Integer)
    type: Mapped[str] = mapped_column(String(64))
    payload: Mapped[dict] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)

    run: Mapped[Run] = relationship(back_populates="events")
