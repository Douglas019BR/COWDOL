"""Application settings loaded from the environment."""

import os
from dataclasses import dataclass

DEFAULT_ORIGINS = "http://localhost:3000,http://localhost:5173"


@dataclass(frozen=True)
class Settings:
    """Runtime configuration for the API."""

    cors_origins: tuple[str, ...]
    cache_ttl_seconds: int


def get_settings() -> Settings:
    """Build settings from environment variables."""
    origins = os.getenv("COWDOL_CORS_ORIGINS", DEFAULT_ORIGINS)
    ttl = int(os.getenv("COWDOL_CACHE_TTL_SECONDS", "300"))
    return Settings(
        cors_origins=tuple(
            origin.strip() for origin in origins.split(",") if origin.strip()
        ),
        cache_ttl_seconds=ttl,
    )
