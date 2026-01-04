import {useMemo, useState} from 'react'
import {useParams} from 'react-router-dom'
import {useTranslation} from 'react-i18next'
import {AlertTriangle, Award, CheckCircle, Clock, TrendingUp} from 'lucide-react'
import Breadcrumb from '../../components/ui/Breadcrumb'
import StatsWidget from '../../components/ui/StatsWidget'
import DataTable, {Column} from '../../components/ui/DataTable'
import Pagination from '../../components/ui/Pagination'
import FilterBar from '../../components/ui/FilterBar'
import StatusBadge from '../../components/ui/StatusBadge'
import Loader from '../../components/Loader'
import { useUserDeckCards } from '../../hooks/query/analytics.query'
import type {UserDeckCard} from '../../types'

export default function UserDeckCardsPage() {
  const { userId, deckId } = useParams<{ userId: string; deckId: string }>()
  const { t } = useTranslation()

  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)

  const { data, isLoading } = useUserDeckCards(parseInt(userId!), parseInt(deckId!))

  const filteredCards = useMemo(() => {
    if (!data) return []
    return data.cards.filter((card) => {
      if (statusFilter === 'all') return true
      return card.status === statusFilter
    })
  }, [data, statusFilter])

  const paginatedCards = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredCards.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredCards, currentPage, itemsPerPage])

  const totalPages = Math.ceil(filteredCards.length / itemsPerPage)

  if (isLoading || !data) {
    return <Loader text={t('admin.loadingCards')} />
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

  const lowSuccessCards = filteredCards.filter(
    (c) => c.success_rate !== null && c.success_rate < 40
  ).length
  const staleCards = filteredCards.filter(
    (c) =>
      c.last_seen &&
      Date.now() - new Date(c.last_seen).getTime() > 7 * 24 * 60 * 60 * 1000
  ).length
  const masteredCards = filteredCards.filter((c) => c.status === 'mastered').length

  const columns: Column<UserDeckCard>[] = [
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
      key: 'status',
      header: t('admin.status'),
      render: (card) => <StatusBadge status={card.status} />,
    },
    {
      key: 'success_rate',
      header: t('admin.successRate'),
      render: (card) => (
        <div
          className={`text-sm font-medium ${
            card.success_rate === null
              ? 'text-gray-400'
              : card.success_rate >= 70
              ? 'text-green-600 dark:text-green-400'
              : card.success_rate >= 50
              ? 'text-yellow-600 dark:text-yellow-400'
              : 'text-red-600 dark:text-red-400'
          }`}
        >
          {card.success_rate !== null ? `${card.success_rate}%` : '-'}
        </div>
      ),
    },
    {
      key: 'attempts',
      header: t('admin.attempts'),
      render: (card) => (
        <div className="text-sm text-gray-700 dark:text-gray-300">
          {card.attempts}
        </div>
      ),
    },
    {
      key: 'last_seen',
      header: t('admin.lastSeen'),
      render: (card) => {
        const timeAgo = formatTimeAgo(card.last_seen)
        const isStale = card.last_seen
          ? Date.now() - new Date(card.last_seen).getTime() > 7 * 24 * 60 * 60 * 1000
          : false

        return (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {timeAgo}
            </span>
            {isStale && (
              <span title={t('admin.staleCard')}>
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
              </span>
            )}
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
            { label: t('admin.users'), href: '/admin?tab=users' },
            { label: data.username, href: `/admin/users/${userId}?tab=progress` },
            { label: data.deck_name },
          ]}
        />

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {data.deck_name} - {data.username}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('admin.userDeckCardsDescription')}
          </p>
        </div>

        {/* Stats Summary */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <StatsWidget
            title={t('admin.mastered')}
            value={`${data.mastered_count}/${data.total_count}`}
            icon={Award}
            variant="success"
          />
          <StatsWidget
            title={t('admin.avgSuccessRate')}
            value={`${data.avg_success_rate}%`}
            icon={TrendingUp}
            variant={data.avg_success_rate >= 70 ? 'success' : 'warning'}
          />
          <StatsWidget
            title={t('admin.lastActivity')}
            value={formatTimeAgo(data.last_activity)}
            icon={Clock}
            variant="info"
          />
        </div>

        {/* Filters */}
        <FilterBar
          filters={[
            {
              key: 'status',
              label: t('admin.status'),
              value: statusFilter,
              onChange: setStatusFilter,
              options: [
                { label: t('admin.allStatuses'), value: 'all' },
                { label: t('admin.statusMastered'), value: 'mastered' },
                { label: t('admin.statusReview'), value: 'review' },
                { label: t('admin.statusLearning'), value: 'learning' },
                { label: t('admin.statusNew'), value: 'new' },
              ],
            },
          ]}
        />

        {/* Cards Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 mb-8 overflow-hidden">
          <DataTable
            columns={columns}
            data={paginatedCards}
            keyExtractor={(card) => card.card_id}
            emptyMessage={t('admin.noCardsFound')}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredCards.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        </div>

        {/* Quick Insights */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
              {t('admin.quickInsights')}
            </h3>
          </div>
          <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            {lowSuccessCards > 0 && (
              <li>
                ⚠️ {t('admin.lowSuccessCards', { count: lowSuccessCards })}
              </li>
            )}
            {staleCards > 0 && (
              <li>
                🔥 {t('admin.staleCards', { count: staleCards })}
              </li>
            )}
            <li>
              ✅ {t('admin.masteredCardsCount', { count: masteredCards })}
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

