"""
TrustGraph AI - Database Configuration
SQLite connection and session management via SQLAlchemy
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from backend.config import DATABASE_URL

# ──────────────────────────────────────────────
# Engine
# ──────────────────────────────────────────────
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}   # Required for SQLite
)

# ──────────────────────────────────────────────
# Session Factory
# ──────────────────────────────────────────────
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# ──────────────────────────────────────────────
# ORM Base
# ──────────────────────────────────────────────
Base = declarative_base()


def get_db():
    """
    FastAPI dependency that yields a DB session and ensures cleanup.
    Usage:
        db: Session = Depends(get_db)
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Create all tables defined in ORM models."""
    # Import models so SQLAlchemy registers them before create_all()
    from backend.models import db_models  # noqa: F401
    Base.metadata.create_all(bind=engine)
