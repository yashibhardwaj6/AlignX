from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql+psycopg://alignx:alignx@localhost:5432/alignx"
    jwt_secret: str = "dev-alignx-secret"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 720
    frontend_origin: str = "http://localhost:5173"

    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache
def get_settings() -> Settings:
    return Settings()
