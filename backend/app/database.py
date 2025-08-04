from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config.settings import settings
import os

# Determine database URL based on environment
if os.getenv("DATABASE_URL"):
    # Use PostgreSQL for Railway deployment
    DATABASE_URL = os.getenv("DATABASE_URL")
    # Convert Railway's PostgreSQL URL if needed
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
else:
    # Use SQLite for local development
    DATABASE_URL = settings.DATABASE_URL

# Create SQLAlchemy engine
engine = create_engine(
    DATABASE_URL,
    echo=settings.DEBUG,  # Enable SQL logging in debug mode
    pool_pre_ping=True,   # Enable connection health checks
    pool_recycle=300,     # Recycle connections every 5 minutes
)

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class
Base = declarative_base()

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 