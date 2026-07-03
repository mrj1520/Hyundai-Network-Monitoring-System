from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from app.core.config import settings
from typing import Generator

# Build connection engine
# Using PostgreSQL, so create_engine takes database url
# Pool pre-ping ensures stale connections are recycled
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency to provide transactional database sessions.
    Automatically closes session at completion of API request.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
