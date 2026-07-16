# TrustGraph AI - Database Schema

The backend uses **SQLite** (`fraud_data.db`) orchestrated via SQLAlchemy. 

## 1. `cyber_events`
Stores the continuous timeline of all events across all vectors (Login, SIM Swap, Transaction).
*This replaces the legacy `transactions` table.*

| Column | Type | Description |
|---|---|---|
| `id` | Integer | Primary Key |
| `event_id` | String | Unique Event Identifier (e.g., `EVT-123`) |
| `user_id` | String | Customer Identifier |
| `event_type` | String | `LOGIN_FAILED`, `TRANSFER`, `SIM_SWAP`, etc. |
| `timestamp` | DateTime | UTC Timestamp of the event |
| `device_id` | String | Originating device fingerprint |
| `ip_address` | String | Originating IP |
| `location` | String | Geographic location |
| `session_id` | String | Active session tracker |
| `correlation_id` | String | Trace identifier across microservices |
| `source` | String | `MOBILE`, `WEB`, `API` |
| `status` | String | `PROCESSED`, `FLAGGED`, `FAILED` |
| `risk_score` | Integer | Calculated numeric risk (0-100) |
| `risk_level` | String | `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` |
| `severity` | String | Severity rating |
| `raw_telemetry` | JSON | VPN, Root detection, Device Trust metrics |
| `telemetry_profile` | JSON | Enhanced telemetry evaluation data |
| `metadata_payload` | JSON | Includes custom data (amount, beneficiary), the generated **Playbook**, and **Feature Contributions**. |

---

## 2. `fraud_alerts`
Generated when an event breaches the `MEDIUM` or `HIGH` threshold, placing it in the SOC queue.

| Column | Type | Description |
|---|---|---|
| `id` | Integer | Primary Key |
| `alert_id` | String | Unique Alert Identifier (e.g., `ALT-456`) |
| `event_id` | String | Foreign Key -> `cyber_events.event_id` |
| `user_id` | String | Customer Identifier |
| `risk_score` | Integer | The final score that triggered the alert |
| `risk_level` | String | `MEDIUM`, `HIGH`, `CRITICAL` |
| `reasons` | JSON | List of unstructured reasons the alert fired |
| `recommended_action` | String | Output from the Playbook Engine (`BLOCK`, `VERIFY`, `FREEZE`) |
| `status` | String | `OPEN`, `INVESTIGATING`, `CLOSED` |
| `timestamp` | DateTime | UTC Timestamp |

---

## 3. `user_profiles`
Maintains the behavioral baseline for each customer. Updated dynamically on every event.

| Column | Type | Description |
|---|---|---|
| `id` | Integer | Primary Key |
| `user_id` | String | Customer Identifier |
| `total_txns` | Integer | Total volume of transfers |
| `fraud_txns` | Integer | Number of flagged attempts |
| `avg_amount` | Float | Moving average transfer amount |
| `max_amount` | Float | Largest transfer to date |
| `usual_location` | String | Most frequent geographic location |
| `known_devices` | JSON | List of trusted device fingerprints |
| `last_updated` | DateTime | UTC Timestamp |

---

## 4. `transactions` (Legacy / Deprecated)
Used exclusively in Phase 1 before migrating to the unified `cyber_events` schema.

| Column | Type | Description |
|---|---|---|
| `id` | Integer | Primary Key |
| `transaction_id` | String | Unique identifier |
| `user_id` | String | Customer Identifier |
| `amount` | Float | Value of transfer |
| `risk_score` | Integer | Legacy risk score |
| `recommended_action`| String | `ALLOW` / `BLOCK` |
