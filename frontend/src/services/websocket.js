const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws'

class TrustGraphWebSocket {
  constructor() {
    this.socket = null
    this.listeners = {}
    this.reconnectDelay = 3000
    this.reconnectTimer = null
    this.shouldReconnect = true
  }

  connect() {
    try {
      this.socket = new WebSocket(WS_URL)

      this.socket.onopen = () => {
        console.log('[TrustGraph WS] Connected')
        this._emit('connected', {})
        if (this.reconnectTimer) { clearTimeout(this.reconnectTimer); this.reconnectTimer = null }
      }

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          this._emit(data.type || 'message', data)
          this._emit('*', data)
        } catch {
          this._emit('raw', event.data)
        }
      }

      this.socket.onclose = () => {
        console.warn('[TrustGraph WS] Disconnected')
        this._emit('disconnected', {})
        if (this.shouldReconnect) {
          this.reconnectTimer = setTimeout(() => this.connect(), this.reconnectDelay)
        }
      }

      this.socket.onerror = (err) => {
        console.error('[TrustGraph WS] Error', err)
        this._emit('error', err)
      }
    } catch (err) {
      console.error('[TrustGraph WS] Failed to connect', err)
    }
  }

  disconnect() {
    this.shouldReconnect = false
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer)
    if (this.socket) { this.socket.close(); this.socket = null }
  }

  send(type, payload = {}) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type, ...payload }))
    }
  }

  on(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = []
    this.listeners[event].push(callback)
    return () => this.off(event, callback)
  }

  off(event, callback) {
    if (!this.listeners[event]) return
    this.listeners[event] = this.listeners[event].filter((cb) => cb !== callback)
  }

  _emit(event, data) {
    ;(this.listeners[event] || []).forEach((cb) => cb(data))
  }

  get isConnected() {
    return this.socket?.readyState === WebSocket.OPEN
  }
}

const wsService = new TrustGraphWebSocket()
export default wsService
