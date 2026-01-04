import type {
  GameSessionStart,
  GameSessionResponse,
  NextCardResponse,
  AnswerSubmit,
  AnswerResponse,
  SessionStatsResponse
} from '../types'
import api from './api'

export const startGameSession = async (data: GameSessionStart): Promise<GameSessionResponse> => {
  const res = await api.post<GameSessionResponse>('/game/sessions', data)
  return res.data
}

export const getNextCard = async (sessionId: number): Promise<NextCardResponse> => {
  const res = await api.get<NextCardResponse>(`/game/sessions/${sessionId}/next-card`)
  return res.data
}

export const submitAnswer = async (sessionId: number, data: AnswerSubmit): Promise<AnswerResponse> => {
  const res = await api.post<AnswerResponse>(`/game/sessions/${sessionId}/answer`, data)
  return res.data
}

export const getSessionStats = async (sessionId: number): Promise<SessionStatsResponse> => {
  const res = await api.get<SessionStatsResponse>(`/game/sessions/${sessionId}`)
  return res.data
}

export const completeGameSession = async (sessionId: number): Promise<SessionStatsResponse> => {
  const res = await api.post<SessionStatsResponse>(`/game/sessions/${sessionId}/complete`)
  return res.data
}
