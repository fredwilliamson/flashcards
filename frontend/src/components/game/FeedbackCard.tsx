import { useTranslation } from 'react-i18next'
import { CheckCircle, XCircle, ArrowRight } from 'lucide-react'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'

interface FeedbackCardProps {
  isCorrect: boolean
  message: string
  expectedKeywords: string[]
  hasMoreCards: boolean
  onNextCard: () => void
}

export default function FeedbackCard({
  isCorrect,
  message,
  expectedKeywords,
  hasMoreCards,
  onNextCard,
}: FeedbackCardProps) {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      {/* Feedback Message */}
      <div
        className={`text-center p-6 rounded-lg ${
          isCorrect
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
        }`}
      >
        {isCorrect ? (
          <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-400 mx-auto mb-4" />
        ) : (
          <XCircle className="h-16 w-16 text-red-600 dark:text-red-400 mx-auto mb-4" />
        )}
        <h3
          className={`text-2xl font-bold mb-2 ${
            isCorrect
              ? 'text-green-900 dark:text-green-100'
              : 'text-red-900 dark:text-red-100'
          }`}
        >
          {isCorrect ? t('game.correct') : t('game.incorrect')}
        </h3>
        <p
          className={`text-lg ${
            isCorrect
              ? 'text-green-700 dark:text-green-300'
              : 'text-red-700 dark:text-red-300'
          }`}
        >
          {message}
        </p>
      </div>

      {/* Expected Keywords (only shown on incorrect answers) */}
      {!isCorrect && expectedKeywords && expectedKeywords.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
            {t('game.expectedKeywords')}:
          </h4>
          <div className="flex flex-wrap gap-2">
            {expectedKeywords.map((keyword, index) => (
              <Badge key={index} variant="info">
                {keyword}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Next Card Button */}
      <Button variant="primary" size="lg" onClick={onNextCard} className="w-full">
        <ArrowRight className="h-5 w-5 mr-2" />
        {hasMoreCards ? t('game.nextCard') : t('game.finish')}
      </Button>
    </div>
  )
}

