import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Users as UsersIcon, TrendingUp, Target, AlertCircle, ChevronRight } from 'lucide-react'
import Breadcrumb from '../../components/ui/Breadcrumb'
import StatsWidget from '../../components/ui/StatsWidget'
import DataTable, { Column } from '../../components/ui/DataTable'
import ProgressBar from '../../components/ui/ProgressBar'
import { Button } from '../../components/ui/Button'
import Loader from '../../components/Loader'
import { useDeckAnalytics } from '../../hooks/query/analytics.query'
import type { DeckUserProgress, CardDifficulty } from '../../types'

export default function DeckAnalyticsPage() {
  const { deckId } = useParams<{ deckId: string }>()
  const { t } = useTranslation()
  const navigate = useNavigate()

  const { data: deckAnalytics, isLoading } = useDeckAnalytics(parseInt(deckId!))

  if (isLoading || !deckAnalytics) {
    return <Loader text={t('admin.loadingDeckAnalytics')} />
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

  const handleViewDetails = (userId: number) => {
    navigate(`/admin/decks/${deckId}/users/${userId}/cards`)
  }

  const userColumns: Column<DeckUserProgress>[] = [
    {
      key: 'username',
      header: t('admin.username'),
      render: (user) => (
        <div className="font-medium text-gray-900 dark:text-white">
          {user.username}
        </div>
      ),
    },
    {
      key: 'progress',
      header: t('admin.progress'),
      render: (user) => (
        <div className="min-w-[200px]">
          <ProgressBar
            value={user.progress_percentage}
            size="md"
            color={
              user.progress_percentage >= 80
                ? 'green'
                : user.progress_percentage >= 50
                ? 'blue'
                : user.progress_percentage >= 30
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
      render: (user) => (
        <div className="text-sm text-gray-700 dark:text-gray-300">
          {user.mastered_cards}/{user.total_cards}
        </div>
      ),
    },
    {
      key: 'rate',
      header: t('admin.successRate'),
      render: (user) => (
        <div
          className={`text-sm font-medium ${
            user.success_rate >= 70
              ? 'text-green-600 dark:text-green-400'
              : user.success_rate >= 50
              ? 'text-yellow-600 dark:text-yellow-400'
              : 'text-red-600 dark:text-red-400'
          }`}
        >
          {user.success_rate}%
        </div>
      ),
    },
    {
      key: 'activity',
      header: t('admin.lastActivity'),
      render: (user) => {
        const timeAgo = formatTimeAgo(user.last_activity)
        const isStale = user.last_activity
          ? Date.now() - new Date(user.last_activity).getTime() > 7 * 24 * 60 * 60 * 1000
          : false

        return (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {timeAgo}
            </span>
            {isStale && (
              <span title={t('admin.staleActivity')}>
                <AlertCircle className="w-4 h-4 text-yellow-500" />
              </span>
            )}
          </div>
        )
      },
    },
    {
      key: 'actions',
      header: t('common.actions'),
      render: (user) => (
        <Button size="sm" variant="outline" onClick={() => handleViewDetails(user.user_id)}>
          {t('admin.details')}
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      ),
    },
  ]

  const difficultyColumns: Column<CardDifficulty>[] = [
    {
      key: 'question',
      header: t('admin.cardQuestion'),
      render: (card) => (
        <div className="font-medium text-gray-900 dark:text-white max-w-md truncate">
          {card.question}
        </div>
      ),
    },
    {
      key: 'attempts',
      header: t('admin.totalAttempts'),
      render: (card) => (
        <div className="text-sm text-gray-700 dark:text-gray-300">
          {card.attempts}
        </div>
      ),
    },
    {
      key: 'success',
      header: t('admin.successRate'),
      render: (card) => (
        <div className="text-sm text-gray-700 dark:text-gray-300">
          {card.success_rate.toFixed(1)}%
        </div>
      ),
    },
    {
      key: 'difficulty',
      header: t('admin.difficultyScore'),
      render: (card) => {
        const difficulty = 100 - card.success_rate
        return (
          <div className="flex items-center gap-2">
            <div className="flex-1 max-w-[100px]">
              <ProgressBar
                value={difficulty}
                size="sm"
                color="red"
                showLabel={false}
              />
            </div>
            <span className="text-sm font-medium text-red-600 dark:text-red-400">
              {difficulty.toFixed(1)}%
            </span>
          </div>
        )
      },
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Breadcrumb
          items={[
            { label: t('admin.decks'), href: '/admin?tab=decks' },
            { label: deckAnalytics.deck_name },
          ]}
        />

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('admin.deckAnalytics', { name: deckAnalytics.deck_name })}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('admin.deckAnalyticsDescription')}
          </p>
        </div>

        {/* Overall Stats */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatsWidget
            title={t('admin.users')}
            value={deckAnalytics.total_users}
            icon={UsersIcon}
            variant="info"
          />
          <StatsWidget
            title={t('admin.avgMasteryRate')}
            value={`${deckAnalytics.avg_mastery_rate}%`}
            icon={TrendingUp}
            variant={deckAnalytics.avg_mastery_rate >= 70 ? 'success' : 'warning'}
          />
          <StatsWidget
            title={t('admin.avgSuccessRate')}
            value={`${deckAnalytics.avg_success_rate}%`}
            icon={Target}
            variant={deckAnalytics.avg_success_rate >= 70 ? 'success' : 'warning'}
          />
          <StatsWidget
            title={t('admin.difficultCards')}
            value={deckAnalytics.difficult_cards_count}
            icon={AlertCircle}
            variant="danger"
          />
        </div>

        {/* Progress by User */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 mb-8">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {t('admin.progressByUser')}
            </h2>
          </div>
          <DataTable
            columns={userColumns}
            data={deckAnalytics.users_progress}
            keyExtractor={(user) => user.user_id}
            emptyMessage={t('admin.noUsersProgress')}
          />
        </div>

        {/* Difficult Cards */}
        {deckAnalytics.difficult_cards.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {t('admin.difficultCardsTitle')}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {t('admin.difficultCardsDescription')}
              </p>
            </div>
            <DataTable
              columns={difficultyColumns}
              data={deckAnalytics.difficult_cards}
              keyExtractor={(card) => card.card_id}
              emptyMessage={t('admin.noDifficultCards')}
            />
          </div>
        )}
      </div>
    </div>
  )
}

