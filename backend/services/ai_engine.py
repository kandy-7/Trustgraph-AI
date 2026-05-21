"""
TrustGraph AI – Gemini AI Engine
Powers fraud explanation, risk narration, and compliance summaries
using Google Gemini (gemini-1.5-flash).
"""

from __future__ import annotations
import logging
from typing import Any

import google.generativeai as genai

from backend.config import GEMINI_API_KEY, GEMINI_MODEL

logger = logging.getLogger(__name__)

# ──────────────────────────────────────────────
# Client initialisation
# ──────────────────────────────────────────────
_client_ready = False

def _init_gemini():
    global _client_ready
    if not GEMINI_API_KEY:
        logger.warning("GEMINI_API_KEY not set – AI features will return mock responses.")
        return
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        _client_ready = True
        logger.info("Gemini client initialised (model: %s).", GEMINI_MODEL)
    except Exception as e:
        logger.error("Failed to initialise Gemini: %s", e)

_init_gemini()


def _ask_gemini(prompt: str, temperature: float = 0.4) -> str:
    """
    Send a prompt to Gemini and return the text response.
    Falls back to a descriptive mock if API key is missing.
    """
    if not _client_ready:
        return "[AI unavailable – set GEMINI_API_KEY in .env to enable Gemini responses.]"

    try:
        model = genai.GenerativeModel(
            model_name=GEMINI_MODEL,
            generation_config=genai.GenerationConfig(
                temperature=temperature,
                max_output_tokens=512,
            )
        )
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        logger.error("Gemini API error: %s", e)
        return f"[Gemini error: {e}]"


# ══════════════════════════════════════════════════════════
# Public AI Functions
# ══════════════════════════════════════════════════════════

def explain_fraud_decision(analysis: dict[str, Any]) -> str:
    """
    Generate a plain-English explanation of a fraud decision.
    Called from POST /api/ai/explain.

    Args:
        analysis: The full fraud engine output dict.

    Returns:
        Human-readable explanation string.
    """
    reasons_str = ", ".join(analysis.get("reasons", [])) or "none"
    prompt = f"""You are TrustGraph AI, a fraud detection assistant for an Indian digital payments system.

A transaction was analysed with the following result:
- Transaction ID  : {analysis.get('transaction_id')}
- User ID         : {analysis.get('user_id')}
- Amount          : ₹{analysis.get('amount', 0):,.2f}
- Risk Score      : {analysis.get('risk_score')}/100
- Risk Level      : {analysis.get('risk_level')}
- Decision        : {analysis.get('recommended_action')}
- Triggered Rules : {reasons_str}

Write a clear, concise explanation (3–4 sentences) for a fraud officer explaining:
1. Why this transaction was flagged.
2. What the risk indicators mean.
3. What action should be taken.

Use simple language. Do not use bullet points. Be direct."""
    return _ask_gemini(prompt, temperature=0.3)


def narrate_risk_score(analysis: dict[str, Any]) -> str:
    """
    Generate a short customer-facing risk narrative (non-technical).
    Called from POST /api/ai/narrate.
    """
    prompt = f"""You are a fraud prevention assistant for an Indian digital payments app.

A transaction scored {analysis.get('risk_score')}/100 for fraud risk (level: {analysis.get('risk_level')}).
Triggered signals: {', '.join(analysis.get('reasons', []))}.
Decision: {analysis.get('recommended_action')}.

Write a 2-sentence customer-friendly notification explaining why their transaction
was flagged or held, without using technical jargon. Be empathetic and clear."""
    return _ask_gemini(prompt, temperature=0.5)


def compliance_summary(transactions: list[dict[str, Any]]) -> str:
    """
    Generate a regulatory compliance summary for a batch of flagged transactions.
    Called from POST /api/ai/compliance.
    """
    high_risk = [t for t in transactions if t.get("risk_level") == "HIGH"]
    medium_risk = [t for t in transactions if t.get("risk_level") == "MEDIUM"]
    total = len(transactions)

    prompt = f"""You are a compliance officer AI assistant for an Indian fintech company
subject to RBI fraud reporting guidelines.

Batch summary:
- Total transactions analysed : {total}
- HIGH risk (BLOCK)           : {len(high_risk)}
- MEDIUM risk (VERIFY)        : {len(medium_risk)}
- LOW risk (ALLOW)            : {total - len(high_risk) - len(medium_risk)}

High-risk transaction IDs: {[t.get('transaction_id') for t in high_risk[:5]]}

Write a professional compliance summary (5–7 sentences) suitable for submission
to a fraud review board. Include:
1. Overview of the batch.
2. Nature of detected anomalies.
3. Actions taken by the system.
4. Recommended manual review items.
5. Regulatory note (RBI / NPCI guidelines reference)."""
    return _ask_gemini(prompt, temperature=0.3)


def chat_with_fraud_agent(user_message: str, context: dict[str, Any] | None = None) -> str:
    """
    General-purpose fraud intelligence chat.
    Called from POST /api/ai/chat.

    Args:
        user_message: The officer's question.
        context:      Optional transaction or alert context dict.
    """
    context_str = ""
    if context:
        context_str = f"\n\nContext provided:\n{context}"

    prompt = f"""You are TrustGraph AI, an expert fraud intelligence assistant for Indian digital payments.
You help fraud officers investigate suspicious transactions, understand risk signals,
and decide on appropriate actions.{context_str}

Officer's question: {user_message}

Provide a helpful, accurate, and concise response. Reference Indian payment systems
(UPI, NEFT, IMPS) and RBI/NPCI guidelines where relevant."""
    return _ask_gemini(prompt, temperature=0.5)
