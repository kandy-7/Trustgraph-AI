import { useState, useEffect, useCallback } from 'react'
import { getTransactions } from '../services/api'

const MOCK_TRANSACTIONS = [
  { id: 'TXN-9821', from: 'ACC-4521', to: 'ACC-7712', amount: '₹45,000', method: 'UPI',  risk: 91, status: 'blocked',   time: '09:12 AM' },
  { id: 'TXN-9822', from: 'ACC-3391', to: 'ACC-1145', amount: '₹12,500', method: 'NEFT', risk: 62, status: 'flagged',   time: '09:15 AM' },
  { id: 'TXN-9823', from: 'ACC-8801', to: 'ACC-5522', amount: '₹2,200',  method: 'IMPS', risk: 18, status: 'cleared',   time: '09:17 AM' },
  { id: 'TXN-9824', from: 'ACC-7832', to: 'ACC-9910', amount: '₹88,000', method: 'UPI',  risk: 85, status: 'escalated', time: '09:19 AM' },
  { id: 'TXN-9825', from: 'ACC-2245', to: 'ACC-3301', amount: '₹5,200',  method: 'UPI',  risk: 44, status: 'reviewing', time: '09:21 AM' },
  { id: 'TXN-9826', from: 'ACC-6610', to: 'ACC-7730', amount: '₹1,500',  method: 'IMPS', risk: 9,  status: 'cleared',   time: '09:23 AM' },
]

export default function useTransactions(filters = {}, pollInterval = 0) {
  const [transactions, setTransactions] = useState(MOCK_TRANSACTIONS)
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState(null)
  const [totalCount, setTotalCount]     = useState(MOCK_TRANSACTIONS.length)

  const fetchTransactions = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getTransactions(filters)
      setTransactions(data?.transactions || MOCK_TRANSACTIONS)
      setTotalCount(data?.total || MOCK_TRANSACTIONS.length)
    } catch {
      setTransactions(MOCK_TRANSACTIONS)
      setTotalCount(MOCK_TRANSACTIONS.length)
    } finally {
      setLoading(false)
    }
  }, [JSON.stringify(filters)])

  useEffect(() => {
    fetchTransactions()
    if (pollInterval > 0) {
      const iv = setInterval(fetchTransactions, pollInterval)
      return () => clearInterval(iv)
    }
  }, [fetchTransactions, pollInterval])

  // Derived stats
  const highRiskCount = transactions.filter((t) => t.risk >= 70).length
  const blockedCount  = transactions.filter((t) => t.status === 'blocked').length
  const clearedCount  = transactions.filter((t) => t.status === 'cleared').length

  return {
    transactions, loading, error, totalCount,
    highRiskCount, blockedCount, clearedCount,
    refresh: fetchTransactions,
  }
}
