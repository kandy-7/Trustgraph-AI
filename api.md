# TrustGraph AI - Final API Documentation

## 1. Events & Simulation
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/events` | Ingest raw cyber/transaction events into the pipeline. |
| `POST` | `/api/simulate` | Triggers the backend scenario simulator, generating mock attacks that flow to SQLite and WebSockets. |

## 2. Command Center Dashboard
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/dashboard/overview` | Returns aggregate metrics: prevented loss, active cases, and fraud attempts. |
| `GET` | `/api/dashboard/live-events` | Returns the latest 50 events for the live ticker feed. |
| `GET` | `/api/dashboard/threats` | Returns the breakdown of categorized threats (e.g. Account Takeover, Mule Network). |

## 3. Customer 360
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/customers/{id}` | Returns the customer's behavioral baseline (total txns, avg amounts, location). |
| `GET` | `/api/customers/{id}/timeline` | Returns the last 100 raw events for this customer. |
| `GET` | `/api/customers/{id}/risk` | Returns the current dynamic risk profile for this customer. |
| `GET` | `/api/customers/{id}/alerts` | Returns the historical fraud alerts associated with this customer. |
| `GET` | `/api/customers/{id}/devices` | Returns the list of known trusted devices for this customer. |

## 4. Threat & Network Intelligence
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/network` | Returns the active Graph relationships (Mule networks, shared devices). |
| `GET` | `/api/alerts` | Returns all OPEN fraud alerts for the analyst queue. |

## 5. SOC Copilot (LLM)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/copilot/chat` | Generic cybersecurity chat interface for analysts. |
| `POST` | `/api/copilot/explain` | Generates a human-readable threat story explaining why an alert fired. |
| `POST` | `/api/copilot/report` | Generates an RBI-compliant incident report summary. |

## 6. Decision Intelligence (Phase 11)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/explain/{event_id}` | Returns the structured engine and feature contributions for an event decision. |

## 7. Incident Reporting Engine (Phase 12)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/reports/incident/{id}?format=json` | Exports the full incident timeline, threat summary, and investigator notes. |
| `GET` | `/api/reports/summary` | Returns global incident statistics. |

## WebSockets
| Channel | Endpoint | Description |
|---|---|---|
| `WS` | `/ws/alerts` | Broadcasts whenever a new `FraudAlert` is generated. |
| `WS` | `/ws/transactions` | Broadcasts every single `CyberEvent` after processing. |
