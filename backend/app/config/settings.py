from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    # App settings
    APP_NAME: str = "Employee Performance Management System"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # Database settings
    DATABASE_URL: str = "sqlite:///./epms.db"
    
    # JWT settings
    JWT_SECRET_KEY: str = "your-secret-key-change-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # CORS settings
    ALLOWED_ORIGINS: list = ["*"]
    
    class Config:
        env_file = ".env"
        case_sensitive = True

# Create settings instance
settings = Settings()

# Override database URL for Railway if DATABASE_URL is provided
if os.getenv("DATABASE_URL"):
    settings.DATABASE_URL = os.getenv("DATABASE_URL")

# Override JWT secret for Railway if provided
if os.getenv("JWT_SECRET_KEY"):
    settings.JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")

# Override debug mode for Railway
if os.getenv("DEBUG"):
    settings.DEBUG = os.getenv("DEBUG").lower() == "true" 