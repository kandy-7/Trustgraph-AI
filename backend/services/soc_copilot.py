import os
import json
import google.generativeai as genai
import logging

logger = logging.getLogger(__name__)

# Initialize Gemini if key exists
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
llm_enabled = False

if GEMINI_API_KEY:
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel('gemini-1.5-flash')
        llm_enabled = True
    except Exception as e:
        logger.error(f"Failed to initialize Gemini: {e}")

# Base Persona Prompt requested by User
BASE_PROMPT = """You are TrustGraph AI SOC Copilot.
Your responsibilities:
Explain incidents.
Recommend containment.
Generate investigation summaries.
Generate compliance reports.
Never fabricate evidence.
Base answers only on supplied context.

Context:
{context}
"""

def _build_context(event_data: dict) -> str:
    """Builds structured context for the LLM from the raw event payload"""
    context = []
    
    if "user_id" in event_data:
        context.append(f"Customer: {event_data['user_id']}")
        
    context.append(f"Event ID: {event_data.get('event_id', 'Unknown')}")
    context.append(f"Risk Score: {event_data.get('risk_score', 'Unknown')}")
    context.append(f"Risk Level: {event_data.get('risk_level', 'Unknown')}")
    
    if event_data.get("reasons"):
        context.append(f"\nThreat Findings & ML/Graph Explanations:")
        for r in event_data["reasons"]:
            context.append(f"- {r}")
            
    if event_data.get("threat_story"):
        context.append("\nAttack Timeline (Threat Story):")
        for s in event_data["threat_story"]:
            context.append(f"- {s}")
            
    return "\n".join(context)


def _call_llm_or_fallback(prompt: str, fallback_template: str) -> str:
    """Calls Gemini if available, otherwise returns the deterministic fallback template."""
    if not llm_enabled:
        return fallback_template
        
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        logger.error(f"LLM generation failed: {e}")
        return fallback_template


# ══════════════════════════════════════════════════════════
# Capabilities
# ══════════════════════════════════════════════════════════

def generate_incident_explanation(event_data: dict) -> str:
    context = _build_context(event_data)
    prompt = BASE_PROMPT.replace("{context}", context) + "\n\nTask: Explain why this incident was flagged and what the root cause of the risk score is. Be extremely concise (under 4 sentences)."
    
    fallback = (
        f"This incident was blocked because the risk score reached {event_data.get('risk_score', 0)}. "
        f"The primary flags were: {', '.join(event_data.get('reasons', [])[:2])}. "
        f"Please escalate to Tier 2."
    )
    return _call_llm_or_fallback(prompt, fallback)


def generate_compliance_report(event_data: dict) -> str:
    context = _build_context(event_data)
    prompt = BASE_PROMPT.replace("{context}", context) + "\n\nTask: Generate an official RBI (Reserve Bank of India) / NPCI Incident Summary report for this event. Include sections for Incident Overview, Affected Vectors, and Mitigation Steps."
    
    fallback = (
        f"--- NPCI/RBI INCIDENT REPORT ---\n"
        f"Event: {event_data.get('event_id')}\n"
        f"Status: Mitigated ({event_data.get('recommended_action')})\n"
        f"Details: {event_data.get('reasons')}"
    )
    return _call_llm_or_fallback(prompt, fallback)


def generate_executive_summary() -> str:
    # In a real app we'd fetch stats from DB. For now, generate a realistic template.
    prompt = "You are TrustGraph AI SOC Copilot. Task: Generate a 4-line executive summary of today's SOC platform performance, mentioning high detection rates, blocked funds, and the top threat vector (Account Takeover)."
    fallback = "Today: 14 attacks detected. 12 blocked. 2 under investigation. ₹18.4L prevented. Highest threat: Account Takeover."
    return _call_llm_or_fallback(prompt, fallback)


def generate_recommendations(event_data: dict) -> str:
    context = _build_context(event_data)
    prompt = BASE_PROMPT.replace("{context}", context) + "\n\nTask: Provide 3 actionable steps the SOC team should take to contain this specific threat right now."
    
    fallback = "1. Freeze the account.\n2. Contact the customer.\n3. Revoke trusted device tokens."
    return _call_llm_or_fallback(prompt, fallback)


def handle_chat(query: str, event_data: Optional[dict] = None) -> str:
    context = _build_context(event_data) if event_data else "No specific incident context."
    prompt = BASE_PROMPT.replace("{context}", context) + f"\n\nAnalyst Query: {query}\n\nTask: Answer the analyst's question based strictly on the context."
    
    fallback = "The LLM engine is currently offline or unreachable. Cannot process open-ended chat."
    return _call_llm_or_fallback(prompt, fallback)


def generate_threat_story_narrative(event_data: dict) -> str:
    """The 'Add One More Feature' requested by User for dramatic narrative generation."""
    context = _build_context(event_data)
    prompt = BASE_PROMPT.replace("{context}", context) + "\n\nTask: Turn the timeline and findings into a dramatic but professional 3-sentence narrative story of how the attacker was stopped by TrustGraph AI."
    
    fallback = "TrustGraph AI detected multiple anomalies across device, location, and behaviour. The sequence was identified as an Account Takeover and stopped before funds were lost."
    return _call_llm_or_fallback(prompt, fallback)
