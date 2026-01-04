import {useMemo} from 'react'
import {useTranslation} from 'react-i18next'
import {BookOpen, Eye, Play} from 'lucide-react'
import {useNavigate} from 'react-router-dom'
import {useDecks} from '@/hooks/query'
import {useStartSession} from '@/hooks/query'
import {useAuth} from '../../contexts/AuthContext'
import {useUserProgress} from '@/hooks/query'
import {usePaginatedSearch} from '../../hooks/usePaginatedSearch'
import type {Deck} from '@/types'
import DataTable, {Column} from '../ui/DataTable'
import Pagination from '../ui/Pagination'
import SearchBar from '../ui/SearchBar'
import {Badge} from '../ui/Badge'
import {Button} from '../ui/Button'
import ProgressBar from '../ui/ProgressBar'
import Loader from '../Loader'

export default function MyDecksManagement() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuth()

  const { decks = [], isLoading: loadingDecks } = useDecks()
  const { data: userProgress, isLoading: loadingProgress } = useUserProgress(user?.id || 0)
  const startGameMutation = useStartSession()

  // Filter only public decks
  const publicDecks = useMemo(() => {
    return decks.filter(deck => deck.is_public)
  }, [decks])

  // Use paginated search hook
  const {
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    paginatedItems: paginatedDecks,
    totalPages,
    totalItems,
  } = usePaginatedSearch({
    items: publicDecks,
    searchFields: (deck) => [deck.name, deck.description],
    initialItemsPerPage: 10,
    sortFn: (a, b) => a.name.localeCompare(b.name),
  })

  // Get progress for a specific deck
  const getDeckProgress = (deckId: number) => {
    return userProgress?.decks_progress.find(d => d.deck_id === deckId)
  }

  const handleStartGame = async (deckId: number) => {
    startGameMutation.mutate(
      { deck_id: deckId },
      {
        onSuccess: (session) => {
          navigate(`/student/game/${session.id}`)
        },
      }
    )
  }

  const handleViewDetails = (deckId: number) => {
    navigate(`/student/decks/${deckId}`)
  }

  const columns: Column<Deck>[] = [
    {
      key: 'name',
      header: t('admin.deckName'),
      render: (deck) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-gray-400" />
            {deck.name}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1 mt-1">
            {deck.description}
          </div>
        </div>
      ),
    },
    {
      key: 'progress',
      header: t('admin.progress'),
      render: (deck) => {
        const progress = getDeckProgress(deck.id)
        if (!progress) {
          return (
            <Badge variant="secondary" className="text-xs">
              {t('common.new')}
            </Badge>
          )
        }
        return (
          <div className="space-y-1">
            <ProgressBar 
              value={progress.progress_percentage} 
              className="w-32"
            />
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {progress.mastered_cards} / {progress.total_cards} {t('common.cards')}
            </div>
          </div>
        )
      },
    },
    {
      key: 'success_rate',
      header: t('admin.successRate'),
      render: (deck) => {
        const progress = getDeckProgress(deck.id)
        if (!progress) return <span className="text-gray-400">-</span>
        
        const color = progress.success_rate >= 80 
          ? 'text-green-600 dark:text-green-400'
          : progress.success_rate >= 50
          ? 'text-yellow-600 dark:text-yellow-400'
          : 'text-red-600 dark:text-red-400'
        
        return (
          <span className={`font-medium ${color}`}>
            {progress.success_rate.toFixed(1)}%
          </span>
        )
      },
    },
    {
      key: 'actions',
      header: t('common.actions'),
      render: (deck) => (
        <div className="flex gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleStartGame(deck.id)}
            disabled={startGameMutation.isPending}
          >
            <Play className="h-4 w-4 mr-1" />
            {t('common.practice')}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleViewDetails(deck.id)}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  if (loadingDecks || loadingProgress) {
    return <Loader />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('student.availableDecks')}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {t('student.selectDeckToPractice')}
          </p>
        </div>
      </div>

      {/* Search */}
      <SearchBar
        onSearch={setSearchQuery}
        placeholder={t('admin.searchDecks')}
        initialValue={searchQuery}
      />

      {/* Table */}
      <DataTable
        data={paginatedDecks}
        columns={columns}
        keyExtractor={(deck) => deck.id.toString()}
        emptyMessage={t('admin.noDecksFound')}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  )
}

