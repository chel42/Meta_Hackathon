import argparse
import asyncio
import base64
import json
import math
import mimetypes
import os
import random
import statistics
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from openai import APIStatusError
from pydantic import ValidationError

from app.agents.investigator import Investigator
from app.agents.pipeline import AgentPipeline
from app.agents.prompt_loader import load_prompt
from app.agents.source_verifier import normalize_url
from app.providers.base import Usage
from app.providers.meta import MetaProvider
from app.schemas.agents import ClaimList

SAMPLES = [
    "La Terre tourne autour du Soleil.",
    "L'eau bout à 100 degrés Celsius au niveau de la mer.",
    "Le mont Everest est le plus haut sommet au-dessus du niveau de la mer.",
    "La vaccination contre la rougeole réduit le risque de maladie.",
    "La Grande Muraille de Chine est visible à l'œil nu depuis la Lune.",
    "Le Japon compte plus de 100 millions d'habitants.",
    "Le français est une langue officielle de la Suisse.",
    "Les abeilles contribuent à la pollinisation de nombreuses plantes.",
    "Le Nil traverse plusieurs pays africains.",
    "La lumière du Soleil met environ huit minutes à atteindre la Terre.",
]

THREE_CLAIM_SAMPLE = (
    "La Terre tourne autour du Soleil. L'eau est composée d'hydrogène et d'oxygène. "
    "Le mont Everest est le plus haut sommet au-dessus du niveau de la mer."
)


def percentile(values: list[float], percentile_value: int) -> float | None:
    if not values:
        return None
    ordered = sorted(values)
    if percentile_value == 50:
        return round(statistics.median(ordered), 3)
    index = max(0, (len(ordered) * percentile_value + 99) // 100 - 1)
    return round(ordered[index], 3)


def estimate_cost(usage: Usage, rates: dict[str, float | None]) -> float | None:
    if not usage.reported or any(
        rates.get(key) is None for key in ("input", "output", "search")
    ):
        return None
    cost = (
        usage.input_tokens * rates["input"] / 1_000_000
        + usage.output_tokens * rates["output"] / 1_000_000
        + usage.searches * rates["search"]
    )
    return round(cost, 6)


def _rates_from_environment() -> dict[str, float | None]:
    names = {
        "input": "TOKEN_INPUT_USD_PER_MILLION",
        "output": "TOKEN_OUTPUT_USD_PER_MILLION",
        "search": "SEARCH_USD",
    }
    rates: dict[str, float | None] = {}
    for key, name in names.items():
        value = os.getenv(name)
        rate = float(value) if value else None
        if rate is not None and (not math.isfinite(rate) or rate < 0):
            raise ValueError(f"{name} doit être un nombre positif ou nul.")
        rates[key] = rate
    return rates


def _usage_from_chat(response: Any) -> Usage:
    raw_usage = getattr(response, "usage", None)
    return Usage(
        input_tokens=getattr(raw_usage, "prompt_tokens", 0) or 0,
        output_tokens=getattr(raw_usage, "completion_tokens", 0) or 0,
        reported=raw_usage is not None,
    )


def _is_strict_schema_rejection(error: APIStatusError) -> bool:
    message = str(error).casefold()
    return error.status_code == 400 and (
        "strict" in message or "json_schema" in message
    )


async def _chat_once_with_transient_retry(
    provider: MetaProvider, *, request: dict[str, Any]
) -> Any:
    for attempt in range(2):
        try:
            return await provider.client.chat.completions.create(**request)
        except APIStatusError as exc:
            if attempt or exc.status_code != 429 and exc.status_code < 500:
                raise
            await asyncio.sleep(random.uniform(0.25, 0.75))
    raise RuntimeError("Unreachable retry state")


async def _extract_sample(
    provider: MetaProvider, text: str
) -> tuple[bool, bool | None, int, Usage, str | None]:
    schema = ClaimList.model_json_schema()
    system_prompt = load_prompt("claim_extractor")
    user_prompt = f"Langue de réponse : fr\n\nContenu à analyser :\n{text}"
    strict_accepted: bool | None = None
    total_usage = Usage()

    for strict in (True, False):
        request = {
            "model": provider.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "response_format": {
                "type": "json_schema",
                "json_schema": {
                    "name": "ClaimList",
                    "strict": strict,
                    "schema": schema,
                },
            },
            "reasoning_effort": "low",
            "max_tokens": 4000,
            "timeout": 45,
        }
        try:
            response = await _chat_once_with_transient_retry(provider, request=request)
        except APIStatusError as exc:
            if strict and _is_strict_schema_rejection(exc):
                strict_accepted = False
                continue
            return False, strict_accepted, 1, total_usage, f"http_{exc.status_code}"
        except Exception as exc:
            return False, strict_accepted, 1, total_usage, type(exc).__name__

        if strict:
            strict_accepted = True
        total_usage = _add_usage(total_usage, _usage_from_chat(response))
        raw = response.choices[0].message.content
        try:
            if raw is None:
                raise ValueError("empty_response")
            ClaimList.model_validate_json(raw)
            return True, strict_accepted, 1, total_usage, None
        except (ValidationError, ValueError):
            correction = (
                f"{user_prompt}\n\nLa réponse précédente était invalide. "
                "Retourne un JSON corrigé conforme au schéma."
            )
            retry_request = dict(request)
            retry_request["messages"] = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": correction},
            ]
            try:
                retry_response = await _chat_once_with_transient_retry(
                    provider, request=retry_request
                )
                total_usage = _add_usage(total_usage, _usage_from_chat(retry_response))
                retry_raw = retry_response.choices[0].message.content
                if retry_raw is None:
                    raise ValueError("empty_response")
                ClaimList.model_validate_json(retry_raw)
                return False, strict_accepted, 2, total_usage, None
            except APIStatusError as exc:
                return False, strict_accepted, 2, total_usage, f"http_{exc.status_code}"
            except (ValidationError, ValueError):
                return False, strict_accepted, 2, total_usage, "invalid_json_or_schema"
            except Exception as exc:
                return False, strict_accepted, 2, total_usage, type(exc).__name__

    return False, strict_accepted, 1, total_usage, "strict_and_fallback_rejected"


def _add_usage(first: Usage, second: Usage) -> Usage:
    return Usage(
        input_tokens=first.input_tokens + second.input_tokens,
        output_tokens=first.output_tokens + second.output_tokens,
        searches=first.searches + second.searches,
        reported=first.reported and second.reported,
    )


def _usage_to_dict(usage: Usage) -> dict[str, int | bool]:
    return {
        "input_tokens": usage.input_tokens,
        "output_tokens": usage.output_tokens,
        "searches": usage.searches,
        "usage_reported": usage.reported,
    }


def _parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Mesure les critères de fumée Meta du ticket A-01."
    )
    parser.add_argument(
        "--three-claim-runs",
        type=int,
        default=0,
        metavar="N",
        help="Mesure N runs complets ciblant trois affirmations (1 à 5 ; appels Meta payants).",
    )
    parser.add_argument(
        "--image",
        type=Path,
        help="Image facultative pour le smoke test MediaAnalyst (appels Meta payants).",
    )
    parser.add_argument("--caption", default="", help="Légende facultative de l'image.")
    parser.add_argument(
        "--region-policy",
        choices=("verified", "not_verified", "pending"),
        default="pending",
        help="Confirmation manuelle par l'équipe de la politique géographique Meta.",
    )
    parser.add_argument("--region-policy-notes", default="")
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("eval/results/meta-smoke.json"),
        help="Chemin du rapport JSON, relatif au répertoire courant.",
    )
    return parser.parse_args()


async def _run(args: argparse.Namespace) -> tuple[dict[str, Any], bool]:
    key = os.environ.get("MODEL_API_KEY")
    if not key:
        raise SystemExit(
            "MODEL_API_KEY absent : définissez la clé dans l'environnement avant les tests live."
        )
    if args.image and not args.image.is_file():
        raise SystemExit(f"Image introuvable : {args.image}")
    if not 0 <= args.three_claim_runs <= 5:
        raise SystemExit("--three-claim-runs doit être compris entre 0 et 5.")

    rates = _rates_from_environment()
    run_budget = float(os.getenv("RUN_BUDGET_USD", "0.50"))
    if args.three_claim_runs:
        if any(rates[key] is None for key in ("input", "output", "search")):
            raise SystemExit(
                "Les tarifs d'entrée, de sortie et de recherche doivent être "
                "configurés pour appliquer le plafond du run à trois affirmations."
            )
        if not math.isfinite(run_budget) or run_budget <= 0:
            raise SystemExit("RUN_BUDGET_USD doit être strictement positif.")
    provider = MetaProvider(
        api_key=key,
        model=os.environ.get("META_MODEL", "muse-spark-1.3"),
        base_url=os.environ.get("META_BASE_URL", "https://api.meta.ai/v1"),
    )
    report: dict[str, Any] = {
        "schema_version": "1.0",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "provider": provider.name,
        "model": provider.model,
        "configured_rates_usd": rates,
        "claim_extractor": {},
        "web_search": {},
        "three_claim_run": {"status": "not_requested", "runs": []},
        "image_analysis": {"status": "not_requested"},
        "geographic_policy": {
            "status": args.region_policy,
            "notes": args.region_policy_notes,
            "verified_by_smoke_test": False,
        },
    }
    all_usage = Usage()
    strict_results: list[bool] = []
    extraction_results: list[dict[str, Any]] = []
    extraction_latencies: list[float] = []

    try:
        for sample in SAMPLES:
            started = time.perf_counter()
            valid, strict, attempts, usage, error = await _extract_sample(
                provider, sample
            )
            elapsed = time.perf_counter() - started
            all_usage = _add_usage(all_usage, usage)
            extraction_latencies.append(elapsed)
            if strict is not None:
                strict_results.append(strict)
            extraction_results.append(
                {
                    "first_response_valid": valid,
                    "attempts": attempts,
                    "latency_seconds": round(elapsed, 3),
                    "error": error,
                }
            )

        first_pass_count = sum(
            result["first_response_valid"] for result in extraction_results
        )
        report["claim_extractor"] = {
            "first_response_valid": first_pass_count,
            "sample_count": len(SAMPLES),
            "first_response_rate": first_pass_count / len(SAMPLES),
            "acceptance_target_met": first_pass_count >= 9,
            "strict_schema_accepted": (
                all(strict_results) if strict_results else None
            ),
            "strict_fallback_used": bool(strict_results) and not all(strict_results),
            "samples": extraction_results,
            "latency_p50_seconds": percentile(extraction_latencies, 50),
            "latency_p95_seconds": percentile(extraction_latencies, 95),
        }

        investigator = Investigator(provider)
        search_results = []
        search_latencies = []
        cited_total = 0
        cited_in_raw_total = 0
        citation_results_count = 0
        raw_result_responses = 0
        for claim in SAMPLES[:5]:
            started = time.perf_counter()
            try:
                result, usage = await investigator.investigate(claim)
                all_usage = _add_usage(all_usage, usage)
                cited_urls = {
                    normalize_url(str(item.url)) for item in result.citations
                }
                raw_urls = {
                    normalize_url(str(item.url)) for item in result.raw_results
                }
                cited_total += len(cited_urls)
                cited_in_raw_total += len(cited_urls & raw_urls)
                citation_results_count += bool(result.citations)
                raw_result_responses += bool(result.raw_results)
                search_latencies.append(time.perf_counter() - started)
                search_results.append(
                    {
                        "search_calls": result.search_calls,
                        "citation_count": len(result.citations),
                        "raw_result_count": len(result.raw_results),
                        "citation_urls_in_raw_results": len(cited_urls & raw_urls),
                        "citation_match_rate": (
                            len(cited_urls & raw_urls) / len(cited_urls)
                            if cited_urls
                            else None
                        ),
                        "latency_seconds": round(search_latencies[-1], 3),
                    }
                )
            except Exception as exc:
                search_latencies.append(time.perf_counter() - started)
                search_results.append(
                    {"error": type(exc).__name__, "latency_seconds": round(search_latencies[-1], 3)}
                )

        report["web_search"] = {
            "sample_count": len(search_results),
            "samples_with_citations": citation_results_count,
            "samples_with_raw_results": raw_result_responses,
            "citation_count": cited_total,
            "citation_urls_in_raw_results": cited_in_raw_total,
            "citation_match_rate": (
                cited_in_raw_total / cited_total if cited_total else None
            ),
            "searches_and_citations_target_met": (
                len(search_results) == 5
                and citation_results_count == 5
                and raw_result_responses == 5
            ),
            "latency_p50_seconds": percentile(search_latencies, 50),
            "latency_p95_seconds": percentile(search_latencies, 95),
            "samples": search_results,
        }

        if args.three_claim_runs:
            run_results = []
            run_latencies = []
            for run_number in range(1, args.three_claim_runs + 1):
                started = time.perf_counter()
                try:
                    result = await AgentPipeline(
                        provider,
                        budget_usd=run_budget,
                        token_input_usd_per_million=rates["input"],
                        token_output_usd_per_million=rates["output"],
                        search_usd=rates["search"],
                    ).run(THREE_CLAIM_SAMPLE)
                    elapsed = time.perf_counter() - started
                    run_latencies.append(elapsed)
                    all_usage = _add_usage(all_usage, result.usage)
                    run_results.append(
                        {
                            "run": run_number,
                            "status": "completed",
                            "claims_returned": len(result.report.claims),
                            "claim_verdicts": [
                                item.verdict for item in result.report.claims
                            ],
                            "latency_seconds": round(elapsed, 3),
                            "usage": _usage_to_dict(result.usage),
                            "budget_used_usd": result.report.trace.budget_used,
                            "configured_budget_usd": run_budget,
                            "reported_cost_usd": estimate_cost(result.usage, rates),
                        }
                    )
                except Exception as exc:
                    elapsed = time.perf_counter() - started
                    run_latencies.append(elapsed)
                    run_results.append(
                        {
                            "run": run_number,
                            "status": "failed",
                            "error": type(exc).__name__,
                            "latency_seconds": round(elapsed, 3),
                        }
                    )

            run_costs = [
                item["reported_cost_usd"]
                for item in run_results
                if item.get("reported_cost_usd") is not None
            ]
            report["three_claim_run"] = {
                "status": (
                    "completed"
                    if all(item["status"] == "completed" for item in run_results)
                    else "failed"
                ),
                "acceptance_target_met": all(
                    item["status"] == "completed" and item["claims_returned"] == 3
                    for item in run_results
                ),
                "sample_count": len(run_results),
                "latency_p50_seconds": percentile(run_latencies, 50),
                "latency_p95_seconds": percentile(run_latencies, 95),
                "cost_p50_usd": percentile(run_costs, 50),
                "cost_p95_usd": percentile(run_costs, 95),
                "cost_sample_count": len(run_costs),
                "cost_measurable_for_all_runs": len(run_costs) == len(run_results),
                "runs": run_results,
            }

        if args.image:
            mime_type, _ = mimetypes.guess_type(args.image.name)
            image_bytes = args.image.read_bytes()
            if mime_type not in {"image/jpeg", "image/png", "image/webp", "image/gif"}:
                raise SystemExit("Formats d'image pris en charge : JPEG, PNG, WebP et GIF.")
            if len(image_bytes) > 5 * 1024 * 1024:
                raise SystemExit("L'image dépasse la limite de 5 Mo.")
            data_url = (
                f"data:{mime_type};base64,"
                f"{base64.b64encode(image_bytes).decode('ascii')}"
            )
            started = time.perf_counter()
            try:
                analysis, usage = await provider.describe_image(
                    image_data_url=data_url,
                    caption=args.caption,
                    timeout=45,
                )
                all_usage = _add_usage(all_usage, usage)
                report["image_analysis"] = {
                    "status": "completed",
                    "caption_consistency": analysis.caption_consistency,
                    "provenance": analysis.provenance,
                    "latency_seconds": round(time.perf_counter() - started, 3),
                    "usage": _usage_to_dict(usage),
                    "reported_cost_usd": estimate_cost(usage, rates),
                }
            except Exception as exc:
                report["image_analysis"] = {
                    "status": "failed",
                    "error": type(exc).__name__,
                    "latency_seconds": round(time.perf_counter() - started, 3),
                }

        report["total_usage"] = _usage_to_dict(all_usage)
        report["estimated_total_cost_usd"] = estimate_cost(all_usage, rates)
        report["cost_measurable"] = estimate_cost(all_usage, rates) is not None
        report["notes"] = [
            "Les coûts sont estimés à partir des tarifs configurés dans les variables d'environnement.",
            "La politique géographique est une confirmation d'équipe, pas une mesure automatique.",
            "Le test de run à trois affirmations et l'analyse d'image sont optionnels pour maîtriser le coût.",
        ]
    finally:
        await provider.client.close()

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(
        json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(json.dumps(report, ensure_ascii=False, indent=2))

    required_checks = (
        report["claim_extractor"]["acceptance_target_met"]
        and report["web_search"]["searches_and_citations_target_met"]
    )
    if args.three_claim_runs:
        required_checks = (
            required_checks
            and report["three_claim_run"]["acceptance_target_met"]
        )
    if args.image:
        required_checks = required_checks and report["image_analysis"]["status"] == "completed"
    return report, required_checks


async def main() -> None:
    args = _parse_args()
    _, required_checks = await _run(args)
    if not required_checks:
        raise SystemExit(1)


if __name__ == "__main__":
    asyncio.run(main())
