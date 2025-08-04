import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "sqlite:///./app.db"
    
    # JWT Settings
    JWT_SECRET_KEY: str = "your-secret-key-change-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS Settings
    ALLOWED_ORIGINS: List[str] = ["*"]
    
    # Debug Mode
    DEBUG: bool = False
    
    # API Settings
    API_V1_STR: str = "/api"
    PROJECT_NAME: str = "Employee Performance Management"
    
    class Config:
        env_file = ".env"

# Create settings instance
settings = Settings()

# Override with environment variables for Render
if os.getenv("DATABASE_URL"):
    settings.DATABASE_URL = os.getenv("DATABASE_URL")
if os.getenv("JWT_SECRET_KEY"):
    settings.JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
if os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"):
    settings.ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))
if os.getenv("DEBUG"):
    settings.DEBUG = os.getenv("DEBUG").lower() == "true"
if os.getenv("ALLOWED_ORIGINS"):
    settings.ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS").split(",") 