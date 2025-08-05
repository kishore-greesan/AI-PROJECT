import os
from typing import List

class Settings:
    # App settings
    APP_NAME: str = "Employee Performance Management System"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # Database settings
    DATABASE_URL: str = "sqlite:///./app.db"
    
    # JWT settings
    JWT_SECRET_KEY: str = "your-secret-key-change-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # CORS settings
    ALLOWED_ORIGINS: List[str] = ["*"]
    
    def __init__(self):
        # Override with environment variables
        if os.getenv("DATABASE_URL"):
            self.DATABASE_URL = os.getenv("DATABASE_URL")
        if os.getenv("JWT_SECRET_KEY"):
            self.JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
        if os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"):
            self.ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))
        if os.getenv("DEBUG"):
            self.DEBUG = os.getenv("DEBUG").lower() == "true"
        if os.getenv("ALLOWED_ORIGINS"):
            self.ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS").split(",")

# Create settings instance
settings = Settings() 