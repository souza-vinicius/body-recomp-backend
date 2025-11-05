"""Core configuration settings for Body Recomp Backend.
Uses pydantic-settings to load configuration from environment variables.
"""
import json
from typing import Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Database Configuration
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/body_recomp"

    # Security Configuration
    SECRET_KEY: str = "your-secret-key-here-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Application Configuration
    DEBUG: bool = True
    API_V1_PREFIX: str = "/api/v1"
    PROJECT_NAME: str = "Body Recomp Backend"
    VERSION: str = "0.1.0"

    # CORS Configuration
    ALLOWED_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://localhost:8000",
    ]

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v: Union[str, list[str]]) -> list[str]:
        """Parse ALLOWED_ORIGINS from string or list.
        
        Accepts:
        - Single string: "https://example.com"
        - Comma-separated: "https://example.com,https://app.com"
        - JSON array: '["https://example.com","https://app.com"]'
        - List: ["https://example.com", "https://app.com"]
        """
        if isinstance(v, str):
            # Try to parse as JSON array first
            v = v.strip()
            if v.startswith("[") and v.endswith("]"):
                try:
                    return json.loads(v)
                except json.JSONDecodeError:
                    pass
            
            # Parse as comma-separated string
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        
        return v

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",  # Ignore extra environment variables
    )


# Global settings instance
settings = Settings()
