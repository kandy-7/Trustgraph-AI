// ─────────────────────────────────────────────────────────────
// TrustGraph AI — Groq LLM client for the SOC Copilot
//
// Talks directly to Groq's OpenAI-compatible Chat Completions API.
// The key is read from VITE_GROQ_API_KEY (see frontend/.env, gitignored).
//
// NOTE: calling the LLM from the browser exposes the API key in the
// client bundle. That is acceptable for a hackathon demo, but for
// production the request should be proxied through the backend.
// ─────────────────────────────────────────────────────────────

const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || '';
const GROQ_MODEL = import.meta.env.VITE_GROQ_MODEL || 'llama-3.3-70b-versatile';

/** Whether a Groq key is configured. */
export const isGroqConfigured = () => Boolean(GROQ_API_KEY);

// How many prior turns to send for conversational memory (keeps token use bounded).
const MAX_HISTORY = 12;

/**
 * Build the system prompt that grounds the Copilot in the live SOC context.
 * "Feed everything to it" — current posture, the active investigation, and
 * the most recent telemetry are all serialized here.
 */
function buildSystemPrompt(context = {}) {
  const { stats, investigationCase, liveEvents } = context;

  const lines = [
    'You are TrustGraph AI SOC Copilot — an expert Security Operations Center assistant for a banking cyber-defense platform used by fraud analysts and SOC officers in India.',
    '',
    'Your job: help the analyst understand and respond to cyber-attacks on bank customers (account takeover, SIM swap, credential stuffing, UPI fraud, money laundering / mule networks). You correlate cyber telemetry, behavioral intelligence, and transaction analytics.',
    '',
    'Capabilities you can perform on request:',
    '- Explain why an incident was flagged and reconstruct the attack timeline.',
    '- Explain a risk score and its contributing factors.',
    '- Recommend concrete SOC response actions (freeze account, block beneficiary, force password reset, escalate, file RBI STR, etc.).',
    '- Draft RBI-compliant incident / compliance report summaries.',
    '',
    'Style: respond as a professional SOC analyst. Be concise and actionable. Use Markdown with **bold** for emphasis and short lists. Use ₹ for currency (Indian Rupees). Do not invent customer data that is not provided — if something is unknown, say so.',
  ];

  if (stats) {
    lines.push(
      '',
      '── Current platform posture ──',
      `Threat level: ${stats.threatLevel}`,
      `Prevented loss: ₹${stats.preventedLoss}${typeof stats.preventedLoss === 'number' ? ' Cr' : ' L'}`,
      `Events today: ${stats.todayEvents}`,
      `Critical incidents / open cases: ${stats.criticalIncidents ?? stats.openCases ?? 0}`,
      `Fraud attempts: ${stats.fraudAttempts ?? 'n/a'}`,
      `Avg response time: ${stats.avgResponse}s`,
    );
  }

  if (investigationCase) {
    const c = investigationCase;
    lines.push(
      '',
      '── Active investigation ──',
      `Case: ${c.id} · Customer: ${c.customer}${c.userId ? ` (${c.userId})` : ''}`,
      `Threat: ${c.threat} · Stage: ${c.stage}`,
      `AI confidence: ${c.confidence}% · Risk score: ${c.riskScore}/100`,
    );
    if (Array.isArray(c.timeline) && c.timeline.length) {
      lines.push('Attack timeline:');
      c.timeline.forEach((e) => {
        lines.push(`  ${e.time} · ${e.type}${e.status ? ` [${e.status}]` : ''} · ${e.msg} (${e.severity})`);
      });
    }
  } else {
    lines.push('', '── Active investigation ──', 'No active investigation case. Answer generally or ask the analyst to run a simulation / open a case.');
  }

  if (Array.isArray(liveEvents) && liveEvents.length) {
    lines.push('', '── Recent live events (newest first) ──');
    liveEvents.slice(0, 10).forEach((e) => {
      lines.push(`  ${e.time} · ${e.type} · ${e.msg} (${e.severity}${e.status ? `/${e.status}` : ''})`);
    });
  }

  return lines.join('\n');
}

/**
 * Send the conversation to Groq and return the assistant's reply text.
 *
 * @param {Object}   params
 * @param {Array}    params.history  Prior chat turns: [{ role: 'user'|'assistant', content }]
 * @param {Object}   params.context  Live SOC context: { stats, investigationCase, liveEvents }
 * @param {AbortSignal} [params.signal]
 * @returns {Promise<string>} assistant reply (throws on failure)
 */
export async function askCopilot({ history = [], context = {}, signal } = {}) {
  if (!GROQ_API_KEY) {
    throw new Error('Groq API key not configured (set VITE_GROQ_API_KEY)');
  }

  const messages = [
    { role: 'system', content: buildSystemPrompt(context) },
    ...history
      .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && m.content)
      .slice(-MAX_HISTORY)
      .map((m) => ({ role: m.role, content: m.content })),
  ];

  const res = await fetch(GROQ_ENDPOINT, {
    method: 'POST',
    signal,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages,
      temperature: 0.4,
      max_tokens: 1024,
      top_p: 0.9,
      stream: false,
    }),
  });

  if (!res.ok) {
    let detail = '';
    try {
      const err = await res.json();
      detail = err?.error?.message || JSON.stringify(err);
    } catch {
      detail = res.statusText;
    }
    throw new Error(`Groq request failed (${res.status}): ${detail}`);
  }

  const data = await res.json();
  const reply = data?.choices?.[0]?.message?.content?.trim();
  if (!reply) throw new Error('Groq returned an empty response');
  return reply;
}
