import { CheckCircle, Edit2, HelpCircle, Tag, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent } from './ui/Card'
import { Badge } from './ui/Badge'
import type { Card as CardType } from '../types'

interface FlashCardProps {
  card: CardType
  onEdit: (card: CardType) => void
  onDelete: (cardId: number) => void
}

export default function FlashCard({ card, onEdit, onDelete }: FlashCardProps) {
  const { t } = useTranslation()
  
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-600">
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Question */}
          <div className="pb-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-start gap-2 mb-2">
              <HelpCircle className="h-4 w-4 text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1 uppercase tracking-wide">
                  {t('admin.question')}
                </p>
                <p className="font-medium text-gray-900 dark:text-white leading-relaxed">
                  {card.question}
                </p>
              </div>
            </div>
          </div>

          {/* Answer */}
          <div className="pb-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-start gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-green-600 dark:text-green-400 mb-1 uppercase tracking-wide">
                  {t('admin.answer')}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {card.answer}
                </p>
              </div>
            </div>
          </div>

          {/* Keywords */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Tag className="h-4 w-4 text-purple-500 dark:text-purple-400" />
              <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide">
                {t('admin.keywords')}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 ml-6">
              {card.keywords.map((keyword, idx) => (
                <Badge
                  key={idx}
                  variant="default"
                  className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                >
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => onEdit(card)}
              className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
              title={t('admin.editCard')}
            >
              <Edit2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </button>
            <button
              onClick={() => onDelete(card.id)}
              className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
              title={t('admin.deleteCard')}
            >
              <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


