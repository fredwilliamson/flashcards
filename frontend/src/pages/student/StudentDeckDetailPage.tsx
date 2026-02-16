import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Play, BookOpen, Target, TrendingUp, Clock } from 'lucide-react'
import { useDeck, useStartSession } from '@/hooks/query'
import { usePaginatedUserDeckCards } from '../../hooks/usePaginatedUserDeckCards'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import DataTable, { Column } from '../../components/ui/DataTable'
import { useDataSort } from '../../hooks/useDataSort'

import ProgressBar from '../../components/ui/ProgressBar'
import StatsWidget from '../../components/ui/StatsWidget'
import Loader from '../../components/Loader'
import type { UserDeckCard, CardStatus } from '../../types'

const getStatusColor = (status: CardStatus): 'default' | 'warning' | 'info' | 'success' => {
  switch (status) {
    case 'mastered':
      return 'success'
    case 'review':
      return 'info'
    case 'learning':
      return 'warning'
    default:
      return 'default'
  }
}

const getStatusLabel = (status: CardStatus, t: any): string => {
  switch (status) {
    case 'mastered':
      return t('game.status.mastered')
    case 'review':
      return t('game.status.review')
    case 'learning':
      return t('game.status.learning')
    default:
      return t('game.status.new')
  }
}

export default function StudentDeckDetailPage() {
  const { deckId } = useParams<{ deckId: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { user } = useAuth()

  const deckIdNum = deckId ? parseInt(deckId) : 0
  const { deck, isLoading: loadingDeck } = useDeck(deckIdNum)
  const { 
    cards, 
    metadata, 
    isLoading: loadingCards,
    frontendPageIndex,
    frontendPageSize,
    loadMoreIfNeeded,
    setFrontendPageSize,
  } = usePaginatedUserDeckCards(user?.id || 0, deckIdNum, 10)
  const { sortedData: sortedCards, handleSortChange } = useDataSort(cards)
  const startGameMutation = useStartSession()

  const handleStartPractice = () => {
    startGameMutation.mutate(
      { deck_id: deckIdNum },
      {
        onSuccess: (session) => {
          navigate(`/student/game/${session.id}`)
        },
      }
    )
  }

  const handleBack = () => {
    navigate('/student/dashboard')
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  const columns: Column<UserDeckCard>[] = [
    {
      key: 'question',
      header: t('admin.question'),
      sortable: true,
      sortType: 'string',
      render: (card) => (
        <div className="max-w-md">
          <div className="font-medium text-gray-900 dark:text-white">
            {card.question}
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: t('admin.status'),
      sortable: true,
      sortType: 'string',
      render: (card) => (
        <Badge variant={getStatusColor(card.status)}>
          {getStatusLabel(card.status, t)}
        </Badge>
      ),
    },
    {
      key: 'attempts',
      header: t('admin.attempts'),
      sortable: true,
      sortType: 'number',
      render: (card) => (
        <span className="text-gray-900 dark:text-white">{card.attempts}</span>
      ),
    },
    {
      key: 'success_rate',
      header: t('admin.successRate'),
      sortable: true,
      sortType: 'number',
      render: (card) => {
        if (card.attempts === 0) {
          return <span className="text-gray-400">-</span>
        }
        const color =
          card.success_rate >= 80
            ? 'text-green-600 dark:text-green-400'
            : card.success_rate >= 50
            ? 'text-yellow-600 dark:text-yellow-400'
            : 'text-red-600 dark:text-red-400'
        return <span className={`font-medium ${color}`}>{card.success_rate.toFixed(1)}%</span>
      },
    },
    {
      key: 'last_seen',
      header: t('admin.lastSeen'),
      sortable: true,
      sortType: 'date',
      render: (card) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {formatDate(card.last_seen)}
        </span>
      ),
    },
    {
      key: 'next_review',
      header: t('admin.nextReview'),
      sortable: true,
      sortType: 'date',
      render: (card) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {formatDate(card.next_review)}
        </span>
      ),
    },
  ]

  if (loadingDeck || loadingCards) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
        <main className="mx-auto max-w-7xl px-4 py-8">
          <Loader />
        </main>
      </div>
    )
  }

  if (!deck || !metadata) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
        <main className="mx-auto max-w-7xl px-4 py-8">
          <div className="text-center">
            <p className="text-gray-500 dark:text-gray-400">{t('admin.deckNotFound')}</p>
            <Button variant="secondary" onClick={handleBack} className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('common.back')}
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Button variant="secondary" onClick={handleBack} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('common.back')}
        </Button>

        {/* Deck Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                {deck.name}
              </h1>
              {deck.description && (
                <p className="text-gray-600 dark:text-gray-400 mb-4">{deck.description}</p>
              )}
              <div className="flex gap-4">
                <Badge variant="info">
                  {metadata.total_count} {t('common.cards')}
                </Badge>
                <Badge variant="success">
                  {metadata.mastered_count} {t('common.mastered')}
                </Badge>
              </div>
            </div>
            <Button
              variant="primary"
              size="lg"
              onClick={handleStartPractice}
              disabled={startGameMutation.isPending || metadata.total_count === 0}
            >
              <Play className="h-5 w-5 mr-2" />
              {t('common.practice')}
            </Button>
          </div>
        </div>

        {/* Stats Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatsWidget
            title={t('admin.totalCards')}
            value={metadata.total_count.toString()}
            icon={Target}
            variant="default"
          />
          <StatsWidget
            title={t('admin.masteredCards')}
            value={metadata.mastered_count.toString()}
            icon={TrendingUp}
            variant="success"
          />
          <StatsWidget
            title={t('admin.avgSuccessRate')}
            value={`${metadata.avg_success_rate.toFixed(1)}%`}
            icon={TrendingUp}
            variant="warning"
          />
          <StatsWidget
            title={t('admin.lastActivity')}
            value={metadata.last_activity ? formatDate(metadata.last_activity) : t('common.justNow')}
            icon={Clock}
            variant="info"
          />
        </div>

        {/* Progress Bar */}
        {metadata.total_count > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('admin.progress')}
            </h3>
            <ProgressBar
              value={(metadata.mastered_count / metadata.total_count) * 100}
              className="mb-2"
            />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {metadata.mastered_count} / {metadata.total_count} {t('common.cards')} {t('common.mastered')}
            </p>
          </div>
        )}

        {/* Cards Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('admin.cards')}
            </h3>
          </div>
          <DataTable
            data={sortedCards}
            columns={columns}
            keyExtractor={(card) => card.card_id.toString()}
            emptyMessage={t('admin.noCards')}
            onSortChange={handleSortChange}
            pagination={{
              total: metadata.total_cards,
              limit: frontendPageSize,
              offset: frontendPageIndex * frontendPageSize,
              onPageChange: (newOffset) => loadMoreIfNeeded(Math.floor(newOffset / frontendPageSize)),
              pageSizeOptions: [5, 10, 20],
              onPageSizeChange: setFrontendPageSize,
            }}
          />
        </div>
      </main>
    </div>
  )
}

