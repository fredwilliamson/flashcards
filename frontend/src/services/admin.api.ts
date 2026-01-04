import type { GlobalStats, UserStats, SessionListItem, CardDifficulty } from '../types'
import api from './api'

export const getGlobalStats = async (): Promise<GlobalStats> => {
  const res = await api.get<GlobalStats>('/admin/stats/global')
  return res.data
}

export const getUserStats = async (userId: number): Promise<UserStats> => {
  const res = await api.get<UserStats>(`/admin/users/${userId}/stats`)
  return res.data
}

export const getAllSessions = async (limit = 10): Promise<SessionListItem[]> => {
  const res = await api.get<SessionListItem[]>(`/admin/sessions?limit=${limit}`)
  return res.data
}

export const getDifficultCards = async (limit = 10): Promise<CardDifficulty[]> => {
  const res = await api.get<CardDifficulty[]>(`/admin/cards/difficult?limit=${limit}`)
  return res.data
}
