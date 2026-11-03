import os

from app.providers.fake import FakeProvider
from app.providers.fallback import FallbackProvider
from app.providers.meta import MetaProvider


def create_provider():
    if os.getenv("MOCK_PROVIDER", "1").strip().lower() in {"1", "true", "yes"}:
        return FakeProvider()
    api_key = os.getenv("MODEL_API_KEY")
    if not api_key:
        raise RuntimeError("MODEL_API_KEY is required when MOCK_PROVIDER is disabled")
    primary = MetaProvider(
        api_key=api_key,
        model=os.getenv("META_MODEL", "muse-spark-1.3"),
        base_url=os.getenv("META_BASE_URL", "https://api.meta.ai/v1"),
    )
    fallback_key = os.getenv("FALLBACK_MODEL_API_KEY")
    if not fallback_key:
        return primary
    fallback = MetaProvider(
        api_key=fallback_key,
        model=os.getenv("FALLBACK_META_MODEL", "muse-spark-1.3"),
        base_url=os.getenv("FALLBACK_META_BASE_URL", "https://api.meta.ai/v1"),
    )
    return FallbackProvider(primary, fallback)
