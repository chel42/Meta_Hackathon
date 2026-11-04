import time
from collections import deque

from app.core.errors import ApiError


class SlidingWindow:
    def __init__(self, *, max_keys: int = 10_000) -> None:
        self._hits: dict[str, deque[float]] = {}
        self.max_keys = max_keys

    def hit(self, key: str, *, limit: int, window_seconds: float) -> None:
        now = time.monotonic()
        bucket = self._hits.get(key)
        if bucket is None:
            if len(self._hits) >= self.max_keys:
                self._prune(now, window_seconds)
            if len(self._hits) >= self.max_keys:
                raise ApiError(429, "rate_limited", "Too many requests")
            bucket = self._hits[key] = deque()
        cutoff = now - window_seconds
        while bucket and bucket[0] < cutoff:
            bucket.popleft()
        if not bucket:
            self._hits.pop(key, None)
        if len(bucket) >= limit:
            raise ApiError(429, "rate_limited", "Too many requests")
        bucket.append(now)
        self._hits[key] = bucket

    def _prune(self, now: float, window_seconds: float) -> None:
        cutoff = now - window_seconds
        expired = []
        for key, bucket in self._hits.items():
            while bucket and bucket[0] < cutoff:
                bucket.popleft()
            if not bucket:
                expired.append(key)
        for key in expired:
            self._hits.pop(key, None)


login_limiter = SlidingWindow()
submission_limiter = SlidingWindow()
