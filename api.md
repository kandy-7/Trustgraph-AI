# TrustGraph AI — API Reference

> **Base URL** `http://localhost:8000`  
> **Swagger UI** → [http://localhost:8000/docs](http://localhost:8000/docs)  
> **ReDoc** → [http://localhost:8000/redoc](http://localhost:8000/redoc)  
> **AI Provider** Google Gemini (`gemini-1.5-flash`)  
> **Database** SQLite (`trustgraph.db`, auto-created on first boot)  
> **Content-Type** `application/json`

---

## Quick Start

```bash
# 1. Copy env and add your Gemini key
cp .env.example .env
# Edit .env → set GEMINI_API_KEY=your_key_here

# 2. Install dependencies
pip install -r backend/requirements.txt

# 3. Run the server
python run.py
# → http://localhost:8000/docs
```

---

## Endpoint Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Service health metadata |
| GET | `/health` | Simple health check |
| **Transactions** | | |
| POST | `/api/transaction` | Analyse a single transaction |
| GET | `/api/transactions` | List all transactions (paginated) |
| GET | `/api/transactions/{txn_id}` | Get one transaction by ID |
| GET | `/api/stats` | Dashboard aggregate statistics |
| GET | `/api/rules` | List active fraud detection rules |
| **Alerts** | | |
| GET | `/api/alerts` | List fraud alerts (filterable) |
| GET | `/api/alerts/{alert_id}` | Get one alert |
| PATCH | `/api/alerts/{alert_id}` | Officer updates status / notes |
| DELETE | `/api/alerts/{alert_id}` | Close an alert |
| **Simulation** | | |
| POST | `/api/simulate` | Run a fraud scenario simulation |
| GET | `/api/simulate/scenarios` | List scenario templates |
| **Graph** | | |
| GET | `/api/graph` | Full beneficiary transaction graph |
| GET | `/api/graph/user/{user_id}` | Per-user connection map |
| **AI (Gemini)** | | |
| POST | `/api/ai/explain` | Gemini fraud decision explanation |
| POST | `/api/ai/narrate` | Gemini customer risk notification |
| POST | `/api/ai/compliance` | Gemini compliance batch summary |
| POST | `/api/ai/chat` | Gemini fraud officer chat |
| **WebSocket** | | |
| WS | `/ws/transactions` | Live transaction stream |
| WS | `/ws/alerts` | Live fraud alert stream |

---

## Risk Engine

### How the Score Is Calculated

The engine evaluates 7 behavioural rules. Scores are **additive, capped at 100**.

| Rule ID | Label | +Score | Trigger Condition |
|---------|-------|--------|-------------------|
| `high_amount` | High Transaction Amount | +30 | Amount > ₹50,000 |
| `unknown_device` | Untrusted Device | +25 | `trusted_device: false` |
| `new_beneficiary` | New Beneficiary | +20 | `beneficiary_type: "new"` |
| `midnight_login` | Suspicious Login Time | +20 | `login_time` between 00:00–05:59 |
| `historical_fraud` | Historical Fraud Signal | +30 | `isFraud: 1` |
| `location_anomaly` | Location Anomaly | +15 | Location ≠ user's usual region |
| `velocity_spike` | Velocity Spike | +20 | Amount ≥ 10× user's average spend |

### Risk Bands

| Score | Level | Action | Next Step |
|-------|-------|--------|-----------|
| 0–30 | **LOW** | ALLOW | None |
| 31–60 | **MEDIUM** | VERIFY | OTP re-verification |
| 61–100 | **HIGH** | BLOCK | Escalate to fraud team |

---

## Health

### `GET /`

```bash
curl http://localhost:8000/
```

**Response**
```json
{
  "service": "TrustGraph AI",
  "version": "1.0.0",
  "status":  "running",
  "docs":    "/docs"
}
```

---

### `GET /health`

```bash
curl http://localhost:8000/health
```

**Response**
```json
{ "status": "ok" }
```

---

## Transactions

### `POST /api/transaction`

Analyse a single transaction. Runs all 7 fraud rules, persists the result, and auto-creates a `FraudAlert` for MEDIUM/HIGH risk.

#### Request Body

```json
{
  "TransactionID":    "TXN-DEMO001",
  "user_id":          "USR-10042",
  "TransactionAmt":   95000,
  "payment_type":     "UPI",
  "location":         "Mumbai",
  "beneficiary_id":   "BEN-00291",
  "beneficiary_type": "new",
  "device_id":        "DEV-android-9921",
  "trusted_device":   false,
  "login_time":       "02:14",
  "isFraud":          0
}
```

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `TransactionID` | string | No | Auto-generated | Unique transaction ID |
| `user_id` | string | **Yes** | — | Customer identifier |
| `TransactionAmt` | float | **Yes** | — | Amount in INR (must be > 0) |
| `payment_type` | string | No | `"UPI"` | `UPI` / `NEFT` / `RTGS` / `IMPS` / `Wallet` |
| `location` | string | No | `"Unknown"` | City or state of the transaction |
| `beneficiary_id` | string | No | null | Recipient account ID |
| `beneficiary_type` | string | No | `"known"` | `"known"` or `"new"` |
| `device_id` | string | No | null | Device fingerprint string |
| `trusted_device` | bool | No | `true` | Whether device is recognised |
| `login_time` | string | No | `"12:00"` | HH:MM in 24-hour format |
| `isFraud` | int | No | `0` | Ground-truth label: `0` = legit, `1` = fraud |

#### Response `200 OK`

```json
{
  "transaction_id":     "TXN-DEMO001",
  "user_id":            "USR-10042",
  "amount":             95000.0,
  "risk_score":         95,
  "risk_level":         "HIGH",
  "alert":              true,
  "recommended_action": "BLOCK",
  "suggested_step":     "Escalate to fraud investigation team",
  "reasons": [
    "high_amount",
    "unknown_device",
    "new_beneficiary",
    "midnight_login"
  ],
  "timestamp": "2026-05-20T16:30:00.000000"
}
```

#### curl

```bash
curl -X POST http://localhost:8000/api/transaction \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "USR-10042",
    "TransactionAmt": 95000,
    "trusted_device": false,
    "beneficiary_type": "new",
    "login_time": "02:14",
    "location": "Mumbai"
  }'
```

---

### `GET /api/transactions`

List all analysed transactions with pagination and filtering.

#### Query Parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `risk_level` | string | — | Filter: `LOW` / `MEDIUM` / `HIGH` |
| `user_id` | string | — | Filter by user ID |
| `limit` | int | 50 | Records per page (1–500) |
| `offset` | int | 0 | Pagination offset |

#### Response `200 OK`

```json
{
  "total":  142,
  "offset": 0,
  "limit":  50,
  "data": [
    {
      "transaction_id":     "TXN-DEMO001",
      "user_id":            "USR-10042",
      "amount":             95000.0,
      "payment_type":       "UPI",
      "location":           "Mumbai",
      "risk_score":         95,
      "risk_level":         "HIGH",
      "recommended_action": "BLOCK",
      "reasons":            ["high_amount", "unknown_device"],
      "created_at":         "2026-05-20T16:30:00"
    }
  ]
}
```

#### curl

```bash
# All HIGH risk transactions
curl "http://localhost:8000/api/transactions?risk_level=HIGH&limit=20"

# Transactions for a specific user
curl "http://localhost:8000/api/transactions?user_id=USR-10042"
```

---

### `GET /api/transactions/{txn_id}`

Get the complete record for a single transaction.

#### Response `200 OK`

```json
{
  "transaction_id":     "TXN-DEMO001",
  "user_id":            "USR-10042",
  "amount":             95000.0,
  "payment_type":       "UPI",
  "location":           "Mumbai",
  "beneficiary_id":     "BEN-00291",
  "beneficiary_type":   "new",
  "trusted_device":     false,
  "login_time":         "02:14",
  "risk_score":         95,
  "risk_level":         "HIGH",
  "recommended_action": "BLOCK",
  "suggested_step":     "Escalate to fraud investigation team",
  "reasons":            ["high_amount", "unknown_device", "new_beneficiary", "midnight_login"],
  "is_fraud":           0,
  "created_at":         "2026-05-20T16:30:00"
}
```

| Code | Error |
|------|-------|
| 404 | `"Transaction 'TXN-XXXX' not found"` |

---

### `GET /api/stats`

Dashboard aggregate statistics for the full dataset.

#### Response `200 OK`

```json
{
  "total_transactions": 500,
  "high_risk_count":    72,
  "medium_risk_count":  121,
  "low_risk_count":     307,
  "fraud_rate_pct":     14.4,
  "blocked_count":      72,
  "alerts_open":        38
}
```

---

### `GET /api/rules`

List all active fraud detection rules with weights and descriptions.

#### Response `200 OK`

```json
{
  "rules": [
    { "id": "high_amount",      "label": "High Transaction Amount",    "weight": 30 },
    { "id": "unknown_device",   "label": "Untrusted / Unknown Device",  "weight": 25 },
    { "id": "new_beneficiary",  "label": "New Beneficiary",             "weight": 20 },
    { "id": "midnight_login",   "label": "Suspicious Login Time",       "weight": 20 },
    { "id": "historical_fraud", "label": "Historical Fraud Signal",     "weight": 30 },
    { "id": "location_anomaly", "label": "Location Anomaly",            "weight": 15 },
    { "id": "velocity_spike",   "label": "Velocity Spike",              "weight": 20 }
  ]
}
```

---

## Fraud Alerts

Alerts are auto-created for every MEDIUM or HIGH risk transaction.

**Status flow:** `OPEN` → `REVIEWED` → `CLOSED`

---

### `GET /api/alerts`

#### Query Parameters

| Param | Type | Description |
|-------|------|-------------|
| `risk_level` | string | `HIGH` / `MEDIUM` |
| `status` | string | `OPEN` / `REVIEWED` / `CLOSED` |
| `user_id` | string | Filter by user |
| `limit` | int | Records per page (default 50) |
| `offset` | int | Pagination offset |

#### Response `200 OK`

```json
{
  "total": 38,
  "offset": 0,
  "limit": 50,
  "data": [
    {
      "alert_id":           "ALT-A1B2C3D4E5",
      "transaction_id":     "TXN-DEMO001",
      "user_id":            "USR-10042",
      "risk_score":         95,
      "risk_level":         "HIGH",
      "reasons":            ["high_amount", "unknown_device"],
      "recommended_action": "BLOCK",
      "suggested_step":     "Escalate to fraud investigation team",
      "status":             "OPEN",
      "officer_notes":      null,
      "created_at":         "2026-05-20T16:30:00"
    }
  ]
}
```

```bash
curl "http://localhost:8000/api/alerts?risk_level=HIGH&status=OPEN"
```

---

### `GET /api/alerts/{alert_id}`

#### Response `200 OK`

```json
{
  "alert_id":           "ALT-A1B2C3D4E5",
  "transaction_id":     "TXN-DEMO001",
  "user_id":            "USR-10042",
  "risk_score":         95,
  "risk_level":         "HIGH",
  "reasons":            ["high_amount", "midnight_login"],
  "recommended_action": "BLOCK",
  "suggested_step":     "Escalate to fraud investigation team",
  "status":             "OPEN",
  "officer_notes":      null,
  "created_at":         "2026-05-20T16:30:00"
}
```

---

### `PATCH /api/alerts/{alert_id}`

Officer updates investigation status or adds notes.

#### Request Body

```json
{
  "status":        "REVIEWED",
  "officer_notes": "Spoke with customer. Confirmed legitimate travel. False positive."
}
```

| Field | Values |
|-------|--------|
| `status` | `OPEN` / `REVIEWED` / `CLOSED` |
| `officer_notes` | Any free-text string |

#### Response `200 OK`

```json
{
  "success":       true,
  "alert_id":      "ALT-A1B2C3D4E5",
  "status":        "REVIEWED",
  "officer_notes": "Spoke with customer. Confirmed legitimate travel. False positive."
}
```

```bash
curl -X PATCH http://localhost:8000/api/alerts/ALT-A1B2C3D4E5 \
  -H "Content-Type: application/json" \
  -d '{"status": "REVIEWED", "officer_notes": "False positive confirmed."}'
```

---

### `DELETE /api/alerts/{alert_id}`

Soft-closes an alert (data retained, status set to CLOSED).

```json
{ "success": true, "alert_id": "ALT-A1B2C3D4E5", "status": "CLOSED" }
```

---

## Simulation

Generate synthetic transactions to populate and test the fraud engine. Every simulated transaction is fully analysed and stored.

### Scenarios

| Key | Fraud? | Amount Range | Login Time | Device |
|-----|--------|-------------|------------|--------|
| `account_takeover` | Yes | ₹60k–2L | 00:00–04:59 | Untrusted |
| `sim_swap` | Yes | ₹50k–1.5L | 01:00–05:59 | Untrusted |
| `upi_phishing` | Yes | ₹5k–30k | 09:00–22:00 | Trusted |
| `mule_account` | Yes | ₹10k–80k | 08:00–20:00 | Trusted |
| `normal_user` | No | ₹200–5k | 08:00–21:00 | Trusted |
| `random` | 50/50 | Mixed | Mixed | Mixed |

---

### `POST /api/simulate`

#### Request Body

```json
{
  "scenario": "account_takeover",
  "count":    5,
  "user_id":  "USR-99999"
}
```

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `scenario` | string | `"random"` | Scenario key from the table above |
| `count` | int | 1 | Transactions to generate (max 50) |
| `user_id` | string | Random per txn | Pin all transactions to this user |

#### Response `200 OK`

```json
{
  "scenario":  "account_takeover",
  "generated": 5,
  "results": [
    {
      "transaction_id":     "SIM-AB12CD34EF",
      "user_id":            "USR-99999",
      "amount":             127450.0,
      "risk_score":         95,
      "risk_level":         "HIGH",
      "alert":              true,
      "recommended_action": "BLOCK",
      "suggested_step":     "Escalate to fraud investigation team",
      "reasons":            ["high_amount", "unknown_device", "new_beneficiary", "midnight_login"],
      "timestamp":          "2026-05-20T16:30:00"
    }
  ]
}
```

```bash
# Simulate 5 account takeover attacks
curl -X POST http://localhost:8000/api/simulate \
  -H "Content-Type: application/json" \
  -d '{"scenario": "account_takeover", "count": 5}'

# 10 random mixed transactions
curl -X POST http://localhost:8000/api/simulate \
  -H "Content-Type: application/json" \
  -d '{"scenario": "random", "count": 10}'
```

---

### `GET /api/simulate/scenarios`

#### Response `200 OK`

```json
{
  "scenarios": [
    { "key": "account_takeover", "is_fraud": true,  "description": "Attacker takes over account..." },
    { "key": "sim_swap",         "is_fraud": true,  "description": "SIM swap fraud..." },
    { "key": "upi_phishing",     "is_fraud": true,  "description": "UPI phishing..." },
    { "key": "mule_account",     "is_fraud": true,  "description": "Money mule chain..." },
    { "key": "normal_user",      "is_fraud": false, "description": "Legitimate routine transaction" },
    { "key": "random",           "is_fraud": null,  "description": "50/50 mix of fraud and normal" }
  ]
}
```

---

## Graph Analysis

Builds a directed graph of `user → beneficiary` money flows to detect fraud rings.

---

### `GET /api/graph`

#### Query Parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `limit` | int | 500 | Max transactions to include |
| `fraud_only` | bool | false | Only fraud-flagged transactions |

#### Response `200 OK`

```json
{
  "nodes": [
    { "id": "USR-10042", "label": "USR-10042", "type": "user",        "flagged": true },
    { "id": "BEN-00291", "label": "BEN-00291", "type": "beneficiary", "flagged": true }
  ],
  "edges": [
    { "source": "USR-10042", "target": "BEN-00291", "weight": 95000.0, "flagged": true }
  ],
  "flagged_nodes":  ["USR-10042", "BEN-00291"],
  "risk_clusters":  [["BEN-00291", "BEN-00399", "USR-10042"]]
}
```

> `risk_clusters` — connected account groups forming a suspected **fraud ring** (2+ flagged nodes).

```bash
curl "http://localhost:8000/api/graph?fraud_only=true"
```

---

### `GET /api/graph/user/{user_id}`

Returns direct beneficiaries and second-degree connections for one user.

#### Response `200 OK`

```json
{
  "user_id":          "USR-10042",
  "direct":           ["BEN-00291", "BEN-00312"],
  "indirect":         ["BEN-00399", "BEN-00500"],
  "flagged_indirect": 2
}
```

| Field | Description |
|-------|-------------|
| `direct` | Accounts this user transacted with directly |
| `indirect` | 2nd-degree connections (beneficiaries of their beneficiaries) |
| `flagged_indirect` | Count of flagged indirect nodes — high value = fraud ring signal |

```bash
curl "http://localhost:8000/api/graph/user/USR-10042"
```

---

## AI (Gemini)

All four endpoints use **Google Gemini `gemini-1.5-flash`**.

Set `GEMINI_API_KEY` in `.env` to enable. Without it, a placeholder message is returned — all other endpoints remain fully functional.

Get a free API key at → [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)

---

### `POST /api/ai/explain`

Gemini writes a **3–4 sentence officer-facing explanation** of a fraud decision.

#### Request Body

```json
{ "transaction_id": "TXN-DEMO001" }
```

#### Response `200 OK`

```json
{
  "model":    "gemini-1.5-flash",
  "response": "Transaction TXN-DEMO001 was blocked due to four simultaneous high-risk signals: the amount of Rs.95,000 exceeds the Rs.50,000 threshold, the login occurred at 2:14 AM, the transaction came from an unrecognised device, and the recipient is a first-time beneficiary. Together these indicators produce a risk score of 95/100, consistent with an account takeover. The recommended action is to freeze the transaction and contact the customer via their registered mobile number for identity verification."
}
```

```bash
curl -X POST http://localhost:8000/api/ai/explain \
  -H "Content-Type: application/json" \
  -d '{"transaction_id": "TXN-DEMO001"}'
```

---

### `POST /api/ai/narrate`

Gemini generates a **2-sentence customer-friendly notification** — suitable for in-app alerts or SMS.

#### Request Body

```json
{ "transaction_id": "TXN-DEMO001" }
```

#### Response `200 OK`

```json
{
  "model":    "gemini-1.5-flash",
  "response": "We have temporarily held your transaction of Rs.95,000 as our security system detected some unusual activity for your protection. Please verify your identity through the app or call our support team to release the funds."
}
```

```bash
curl -X POST http://localhost:8000/api/ai/narrate \
  -H "Content-Type: application/json" \
  -d '{"transaction_id": "TXN-DEMO001"}'
```

---

### `POST /api/ai/compliance`

Gemini generates a **professional compliance report** for a batch of flagged transactions — suitable for RBI/NPCI reporting or internal fraud review boards.

#### Request Body

```json
{ "limit": 50 }
```

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `limit` | int | 50 | Recent HIGH/MEDIUM transactions to summarise (max 500) |

#### Response `200 OK`

```json
{
  "model":    "gemini-1.5-flash",
  "response": "During the review period, TrustGraph AI analysed 50 flagged transactions comprising 32 HIGH-risk and 18 MEDIUM-risk cases. The predominant patterns were account takeover attempts and UPI phishing. The system automatically blocked all HIGH-risk transactions and triggered OTP re-verification for MEDIUM-risk cases. Manual review is recommended for 12 borderline cases. This report is prepared in accordance with RBI Circular RBI/2021-22/112 on digital payment fraud reporting."
}
```

```bash
curl -X POST http://localhost:8000/api/ai/compliance \
  -H "Content-Type: application/json" \
  -d '{"limit": 100}'
```

---

### `POST /api/ai/chat`

**Free-form fraud intelligence Q&A.** Attach an optional `transaction_id` to give Gemini live context.

#### Request Body

```json
{
  "message":        "Is this a SIM swap attack? What should I do?",
  "transaction_id": "TXN-DEMO001"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `message` | string | **Yes** | Your question |
| `transaction_id` | string | No | Attach transaction as context |

#### Response `200 OK`

```json
{
  "model":    "gemini-1.5-flash",
  "response": "Based on the transaction context, this appears to be an account takeover rather than a classic SIM swap — the device fingerprint changed but no SIM change was detected. Recommended steps: (1) Call the customer on their registered number, (2) Trigger face verification in the app, (3) If confirmed fraud, file an SAR under PMLA guidelines and notify NPCI's fraud portal within 24 hours."
}
```

#### Example Questions

```bash
# With transaction context
curl -X POST http://localhost:8000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Is this a SIM swap?", "transaction_id": "TXN-DEMO001"}'

# General fraud knowledge
curl -X POST http://localhost:8000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What are the top signs of UPI phishing in India?"}'

# RBI compliance guidance
curl -X POST http://localhost:8000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What are our reporting obligations under RBI digital fraud guidelines?"}'
```

---

## WebSocket

Connect to receive **real-time push events** without polling the REST API.

---

### `WS /ws/transactions`

Live stream of every transaction analysis result.

```
ws://localhost:8000/ws/transactions
```

**On connect**
```json
{
  "type":    "connected",
  "channel": "transactions",
  "message": "TrustGraph AI live transaction feed ready.",
  "ts":      "2026-05-20T16:30:00"
}
```

**Per-transaction push**
```json
{
  "type": "transaction",
  "data": {
    "transaction_id":     "TXN-DEMO001",
    "user_id":            "USR-10042",
    "amount":             95000.0,
    "risk_score":         95,
    "risk_level":         "HIGH",
    "recommended_action": "BLOCK",
    "reasons":            ["high_amount", "midnight_login"]
  },
  "ts": "2026-05-20T16:30:01"
}
```

Send `"ping"` → receive `{"type": "pong"}` for keep-alive.

---

### `WS /ws/alerts`

Live stream of MEDIUM and HIGH risk alerts only.

```
ws://localhost:8000/ws/alerts
```

**Alert push**
```json
{
  "type": "alert",
  "data": {
    "alert_id":           "ALT-A1B2C3D4E5",
    "transaction_id":     "TXN-DEMO001",
    "user_id":            "USR-10042",
    "risk_level":         "HIGH",
    "recommended_action": "BLOCK"
  },
  "ts": "2026-05-20T16:30:01"
}
```

---

## Error Responses

```json
{ "detail": "Human-readable error message" }
```

| HTTP Code | Cause |
|-----------|-------|
| `400` | Bad request (invalid scenario key, invalid status value) |
| `404` | Resource not found (transaction or alert ID does not exist) |
| `422` | Pydantic validation error (missing required field or wrong type) |
| `500` | Internal server error |

---

## Environment Variables

```env
HOST=0.0.0.0
PORT=8000
DEBUG=true
DATABASE_URL=sqlite:///./trustgraph.db
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

---

## Project Structure

```
backend/
├── main.py                  # FastAPI app + router wiring
├── config.py                # Env vars, risk thresholds
├── database.py              # SQLite engine + session
├── requirements.txt
│
├── models/
│   ├── schemas.py           # Pydantic request/response models
│   └── db_models.py         # SQLAlchemy ORM tables
│
├── services/
│   ├── fraud_engine.py      # 7-rule behavioural scoring engine
│   ├── simulator.py         # Fraud scenario generators
│   ├── graph_engine.py      # NetworkX fraud ring detection
│   └── ai_engine.py         # Google Gemini AI integration
│
└── routes/
    ├── transaction.py       # /api/transaction  /api/transactions  /api/stats  /api/rules
    ├── alerts.py            # /api/alerts
    ├── simulation.py        # /api/simulate
    ├── graph.py             # /api/graph
    ├── ai.py                # /api/ai/*
    └── websocket.py         # /ws/transactions  /ws/alerts
```
