import { LogOut } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'

export default function LogoutButton() {
  const { t } = useTranslation()
  const { logout } = useAuth()

  return (
    <button
      onClick={logout}
      className="rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      aria-label={t('auth.logout')}
      title={t('auth.logout')}
    >
      <LogOut className="h-5 w-5 text-gray-700 dark:text-gray-300" />
    </button>
  )
}


