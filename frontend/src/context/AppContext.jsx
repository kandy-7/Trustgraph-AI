import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { getDashboardOverview, runLiveSimulation } from '../services/api';
import { WS_BASE, USE_MOCK_DATA } from '../config';

const AppContext = createContext();
export const useAppContext = () => useContext(AppContext);

const MOCK_STATS = {
  threatLevel: 'LOW', preventedLoss: 12.4, todayEvents: 8234,
  criticalIncidents: 2, avgResponse: 1.2, openCases: 4, fraudAttempts: 18
};

const MOCK_ATTACK_STATS = {
  threatLevel: 'CRITICAL', preventedLoss: 42.6, todayEvents: 14582,
  criticalIncidents: 27, avgResponse: 1.4, openCases: 18, fraudAttempts: 148
};

const ATTACK_SEQUENCE = [
  { time: '08:31', type: 'FAILED_LOGIN', msg: 'Credential Stuffing · 185.15.42.100', severity: 'HIGH' },
  { time: '08:34', type: 'VPN_LOGIN', msg: 'VPN Login · Russia', severity: 'HIGH' },
  { time: '08:35', type: 'DEVICE_CHANGE', msg: 'Unknown Device · Emulator detected', severity: 'CRITICAL' },
  { time: '08:36', type: 'SIM_SWAP', msg: 'SIM Swap · Carrier Jio→Airtel', severity: 'CRITICAL' },
  { time: '08:38', type: 'PASSWORD_RESET', msg: 'Password Reset · Out-of-hours', severity: 'CRITICAL' },
  { time: '08:42', type: 'BENEFICIARY_ADDED', msg: 'New Beneficiary · BEN-99282', severity: 'CRITICAL' },
  { time: '08:45', type: 'TRANSFER', msg: '₹4.9L IMPS Transfer · BLOCKED', severity: 'CRITICAL', status: 'BLOCKED' },
];

export const AppProvider = ({ children }) => {
  const [stats, setStats] = useState(MOCK_STATS);
  const [liveEvents, setLiveEvents] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [investigationCase, setInvestigationCase] = useState(null);
  const [wsConnected, setWsConnected] = useState(false);
  const wsRef = useRef(null);
  const intervalRef = useRef(null);

  // Toast system
  const addToast = useCallback((toast) => {
    const id = Date.now();
    setToasts(prev => [{ ...toast, id }, ...prev].slice(0, 5));
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Connect WebSocket to live backend
  useEffect(() => {
    if (USE_MOCK_DATA) return;
    
    const connect = () => {
      try {
        const ws = new WebSocket(`${WS_BASE}/alerts`);
        wsRef.current = ws;
        ws.onopen = () => { setWsConnected(true); console.log('[WS] Connected'); };
        ws.onmessage = (e) => {
          try {
            const data = JSON.parse(e.data);
            if (data.type === 'alert') {
              const alert = data.data;
              setLiveEvents(prev => [{
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                type: 'ALERT',
                msg: `Risk ${alert.risk_score} · ${alert.risk_level}`,
                severity: alert.risk_level
              }, ...prev].slice(0, 50));
              addToast({ severity: alert.risk_level, msg: `Alert: Risk Score ${alert.risk_score}` });
            }
            if (data.type === 'transaction') {
              const evt = data.data;
              setLiveEvents(prev => [{
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                type: evt.event_type || 'EVENT',
                msg: `${evt.user_id} · Score ${evt.risk_score}`,
                severity: evt.risk_score > 80 ? 'CRITICAL' : evt.risk_score > 50 ? 'HIGH' : 'LOW'
              }, ...prev].slice(0, 50));
            }
          } catch {}
        };
        ws.onclose = () => { setWsConnected(false); setTimeout(connect, 4000); };
        ws.onerror = () => ws.close();
      } catch {}
    };
    connect();
    return () => { wsRef.current?.close(); };
  }, [addToast]);

  // Fetch live stats from backend
  useEffect(() => {
    if (USE_MOCK_DATA) return;
    const fetch = () => {
      getDashboardOverview()
        .then(data => {
          if (!data) return;
          const loss = (data.prevented_loss / 100000).toFixed(1);
          setStats(prev => ({
            ...prev,
            preventedLoss: loss,
            todayEvents: data.total_events_today,
            criticalIncidents: data.open_cases,
            openCases: data.open_cases,
            fraudAttempts: data.fraud_attempts,
          }));
        })
        .catch(() => {});
    };
    fetch();
    const id = setInterval(fetch, 30000);
    return () => clearInterval(id);
  }, []);

  // Simulation engine (UI-side demo + optional backend trigger)
  const runSimulation = useCallback(async (mode) => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (mode === 'Normal Customer' || mode === 'reset') {
      setStats(MOCK_STATS);
      setLiveEvents([{ time: new Date().toLocaleTimeString().slice(0, 5), type: 'LOGIN', msg: 'Normal Login · Mumbai', severity: 'LOW' }]);
      setInvestigationCase(null);
      return;
    }

    // Always do UI simulation for instant visual impact
    setStats(MOCK_ATTACK_STATS);
    setLiveEvents([]);
    setInvestigationCase({
      id: 'CASE-82941',
      customer: 'John Doe',
      userId: 'USR-38362',
      threat: 'Account Takeover',
      stage: 'Money Extraction',
      confidence: 97,
      riskScore: 96,
      timeline: ATTACK_SEQUENCE,
    });

    let step = 0;
    intervalRef.current = setInterval(() => {
      if (step < ATTACK_SEQUENCE.length) {
        const evt = ATTACK_SEQUENCE[step];
        setLiveEvents(prev => [evt, ...prev]);
        if (['CRITICAL', 'HIGH'].includes(evt.severity)) {
          addToast({ severity: evt.severity, msg: `${evt.type.replace(/_/g, ' ')}: ${evt.msg}` });
        }
        step++;
      } else {
        clearInterval(intervalRef.current);
      }
    }, 1800);

    // Also trigger real backend if available (non-blocking)
    if (!USE_MOCK_DATA) {
      runLiveSimulation('ALL').catch(() => {});
    }
  }, [addToast]);

  return (
    <AppContext.Provider value={{
      stats, liveEvents, toasts, investigationCase,
      wsConnected, addToast, removeToast, runSimulation
    }}>
      {children}
    </AppContext.Provider>
  );
};
