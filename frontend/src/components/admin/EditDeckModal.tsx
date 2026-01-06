import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { useUpdateDeck } from '../../hooks/query'
import type { Deck } from '../../types'

interface EditDeckModalProps {
  deck: Deck
  isOpen: boolean
  onClose: () => void
}

export default function EditDeckModal({ deck, isOpen, onClose }: EditDeckModalProps) {
  const { t } = useTranslation()
  const [formData, setFormData] = useState({
    name: deck.name,
    description: deck.description,
    is_public: deck.is_public,
  })

  const { mutate: updateDeck, isPending } = useUpdateDeck()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    updateDeck(
      { id: deck.id, data: formData },
      {
        onSuccess: () => {
          onClose()
        },
      }
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('admin.editDeck')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('admin.deckName')}
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('admin.description')}
          </label>
          <textarea
            required
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.is_public}
              onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {t('admin.publicDeck')}
            </span>
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? t('admin.savingCard') : t('common.save')}
          </Button>
        </div>
      </form>
    </Modal>
  )
}



