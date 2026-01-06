import {useSearchParams} from 'react-router-dom'
import {useTranslation} from 'react-i18next'
import {BarChart3, BookOpen, Users as UsersIcon} from 'lucide-react'
import {useAuth} from '../../contexts/AuthContext'
import UserMenu from '../../components/UserMenu'
import {Badge} from '../../components/ui/Badge'
import Tabs from '../../components/ui/Tabs'
import UsersManagement from '../../components/admin/UsersManagement'
import DecksManagement from '../../components/admin/DecksManagement'

export default function AdminDashboard() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  const activeTab = searchParams.get('tab') || 'users'

  const handleTabChange = (tabId: string) => {
    setSearchParams({ tab: tabId })
  }

  const tabs = [
    {
      id: 'users',
      label: t('admin.users'),
      icon: <UsersIcon className="w-4 h-4" />,
      content: <UsersManagement />,
    },
    {
      id: 'decks',
      label: t('admin.decks'),
      icon: <BookOpen className="w-4 h-4" />,
      content: <DecksManagement />,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Navbar */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex">
              <div className="flex flex-shrink-0 items-center">
                <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-500 mr-2" />
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  {t('admin.dashboard')}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="success">{t('admin.admin')}</Badge>
              <UserMenu />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={handleTabChange} />
      </main>
    </div>
  )
}
