"""
TrustGraph AI – database/load_data.py
CSV → SQLite pipeline.

Reads each CSV from backend/data/, validates every row, and upserts
clean records into the corresponding SQLite table.

Run directly:
    python -m backend.database.load_data
    # or from project root:
    python backend/database/load_data.py
"""

from __future__ import annotations

import csv
import sys
from datetime import datetime
from pathlib import Path
from typing import Any

# ── Allow running as __main__ without installing the package ──────────────────
_PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(_PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(_PROJECT_ROOT))
# ─────────────────────────────────────────────────────────────────────────────

from backend.database.db import SessionLocal, init_db
from backend.database.models import (
    Transaction, UserProfile, BlacklistedAccount, FraudPattern
)
from backend.database.validators import check_required_columns, validate_row

# ──────────────────────────────────────────────
# Paths
# ──────────────────────────────────────────────
_DATA_DIR = Path(__file__).resolve().parents[1] / "data"

CSV_FILES = {
    "transactions":         _DATA_DIR / "transactions.csv",
    "user_profiles":        _DATA_DIR / "user_profiles.csv",
    "blacklisted_accounts": _DATA_DIR / "blacklisted_accounts.csv",
    "fraud_patterns":       _DATA_DIR / "fraud_patterns.csv",
}


# ──────────────────────────────────────────────
# Logging helpers
# ──────────────────────────────────────────────
def _ts() -> str:
    return datetime.now().strftime("%H:%M:%S")


def _info(msg: str) -> None:
    print(f"[INFO  {_ts()}] {msg}")


def _warn(msg: str) -> None:
    print(f"[WARN  {_ts()}] {msg}", file=sys.stderr)


def _ok(msg: str) -> None:
    print(f"[OK    {_ts()}] {msg}")


# ──────────────────────────────────────────────
# Generic CSV reader
# ──────────────────────────────────────────────
def _read_csv(path: Path, table: str) -> list[dict[str, Any]]:
    """
    Read a CSV, check required columns, validate each row.
    Returns a list of clean row dicts; bad rows are skipped with warnings.
    """
    if not path.exists():
        _warn(f"File not found, skipping: {path}")
        return []

    rows: list[dict[str, Any]] = []
    with open(path, newline="", encoding="utf-8") as fh:
        reader = csv.DictReader(fh)
        headers = reader.fieldnames or []

        # ── column-presence check ──────────────
        missing_cols = check_required_columns(list(headers), table)
        if missing_cols:
            _warn(
                f"{path.name}: missing required columns {missing_cols}. "
                "Skipping entire file."
            )
            return []

        _info(f"Reading {path.name} …")
        for line_no, row in enumerate(reader, start=2):   # 1=header
            ok, reason = validate_row(table, dict(row))
            if ok:
                rows.append(dict(row))
            else:
                _warn(f"{path.name} line {line_no}: {reason} → skipped")

    return rows


# ──────────────────────────────────────────────
# Table-specific loaders
# ──────────────────────────────────────────────

def _load_transactions(db, rows: list[dict]) -> tuple[int, int]:
    inserted, skipped = 0, 0
    for row in rows:
        exists = (
            db.query(Transaction)
            .filter(Transaction.transaction_id == row["transaction_id"])
            .first()
        )
        if exists:
            skipped += 1
            continue

        record = Transaction(
            transaction_id   = str(row["transaction_id"]).strip(),
            user_id          = str(row["user_id"]).strip(),
            amount           = float(row["amount"]),
            location         = str(row.get("location", "Unknown")).strip() or "Unknown",
            device           = str(row.get("device", "")).strip() or None,
            login_time       = str(row.get("login_time", "12:00")).strip() or "12:00",
            beneficiary_type = str(row.get("beneficiary_type", "known")).strip().lower(),
            payment_type     = str(row.get("payment_type", "UPI")).strip().upper(),
        )
        db.add(record)
        inserted += 1
    db.commit()
    return inserted, skipped


def _load_user_profiles(db, rows: list[dict]) -> tuple[int, int]:
    inserted, skipped = 0, 0
    for row in rows:
        user_id = str(row["user_id"]).strip()
        exists = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
        if exists:
            # Update avg and location if record already present
            exists.avg_transaction = float(row.get("avg_transaction") or exists.avg_transaction)
            exists.usual_location  = str(row.get("usual_location", exists.usual_location)).strip()
            exists.trusted_devices = str(row.get("trusted_devices", exists.trusted_devices)).strip()
            skipped += 1
            continue

        record = UserProfile(
            user_id         = user_id,
            avg_transaction = float(row.get("avg_transaction") or 0),
            usual_location  = str(row.get("usual_location", "Unknown")).strip(),
            trusted_devices = str(row.get("trusted_devices", "")).strip(),
        )
        db.add(record)
        inserted += 1
    db.commit()
    return inserted, skipped


def _load_blacklisted(db, rows: list[dict]) -> tuple[int, int]:
    inserted, skipped = 0, 0
    for row in rows:
        account_id = str(row["account_id"]).strip()
        exists = (
            db.query(BlacklistedAccount)
            .filter(BlacklistedAccount.account_id == account_id)
            .first()
        )
        if exists:
            skipped += 1
            continue
        record = BlacklistedAccount(
            account_id = account_id,
            reason     = str(row.get("reason", "")).strip(),
        )
        db.add(record)
        inserted += 1
    db.commit()
    return inserted, skipped


def _load_fraud_patterns(db, rows: list[dict]) -> tuple[int, int]:
    inserted, skipped = 0, 0
    for row in rows:
        pattern_id = str(row["pattern_id"]).strip()
        exists = (
            db.query(FraudPattern)
            .filter(FraudPattern.pattern_id == pattern_id)
            .first()
        )
        if exists:
            skipped += 1
            continue
        record = FraudPattern(
            pattern_id  = pattern_id,
            description = str(row.get("description", "")).strip(),
            risk_score  = int(float(row.get("risk_score", 0))),
        )
        db.add(record)
        inserted += 1
    db.commit()
    return inserted, skipped


# ──────────────────────────────────────────────
# Main pipeline
# ──────────────────────────────────────────────
_LOADERS = {
    "transactions":         _load_transactions,
    "user_profiles":        _load_user_profiles,
    "blacklisted_accounts": _load_blacklisted,
    "fraud_patterns":       _load_fraud_patterns,
}


def run_pipeline() -> None:
    """Execute the full CSV → DB pipeline."""
    _info("Initialising database …")
    init_db()
    _ok("Tables created / verified.")

    db = SessionLocal()
    try:
        total_inserted = 0
        for table, csv_path in CSV_FILES.items():
            rows = _read_csv(csv_path, table)
            if not rows:
                _warn(f"No valid rows found in {csv_path.name}.")
                continue

            loader = _LOADERS[table]
            inserted, skipped = loader(db, rows)
            total_inserted += inserted
            _ok(
                f"{csv_path.name}: {inserted} inserted, "
                f"{skipped} already existed (skipped)."
            )

        _ok(f"Pipeline complete. Total new records inserted: {total_inserted}")
    except Exception as exc:
        db.rollback()
        _warn(f"Pipeline failed: {exc}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    run_pipeline()
