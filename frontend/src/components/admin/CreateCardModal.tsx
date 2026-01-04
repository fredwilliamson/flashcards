import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { useCreateCard } from '../../hooks/query'

interface CreateCardModalProps {
  isOpen: boolean
  onClose: () => void
  deckId: number
}

export default function CreateCardModal({ isOpen, onClose, deckId }: CreateCardModalProps) {
  const { t } = useTranslation()
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    keywords: ''
  })

  const { mutate: createCard, isPending } = useCreateCard()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const cardData = {
      deck_id: deckId,
      question: formData.question,
      answer: formData.answer,
      keywords: formData.keywords.split(',').map(k => k.trim()).filter(k => k.length > 0)
    }

    createCard(cardData, {
      onSuccess: () => {
        onClose()
        setFormData({ question: '', answer: '', keywords: '' })
      }
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('admin.createNewCard')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('admin.question')}
          </label>
          <textarea
            required
            rows={2}
            value={formData.question}
            onChange={(e) => setFormData({ ...formData, question: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('admin.answer')}
          </label>
          <textarea
            required
            rows={2}
            value={formData.answer}
            onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('admin.keywordsSeparated')}
          </label>
          <input
            type="text"
            required
            value={formData.keywords}
            onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
            placeholder={t('admin.keywordsPlaceholder')}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? t('admin.creatingCard') : t('admin.createCard')}
          </Button>
        </div>
      </form>
    </Modal>
  )
}


