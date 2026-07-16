export const fetchDashboardStats = async () => {
  return {
    threatLevel: 'LOW',
    preventedLoss: 12.4,
    todayEvents: 8234,
    criticalIncidents: 2,
    avgResponse: 1.2
  };
};

export const fetchRiskTrend = async () => {
  return [
    { time: '00:00', risk: 10 },
    { time: '04:00', risk: 12 },
    { time: '08:00', risk: 45 },
    { time: '12:00', risk: 30 },
    { time: '16:00', risk: 85 },
    { time: '20:00', risk: 25 },
  ];
};
