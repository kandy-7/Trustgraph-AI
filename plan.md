# TrustGraph AI 2.0: Banking Cyber Defense Platform

## Project Vision
**TrustGraph AI → Banking Cyber Defense Platform**

Instead of asking: *"Is this transaction fraudulent?"*
We ask: *"Is this customer under an active cyber attack, and what should the bank do before money leaves the account?"*

**Tagline**: *Correlating cyber events, behavioral intelligence, and transaction analytics to stop account takeover before financial loss.*

---

## 12 Phase Roadmap

### Phase 1: Unified Event Collection
**Goal**: Create one event stream for everything.
Instead of only tracking `Transaction`, we collect a continuous timeline:
- Login
- Password Change
- SIM Swap
- Device Change
- ATM Usage
- Card Usage
- UPI, NEFT, IMPS
- KYC Update
- Beneficiary Added
- Location Change
- Failed Login
- VPN Detection

**Deliverables**: Event schema, Event simulator, Unified event API.

### Phase 2: Cyber Telemetry Engine
**Goal**: Shift from "Transaction Risk" to "Customer Cyber Risk".
Track cyber indicators continuously:
- Device / Browser fingerprint
- IP reputation & VPN usage
- Impossible travel
- Rooted phone / Emulator detection
- Malware indicator / Jailbroken device
- SIM replacement

### Phase 3: Behavioral Intelligence Engine
**Goal**: Build dynamic customer profiles (behavioral digital identity).
Learn and compare every new event against:
- Normal transfer amount
- Preferred payment method
- Usual login hour & cities
- Trusted devices & merchants
- Salary date & daily spending pattern

### Phase 4: Event Correlation Engine
**Goal**: Connect all events to detect attacks, not just transactions.
*Example Timeline*:
1. `09:01` Failed Login
2. `09:03` VPN Login
3. `09:05` Password Changed
4. `09:06` New Device
5. `09:08` SIM Swap
6. `09:10` New Beneficiary
7. `09:13` ₹4.8L Transfer → **High Confidence Account Takeover**

### Phase 5: Hybrid AI Risk Engine
**Goal**: Unified Risk = Rules + ML + Anomaly
1. **Rule Engine**: Fast (Large Amount, Night Login, Unknown Device)
2. **ML Model**: Random Forest (Outputs Fraud Probability)
3. **Isolation Forest**: Finds unusual behavior (e.g., sudden ₹4.8L transfer after ₹300 average)

### Phase 6: Money Flow Intelligence
**Goal**: Upgrade the NetworkX graph from visualization to active intelligence.
Detect:
- Mule networks & Fraud rings
- Circular transfers & Layering
- Shared beneficiaries, devices, and IP addresses

### Phase 7: Threat Intelligence Module
**Goal**: Cross-reference events with known threats.
Maintain lists of:
- Blacklisted IPs & Malicious Domains
- Fraud Wallets & Known Mule Accounts
- Compromised Devices & Fake Merchants
- High Risk Countries & Suspicious UPI Handles

### Phase 8: AI SOC Copilot
**Goal**: LLM as a cybersecurity assistant.
Capabilities:
- "Why was this blocked?"
- "Summarize today's attacks."
- "Generate RBI report."
- "Show attack timeline."
- "Suggest investigation steps."

### Phase 9: Smart Response Engine
**Goal**: Recommend adaptive actions instead of just "BLOCK".
Responses:
- Freeze Account / Soft Hold
- OTP Verification / Video KYC
- Notify Customer / Limit Transaction
- Block Beneficiary / Force Password Reset
- Escalate to Fraud Team / SOC

### Phase 10: Command Center Dashboard
**Goal**: A professional dashboard for SOC teams.
Features:
- Live Threat Feed & Attack Timeline
- Risk Map (Attack origins)
- Fraud Network Graph (Money movement)
- Analyst Queue (Pending investigations)
- Customer Profile
- Executive Dashboard (Losses prevented, High-risk users, Recovered funds)

### Phase 11: Explainable AI
**Goal**: Provide transparency for ML predictions using SHAP.
Example Display:
- **Prediction**: 97% Fraud
- **Reason**: SIM Change (31%), Large Transfer (24%), New Device (18%), VPN (15%), Unknown Location (12%)

### Phase 12: Incident Response & Compliance
**Goal**: Exportable reports for deployment readiness.
Generate & Export (PDF/CSV/JSON):
- Incident Report & Timeline
- Affected Accounts & Recommended Actions
- Evidence, Officer Notes, & Compliance Summary

---

## Improved Architecture

```text
             Cyber Events
(Login, SIM, Device, VPN, Password)
                    │
          Event Correlation Engine
                    │
        Behaviour Intelligence Engine
                    │
         Feature Engineering Pipeline
                    │
     ┌──────────────┼──────────────┐
     │              │              │
 Rule Engine   ML Prediction   Isolation Forest
     │              │              │
     └──────────────┼──────────────┘
          Unified Risk Engine
                    │
       Threat Intelligence Check
                    │
         Money Flow Graph Engine
                    │
          AI SOC Copilot (LLM)
                    │
 Response Recommendation Engine
                    │
 React Command Center Dashboard
```

---

## Target APIs

- `POST /events`
- `POST /transactions`
- `POST /simulate`
- `GET /timeline/{user}`
- `GET /risk/{user}`
- `GET /customer-profile/{id}`
- `GET /attack-graph`
- `GET /risk-map`
- `GET /alerts`
- `GET /soc-summary`
- `POST /llm/chat`
- `POST /feedback`
- `POST /incident-report`
- `GET /dashboard`

---

## Demo Story (Hackathon Flow)
1. Customer logs in normally.
2. Attacker launches credential stuffing, causing multiple failed logins.
3. Login succeeds from another city.
4. Device fingerprint changes and a SIM swap is detected.
5. Password is changed and a new beneficiary is added.
6. A ₹4.9 lakh IMPS transfer is attempted.
7. TrustGraph AI correlates all events; risk score reaches 99.
8. Transaction is blocked automatically.
9. SOC Copilot explains the attack.
10. Fraud graph shows linked mule accounts.
11. Incident report is generated in seconds.
