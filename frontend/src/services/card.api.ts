import type { Card, CardCreate, CardPatch, CSVImportResponse } from '../types'
import api from './api'

export const getAllCards = async (): Promise<Card[]> => {
  const res = await api.get<Card[]>('/cards')
  return res.data
}

export const getCardById = async (id: number): Promise<Card> => {
  const res = await api.get<Card>(`/cards/${id}`)
  return res.data
}

export const getCardsByDeck = async (deckId: number): Promise<Card[]> => {
  const res = await api.get<Card[]>(`/cards?deck_id=${deckId}`)
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

export const importCardCSV = async (deckId: number, file: File): Promise<CSVImportResponse> => {
  const formData = new FormData()
  formData.append('file', file)
  const res = await api.post<CSVImportResponse>(`/decks/${deckId}/import-csv`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}
