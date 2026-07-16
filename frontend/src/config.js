// TrustGraph AI — Config
// Set USE_MOCK_DATA = true to run entirely without backend (demo safe mode)
// Set USE_MOCK_DATA = false to use real FastAPI backend

export const USE_MOCK_DATA = false

export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
export const WS_BASE = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws'
