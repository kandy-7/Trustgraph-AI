"""
TrustGraph AI – database/test_db.py
====================================
End-to-end test suite for the fraud detection database layer.

Sections
--------
  1. Dataset Validation
  2. Database Initialisation
  3. CSV → DB Loading & Row Counts
  4. Query Functions
  5. Fraud Logging
  6. End-to-End Pipeline Simulation

Run from project root:
    python -m backend.database.test_db
    # or with the venv:
    venv/bin/python -m backend.database.test_db
"""

from __future__ import annotations

import csv
import json
import sys
import traceback
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

# ── Allow running as __main__ without package install ─────────────────────────
_PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(_PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(_PROJECT_ROOT))
# ─────────────────────────────────────────────────────────────────────────────

from sqlalchemy import text

from backend.database.db import SessionLocal, engine, init_db
from backend.database.load_data import run_pipeline
from backend.database.models import (
    BlacklistedAccount, FraudLog, FraudPattern, Transaction, UserProfile,
)
from backend.database.queries import (
    get_all_transactions,
    get_blacklisted_accounts,
    get_fraud_logs,
    get_fraud_logs_by_transaction,
    get_fraud_patterns,
    get_transaction_by_id,
    get_user_profile,
    get_user_transactions,
    is_blacklisted,
    log_fraud_alert,
)
from backend.database.validators import (
    check_required_columns,
    validate_row,
)

# ──────────────────────────────────────────────
# Paths
# ──────────────────────────────────────────────
_DATA_DIR = Path(__file__).resolve().parents[1] / "data"

CSV_META = {
    "transactions":         _DATA_DIR / "transactions.csv",
    "user_profiles":        _DATA_DIR / "user_profiles.csv",
    "blacklisted_accounts": _DATA_DIR / "blacklisted_accounts.csv",
    "fraud_patterns":       _DATA_DIR / "fraud_patterns.csv",
}

EXPECTED_TABLES = {
    "transactions",
    "user_profiles",
    "blacklisted_accounts",
    "fraud_patterns",
    "fraud_logs",
}


# ══════════════════════════════════════════════
# Console helpers
# ══════════════════════════════════════════════

_BOLD   = "\033[1m"
_GREEN  = "\033[92m"
_YELLOW = "\033[93m"
_RED    = "\033[91m"
_CYAN   = "\033[96m"
_RESET  = "\033[0m"

# Detect non-TTY environments and strip ANSI codes
if not sys.stdout.isatty():
    _BOLD = _GREEN = _YELLOW = _RED = _CYAN = _RESET = ""


def _banner(title: str) -> None:
    width = 62
    print()
    print(f"{_BOLD}{_CYAN}{'═' * width}{_RESET}")
    print(f"{_BOLD}{_CYAN}  {title}{_RESET}")
    print(f"{_BOLD}{_CYAN}{'═' * width}{_RESET}")


def _ok(msg: str) -> None:
    print(f"  {_GREEN}✔  {msg}{_RESET}")


def _warn(msg: str) -> None:
    print(f"  {_YELLOW}⚠  {msg}{_RESET}")


def _fail(msg: str) -> None:
    print(f"  {_RED}✘  {msg}{_RESET}")


def _info(msg: str) -> None:
    print(f"     {msg}")


def _json(data: Any, indent: int = 6) -> None:
    """Pretty-print any dict/list as indented JSON."""
    print(json.dumps(data, indent=indent, default=str, ensure_ascii=False))


# Tracks overall pass/fail counts
_results: dict[str, int] = {"passed": 0, "failed": 0, "warned": 0}


def _assert(condition: bool, pass_msg: str, fail_msg: str) -> bool:
    if condition:
        _ok(pass_msg)
        _results["passed"] += 1
    else:
        _fail(fail_msg)
        _results["failed"] += 1
    return condition


# ══════════════════════════════════════════════
# SECTION 1 – Dataset Validation
# ══════════════════════════════════════════════

def test_dataset_validation() -> None:
    _banner("SECTION 1 · Dataset Validation")

    for table, path in CSV_META.items():
        print(f"\n  📄 {path.name}")

        if not path.exists():
            _fail(f"File not found: {path}")
            _results["failed"] += 1
            continue

        valid_rows: list[dict] = []
        invalid_rows: list[tuple[int, str]] = []

        with open(path, newline="", encoding="utf-8") as fh:
            reader = csv.DictReader(fh)
            headers = list(reader.fieldnames or [])

            missing_cols = check_required_columns(headers, table)
            if missing_cols:
                _fail(f"Missing required columns: {missing_cols}")
                _results["failed"] += 1
                continue
            else:
                _ok(f"All required columns present: {headers}")

            for line_no, raw_row in enumerate(reader, start=2):
                row = dict(raw_row)
                ok, reason = validate_row(table, row)
                if ok:
                    valid_rows.append(row)
                else:
                    invalid_rows.append((line_no, reason))

        _ok(f"Valid rows   : {len(valid_rows)}")
        if invalid_rows:
            _warn(f"Skipped rows : {len(invalid_rows)}")
            for line_no, reason in invalid_rows:
                _info(f"  line {line_no:>4}: {reason}")
        else:
            _ok("No invalid rows found")

        _assert(
            len(valid_rows) > 0,
            f"{path.name} has loadable data",
            f"{path.name} has zero valid rows – cannot load",
        )


# ══════════════════════════════════════════════
# SECTION 2 – Database Initialisation
# ══════════════════════════════════════════════

def test_db_init() -> None:
    _banner("SECTION 2 · Database Initialisation")

    try:
        init_db()
        _ok("init_db() executed without error")
    except Exception as exc:
        _fail(f"init_db() raised: {exc}")
        _results["failed"] += 1
        return

    # Inspect actual SQLite table names
    with engine.connect() as conn:
        result = conn.execute(
            text("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;")
        )
        actual_tables = {row[0] for row in result.fetchall()}

    _info(f"Tables in DB: {sorted(actual_tables)}")

    missing = EXPECTED_TABLES - actual_tables
    if missing:
        _fail(f"Missing tables: {missing}")
        _results["failed"] += 1
    else:
        _ok("All tables created successfully")
        _results["passed"] += 1

    for t in sorted(EXPECTED_TABLES):
        _assert(t in actual_tables, f"Table '{t}' exists", f"Table '{t}' is MISSING")


# ══════════════════════════════════════════════
# SECTION 3 – CSV → DB Loading & Row Counts
# ══════════════════════════════════════════════

def test_csv_loading() -> None:
    _banner("SECTION 3 · CSV → DB Loading & Row Counts")

    print("\n  Running pipeline (duplicates are safely skipped) …")
    try:
        run_pipeline()
        _ok("Pipeline completed without error")
        _results["passed"] += 1
    except Exception as exc:
        _fail(f"Pipeline raised: {exc}")
        traceback.print_exc()
        _results["failed"] += 1
        return

    # Row counts per table
    count_queries = {
        "transactions":         "SELECT COUNT(*) FROM transactions",
        "user_profiles":        "SELECT COUNT(*) FROM user_profiles",
        "blacklisted_accounts": "SELECT COUNT(*) FROM blacklisted_accounts",
        "fraud_patterns":       "SELECT COUNT(*) FROM fraud_patterns",
        "fraud_logs":           "SELECT COUNT(*) FROM fraud_logs",
    }

    print()
    print(f"  {'Table':<25} {'Rows':>8}")
    print(f"  {'-'*25} {'-'*8}")

    with engine.connect() as conn:
        for table, sql in count_queries.items():
            count = conn.execute(text(sql)).scalar()
            flag = _GREEN + "✔" + _RESET if count and count > 0 else _YELLOW + "⚠" + _RESET
            print(f"  {flag}  {table:<23} {count:>8,}")
            if table != "fraud_logs":        # fraud_logs starts at 0 initially
                _assert(
                    count > 0,
                    f"{table}: {count} rows loaded",
                    f"{table}: 0 rows – loading may have failed",
                )

    # Duplicate-safety check for transactions
    with engine.connect() as conn:
        dup_check = conn.execute(
            text(
                "SELECT transaction_id, COUNT(*) c FROM transactions "
                "GROUP BY transaction_id HAVING c > 1"
            )
        ).fetchall()

    _assert(
        len(dup_check) == 0,
        "No duplicate transaction_ids found",
        f"Duplicate transaction_ids detected: {[r[0] for r in dup_check]}",
    )


# ══════════════════════════════════════════════
# SECTION 4 – Query Functions
# ══════════════════════════════════════════════

def test_query_functions() -> None:
    _banner("SECTION 4 · Query Functions")
    db = SessionLocal()

    try:
        # ── 4.1 get_all_transactions ───────────────
        print("\n  4.1  get_all_transactions(limit=5)")
        rows = get_all_transactions(db, limit=5)
        _assert(isinstance(rows, list), f"Returned list with {len(rows)} transaction(s)", "Did not return a list")
        if rows:
            _json(rows[0])

        # ── 4.2 get_transaction_by_id ─────────────
        print("\n  4.2  get_transaction_by_id('TXN001')")
        txn = get_transaction_by_id(db, "TXN001")
        _assert(txn is not None, "TXN001 found in DB", "TXN001 NOT found in DB")
        if txn:
            _json(txn)

        print("\n  4.2b get_transaction_by_id('TXN_NONEXISTENT')")
        missing_txn = get_transaction_by_id(db, "TXN_NONEXISTENT")
        _assert(missing_txn is None, "Non-existent ID correctly returned None", "Expected None but got a result")

        # ── 4.3 get_user_transactions ─────────────
        print("\n  4.3  get_user_transactions('U1001')")
        u1001_txns = get_user_transactions(db, "U1001")
        _assert(len(u1001_txns) > 0, f"Found {len(u1001_txns)} transaction(s) for U1001", "No transactions found for U1001")
        for t in u1001_txns:
            _info(f"  {t['transaction_id']} | ₹{t['amount']:>10,.2f} | {t['location']:<15} | {t['payment_type']}")

        # ── 4.4 get_blacklisted_accounts ──────────
        print("\n  4.4  get_blacklisted_accounts()")
        blacklisted = get_blacklisted_accounts(db)
        _assert(len(blacklisted) > 0, f"Found {len(blacklisted)} blacklisted account(s)", "No blacklisted accounts found")
        for a in blacklisted:
            _info(f"  {a['account_id']:<20} → {a['reason'][:55]}…")

        # ── 4.5 get_user_profile ──────────────────
        print("\n  4.5  get_user_profile('U1001')")
        profile = get_user_profile(db, "U1001")
        _assert(profile is not None, "Profile for U1001 found", "Profile for U1001 NOT found")
        if profile:
            _json(profile)

        print("\n  4.5b get_user_profile('U_GHOST')")
        ghost = get_user_profile(db, "U_GHOST")
        _assert(ghost is None, "Unknown user correctly returned None", "Expected None but got a profile")

        # ── 4.6 is_blacklisted ────────────────────
        print("\n  4.6  is_blacklisted()")
        _assert(is_blacklisted(db, "U1002"), "U1002 correctly identified as blacklisted", "U1002 NOT identified as blacklisted")
        _assert(not is_blacklisted(db, "U1003"), "U1003 correctly identified as NOT blacklisted", "U1003 incorrectly flagged")

        # ── 4.7 get_fraud_patterns ────────────────
        print("\n  4.7  get_fraud_patterns() – top 3 by risk score")
        patterns = get_fraud_patterns(db)
        _assert(len(patterns) > 0, f"Found {len(patterns)} fraud pattern(s)", "No fraud patterns found")
        for p in patterns[:3]:
            _info(f"  [{p['risk_score']:>3}] {p['pattern_id']:<8} {p['description'][:55]}")

    finally:
        db.close()


# ══════════════════════════════════════════════
# SECTION 5 – Fraud Logging
# ══════════════════════════════════════════════

def test_fraud_logging() -> None:
    _banner("SECTION 5 · Fraud Logging")
    db = SessionLocal()

    TEST_TXN_ID = "TXN_TEST_SUITE"

    try:
        # Clean up any leftover entry from a previous run
        db.query(FraudLog).filter(FraudLog.transaction_id == TEST_TXN_ID).delete()
        db.commit()

        # ── 5.1 Insert ────────────────────────────
        print("\n  5.1  log_fraud_alert()")
        log = log_fraud_alert(
            db,
            transaction_id = TEST_TXN_ID,
            risk_score     = 90,
            risk_level     = "HIGH",
            reasons        = [
                "Midnight transfer (03:45)",
                "Untrusted / unknown device",
                "New beneficiary – never transacted before",
                "Amount 6× above user average",
            ],
        )
        _assert(log.get("id") is not None, f"Fraud log inserted with id={log['id']}", "Fraud log has no id")
        _json(log)

        # ── 5.2 Verify in DB via raw SQL ──────────
        print("\n  5.2  Verify via raw SQL: SELECT * FROM fraud_logs WHERE transaction_id=?")
        with engine.connect() as conn:
            rows = conn.execute(
                text("SELECT * FROM fraud_logs WHERE transaction_id = :tid"),
                {"tid": TEST_TXN_ID},
            ).fetchall()
        _assert(len(rows) == 1, f"Exactly 1 row found for {TEST_TXN_ID}", f"Expected 1, got {len(rows)} rows")
        if rows:
            cols = ["id", "transaction_id", "risk_score", "risk_level", "reasons", "timestamp"]
            row_dict = dict(zip(cols, rows[0]))
            _info(f"  DB row: {row_dict}")

        # ── 5.3 Retrieve via query function ───────
        print("\n  5.3  get_fraud_logs_by_transaction()")
        fetched = get_fraud_logs_by_transaction(db, TEST_TXN_ID)
        _assert(len(fetched) == 1, "get_fraud_logs_by_transaction returned 1 record", f"Expected 1, got {len(fetched)}")
        _assert(
            fetched[0]["risk_score"] == 90,
            "risk_score correctly stored as 90",
            f"risk_score mismatch: expected 90, got {fetched[0].get('risk_score')}",
        )
        _assert(
            fetched[0]["risk_level"] == "HIGH",
            "risk_level correctly stored as HIGH",
            f"risk_level mismatch: expected HIGH, got {fetched[0].get('risk_level')}",
        )

        # ── 5.4 Full fraud_logs listing ───────────
        print("\n  5.4  get_fraud_logs() – all entries")
        all_logs = get_fraud_logs(db)
        _ok(f"Total fraud log entries: {len(all_logs)}")
        for fl in all_logs[:5]:
            _info(
                f"  id={fl['id']:<4} [{fl['risk_level']:<8}] "
                f"{fl['transaction_id']:<20} score={fl['risk_score']}"
            )

    finally:
        db.close()


# ══════════════════════════════════════════════
# SECTION 6 – End-to-End Pipeline Simulation
# ══════════════════════════════════════════════

def _compute_risk_score(txn: dict, profile: dict | None, blacklisted: bool) -> tuple[int, list[str]]:
    """
    Lightweight fraud risk scorer for the E2E test.
    Returns (score: int, reasons: list[str]).
    """
    score = 10
    reasons: list[str] = []

    # Blacklisted user
    if blacklisted:
        score += 35
        reasons.append("User is blacklisted")

    # High amount
    amount = float(txn.get("amount", 0))
    if amount > 50_000:
        score += 20
        reasons.append(f"High amount: ₹{amount:,.0f}")

    # Amount vs user avg
    if profile:
        avg = float(profile.get("avg_transaction", 0))
        if avg > 0 and amount > avg * 3:
            score += 15
            reasons.append(f"Amount {amount/avg:.1f}× above user average (₹{avg:,.0f})")

    # Midnight transfer (00:00–05:59)
    login_time = str(txn.get("login_time", "12:00"))
    try:
        hour = int(login_time.split(":")[0])
        if 0 <= hour < 6:
            score += 15
            reasons.append(f"Midnight transfer at {login_time}")
    except ValueError:
        pass

    # Untrusted device
    device = str(txn.get("device", "")).strip()
    trusted_devices_raw = (profile or {}).get("trusted_devices", "") or ""
    trusted_list = [d.strip() for d in trusted_devices_raw.split(",") if d.strip()]
    if device.lower() in ("unknown device", "unknown", "") or (
        trusted_list and device not in trusted_list
    ):
        score += 15
        reasons.append(f"Untrusted/unknown device: '{device}'")

    # New beneficiary
    if str(txn.get("beneficiary_type", "known")).strip().lower() == "new":
        score += 10
        reasons.append("New / unknown beneficiary")

    # Location mismatch
    txn_location = str(txn.get("location", "Unknown")).strip()
    usual_location = (profile or {}).get("usual_location", "Unknown")
    if txn_location.lower() in ("unknown", "") or (
        usual_location != "Unknown" and txn_location != usual_location
    ):
        score += 10
        reasons.append(f"Location anomaly: '{txn_location}' vs usual '{usual_location}'")

    score = min(score, 100)

    if not reasons:
        reasons.append("No specific risk factors detected")

    return score, reasons


def _risk_level(score: int) -> str:
    if score >= 80:
        return "CRITICAL"
    if score >= 60:
        return "HIGH"
    if score >= 35:
        return "MEDIUM"
    return "LOW"


def test_e2e_pipeline() -> None:
    _banner("SECTION 6 · End-to-End Pipeline Simulation")

    # Three test scenarios: low risk, medium risk, high risk
    scenarios = [
        {
            "label":            "Normal transaction (LOW risk expected)",
            "transaction_id":   "E2E_TXN_LOW",
            "user_id":          "U1003",
            "amount":           450.00,
            "location":         "Bangalore",
            "device":           "OnePlus 9",
            "login_time":       "14:05",
            "beneficiary_type": "known",
            "payment_type":     "UPI",
        },
        {
            "label":            "Suspicious transaction (HIGH risk expected)",
            "transaction_id":   "E2E_TXN_HIGH",
            "user_id":          "U1001",
            "amount":           95000.00,
            "location":         "Unknown",
            "device":           "Unknown Device",
            "login_time":       "03:45",
            "beneficiary_type": "new",
            "payment_type":     "IMPS",
        },
        {
            "label":            "Blacklisted user (CRITICAL risk expected)",
            "transaction_id":   "E2E_TXN_CRIT",
            "user_id":          "U1002",
            "amount":           110000.00,
            "location":         "Unknown",
            "device":           "Unknown Device",
            "login_time":       "01:12",
            "beneficiary_type": "new",
            "payment_type":     "IMPS",
        },
    ]

    db = SessionLocal()
    try:
        # Clean up E2E test logs from any previous run
        for sc in scenarios:
            db.query(FraudLog).filter(FraudLog.transaction_id == sc["transaction_id"]).delete()
        db.commit()

        FRAUD_THRESHOLD = 70

        for sc in scenarios:
            print(f"\n  ▶  Scenario: {sc['label']}")
            print(f"     transaction_id : {sc['transaction_id']}")
            print(f"     user_id        : {sc['user_id']}")
            print(f"     amount         : ₹{sc['amount']:,.2f}")
            print(f"     device         : {sc['device']}")
            print(f"     login_time     : {sc['login_time']}")
            print(f"     location       : {sc['location']}")

            # Fetch context
            profile     = get_user_profile(db, sc["user_id"])
            blacklisted = is_blacklisted(db, sc["user_id"])

            # Score
            score, reasons = _compute_risk_score(sc, profile, blacklisted)
            level = _risk_level(score)

            print(f"\n     {'─'*46}")
            print(f"     risk_score  : {score}")
            print(f"     risk_level  : {level}")
            print(f"     reasons     :")
            for r in reasons:
                print(f"       • {r}")

            # Log if above threshold
            if score > FRAUD_THRESHOLD:
                logged = log_fraud_alert(
                    db,
                    transaction_id = sc["transaction_id"],
                    risk_score     = score,
                    risk_level     = level,
                    reasons        = reasons,
                )
                _ok(
                    f"score={score} > threshold={FRAUD_THRESHOLD} "
                    f"→ stored in fraud_logs (id={logged['id']})"
                )
                _results["passed"] += 1

                # Confirm persistence
                verify = get_fraud_logs_by_transaction(db, sc["transaction_id"])
                _assert(
                    len(verify) == 1,
                    f"DB confirmation: fraud log persisted for {sc['transaction_id']}",
                    f"Persistence check failed for {sc['transaction_id']}",
                )
            else:
                _ok(
                    f"score={score} ≤ threshold={FRAUD_THRESHOLD} "
                    f"→ transaction ALLOWED, not logged"
                )
                _results["passed"] += 1

    finally:
        db.close()


# ══════════════════════════════════════════════
# Summary
# ══════════════════════════════════════════════

def _print_summary() -> None:
    _banner("TEST SUMMARY")
    total = _results["passed"] + _results["failed"]
    passed = _results["passed"]
    failed = _results["failed"]
    warned = _results["warned"]

    print(f"\n  Total checks : {total}")
    print(f"  {_GREEN}Passed{_RESET}       : {passed}")
    if failed:
        print(f"  {_RED}Failed{_RESET}       : {failed}")
    if warned:
        print(f"  {_YELLOW}Warnings{_RESET}     : {warned}")

    print()
    if failed == 0:
        print(f"  {_GREEN}{_BOLD}✔  All checks passed. Database layer is fully functional.{_RESET}")
    else:
        print(f"  {_RED}{_BOLD}✘  {failed} check(s) failed. Review output above.{_RESET}")
    print()


# ══════════════════════════════════════════════
# Entry point
# ══════════════════════════════════════════════

def main() -> int:
    print(f"\n{_BOLD}TrustGraph AI – Database Test Suite{_RESET}")
    print(f"Started : {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"DB path : {_PROJECT_ROOT / 'backend' / 'fraud_detection.db'}")

    sections = [
        ("Dataset Validation",      test_dataset_validation),
        ("DB Initialisation",       test_db_init),
        ("CSV → DB Loading",        test_csv_loading),
        ("Query Functions",         test_query_functions),
        ("Fraud Logging",           test_fraud_logging),
        ("E2E Pipeline Simulation", test_e2e_pipeline),
    ]

    for _name, fn in sections:
        try:
            fn()
        except Exception as exc:
            _fail(f"Unhandled exception in section '{_name}': {exc}")
            traceback.print_exc()
            _results["failed"] += 1

    _print_summary()
    return 0 if _results["failed"] == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
