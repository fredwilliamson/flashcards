import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { login as loginApi, getMe } from '../services/api'
import type { User } from '../types'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (username: string, password: string, rememberMe?: boolean) => Promise<User>
  logout: () => void
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Helper to get token from either storage
  const getToken = (): string | null => {
    return localStorage.getItem('token') || sessionStorage.getItem('token')
  }

  // Helper to save token based on remember me
  const saveToken = (token: string, rememberMe: boolean) => {
    if (rememberMe) {
      localStorage.setItem('token', token)
      sessionStorage.removeItem('token')
    } else {
      sessionStorage.setItem('token', token)
      localStorage.removeItem('token')
    }
  }

  // Helper to remove token from both storages
  const removeToken = () => {
    localStorage.removeItem('token')
    sessionStorage.removeItem('token')
  }

  useEffect(() => {
    const initAuth = async () => {
      const token = getToken()
      if (token) {
        try {
          const userData = await getMe()
          setUser(userData)
        } catch (error) {
          removeToken()
        }
      }
      setLoading(false)
    }

    initAuth()
  }, [])

  const login = async (username: string, password: string, rememberMe: boolean = false): Promise<User> => {
    const response = await loginApi({ username, password })
    saveToken(response.access_token, rememberMe)
    
    const userData = await getMe()
    setUser(userData)
    return userData
  }

  const logout = () => {
    removeToken()
    setUser(null)
  }

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading, 
        login, 
        logout,
        isAdmin: user?.is_admin ?? false
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

