import type {CSVImportResponse, Deck, DeckCreate, DeckPatch} from '@/types'
import api from './api'

export const getAllDecks = async (): Promise<Deck[]> => {
  const res = await api.get<Deck[]>('/decks')
  return res.data
}

export const getDeckById = async (id: number): Promise<Deck> => {
  const res = await api.get<Deck>(`/decks/${id}`)
  return res.data
}

export const createDeck = async (data: DeckCreate): Promise<Deck> => {
  const res = await api.post<Deck>('/decks', data)
  return res.data
}

export const patchDeck = async (id: number, data: DeckPatch): Promise<Deck> => {
  const res = await api.patch<Deck>(`/decks/${id}`, data)
  return res.data
}

export const deleteDeck = async (id: number): Promise<void> => {
  const res = await api.delete(`/decks/${id}`)
  return res.data
}

export const importDeckCSV = async (deckId: number, file: File): Promise<CSVImportResponse> => {
  const formData = new FormData()
  formData.append('file', file)
  const res = await api.post<CSVImportResponse>(`/decks/${deckId}/import-csv`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}
