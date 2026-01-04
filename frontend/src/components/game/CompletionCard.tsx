import { useTranslation } from 'react-i18next'
import { Trophy, Home } from 'lucide-react'
import { Button } from '../ui/Button'

interface CompletionCardProps {
  successCount: number
  totalCards: number
  onComplete: () => void
  isCompleting: boolean
}

export default function CompletionCard({
  successCount,
  totalCards,
  onComplete,
  isCompleting,
}: CompletionCardProps) {
  const { t } = useTranslation()

  const successRate = totalCards > 0 ? Math.round((successCount / totalCards) * 100) : 0

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {t('game.sessionComplete')}
            </h2>
            <div className="space-y-4 mb-8">
              <div className="text-6xl font-bold text-blue-600 dark:text-blue-400">
                {successCount} / {totalCards}
              </div>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                {t('game.cardsCompleted')}
              </p>
              {totalCards > 0 && (
                <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {successRate}% {t('game.successRate')}
                </div>
              )}
            </div>
            <div className="flex gap-4 justify-center">
              <Button
                variant="primary"
                size="lg"
                onClick={onComplete}
                disabled={isCompleting}
              >
                <Home className="h-5 w-5 mr-2" />
                {t('game.backToDashboard')}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

