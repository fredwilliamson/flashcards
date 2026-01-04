import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'
import {
  useNextCard,
  useSubmitAnswer,
  useSessionStats,
  useCompleteSession,
} from '@/hooks/query'
import { Button } from '../../components/ui/Button'
import Breadcrumb from '../../components/ui/Breadcrumb'
import FeedbackCard from '../../components/game/FeedbackCard'
import QuestionCard from '../../components/game/QuestionCard'
import CompletionCard from '../../components/game/CompletionCard'
import GameProgressHeader from '../../components/game/GameProgressHeader'
import Loader from '../../components/Loader'

type GameState = 'loading' | 'question' | 'feedback' | 'completed'

export default function GamePage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const [gameState, setGameState] = useState<GameState>('loading')
  const [lastFeedback, setLastFeedback] = useState<{
    isCorrect: boolean
    message: string
    expectedKeywords: string[]
  } | null>(null)

  const sessionIdNum = sessionId ? parseInt(sessionId) : null
  const { card, isLoading: loadingCard, refetch: refetchCard } = useNextCard(sessionIdNum)
  const { stats, refetch: refetchStats } = useSessionStats(sessionIdNum)
  const submitAnswerMutation = useSubmitAnswer()
  const completeSessionMutation = useCompleteSession()

  // Set initial game state - only transition from loading to question
  useEffect(() => {
    if (!loadingCard && card && gameState === 'loading') {
      setGameState('question')
    }
  }, [loadingCard, card, gameState])

  const handleSubmitAnswer = async (answer: string) => {
    if (!sessionIdNum || !card || !answer.trim()) return

    submitAnswerMutation.mutate(
      {
        sessionId: sessionIdNum,
        answer: {
          card_id: card.card_id,
          answer: answer,
        },
      },
      {
        onSuccess: (response) => {
          setLastFeedback({
            isCorrect: response.is_correct,
            message: response.message,
            expectedKeywords: response.expected_keywords,
          })
          setGameState('feedback')
          refetchStats()
        },
      }
    )
  }

  const handleNextCard = async () => {
    setLastFeedback(null)
    setGameState('loading')

    // Check if session is complete
    if (stats && stats.remaining_count === 0) {
      setGameState('completed')
    } else {
      await refetchCard()
      setGameState('question')
    }
  }

  const handleCompleteSession = () => {
    if (!sessionIdNum) return

    completeSessionMutation.mutate(sessionIdNum, {
      onSuccess: () => {
        navigate('/student/dashboard')
      },
    })
  }

  const handleExit = () => {
    if (window.confirm(t('game.confirmExit'))) {
      navigate('/student/dashboard')
    }
  }

  // Loading state
  if (loadingCard && gameState === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
        <main className="mx-auto max-w-3xl px-4 py-8">
          <Loader />
        </main>
      </div>
    )
  }

  // Session completed state
  if (gameState === 'completed' || (stats && stats.remaining_count === 0 && gameState !== 'feedback')) {
    return (
      <CompletionCard
        successCount={stats?.success_count || 0}
        totalCards={stats?.total_cards || 0}
        onComplete={handleCompleteSession}
        isCompleting={completeSessionMutation.isPending}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <main className="mx-auto max-w-3xl px-4 py-8">
        {/* Breadcrumb & Exit Button */}
        <div className="flex items-center justify-between mb-6">
          <Breadcrumb
            items={[
              { label: t('student.dashboard'), href: '/student/dashboard' },
              { label: t('game.practice') },
            ]}
          />
          <Button variant="secondary" size="sm" onClick={handleExit}>
            <X className="h-4 w-4 mr-1" />
            {t('game.exit')}
          </Button>
        </div>

        {/* Progress Header */}
        {stats && (
          <GameProgressHeader
            successCount={stats.success_count}
            remainingCount={stats.remaining_count}
            totalCards={stats.total_cards}
          />
        )}

        {/* Game Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-200 dark:border-gray-700">
          {/* Question State */}
          {gameState === 'question' && card && (
            <QuestionCard
              question={card.question}
              onSubmit={handleSubmitAnswer}
              isSubmitting={submitAnswerMutation.isPending}
            />
          )}

          {/* Feedback State */}
          {gameState === 'feedback' && lastFeedback && (
            <FeedbackCard
              isCorrect={lastFeedback.isCorrect}
              message={lastFeedback.message}
              expectedKeywords={lastFeedback.expectedKeywords}
              hasMoreCards={stats ? stats.remaining_count > 0 : false}
              onNextCard={handleNextCard}
            />
          )}
        </div>
      </main>
    </div>
  )
}
