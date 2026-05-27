from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    groq_api_key: str = ""
    groq_model: str = "llama-3.3-70b-versatile"
    # Optional paid provider (leave empty for Groq-only / free setup)
    openai_api_key: str = ""
    chroma_db_path: str = "./data/chroma_db"
    notes_dir: str = "./data/notes"
    embedding_model: str = "text-embedding-3-small"
    local_embedding_model: str = "all-MiniLM-L6-v2"
    llm_model: str = "gpt-4o-mini"  # only used when OPENAI_API_KEY is set
    app_env: str = "development"
    cors_origins: str = "http://localhost:3000"

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.cors_origins.split(",")]


settings = Settings()
