import type { Card, CardCreate, CardPatch, CSVImportResponse, PaginatedResponse } from '../types'
import api from './api'

export const getAllCards = async (limit: number = 40, offset: number = 0): Promise<PaginatedResponse<Card>> => {
  const res = await api.get<PaginatedResponse<Card>>(`/cards?limit=${limit}&offset=${offset}`)
  return res.data
}

export const getCardById = async (id: number): Promise<Card> => {
  const res = await api.get<Card>(`/cards/${id}`)
  return res.data
}

export const getCardsByDeck = async (deckId: number): Promise<Card[]> => {
  const res = await api.get<Card[]>(`/decks/${deckId}/cards`)
  return res.data
}

export const createCard = async (data: CardCreate): Promise<Card> => {
  const res = await api.post<Card>('/cards', data)
  return res.data
}

export const patchCard = async (id: number, data: CardPatch): Promise<Card> => {
  const res = await api.patch<Card>(`/cards/${id}`, data)
  return res.data
}

export const deleteCard = async (id: number): Promise<void> => {
  const res = await api.delete(`/cards/${id}`)
  return res.data
}

export const deleteAllDeckCards = async (deckId: number): Promise<void> => {
  const res = await api.delete(`/decks/${deckId}/cards`)
  return res.data
}

export const importCardCSV = async (deckId: number, file: File): Promise<CSVImportResponse> => {
  const formData = new FormData()
  formData.append('file', file)
  const res = await api.post<CSVImportResponse>(`/decks/${deckId}/import-csv`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}
