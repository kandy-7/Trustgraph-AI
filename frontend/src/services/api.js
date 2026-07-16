import axios from 'axios'
import { API_BASE, USE_MOCK_DATA } from '../config'

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    console.warn('[TrustGraph API]', err.response?.status, err.message)
    return Promise.reject(err)
  }
)

// ── Dashboard ──────────────────────────────────────────────────────
export const getDashboardOverview = () =>
  USE_MOCK_DATA ? Promise.resolve(null) : api.get('/dashboard/overview')

export const getLiveEvents = () =>
  USE_MOCK_DATA ? Promise.resolve([]) : api.get('/dashboard/live-events')

export const getDashboardThreats = () =>
  USE_MOCK_DATA ? Promise.resolve(null) : api.get('/dashboard/threats')

// ── Alerts ─────────────────────────────────────────────────────────
export const getAlerts = (params = {}) =>
  USE_MOCK_DATA ? Promise.resolve([]) : api.get('/alerts', { params })

export const updateAlertStatus = (id, status) =>
  api.patch(`/alerts/${id}`, { status })

// ── Customers ──────────────────────────────────────────────────────
export const getCustomer = (id) =>
  USE_MOCK_DATA ? Promise.resolve(null) : api.get(`/customers/${id}`)

export const getCustomerTimeline = (id) =>
  USE_MOCK_DATA ? Promise.resolve([]) : api.get(`/customers/${id}/timeline`)

export const getCustomerAlerts = (id) =>
  USE_MOCK_DATA ? Promise.resolve([]) : api.get(`/customers/${id}/alerts`)

export const getCustomerDevices = (id) =>
  USE_MOCK_DATA ? Promise.resolve([]) : api.get(`/customers/${id}/devices`)

// ── Network ────────────────────────────────────────────────────────
export const getNetworkGraph = () =>
  USE_MOCK_DATA ? Promise.resolve(null) : api.get('/network')

// ── Explainability ─────────────────────────────────────────────────
export const getDecisionIntelligence = (eventId) =>
  USE_MOCK_DATA ? Promise.resolve(null) : api.get(`/explain/${eventId}`)

// ── Reports ───────────────────────────────────────────────────────
export const getReportsSummary = () =>
  USE_MOCK_DATA ? Promise.resolve(null) : api.get('/reports/summary')

export const getIncidentReport = (eventId, format = 'json') =>
  api.get(`/reports/incident/${eventId}`, { params: { format } })

// ── SOC Copilot ───────────────────────────────────────────────────
export const copilotChat = (payload) =>
  api.post('/copilot/chat', payload)

export const copilotExplain = (payload) =>
  api.post('/copilot/explain', payload)

export const copilotReport = (payload) =>
  api.post('/copilot/report', payload)

// ── Simulator ─────────────────────────────────────────────────────
export const runLiveSimulation = (scenario = 'ALL') =>
  api.post(`/simulate?scenario=${scenario}`)

export default api
