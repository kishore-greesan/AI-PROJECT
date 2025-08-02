from pydantic_settings import BaseSettings
from typing import Optional
import os
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    # Database settings - Use environment variable or default to SQLite
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./epms.db?check_same_thread=False")
    
    # JWT settings
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Security settings
    PASSWORD_MIN_LENGTH: int = 8
    PASSWORD_REQUIRE_UPPERCASE: bool = True
    PASSWORD_REQUIRE_LOWERCASE: bool = True
    PASSWORD_REQUIRE_DIGITS: bool = True
    PASSWORD_REQUIRE_SPECIAL: bool = True
    
    # CORS settings - Add production URLs
    CORS_ORIGINS: list = [
        "http://localhost:3000", 
        "http://localhost:5173",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:3003",
        "https://your-frontend-domain.vercel.app"  # Replace with your actual Vercel domain
    ]
    
    # Rate limiting
    RATE_LIMIT_PER_MINUTE: int = 100
    
    # Application settings
    APP_NAME: str = "Employee Performance Management System"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"
    
    class Config:
        env_file = ".env"

settings = Settings() 