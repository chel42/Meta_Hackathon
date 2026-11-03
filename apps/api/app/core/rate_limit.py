import time
from collections import defaultdict, deque

from app.core.errors import ApiError


class SlidingWindow:
    def __init__(self) -> None:
        self._hits: dict[str, deque[float]] = defaultdict(deque)

    def hit(self, key: str, *, limit: int, window_seconds: float) -> None:
        now = time.monotonic()
        bucket = self._hits[key]
        cutoff = now - window_seconds
        while bucket and bucket[0] < cutoff:
            bucket.popleft()
        if len(bucket) >= limit:
            raise ApiError(429, "rate_limited", "Too many requests")
        bucket.append(now)


login_limiter = SlidingWindow()
submission_limiter = SlidingWindow()
