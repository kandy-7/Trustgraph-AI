import React, { useState } from 'react';
import { Shield, Lock, Mail, Bot, Eye, EyeOff } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Login() {
  const { login } = useAppContext();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@trustgraph.ai');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate slight cyber check
    await new Promise((r) => setTimeout(r, 600));
    const success = login(email, password);
    setLoading(false);
    if (success) {
      navigate('/overview');
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#020617] px-4 overflow-hidden">
      {/* 3D background glowing orb effect */}
      <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/10 blur-[120px]" />
      <div className="absolute left-[30%] top-[20%] h-[300px] w-[300px] rounded-full bg-cyan-500/5 blur-[100px]" />

      {/* Cyber Grid background */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.02]"
        style={{ backgroundImage: 'linear-gradient(rgba(99,102,241,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.5) 1px, transparent 1px)', backgroundSize: '30px 30px' }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Brand Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-glow">
            <Shield className="h-7 w-7 text-white animate-pulse" />
          </div>
          <h2 className="text-3xl font-black text-slate-100 tracking-tight">
            TrustGraph<span className="gradient-text">AI</span>
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Autonomous Cyber Defense & Fraud Intelligence
          </p>
        </div>

        {/* Login Card */}
        <div className="panel panel-top border border-slate-800 bg-slate-900/60 p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-6 rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4 flex gap-3">
            <Bot className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-400">
              <span className="font-bold text-indigo-300">DEMO MODE ACTIVE:</span> Credentials have been pre-filled for immediate review.
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email field */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Analyst Email
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-4 flex items-center text-slate-500">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@trustgraph.ai"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-11 pr-4 text-sm text-slate-200 placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Security Key
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-4 flex items-center text-slate-500">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-11 pr-12 text-sm text-slate-200 placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Action button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 rounded-xl flex items-center justify-center font-bold text-sm"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                'Access Dashboard'
              )}
            </button>
          </form>
        </div>

        {/* Footer notes */}
        <p className="mt-8 text-center text-xs text-slate-600">
          Authorized banking personnel only. Transactions are audit-logged.
        </p>
      </motion.div>
    </div>
  );
}
