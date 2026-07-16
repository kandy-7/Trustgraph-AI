"""
TrustGraph AI – database/db.py
SQLite connection, session factory, and ORM base via SQLAlchemy.

The database file is placed at:
    <project_root>/backend/fraud_detection.db

Usage:
    from backend.database.db import get_db, init_db
"""

import os
from pathlib import Path

from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, declarative_base

# ──────────────────────────────────────────────
# Paths
# ──────────────────────────────────────────────
_HERE = Path(__file__).resolve().parent          # backend/database/
_DB_PATH = _HERE.parent / "fraud_detection.db"  # backend/fraud_detection.db

DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{_DB_PATH}")

# ──────────────────────────────────────────────
# Engine
# ──────────────────────────────────────────────
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},   # Required for SQLite
    echo=False,                                   # Set True to log SQL
)

# Enable WAL mode and foreign keys for every new connection
@event.listens_for(engine, "connect")
def _set_sqlite_pragmas(dbapi_conn, _connection_record):
    cursor = dbapi_conn.cursor()
    cursor.execute("PRAGMA journal_mode=WAL;")
    cursor.execute("PRAGMA foreign_keys=ON;")
    cursor.close()


# ──────────────────────────────────────────────
# Session Factory
# ──────────────────────────────────────────────
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# ──────────────────────────────────────────────
# ORM Declarative Base
# ──────────────────────────────────────────────
Base = declarative_base()


# ──────────────────────────────────────────────
# Dependency / Context Helper
# ──────────────────────────────────────────────
def get_db():
    """
    FastAPI dependency that yields a DB session and guarantees cleanup.

    Usage:
        db: Session = Depends(get_db)
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """
    Create all tables declared in models.py if they don't already exist.
    Call once at application startup.
    """
    from backend.models import db_models  # noqa: F401 – registers metadata
    Base.metadata.create_all(bind=engine)
