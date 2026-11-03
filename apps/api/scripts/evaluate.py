"""Run the 24-case evaluation against the provider selected by environment."""

from __future__ import annotations

import argparse
import asyncio
from datetime import datetime, timezone
import hashlib
import json
import os
from pathlib import Path
import time

from app.agents.pipeline import AgentPipeline
from app.providers.factory import create_provider

CASES = Path(__file__).resolve().parents[1] / "eval" / "cases.json"
DEFAULT_OUT = Path(__file__).resolve().parents[1] / "eval" / "results" / "report.json"


def _citation_results(report) -> tuple[int, int]:
    sources = {source.source_id: source for source in report.sources}
    checked = 0
    valid = 0
    for claim in report.claims:
        for evidence in claim.evidence:
            checked += 1
            source = sources.get(evidence.source_id)
            if (
                source is not None
                and source.support_check.status == "confirmed"
                and evidence.excerpt.strip()
                and evidence.excerpt.casefold() in source.snippet.casefold()
            ):
                valid += 1
    return checked, valid


def _verdict_consistency(report) -> tuple[int, int]:
    sources = {source.source_id: source for source in report.sources}
    consistent = 0
    for claim in report.claims:
        cited_sources_confirmed = all(
            evidence.source_id in sources
            and sources[evidence.source_id].support_check.status == "confirmed"
            for evidence in claim.evidence
        )
        matching_stance = any(
            evidence.stance
            == {"supported": "supports", "contradicted": "contradicts"}.get(
                claim.verdict
            )
            for evidence in claim.evidence
        )
        if claim.verdict == "unverifiable":
            valid = not claim.evidence
        else:
            valid = bool(claim.evidence) and matching_stance and cited_sources_confirmed
        consistent += int(valid)
    return len(report.claims), consistent


async def evaluate(output: Path) -> dict:
    dataset_bytes = CASES.read_bytes()
    cases = json.loads(dataset_bytes)
    if len(cases) != 24:
        raise ValueError(f"Expected 24 evaluation cases, found {len(cases)}")

    pipeline = AgentPipeline(create_provider())
    rows = []
    citation_checks = 0
    valid_citations = 0
    claim_checks = 0
    consistent_claims = 0
    start = time.perf_counter()
    for case in cases:
        case_start = time.perf_counter()
        result = await pipeline.run(case["text"], language="fr")
        report = result.report
        verdicts = [claim.verdict for claim in report.claims]
        actual = (
            "contradicted" if "contradicted" in verdicts else
            "supported" if "supported" in verdicts else
            "unverifiable"
        )
        checked, valid = _citation_results(report)
        claim_count, coherent = _verdict_consistency(report)
        citation_checks += checked
        valid_citations += valid
        claim_checks += claim_count
        consistent_claims += coherent
        rows.append(
            {
                "id": case["id"],
                "expected": case["expected"],
                "actual": actual,
                "agree": actual == case["expected"],
                "claims": len(report.claims),
                "citations_checked": checked,
                "citations_valid": valid,
                "claims_consistent": coherent,
                "provider": report.trace.provider,
                "model": report.trace.model,
                "input_tokens": report.trace.input_tokens,
                "output_tokens": report.trace.output_tokens,
                "latency_s": round(time.perf_counter() - case_start, 3),
                "budget_used": report.trace.budget_used,
            }
        )

    total_latency = time.perf_counter() - start
    summary = {
        "schema_version": 1,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "command": "py -3 scripts/evaluate.py (MOCK_PROVIDER=1)",
        "provider_mode": os.getenv("MOCK_PROVIDER", "1"),
        "configured_provider": pipeline.provider.name,
        "limitations": (
            "Avec FakeProvider, les sorties et sources sont synthétiques : "
            "ces métriques valident le pipeline et les contrats, pas la véracité factuelle."
        ),
        "dataset": {
            "path": "eval/cases.json",
            "sha256": hashlib.sha256(dataset_bytes).hexdigest(),
            "cases": len(cases),
        },
        "metrics": {
            "agreement": sum(row["agree"] for row in rows) / len(rows),
            "valid_citations": (
                valid_citations / citation_checks if citation_checks else None
            ),
            "citation_checks": citation_checks,
            "verdict_consistency": (
                consistent_claims / claim_checks if claim_checks else None
            ),
            "claim_checks": claim_checks,
            "latency_s_total": round(total_latency, 3),
            "budget_used_total": round(
                sum(row["budget_used"] for row in rows), 6
            ),
            "input_tokens_total": sum(row["input_tokens"] for row in rows),
            "output_tokens_total": sum(row["output_tokens"] for row in rows),
        },
        "results": rows,
    }
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(summary, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return summary


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUT)
    args = parser.parse_args()
    summary = asyncio.run(evaluate(args.output))
    print(json.dumps(summary["metrics"] | {"cases": summary["dataset"]["cases"]}, indent=2))
    print(f"Report: {args.output}")


if __name__ == "__main__":
    main()
