import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { useUpdateUser } from '../../hooks/query'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import type { User } from '../../types'

interface EditUserModalProps {
  user: User
  isOpen: boolean
  onClose: () => void
}

export default function EditUserModal({ user, isOpen, onClose }: EditUserModalProps) {
  const { t } = useTranslation()
  const { user: currentUser } = useAuth()
  const toast = useToast()
  const [formData, setFormData] = useState({
    username: user.username,
    first_name: user.first_name,
    last_name: user.last_name,
    password: '',
    is_admin: user.is_admin,
    is_active: user.is_active,
  })

  const { mutate: updateUser, isPending } = useUpdateUser()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Check if trying to remove own admin rights
    if (currentUser?.id === user.id && !formData.is_admin) {
      toast.error(t('admin.cannotRemoveAdminRights'))
      return
    }

    // Check if trying to deactivate self
    if (currentUser?.id === user.id && !formData.is_active) {
      toast.error(t('admin.cannotDeactivateSelf'))
      return
    }

    const updateData: Record<string, unknown> = {
      username: formData.username,
      first_name: formData.first_name,
      last_name: formData.last_name,
      is_admin: formData.is_admin,
      is_active: formData.is_active,
    }

    // Only include password if it's not empty
    if (formData.password.trim()) {
      updateData.password = formData.password
    }

    updateUser(
      { id: user.id, data: updateData },
      {
        onSuccess: () => {
          onClose()
        },
      }
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('admin.editUser')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('admin.username')}
          </label>
          <input
            type="text"
            required
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('admin.firstName')}
            </label>
            <input
              type="text"
              required
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('admin.lastName')}
            </label>
            <input
              type="text"
              required
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('admin.newPassword')}
          </label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder={t('admin.keepCurrentPassword')}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.is_admin}
              onChange={(e) => setFormData({ ...formData, is_admin: e.target.checked })}
              disabled={currentUser?.id === user.id}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {t('admin.isAdmin')}
              {currentUser?.id === user.id && (
                <span className="text-xs text-gray-500 ml-2">{t('admin.cannotRemoveSelf')}</span>
              )}
            </span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              disabled={currentUser?.id === user.id}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {t('admin.isActive')}
              {currentUser?.id === user.id && (
                <span className="text-xs text-gray-500 ml-2">{t('admin.cannotDeactivateSelfShort')}</span>
              )}
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


