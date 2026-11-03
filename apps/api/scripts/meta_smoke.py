import asyncio
import json
import os
import statistics
import time
from pathlib import Path

from app.agents.claim_extractor import ClaimExtractor
from app.agents.investigator import Investigator
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


async def main() -> None:
    key = os.environ.get("MODEL_API_KEY")
    if not key:
        raise SystemExit("Set MODEL_API_KEY to run the opt-in live Meta smoke tests.")
    provider = MetaProvider(
        api_key=key,
        model=os.environ.get("META_MODEL", "muse-spark-1.3"),
        base_url=os.environ.get("META_BASE_URL", "https://api.meta.ai/v1"),
    )
    extractor = ClaimExtractor(provider)
    extraction_results = []
    latencies = []
    for sample in SAMPLES:
        started = time.perf_counter()
        try:
            result, _ = await extractor.extract(sample)
            valid = isinstance(result, ClaimList) and len(result.claims) <= 3
            extraction_results.append(valid)
        except Exception as exc:
            extraction_results.append(False)
            print(f"Extraction failed: {type(exc).__name__}")
        latencies.append(time.perf_counter() - started)

    factual_claims = SAMPLES[:5]
    search_results = []
    investigator = Investigator(provider)
    for claim in factual_claims:
        started = time.perf_counter()
        try:
            result, _ = await investigator.investigate(claim)
            cited = {str(citation.url) for citation in result.citations}
            raw = {str(item.url) for item in result.raw_results}
            search_results.append({
                "searched": result.search_calls > 0,
                "has_citation": bool(cited),
                "citation_in_raw_results": len(cited & raw) / len(cited) if cited else None,
                "latency_seconds": time.perf_counter() - started,
            })
        except Exception as exc:
            search_results.append({"error": type(exc).__name__})

    report = {
        "claim_extractor": {
            "first_pass_valid": sum(extraction_results),
            "sample_count": len(SAMPLES),
            "first_pass_rate": sum(extraction_results) / len(SAMPLES),
            "latency_p50_seconds": statistics.median(latencies),
            "latency_p95_seconds": sorted(latencies)[int(0.95 * (len(latencies) - 1))],
        },
        "web_search": search_results,
        "note": "Geographic policy, image analysis, and run cost require manual/team confirmation.",
    }
    output = Path("eval/results/meta-smoke.json")
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False, indent=2))
    await provider.client.close()


if __name__ == "__main__":
    asyncio.run(main())
