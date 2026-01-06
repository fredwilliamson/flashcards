import { useState, useRef, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { LogOut, Lock, ChevronDown } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { ChangePasswordModal } from './settings/ChangePasswordModal'
import { useChangePassword } from '../hooks/query/users.query'

export default function UserMenu() {
  const { t } = useTranslation()
  const { user, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const changePasswordMutation = useChangePassword()

  // Generate user initials
  const initials = useMemo(() => {
    if (!user) return '?'
    const firstInitial = user.first_name?.charAt(0).toUpperCase() || ''
    const lastInitial = user.last_name?.charAt(0).toUpperCase() || ''
    return `${firstInitial}${lastInitial}` || user.username?.charAt(0).toUpperCase() || '?'
  }, [user])

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleChangePassword = async (currentPassword: string, newPassword: string) => {
    await changePasswordMutation.mutateAsync({
      current_password: currentPassword,
      new_password: newPassword,
    })
  }

  return (
    <>
      <div className="relative" ref={menuRef}>
        {/* Trigger Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 flex items-center justify-center shadow-sm">
              <span className="text-xs font-semibold text-white">
                {initials}
              </span>
            </div>
            <span className="text-sm text-gray-700 dark:text-gray-300 hidden sm:block">
              {user?.first_name} {user?.last_name}
            </span>
          </div>
          <ChevronDown
            className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-56 rounded-lg bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 z-50">
            <div className="py-1">
              {/* User Info */}
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 flex items-center justify-center shadow-sm flex-shrink-0">
                    <span className="text-sm font-semibold text-white">
                      {initials}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {user?.first_name} {user?.last_name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      @{user?.username}
                    </p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <button
                onClick={() => {
                  setIsOpen(false)
                  setShowPasswordModal(true)
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Lock className="h-4 w-4" />
                <span>{t('settings.changePassword')}</span>
              </button>

              <button
                onClick={() => {
                  setIsOpen(false)
                  logout()
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>{t('auth.logout')}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSubmit={handleChangePassword}
      />
    </>
  )
}

