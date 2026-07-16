# TrustGraph AI 2.0

## Banking Cyber Defense Platform

### Overview
TrustGraph AI has evolved from a transaction monitoring dashboard into a comprehensive **Banking Cyber Defense Platform**. 
Instead of only asking *"Is this transaction fraudulent?"*, the system evaluates the entire cyber timeline to answer: *"Is this customer under an active cyber attack, and what should the bank do before money leaves the account?"*

By correlating cyber events (logins, SIM swaps, device changes) with behavioral intelligence and transaction analytics, TrustGraph AI detects and prevents account takeovers, mule networks, and sophisticated cyber fraud.

### Current Status
**Phase 1 Completed: Unified Event Collection**
- Shifted from isolated transactions to a continuous timeline of `CyberEvents`.
- Introduced event sequencing and correlation identifiers to reconstruct attack stories.
- Integrated Event Collector pipeline with severity, tracking, and risk analysis.
- Backward compatibility maintained for the legacy transaction detection pipeline.

### Tech Stack
- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Python + FastAPI
- **Database**: SQLite (scalable to PostgreSQL)
- **AI Layer**: Groq / Gemini integration
- **Graph Intelligence**: NetworkX

### API Endpoints Overview
#### Unified Events
- `POST /api/events` - Ingest a new cyber event.
- `GET /api/events/{event_id}` - Retrieve a specific event.
- `GET /api/users/{id}/timeline` - Reconstruct a chronological attack story.

#### Legacy Transactions (Preserved)
- `POST /api/transaction` - Analyze a single transaction.

#### Simulator
- `POST /api/simulate` - Generate attack stories or normal event sequences.

### Project Structure
```text
trustgraph-ai/
├── frontend/          # React frontend (completed)
├── backend/           # FastAPI backend
│   ├── routes/        # API endpoints (events, transactions, alerts, etc.)
│   ├── services/      # Business logic (event_collector, fraud_engine, simulator)
│   └── models/        # Database and Pydantic schemas
├── docs/              # Documentation
└── run.py             # Application entry point
```

### Getting Started
1. Activate virtual environment: `.\.venv\Scripts\activate`
2. Start the backend: `python run.py`
3. Access Swagger UI: `http://localhost:8000/docs`

### License
MIT License
