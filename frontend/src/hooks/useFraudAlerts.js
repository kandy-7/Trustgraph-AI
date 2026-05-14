import { useState, useEffect, useCallback } from 'react'
import { getFraudAlerts } from '../services/api'

const MOCK_ALERTS = [
  { id: 'ALT-001', type: 'Account Takeover', account: 'ACC-4521', amount: '₹1,20,000', risk: 94, time: '2m ago',  status: 'blocked'   },
  { id: 'ALT-002', type: 'SIM Swap',         account: 'ACC-7832', amount: '₹45,000',  risk: 87, time: '8m ago',  status: 'flagged'   },
  { id: 'ALT-003', type: 'UPI Fraud',        account: 'ACC-3391', amount: '₹12,500',  risk: 76, time: '15m ago', status: 'reviewing' },
  { id: 'ALT-004', type: 'Mule Account',     account: 'ACC-9910', amount: '₹88,000',  risk: 82, time: '23m ago', status: 'escalated' },
  { id: 'ALT-005', type: 'Phishing',         account: 'ACC-2245', amount: '₹5,200',   risk: 61, time: '31m ago', status: 'flagged'   },
]

export default function useFraudAlerts(pollInterval = 30000) {
  const [alerts, setAlerts]     = useState(MOCK_ALERTS)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  const fetchAlerts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getFraudAlerts()
      setAlerts(data?.alerts || MOCK_ALERTS)
    } catch {
      // API not available — keep mock data
      setAlerts(MOCK_ALERTS)
    } finally {
      setLoading(false)
      setLastUpdated(new Date())
    }
  }, [])

  useEffect(() => {
    fetchAlerts()
    const iv = setInterval(fetchAlerts, pollInterval)
    return () => clearInterval(iv)
  }, [fetchAlerts, pollInterval])

  const criticalCount = alerts.filter((a) => a.risk >= 80).length
  const highCount     = alerts.filter((a) => a.risk >= 60 && a.risk < 80).length

  return { alerts, loading, error, lastUpdated, refresh: fetchAlerts, criticalCount, highCount }
}
