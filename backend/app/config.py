from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    openai_api_key: str = ""
    anthropic_api_key: str = ""
    chroma_db_path: str = "./data/chroma_db"
    embedding_model: str = "text-embedding-3-small"
    llm_model: str = "gpt-4o-mini"
    app_env: str = "development"
    cors_origins: str = "http://localhost:3000"

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.cors_origins.split(",")]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
