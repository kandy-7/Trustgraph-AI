import React, { useState } from 'react';
import { Bot, User, Send, Paperclip } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppContext } from '../context/AppContext';

export default function SOCCopilot() {
  const { investigationCase } = useAppContext();
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am your TrustGraph AI SOC Copilot. How can I assist you with your investigations today?' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    const currentInput = input.toLowerCase();
    setInput('');
    
    setTimeout(() => {
      let response = "I'm analyzing the telemetry for that request...";
      
      if (currentInput.includes('summarize') && investigationCase) {
        response = `**Incident Summary for ${investigationCase.id}**\n\nThe customer, ${investigationCase.customer}, is under an active ${investigationCase.threat} attack. The attack has progressed to the **${investigationCase.stage}** stage with a confidence of ${investigationCase.confidence}%. \n\n**Recommendation**: Freeze the account immediately and notify the customer via secure channel.`;
      } else if (currentInput.includes('generate report')) {
        response = "I have drafted the incident report and sent it to your Reports queue. You can download the PDF from the Investigations workspace.";
      }
      
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center">
          <Bot className="w-8 h-8 text-indigo-400 mr-3" />
          SOC Copilot
        </h1>
        <div className="text-sm text-slate-400">LLM Investigation Assistant</div>
      </div>

      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl flex flex-col overflow-hidden">
        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === 'user' ? 'bg-indigo-600 ml-3' : 'bg-slate-700 mr-3'
                }`}>
                  {msg.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-indigo-400" />}
                </div>
                <div className={`p-4 rounded-2xl text-sm whitespace-pre-wrap ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none'
                }`}>
                  {msg.content}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-slate-950 border-t border-slate-800">
          <div className="relative flex items-center">
            <button className="absolute left-3 p-2 text-slate-500 hover:text-slate-300 transition-colors">
              <Paperclip className="w-5 h-5" />
            </button>
            <input 
              type="text" 
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Ask Copilot to summarize an attack, explain a score, or draft a report..."
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-full pl-12 pr-12 py-3 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <button 
              onClick={handleSend}
              className="absolute right-3 p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <div className="flex gap-2 mt-3 ml-2">
            <span className="text-xs text-slate-500">Suggestions:</span>
            <button onClick={() => setInput("Summarize the active incident")} className="text-xs text-indigo-400 hover:text-indigo-300">Summarize active incident</button>
            <button onClick={() => setInput("Generate RBI compliance report")} className="text-xs text-indigo-400 hover:text-indigo-300">Generate report</button>
          </div>
        </div>
      </div>
    </div>
  );
}
