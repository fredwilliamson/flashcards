import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { BookOpen, TrendingUp, GraduationCap } from 'lucide-react'
import UserMenu from '../../components/UserMenu'
import { Badge } from '../../components/ui/Badge'
import Tabs from '../../components/ui/Tabs'
import MyDecksManagement from '../../components/student/MyDecksManagement'
import MyProgressManagement from '../../components/student/MyProgressManagement'

export default function StudentDashboard() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()

  const activeTab = searchParams.get('tab') || 'decks'

  const handleTabChange = (tabId: string) => {
    setSearchParams({ tab: tabId })
  }

  const tabs = [
    {
      id: 'decks',
      label: t('student.myDecks'),
      icon: <BookOpen className="w-4 h-4" />,
      content: <MyDecksManagement />,
    },
    {
      id: 'progress',
      label: t('student.myProgress'),
      icon: <TrendingUp className="w-4 h-4" />,
      content: <MyProgressManagement />,
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
                <GraduationCap className="h-6 w-6 text-blue-600 dark:text-blue-500 mr-2" />
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  {t('student.dashboard')}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="info">{t('student.student')}</Badge>
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

