import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Lock } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { PasswordStrengthIndicator } from '../ui/PasswordStrengthIndicator'

interface ChangePasswordModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (currentPassword: string, newPassword: string) => Promise<void>
}

export function ChangePasswordModal({
  isOpen,
  onClose,
  onSubmit,
}: ChangePasswordModalProps) {
  const { t } = useTranslation()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError(t('settings.allFieldsRequired'))
      return
    }

    if (newPassword !== confirmPassword) {
      setError(t('settings.passwordsMustMatch'))
      return
    }

    if (newPassword === currentPassword) {
      setError(t('settings.newPasswordMustBeDifferent'))
      return
    }

    if (newPassword.length < 8) {
      setError(t('settings.passwordMinLength'))
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(currentPassword, newPassword)
      // Reset form
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.detail || t('settings.changePasswordError'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setError('')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={t('settings.changePassword')} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Current Password */}
        <div>
          <label
            htmlFor="current-password"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            {t('settings.currentPassword')}
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={t('settings.currentPasswordPlaceholder')}
            />
          </div>
        </div>

        {/* New Password */}
        <div>
          <label
            htmlFor="new-password"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            {t('settings.newPassword')}
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={t('settings.newPasswordPlaceholder')}
            />
          </div>
          {/* Password Strength Indicator */}
          <div className="mt-2">
            <PasswordStrengthIndicator password={newPassword} showCriteria={true} />
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label
            htmlFor="confirm-password"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            {t('settings.confirmPassword')}
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={t('settings.confirmPasswordPlaceholder')}
            />
          </div>
          {/* Match indicator */}
          {confirmPassword && (
            <p
              className={`text-xs mt-1 ${
                newPassword === confirmPassword
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}
            >
              {newPassword === confirmPassword
                ? t('settings.passwordsMatch')
                : t('settings.passwordsDontMatch')}
            </p>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button type="button" variant="secondary" className="flex-1" onClick={handleClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" variant="primary" className="flex-1" disabled={isSubmitting}>
            {isSubmitting ? t('settings.changingPassword') : t('settings.changePasswordButton')}
          </Button>
        </div>

        {/* Info message */}
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          {t('settings.logoutAfterChange')}
        </p>
      </form>
    </Modal>
  )
}

