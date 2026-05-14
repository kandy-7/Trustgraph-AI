import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('tg_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('[TrustGraph API]', error.response?.status, error.message)
    return Promise.reject(error)
  }
)

// ── Transactions ────────────────────────────────────────────────
export const getTransactions = (params = {}) =>
  api.get('/transactions', { params })

export const getTransactionById = (id) =>
  api.get(`/transactions/${id}`)

// ── Fraud Alerts ─────────────────────────────────────────────────
export const getFraudAlerts = (params = {}) =>
  api.get('/alerts', { params })

export const getAlertById = (id) =>
  api.get(`/alerts/${id}`)

export const updateAlertStatus = (id, status) =>
  api.patch(`/alerts/${id}`, { status })

// ── Risk Analysis ─────────────────────────────────────────────────
export const getRiskScore = (accountId) =>
  api.get(`/risk/${accountId}`)

export const getRiskTrend = (params = {}) =>
  api.get('/risk/trend', { params })

// ── Graph ─────────────────────────────────────────────────────────
export const getGraphData = () =>
  api.get('/graph')

// ── Officer Panel ─────────────────────────────────────────────────
export const getCases = () =>
  api.get('/cases')

export const updateCase = (id, payload) =>
  api.patch(`/cases/${id}`, payload)

export const addCaseNote = (id, note) =>
  api.post(`/cases/${id}/notes`, { note })

// ── Simulator ─────────────────────────────────────────────────────
export const runSimulation = (type) =>
  api.post('/simulate', { type })

export default api
