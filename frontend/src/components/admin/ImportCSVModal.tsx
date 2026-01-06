import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import FileUpload from '../FileUpload'
import { useImportCSV } from '../../hooks/query'

interface ImportCSVModalProps {
  isOpen: boolean
  onClose: () => void
  deckId: number
}

export default function ImportCSVModal({ isOpen, onClose, deckId }: ImportCSVModalProps) {
  const { t } = useTranslation()
  const [file, setFile] = useState<File | null>(null)
  const { mutate: importCSV, isPending } = useImportCSV()

  const handleClose = () => {
    setFile(null)
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    importCSV({ deckId, file }, {
      onSuccess: () => {
        handleClose()
      }
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={t('admin.importCardsCSV')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('admin.csvFile')}
          </label>
          <FileUpload
            accept=".csv"
            onFileSelect={setFile}
            maxSizeMB={5}
            helpText={t('admin.csvFormatHelp')}
            exampleText={t('admin.csvExample')}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={handleClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" disabled={isPending || !file}>
            {isPending ? t('admin.importing') : t('admin.import')}
          </Button>
        </div>
      </form>
    </Modal>
  )
}



