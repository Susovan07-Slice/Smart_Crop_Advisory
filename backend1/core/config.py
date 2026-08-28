from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "Krushi Shayaka"
    
    # LLM Settings
    LLM_API_BASE: str = "http://localhost:11434/v1"
    LLM_MODEL_NAME: str = "qwen2.5:14b"
    LLM_API_KEY: str = "sk-dummy"
    
    # API Keys
    WEATHERSTACK_API_KEY: Optional[str] = None
    MANDI_API_KEY: Optional[str] = None
    
    # Database
    DATABASE_URL: Optional[str] = None
    
    class Config:
        env_file = ".env"

settings = Settings()
