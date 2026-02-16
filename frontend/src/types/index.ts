export interface User {
  id: number
  username: string
  first_name: string
  last_name: string
  is_admin: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface UserCreate {
  username: string
  first_name: string
  last_name: string
  password: string
  is_admin?: boolean
  is_active?: boolean
}

export interface UserPatch {
  username?: string
  first_name?: string
  last_name?: string
  password?: string
  is_admin?: boolean
  is_active?: boolean
}

export interface LoginRequest {
  username: string
  password: string
}

export interface TokenResponse {
  access_token: string
  token_type: string
}

export interface Deck {
  id: number
  name: string
  description: string
  is_public: boolean
  creator_id: number
  created_at: string
  updated_at: string
}

export interface DeckCreate {
  name: string
  description: string
  is_public?: boolean
}

export interface DeckPatch {
  name?: string
  description?: string
  is_public?: boolean
}

export interface Card {
  id: number
  deck_id: number
  question: string
  answer: string
  keywords: string[]
  created_at: string
  updated_at: string
}

export interface CardCreate {
  deck_id: number
  question: string
  answer: string
  keywords: string[]
}

export interface CardPatch {
  deck_id?: number
  question?: string
  answer?: string
  keywords?: string[]
}

export interface GameSession {
  id: number
  user_id: number
  deck_id: number
  status: 'ACTIVE' | 'COMPLETED' | 'ABANDONED'
  remaining_cards: number[]
  success_cards: number[]
  created_at: string
  updated_at: string
}

export interface GameSessionStart {
  deck_id: number
}

export interface GameSessionResponse {
  id: number
  deck_id: number
  status: string
  remaining_count: number
  success_count: number
}

export interface NextCardResponse {
  card_id: number
  question: string
  position: number
  total_remaining: number
}

export interface AnswerSubmit {
  card_id: number
  answer: string
}

export interface AnswerResponse {
  is_correct: boolean
  expected_keywords: string[]
  message: string
  expected_answer?: string
  remaining_count: number
  success_count: number
}

export interface SessionStatsResponse {
  session_id: number
  deck_id: number
  status: string
  remaining_count: number
  success_count: number
  total_cards: number
}

export interface GlobalStats {
  total_users: number
  total_decks: number
  total_cards: number
  active_sessions: number
  total_sessions: number
  total_attempts: number
  global_success_rate: number
}

export interface UserStats {
  user_id: number
  username: string
  total_sessions: number
  active_sessions: number
  completed_sessions: number
  total_attempts: number
  correct_attempts: number
  success_rate: number
}

export interface SessionListItem {
  session_id: number
  user_id: number
  username: string
  deck_id: number
  deck_name: string
  status: string
  created_at: string
  updated_at: string
}

export interface CardDifficulty {
  card_id: number
  question: string
  attempts: number
  success_rate: number
  avg_time_seconds: number | null
}

export interface CSVImportError {
  line_number: number
  error: string
  raw_line?: string
}

export interface CSVImportResponse {
  total_lines: number
  created_count: number
  error_count: number
  errors: CSVImportError[]
}

// Analytics types
export type CardStatus = 'new' | 'learning' | 'review' | 'mastered'

export interface UserDeckProgress {
  deck_id: number
  deck_name: string
  total_cards: number
  mastered_cards: number
  progress_percentage: number
  success_rate: number
  last_activity: string | null
}

export interface UserProgressStats {
  user_id: number
  username: string
  total_cards_attempted: number
  cards_mastered: number
  avg_success_rate: number
  consecutive_success_count: number
  decks_progress: UserDeckProgress[]
  struggling_decks: UserDeckProgress[]
}

export interface UserDeckCard {
  card_id: number
  question: string
  answer: string
  status: CardStatus
  attempts: number
  success_rate: number
  last_seen: string | null
  next_review: string | null
  consecutive_success_count: number
}

export interface UserDeckCardsResponse {
  user_id: number
  username: string
  deck_id: number
  deck_name: string
  cards: UserDeckCard[]
  mastered_count: number
  total_count: number
  avg_success_rate: number
  last_activity: string | null
  // Pagination
  limit: number
  offset: number
  total_cards: number
}

export interface DeckUserProgress {
  user_id: number
  username: string
  total_cards: number
  mastered_cards: number
  progress_percentage: number
  success_rate: number
  last_activity: string | null
}

export interface DeckAnalyticsStats {
  deck_id: number
  deck_name: string
  total_users: number
  avg_mastery_rate: number
  avg_success_rate: number
  difficult_cards_count: number
  users_progress: DeckUserProgress[]
  difficult_cards: CardDifficulty[]
}

// Paginated responses
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  limit: number
  offset: number
  has_more: boolean
}
