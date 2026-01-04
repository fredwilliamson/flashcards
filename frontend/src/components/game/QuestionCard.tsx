import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '../ui/Button'

interface QuestionCardProps {
  question: string
  onSubmit: (answer: string) => void
  isSubmitting: boolean
}

export default function QuestionCard({ question, onSubmit, isSubmitting }: QuestionCardProps) {
  const { t } = useTranslation()
  const [answer, setAnswer] = useState('')

  const handleSubmit = () => {
    if (answer.trim()) {
      onSubmit(answer)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && answer.trim() && !isSubmitting) {
      handleSubmit()
    }
  }

  return (
    <div className="space-y-6">
      {/* Question Display */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('game.question')}
        </label>
        <div className="text-2xl font-semibold text-gray-900 dark:text-white p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          {question}
        </div>
      </div>

      {/* Answer Input */}
      <div>
        <label
          htmlFor="answer"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          {t('game.yourAnswer')}
        </label>
        <input
          id="answer"
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('game.typeYourAnswer')}
          className="w-full px-4 py-3 text-lg border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
          disabled={isSubmitting}
        />
      </div>

      {/* Submit Button */}
      <Button
        variant="primary"
        size="lg"
        onClick={handleSubmit}
        disabled={!answer.trim() || isSubmitting}
        className="w-full"
      >
        {isSubmitting ? t('common.loading') : t('game.submit')}
      </Button>
    </div>
  )
}

