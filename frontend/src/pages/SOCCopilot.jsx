import React, { useState, useRef, useEffect } from 'react';
import { Bot, User, Send, Sparkles, Zap, FileText, ShieldAlert, Clock, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../context/AppContext';
import { copilotChat, copilotExplain, copilotReport } from '../services/api';
import { USE_MOCK_DATA } from '../config';

const QUICK_ACTIONS = [
  { label: 'Explain Incident',    icon: ShieldAlert, color: 'text-rose-400',   prompt: 'Explain the active incident and why it was flagged' },
  { label: 'Generate Timeline',   icon: Clock,       color: 'text-cyan-400',   prompt: "Show today's attack timeline" },
  { label: 'Generate Report',     icon: FileText,    color: 'text-indigo-400', prompt: 'Generate an RBI compliance incident report' },
  { label: 'Recommend Action',    icon: Zap,         color: 'text-amber-400',  prompt: 'What immediate actions should the SOC team take?' },
];

const MOCK_RESPONSES = {
  'explain': `**Incident Analysis · CASE-82941**\n\nCustomer John Doe (USR-38362) is under an active **Account Takeover** attack, currently at the **Money Extraction** stage with 97% confidence.\n\n**Attack Reconstruction:**\n1. Credential stuffing from botnet IP 185.15.42.100 (Russia)\n2. VPN login succeeded after 847 failed attempts\n3. Device fingerprint changed to an emulated Android device\n4. SIM swap executed — carrier changed Jio → Airtel\n5. Password reset completed out-of-hours\n6. ₹4.9L IMPS transfer attempted and **blocked**\n\n**Risk Contribution:** Telemetry (30%) + Correlation (15%) + ML (30%) + Graph (5%) = **Score: 96/100**`,
  'timeline': `**Attack Timeline · Today**\n\n08:31 · FAILED_LOGIN · 847 attempts · Botnet detected\n08:34 · VPN_LOGIN · Tor exit node · Russia\n08:35 · DEVICE_CHANGE · Emulator fingerprint\n08:36 · SIM_SWAP · Carrier: Jio → Airtel\n08:38 · PASSWORD_RESET · Out-of-hours\n08:42 · BENEFICIARY_ADDED · New mule account\n08:45 · TRANSFER · ₹4.9L IMPS → **BLOCKED**\n\n**Total detection time: 1.2 seconds**\n**Total prevention time: 2.4 seconds**`,
  'report': `**RBI Incident Report**\n**Report ID:** REP-82941-2026\n**Generated:** ${new Date().toLocaleString()}\n\n**Section 1: Incident Summary**\nA sophisticated Account Takeover attack was detected and blocked at 08:45 IST. Total funds protected: ₹4,90,000.\n\n**Section 2: Attack Vector**\nMulti-stage credential stuffing followed by SIM swap, password reset, and fraudulent fund transfer attempt.\n\n**Section 3: Response Actions**\n• Account frozen immediately\n• Customer notified via registered mobile\n• Sessions invalidated across all devices\n• Case escalated to Fraud Investigation Team\n\n**Compliance Status:** REPORTED ✓`,
  'action': `**Immediate SOC Response Recommendations:**\n\n**🔴 CRITICAL — Execute within 60 seconds:**\n1. Freeze Account USR-38362 immediately\n2. Invalidate all active sessions\n3. Block beneficiary BEN-992 across the network\n\n**🟠 HIGH — Execute within 5 minutes:**\n4. Force password reset via out-of-band channel\n5. Notify customer via registered backup email\n6. Escalate to Fraud Investigation Tier 2\n\n**📋 COMPLIANCE — Execute within 1 hour:**\n7. File RBI STR (Suspicious Transaction Report)\n8. Cross-check beneficiary against mule database\n9. Flag linked accounts for enhanced monitoring`,
  'default': "I'm analyzing the telemetry for that request. For best results, try a quick action above or ask about a specific incident, risk score, or compliance requirement.",
};

const getResponse = (text) => {
  const lower = text.toLowerCase();
  if (lower.includes('explain') || lower.includes('incident') || lower.includes('why')) return MOCK_RESPONSES.explain;
  if (lower.includes('timeline') || lower.includes('today')) return MOCK_RESPONSES.timeline;
  if (lower.includes('report') || lower.includes('rbi') || lower.includes('compliance')) return MOCK_RESPONSES.report;
  if (lower.includes('action') || lower.includes('recommend') || lower.includes('take')) return MOCK_RESPONSES.action;
  return MOCK_RESPONSES.default;
};

export default function SOCCopilot() {
  const { investigationCase } = useAppContext();
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hello — I'm your **TrustGraph AI SOC Copilot** powered by Gemini.\n\nI can explain incidents, generate compliance reports, reconstruct attack timelines, and recommend response actions.\n\nUse a quick action above or ask me anything." },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, typing]);

  const send = async (text) => {
    const value = (text ?? input).trim();
    if (!value) return;
    setMessages(prev => [...prev, { role: 'user', content: value }]);
    setInput('');
    setTyping(true);

    try {
      let response;
      if (!USE_MOCK_DATA) {
        const lower = value.toLowerCase();
        if (lower.includes('explain') && investigationCase) {
          const res = await copilotExplain({ event_id: investigationCase?.id, incident: investigationCase });
          response = res?.explanation || getResponse(value);
        } else if (lower.includes('report')) {
          const res = await copilotReport({ incident: investigationCase });
          response = res?.report || getResponse(value);
        } else {
          const res = await copilotChat({ message: value, context: investigationCase });
          response = res?.response || getResponse(value);
        }
      } else {
        await new Promise(r => setTimeout(r, 900));
        response = getResponse(value);
      }
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch {
      await new Promise(r => setTimeout(r, 900));
      setMessages(prev => [...prev, { role: 'assistant', content: getResponse(value) }]);
    }
    setTyping(false);
  };

  const formatMessage = (content) => {
    return content.split('\n').map((line, i) => {
      const boldLine = line.replace(/\*\*(.*?)\*\*/g, (_, m) => `<strong class="text-slate-100">${m}</strong>`);
      return <p key={i} className={line.trim() === '' ? 'h-2' : 'leading-relaxed'} dangerouslySetInnerHTML={{ __html: boldLine }} />;
    });
  };

  return (
    <div className="flex h-full flex-col p-6 lg:p-8">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-glow">
            <Bot className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="eyebrow">AI Assistant</p>
            <h1 className="text-2xl font-bold text-slate-100">SOC Copilot</h1>
          </div>
        </div>
        <span className="hidden items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400 sm:flex">
          <Sparkles className="h-3.5 w-3.5" /> Powered by Gemini
        </span>
      </div>

      {/* Quick Actions */}
      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {QUICK_ACTIONS.map(action => (
          <button
            key={action.label}
            onClick={() => send(action.prompt)}
            className="flex items-center gap-2.5 rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2.5 text-left transition-all hover:border-slate-700 hover:bg-slate-800/60"
          >
            <action.icon className={`h-4 w-4 shrink-0 ${action.color}`} />
            <span className="text-xs font-semibold text-slate-300">{action.label}</span>
            <ChevronRight className="ml-auto h-3 w-3 text-slate-600 shrink-0" />
          </button>
        ))}
      </div>

      {/* Chat */}
      <div className="panel panel-top flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex max-w-[85%] gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-indigo-500 to-violet-600'
                    : 'border border-slate-700 bg-slate-800'
                }`}>
                  {msg.role === 'user' ? <User className="h-4 w-4 text-white" /> : <Bot className="h-4 w-4 text-indigo-400" />}
                </div>
                <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'rounded-tr-sm bg-indigo-600 text-white'
                    : 'rounded-tl-sm border border-slate-800 bg-slate-900/80 text-slate-300'
                }`}>
                  {formatMessage(msg.content)}
                </div>
              </div>
            </motion.div>
          ))}
          {typing && (
            <div className="flex gap-3">
              <div className="grid h-8 w-8 place-items-center rounded-full border border-slate-700 bg-slate-800">
                <Bot className="h-4 w-4 text-indigo-400" />
              </div>
              <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm border border-slate-800 bg-slate-900/80 px-4 py-3.5">
                {[0,1,2].map(i => (
                  <motion.span key={i} animate={{ y: [0,-5,0] }} transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
                    className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                ))}
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Input */}
        <div className="border-t border-slate-800 bg-slate-900/60 p-4">
          <div className="relative flex items-center">
            <input
              type="text" value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Ask Copilot to explain an attack, draft a report, or recommend actions…"
              className="w-full rounded-full border border-slate-700 bg-slate-800/60 py-3 pl-5 pr-14 text-sm text-slate-200 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
            <button onClick={() => send()}
              className="absolute right-2 grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-glow transition-transform hover:scale-105">
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
