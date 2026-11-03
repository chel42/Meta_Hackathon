import pytest

from app.providers.base import Usage
from scripts.meta_smoke import _rates_from_environment, estimate_cost, percentile


def test_percentile_uses_median_for_p50_and_nearest_rank_for_p95() -> None:
    assert percentile([4, 1, 3, 2], 50) == 2.5
    assert percentile([4, 1, 3, 2], 95) == 4
    assert percentile([], 95) is None


def test_cost_requires_every_configured_rate() -> None:
    usage = Usage(input_tokens=1_000_000, output_tokens=500_000, searches=2)
    assert estimate_cost(
        usage, {"input": 1.0, "output": 2.0, "search": 0.25}
    ) == 2.5
    assert estimate_cost(
        usage, {"input": 1.0, "output": 2.0, "search": None}
    ) is None
    assert estimate_cost(
        Usage(reported=False),
        {"input": 1.0, "output": 2.0, "search": 0.25},
    ) is None


def test_percentile_handles_single_sample_for_opt_in_run_measurements() -> None:
    assert percentile([12.5], 50) == 12.5
    assert percentile([12.5], 95) == 12.5


def test_rates_are_loaded_without_treating_missing_values_as_zero(monkeypatch) -> None:
    monkeypatch.delenv("TOKEN_INPUT_USD_PER_MILLION", raising=False)
    monkeypatch.setenv("TOKEN_OUTPUT_USD_PER_MILLION", "2")
    monkeypatch.setenv("SEARCH_USD", "0.25")

    assert _rates_from_environment() == {
        "input": None,
        "output": 2.0,
        "search": 0.25,
    }


def test_negative_rates_are_rejected(monkeypatch) -> None:
    monkeypatch.setenv("TOKEN_INPUT_USD_PER_MILLION", "-1")

    with pytest.raises(ValueError, match="nombre positif ou nul"):
        _rates_from_environment()
