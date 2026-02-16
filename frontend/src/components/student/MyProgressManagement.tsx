import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TrendingUp, Target, Award, Zap, AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useUserProgress } from '../../hooks/query/analytics.query'
import StatsWidget from '../ui/StatsWidget'
import DataTable, { Column } from '../ui/DataTable'
import ProgressBar from '../ui/ProgressBar'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import Loader from '../Loader'

import type { UserDeckProgress } from '../../types'

export default function MyProgressManagement() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const { data: userProgress, isLoading } = useUserProgress(user?.id || 0)

  const sortedDecks = useMemo(() => {
    if (!userProgress?.decks_progress) return []
    return [...userProgress.decks_progress].sort((a, b) =>
      b.progress_percentage - a.progress_percentage
    )
  }, [userProgress?.decks_progress])

  // Auto-correct page when data shrinks
  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(sortedDecks.length / itemsPerPage))
    if (currentPage > maxPage) setCurrentPage(maxPage)
  }, [sortedDecks.length, itemsPerPage, currentPage])

  const paginatedDecks = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return sortedDecks.slice(startIndex, startIndex + itemsPerPage)
  }, [sortedDecks, currentPage, itemsPerPage])

  const handleViewDeck = (deckId: number) => {
    navigate(`/student/decks/${deckId}`)
  }

  const columns: Column<UserDeckProgress>[] = [
    {
      key: 'deck_name',
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
        <div className="space-y-1">
          <ProgressBar 
            value={deck.progress_percentage} 
            className="w-40"
          />
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {deck.mastered_cards} / {deck.total_cards} {t('common.mastered')}
          </div>
        </div>
      ),
    },
    {
      key: 'success_rate',
      header: t('admin.successRate'),
      render: (deck) => {
        const color = deck.success_rate >= 80 
          ? 'text-green-600 dark:text-green-400'
          : deck.success_rate >= 50
          ? 'text-yellow-600 dark:text-yellow-400'
          : 'text-red-600 dark:text-red-400'
        
        return (
          <span className={`font-medium ${color}`}>
            {deck.success_rate.toFixed(1)}%
          </span>
        )
      },
    },
    {
      key: 'last_activity',
      header: t('admin.lastActivity'),
      render: (deck) => {
        if (!deck.last_activity) {
          return <span className="text-gray-400">-</span>
        }
        const date = new Date(deck.last_activity)
        return (
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {date.toLocaleDateString()}
          </span>
        )
      },
    },
    {
      key: 'actions',
      header: t('common.actions'),
      render: (deck) => (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => handleViewDeck(deck.deck_id)}
        >
          {t('common.details')}
        </Button>
      ),
    },
  ]

  if (isLoading) {
    return <Loader />
  }

  if (!userProgress) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          {t('errors.loadUserStats', { userId: user?.id })}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsWidget
          title={t('student.cardsAttempted')}
          value={userProgress.total_cards_attempted.toString()}
          icon={Target}
          variant="default"
        />
        <StatsWidget
          title={t('student.cardsMastered')}
          value={userProgress.cards_mastered.toString()}
          icon={Award}
          variant="success"
        />
        <StatsWidget
          title={t('admin.avgSuccessRate')}
          value={`${userProgress.avg_success_rate.toFixed(1)}%`}
          icon={TrendingUp}
          variant="warning"
        />
        <StatsWidget
          title={t('student.currentStreak')}
          value={userProgress.consecutive_success_count.toString()}
          icon={Zap}
          variant="info"
        />
      </div>

      {/* Struggling Decks Alert */}
      {userProgress.struggling_decks.length > 0 && (
        <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mt-0.5 mr-3" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                {t('student.needsAttention')}
              </h3>
              <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                {t('student.strugglingDecksMessage', { count: userProgress.struggling_decks.length })}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {userProgress.struggling_decks.map((deck) => (
                  <Badge 
                    key={deck.deck_id} 
                    variant="warning"
                    className="cursor-pointer"
                    onClick={() => handleViewDeck(deck.deck_id)}
                  >
                    {deck.deck_name} ({deck.success_rate.toFixed(0)}%)
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Progress by Deck */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t('student.progressByDeck')}
        </h3>
        {sortedDecks.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400">
              {t('student.noProgressYet')}
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <DataTable
              data={paginatedDecks}
              columns={columns}
              keyExtractor={(deck) => deck.deck_id.toString()}
              emptyMessage={t('student.noProgressYet')}
              pagination={{
                total: sortedDecks.length,
                limit: itemsPerPage,
                offset: (currentPage - 1) * itemsPerPage,
                onPageChange: (newOffset) => setCurrentPage(Math.floor(newOffset / itemsPerPage) + 1),
                pageSizeOptions: [5, 10, 20],
                onPageSizeChange: (size) => { setItemsPerPage(size); setCurrentPage(1) },
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

