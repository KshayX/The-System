from functools import lru_cache
from pydantic import BaseSettings, Field


class Settings(BaseSettings):
    app_name: str = "Real Life Solo Levelling System"
    secret_key: str = Field(default="supersecretchange", env="SOLO_SYSTEM_SECRET_KEY")
    access_token_expire_minutes: int = 60 * 24
    database_url: str = Field(default="sqlite:///./solo_system.db", env="SOLO_SYSTEM_DATABASE_URL")
    daily_reset_hour: int = 5

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache
def get_settings() -> Settings:
    return Settings()
