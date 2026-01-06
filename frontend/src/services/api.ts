import axios from 'axios'
import i18n from '../i18n'

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Store toast function (will be set by ToastContext)
let showToastFn: ((message: string, type: 'success' | 'error' | 'warning' | 'info') => void) | null = null

export function setToastFunction(fn: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void) {
  showToastFn = fn
}

// Request interceptor to add JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      if (error.config?.url?.includes('/auth/me')) {
        // Token invalid - logout
        localStorage.removeItem('token')
        sessionStorage.removeItem('token')
        window.location.href = '/login'
      } else if (error.config?.url?.includes('/auth/login')) {
        // Login failed - don't show toast, let the form handle it
      } else {
        // Other 401 - permission issue
        showToastFn?.(i18n.t('errors.unauthorized'), 'error')
      }
    }
    // Handle 403 Forbidden
    else if (error.response?.status === 403) {
      showToastFn?.(i18n.t('errors.forbidden'), 'error')
    }
    // Handle 404 Not Found
    else if (error.response?.status === 404) {
      showToastFn?.(i18n.t('errors.notFound'), 'error')
    }
    // Handle 409 Conflict (e.g., duplicate username)
    else if (error.response?.status === 409) {
      const detail = error.response?.data?.detail || ''
      // Try to extract username from "Username 'xxx' already exists" message
      const usernameMatch = detail.match(/Username '([^']+)' already exists/)
      const message = usernameMatch 
        ? i18n.t('errors.usernameExists', { username: usernameMatch[1] })
        : detail || i18n.t('errors.conflict')
      showToastFn?.(message, 'error')
    }
    // Handle 500 Internal Server Error
    else if (error.response?.status === 500) {
      showToastFn?.(i18n.t('errors.serverError'), 'error')
    }
    // Handle network errors
    else if (!error.response) {
      showToastFn?.(i18n.t('errors.network'), 'error')
    }
    
    return Promise.reject(error)
  }
)

// Export axios instance as default
export default api

// Re-export all API functions
export * from './auth.api'
export * from './user.api'
export * from './deck.api'
export * from './card.api'
export * from './game.api'
export * from './admin.api'
export * from './analytics.api'

// Re-export types for convenience
export type {
  User,
  UserCreate,
  UserPatch,
  Deck,
  DeckCreate,
  DeckPatch,
  Card,
  CardCreate,
  CardPatch,
  GameSession,
  GameSessionStart,
  GameSessionResponse,
  NextCardResponse,
  AnswerSubmit,
  AnswerResponse,
  SessionStatsResponse,
  GlobalStats,
  UserStats,
  SessionListItem,
  CardDifficulty,
  CSVImportResponse,
  LoginRequest,
  TokenResponse,
  UserProgressStats,
  UserDeckCardsResponse,
  DeckAnalyticsStats
} from '../types'
