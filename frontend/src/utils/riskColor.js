export const getRiskLevel = (score) => {
  if (score >= 80) return 'critical'
  if (score >= 60) return 'high'
  if (score >= 40) return 'medium'
  if (score >= 20) return 'low'
  return 'safe'
}

export const getRiskColor = (score) => {
  if (score >= 80) return '#EF4444'
  if (score >= 60) return '#F97316'
  if (score >= 40) return '#F59E0B'
  if (score >= 20) return '#10B981'
  return '#6B7280'
}

export const getRiskBgColor = (score) => {
  if (score >= 80) return '#FEF2F2'
  if (score >= 60) return '#FFF7ED'
  if (score >= 40) return '#FFFBEB'
  if (score >= 20) return '#ECFDF5'
  return '#F9FAFB'
}

export const getRiskLabel = (score) => {
  if (score >= 80) return 'Critical'
  if (score >= 60) return 'High'
  if (score >= 40) return 'Medium'
  if (score >= 20) return 'Low'
  return 'Safe'
}

export const getRiskBadgeClass = (score) => {
  if (score >= 80) return 'badge-red'
  if (score >= 60) return 'badge-red'
  if (score >= 40) return 'badge-amber'
  if (score >= 20) return 'badge-green'
  return 'badge-gray'
}

export const getFraudTypeColor = (type) => {
  const colors = {
    'UPI Fraud': '#EF4444',
    'SIM Swap': '#F59E0B',
    'Account Takeover': '#8B5CF6',
    'Mule Account': '#EC4899',
    'Phishing': '#F97316',
    'Behavioral Anomaly': '#3B82F6',
    'Normal': '#10B981',
  }
  return colors[type] || '#6B7280'
}

export const getStatusBadge = (status) => {
  const map = {
    blocked: 'badge-red',
    flagged: 'badge-amber',
    cleared: 'badge-green',
    reviewing: 'badge-blue',
    escalated: 'badge-purple',
  }
  return map[status] || 'badge-gray'
}
