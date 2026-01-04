import type { LoginRequest, TokenResponse, User } from '../types'
import api from './api'

export const login = async (data: LoginRequest): Promise<TokenResponse> => {
  const res = await api.post<TokenResponse>('/auth/login', data)
  return res.data
}

export const getMe = async (): Promise<User> => {
  const res = await api.get<User>('/auth/me')
  return res.data
}
