from datetime import datetime, timezone
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, HttpUrl

from app.schemas.agents import MediaAnalysis


class ProofModel(BaseModel):
    model_config = ConfigDict(extra="forbid")


class ProofEvidence(ProofModel):
    stance: Literal["supports", "contradicts", "context"]
    source_id: str
    excerpt: str = Field(max_length=300)


class ProofClaim(ProofModel):
    claim_id: str
    text: str
    verdict: Literal["supported", "contradicted", "unverifiable"]
    rationale: str
    evidence: list[ProofEvidence]
    limits: list[str]


class SourceSupportCheck(ProofModel):
    status: Literal["confirmed", "not_confirmed", "unreachable"]


class ProofSource(ProofModel):
    source_id: str
    url: HttpUrl
    title: str
    publisher: str = ""
    published_at: str | None = None
    retrieved_at: datetime
    snippet: str = ""
    support_check: SourceSupportCheck


class Advice(ProofModel):
    level: Literal["verify_source", "ask_confirmation", "avoid_sharing"]
    text: str


class Trace(ProofModel):
    provider: str
    model: str
    search_calls: int = Field(ge=0)
    budget_used: float = Field(ge=0)
    input_tokens: int = Field(default=0, ge=0)
    output_tokens: int = Field(default=0, ge=0)


class ProofReport(ProofModel):
    schema_version: Literal["1.0"] = "1.0"
    report_id: str
    run_id: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    input: dict[str, str]
    claims: list[ProofClaim]
    sources: list[ProofSource]
    media_analysis: MediaAnalysis | None = None
    limits: list[str]
    advice: Advice
    trace: Trace
