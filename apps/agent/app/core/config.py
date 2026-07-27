from functools import lru_cache

from pydantic import Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "VUELVE IA"
    environment: str = "development"
    feature_generation: bool = False
    internal_secret: str = Field(default="", min_length=0)
    gemini_api_key: str = ""
    supabase_url: str = ""
    supabase_secret_key: str = ""
    gemini_model: str = "gemini-3.6-flash"
    embedding_model: str = "gemini-embedding-2"
    embedding_dimensions: int = 768
    daily_response_limit: int = 5

    @model_validator(mode="after")
    def validate_generation_configuration(self) -> "Settings":
        if self.feature_generation and not all(
            (
                self.internal_secret,
                self.gemini_api_key,
                self.supabase_url,
                self.supabase_secret_key,
            )
        ):
            raise ValueError(
                "Generation requires internal, Gemini and Supabase credentials"
            )
        if self.feature_generation and len(self.internal_secret) < 32:
            raise ValueError("INTERNAL_SECRET must contain at least 32 characters")
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()
