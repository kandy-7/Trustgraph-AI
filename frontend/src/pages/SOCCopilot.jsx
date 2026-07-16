import React, { useState, useRef, useEffect } from 'react';
import { Bot, User, Send, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppContext } from '../context/AppContext';

const SUGGESTIONS = [
  'Summarize the active incident',
  'Generate RBI compliance report',
  'Explain the risk score',
  "Show today's attack timeline",
];

export default function SOCCopilot() {
  const { investigationCase } = useAppContext();
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hello — I'm your TrustGraph AI SOC Copilot. Ask me to summarize an attack, explain a risk score, or draft an incident report." },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const send = (text) => {
    const value = (text ?? input).trim();
    if (!value) return;
    setMessages((prev) => [...prev, { role: 'user', content: value }]);
    const lower = value.toLowerCase();
    setInput('');
    setTyping(true);

    setTimeout(() => {
      let response = "I'm analyzing the telemetry for that request…";
      if (lower.includes('summarize') && investigationCase) {
        response = `**Incident Summary · ${investigationCase.id}**\n\nCustomer ${investigationCase.customer} is under an active ${investigationCase.threat} attack, currently at the **${investigationCase.stage}** stage (confidence ${investigationCase.confidence}%).\n\n**Recommendation:** Freeze the account immediately and notify the customer via a secure out-of-band channel.`;
      } else if (lower.includes('report')) {
        response = 'I have drafted the incident report and queued it in your Reports workspace. You can download the PDF from the Investigations screen.';
      } else if (lower.includes('score') || lower.includes('explain')) {
        response = '**Score Attribution**\n\n• Impossible travel / location anomaly — 45%\n• Device fingerprint mismatch — 30%\n• Velocity & amount drift — 25%\n\nThese factors combine into a composite risk of 96/100.';
      } else if (lower.includes('timeline')) {
        response = 'Today logged 27 correlated high-severity events, peaking at 08:45 with a blocked ₹4.9L IMPS transfer during an account-takeover kill-chain.';
      }
      setMessages((prev) => [...prev, { role: 'assistant', content: response }]);
      setTyping(false);
    }, 900);
  };

  return (
    <div className="flex h-[calc(100vh-9rem)] flex-col">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-accent-gradient shadow-glow">
            <Bot className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="eyebrow">AI Assistant</p>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">SOC Copilot</h1>
          </div>
        </div>
        <span className="hidden items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-600 sm:flex">
          <Sparkles className="h-3.5 w-3.5" /> Powered by LLM
        </span>
      </div>

      <div className="panel panel-top flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex max-w-[80%] gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${msg.role === 'user' ? 'bg-accent-gradient' : 'border border-slate-200 bg-slate-100'}`}>
                  {msg.role === 'user' ? <User className="h-4 w-4 text-white" /> : <Bot className="h-4 w-4 text-indigo-500" />}
                </div>
                <div className={`whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'rounded-tr-sm bg-indigo-600 text-white'
                    : 'rounded-tl-sm border border-slate-200 bg-slate-50 text-slate-700'
                }`}>
                  {msg.content}
                </div>
              </div>
            </motion.div>
          ))}

          {typing && (
            <div className="flex gap-3">
              <div className="grid h-8 w-8 place-items-center rounded-full border border-slate-200 bg-slate-100">
                <Bot className="h-4 w-4 text-indigo-500" />
              </div>
              <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm border border-slate-200 bg-slate-50 px-4 py-3.5">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Input */}
        <div className="border-t border-slate-100 bg-slate-50 p-4">
          <div className="mb-3 flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 transition-colors hover:border-indigo-300 hover:text-indigo-600"
              >
                {s}
              </button>
            ))}
          </div>
          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="Ask Copilot to summarize an attack, explain a score, or draft a report…"
              className="w-full rounded-full border border-slate-200 bg-white py-3 pl-5 pr-14 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
            <button
              onClick={() => send()}
              className="absolute right-2 grid h-9 w-9 place-items-center rounded-full bg-accent-gradient text-white shadow-glow transition-transform hover:scale-105"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
