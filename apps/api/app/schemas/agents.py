from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, HttpUrl, field_validator


class StrictModel(BaseModel):
    model_config = ConfigDict(extra="forbid")


class Claim(StrictModel):
    text: str = Field(min_length=1, max_length=300)
    checkable: bool


class ClaimList(StrictModel):
    claims: list[Claim] = Field(max_length=3)


class Citation(StrictModel):
    url: HttpUrl
    title: str
    start_index: int = Field(ge=0)
    end_index: int = Field(ge=0)


class RawResult(StrictModel):
    url: HttpUrl
    title: str
    snippet: str


class Investigation(StrictModel):
    answer_text: str
    citations: list[Citation]
    raw_results: list[RawResult]
    search_calls: int = Field(ge=0, le=2)


class SourceCheck(StrictModel):
    source_id: str
    url: HttpUrl
    title: str
    status: Literal["confirmed", "not_confirmed", "unreachable"]
    snippet: str


class EvidenceCandidate(StrictModel):
    source_id: str
    stance: Literal["supports", "contradicts", "context"]
    excerpt: str = Field(max_length=300)

    @field_validator("excerpt")
    @classmethod
    def excerpt_has_at_most_25_words(cls, value: str) -> str:
        if len(value.split()) > 25:
            raise ValueError("Evidence excerpts must contain at most 25 words")
        return value


class ClaimVerdict(StrictModel):
    verdict: Literal["supported", "contradicted", "unverifiable"]
    rationale: str
    evidence: list[EvidenceCandidate]
    limits: list[str]

    @field_validator("rationale")
    @classmethod
    def rationale_has_at_most_60_words(cls, value: str) -> str:
        if len(value.split()) > 60:
            raise ValueError("Rationale must contain at most 60 words")
        return value


class MediaAnalysis(StrictModel):
    observations: list[str]
    caption_consistency: Literal["consistent", "inconsistent", "unclear"]
    provenance: Literal["not_assessed"]
