import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  // Global State
  const [demoMode, setDemoMode] = useState('Normal Customer');
  const [isPlaying, setIsPlaying] = useState(false);
  
  const [stats, setStats] = useState({
    threatLevel: 'LOW',
    preventedLoss: 12.4,
    todayEvents: 8234,
    criticalIncidents: 2,
    avgResponse: 1.2
  });

  const [liveEvents, setLiveEvents] = useState([]);
  const [investigationCase, setInvestigationCase] = useState(null);

  // Demo Simulation Logic
  useEffect(() => {
    if (!isPlaying) return;

    let interval;
    if (demoMode === 'Account Takeover') {
      setStats({
        threatLevel: 'CRITICAL',
        preventedLoss: 42.6,
        todayEvents: 14582,
        criticalIncidents: 27,
        avgResponse: 1.4
      });

      const sequence = [
        { time: '08:31', type: 'FAILED_LOGIN', msg: 'Credential Stuffing', severity: 'HIGH' },
        { time: '08:34', type: 'LOGIN', msg: 'VPN Login', severity: 'HIGH' },
        { time: '08:35', type: 'DEVICE_CHANGE', msg: 'Unknown Device', severity: 'CRITICAL' },
        { time: '08:36', type: 'SIM_SWAP', msg: 'SIM Swap Detected', severity: 'CRITICAL' },
        { time: '08:38', type: 'PASSWORD_RESET', msg: 'Password Reset', severity: 'CRITICAL' },
        { time: '08:42', type: 'NEW_BENEFICIARY', msg: 'New Beneficiary', severity: 'CRITICAL' },
        { time: '08:45', type: 'TRANSFER', msg: '₹4.9L Transfer', severity: 'CRITICAL', status: 'BLOCKED' }
      ];

      setInvestigationCase({
        id: 'CASE-82941',
        customer: 'John Doe',
        threat: 'Account Takeover',
        stage: 'Money Extraction',
        confidence: 97,
        riskScore: 96,
        timeline: sequence
      });

      let step = 0;
      setLiveEvents([]); // Clear old
      interval = setInterval(() => {
        if (step < sequence.length) {
          setLiveEvents(prev => [sequence[step], ...prev]);
          step++;
        } else {
          setIsPlaying(false);
          clearInterval(interval);
        }
      }, 1500); // Add a new event every 1.5 seconds for visual effect
    } else {
      // Normal mode reset
      setStats({
        threatLevel: 'LOW',
        preventedLoss: 12.4,
        todayEvents: 8234,
        criticalIncidents: 2,
        avgResponse: 1.2
      });
      setLiveEvents([{ time: new Date().toLocaleTimeString().slice(0,5), type: 'LOGIN', msg: 'Normal Login', severity: 'LOW' }]);
      setInvestigationCase(null);
      setIsPlaying(false);
    }

    return () => clearInterval(interval);
  }, [isPlaying, demoMode]);

  const runSimulation = (mode) => {
    setDemoMode(mode);
    setIsPlaying(true);
  };

  return (
    <AppContext.Provider value={{
      demoMode,
      stats,
      liveEvents,
      investigationCase,
      runSimulation
    }}>
      {children}
    </AppContext.Provider>
  );
};
