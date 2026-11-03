from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "sqlite+aiosqlite:///./vera.db"
    cookie_secure: bool = False
    cookie_name: str = "vera_session"
    allowed_origins: str = (
        "http://localhost:8080,http://127.0.0.1:8080,"
        "http://localhost:8000,http://127.0.0.1:8000"
    )
    retention_days: int = 7
    run_timeout_seconds: int = 180
    max_concurrent_runs: int = 3
    max_content_chars: int = 8000
    max_image_bytes: int = 5 * 1024 * 1024
    submissions_per_hour: int = 20
    login_attempts_per_minute: int = 5
    session_days: int = 14
    mock_provider: str = "1"
    model_api_key: str = ""
    meta_base_url: str = "https://api.meta.ai/v1"
    meta_model: str = "muse-spark-1.3"
    run_budget_usd: float = 0.50
    token_input_usd_per_million: float = 0.0
    token_output_usd_per_million: float = 0.0
    search_usd: float = 0.0
    fallback_model_api_key: str = ""
    fallback_meta_base_url: str = "https://api.meta.ai/v1"
    fallback_meta_model: str = "muse-spark-1.3"

    @property
    def origins(self) -> list[str]:
        return [item.strip().rstrip("/") for item in self.allowed_origins.split(",") if item.strip()]

    @property
    def async_database_url(self) -> str:
        url = self.database_url
        if url.startswith("postgresql://"):
            return url.replace("postgresql://", "postgresql+psycopg://", 1)
        if url.startswith("postgres://"):
            return url.replace("postgres://", "postgresql+psycopg://", 1)
        return url


@lru_cache
def get_settings() -> Settings:
    return Settings()
