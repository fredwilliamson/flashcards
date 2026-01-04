import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { TrendingUp, Award, Target, Flame, AlertTriangle, ChevronRight } from 'lucide-react'
import Breadcrumb from '../../components/ui/Breadcrumb'
import StatsWidget from '../../components/ui/StatsWidget'
import DataTable, { Column } from '../../components/ui/DataTable'
import ProgressBar from '../../components/ui/ProgressBar'
import { Button } from '../../components/ui/Button'
import Loader from '../../components/Loader'
import { useUserProgress } from '../../hooks/query/analytics.query'
import type { UserDeckProgress } from '../../types'

export default function UserProgressPage() {
  const { userId } = useParams<{ userId: string }>()
  const { t } = useTranslation()
  const navigate = useNavigate()

  const { data: userProgress, isLoading } = useUserProgress(parseInt(userId!))

  if (isLoading || !userProgress) {
    return <Loader text={t('admin.loadingUserProgress')} />
  }

  const formatTimeAgo = (dateStr: string | null) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return t('common.justNow')
    if (diffInHours < 24) return t('common.hoursAgo', { count: diffInHours })
    const diffInDays = Math.floor(diffInHours / 24)
    return t('common.daysAgo', { count: diffInDays })
  }

  const handleViewDetails = (deckId: number) => {
    navigate(`/admin/users/${userId}/decks/${deckId}/cards`)
  }

  const columns: Column<UserDeckProgress>[] = [
    {
      key: 'deck',
      header: t('admin.deckName'),
      render: (deck) => (
        <div className="font-medium text-gray-900 dark:text-white">
          {deck.deck_name}
        </div>
      ),
    },
    {
      key: 'progress',
      header: t('admin.progress'),
      render: (deck) => (
        <div className="min-w-[200px]">
          <ProgressBar
            value={deck.progress_percentage}
            size="md"
            color={
              deck.progress_percentage >= 80
                ? 'green'
                : deck.progress_percentage >= 50
                ? 'blue'
                : deck.progress_percentage >= 30
                ? 'yellow'
                : 'red'
            }
          />
        </div>
      ),
    },
    {
      key: 'mastered',
      header: t('admin.mastered'),
      render: (deck) => (
        <div className="text-sm text-gray-700 dark:text-gray-300">
          {deck.mastered_cards}/{deck.total_cards}
        </div>
      ),
    },
    {
      key: 'rate',
      header: t('admin.successRate'),
      render: (deck) => (
        <div
          className={`text-sm font-medium ${
            deck.success_rate >= 70
              ? 'text-green-600 dark:text-green-400'
              : deck.success_rate >= 50
              ? 'text-yellow-600 dark:text-yellow-400'
              : 'text-red-600 dark:text-red-400'
          }`}
        >
          {deck.success_rate}%
        </div>
      ),
    },
    {
      key: 'activity',
      header: t('admin.lastActivity'),
      render: (deck) => {
        const timeAgo = formatTimeAgo(deck.last_activity)
        const isStale = deck.last_activity
          ? Date.now() - new Date(deck.last_activity).getTime() > 7 * 24 * 60 * 60 * 1000
          : false

        return (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {timeAgo}
            </span>
            {isStale && (
              <span title={t('admin.staleActivity')}>
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
              </span>
            )}
          </div>
        )
      },
    },
    {
      key: 'actions',
      header: t('common.actions'),
      render: (deck) => (
        <Button size="sm" variant="outline" onClick={() => handleViewDetails(deck.deck_id)}>
          {t('admin.details')}
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Breadcrumb
          items={[
            { label: t('admin.users'), href: '/admin?tab=users' },
            { label: userProgress.username },
          ]}
        />

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('admin.userProgress', { name: userProgress.username })}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('admin.userProgressDescription')}
          </p>
        </div>

        {/* Overall Stats */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatsWidget
            title={t('admin.totalCardsAttempted')}
            value={userProgress.total_cards_attempted}
            icon={Target}
            variant="info"
          />
          <StatsWidget
            title={t('admin.cardsMastered')}
            value={userProgress.cards_mastered}
            icon={Award}
            variant="success"
          />
          <StatsWidget
            title={t('admin.avgSuccessRate')}
            value={`${userProgress.avg_success_rate.toFixed(1)}%`}
            icon={TrendingUp}
            variant={userProgress.avg_success_rate >= 70 ? 'success' : 'warning'}
          />
          <StatsWidget
            title={t('admin.currentStreak')}
            value={`${userProgress.consecutive_success_count} ${t('common.days')}`}
            icon={Flame}
            variant="danger"
          />
        </div>

        {/* Progress by Deck */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 mb-8">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {t('admin.progressByDeck')}
            </h2>
          </div>
          <DataTable
            columns={columns}
            data={userProgress.decks_progress}
            keyExtractor={(deck) => deck.deck_id}
            emptyMessage={t('admin.noDecksProgress')}
          />
        </div>

        {/* Struggling Decks */}
        {userProgress.struggling_decks.length > 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100">
                {t('admin.strugglingDecks')}
              </h3>
            </div>
            <ul className="space-y-2">
              {userProgress.struggling_decks.map((deck) => (
                <li
                  key={deck.deck_id}
                  className="text-sm text-yellow-800 dark:text-yellow-200"
                >
                  <strong>{deck.deck_name}</strong>: {deck.success_rate}% success rate (
                  {deck.mastered_cards}/{deck.total_cards} mastered)
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

