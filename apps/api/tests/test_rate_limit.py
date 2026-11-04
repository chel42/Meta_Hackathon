import pytest

from app.core.errors import ApiError
from app.core.rate_limit import SlidingWindow


def test_sliding_window_discards_expired_buckets(monkeypatch) -> None:
    import app.core.rate_limit as rate_limit

    now = 10.0
    monkeypatch.setattr(rate_limit.time, "monotonic", lambda: now)
    limiter = SlidingWindow(max_keys=2)
    limiter.hit("first", limit=1, window_seconds=5)
    assert "first" in limiter._hits

    now = 16.0
    limiter.hit("second", limit=1, window_seconds=5)
    now = 17.0
    limiter.hit("third", limit=1, window_seconds=5)
    assert "first" not in limiter._hits
    assert "second" in limiter._hits
    assert "third" in limiter._hits


def test_sliding_window_bounds_active_keys(monkeypatch) -> None:
    import app.core.rate_limit as rate_limit

    monkeypatch.setattr(rate_limit.time, "monotonic", lambda: 10.0)
    limiter = SlidingWindow(max_keys=2)
    limiter.hit("first", limit=5, window_seconds=60)
    limiter.hit("second", limit=5, window_seconds=60)

    with pytest.raises(ApiError) as raised:
        limiter.hit("third", limit=5, window_seconds=60)

    assert raised.value.status_code == 429
