import {useEffect, useMemo, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {BookOpen, Eye, Play} from 'lucide-react'
import {useNavigate} from 'react-router-dom'
import {useStartSession} from '@/hooks/query'
import {useAuth} from '../../contexts/AuthContext'
import {useUserProgress} from '@/hooks/query'
import {usePaginatedDecks} from '../../hooks/usePaginatedDecks'
import type {Deck} from '@/types'
import DataTable, {Column} from '../ui/DataTable'

import SearchBar from '../ui/SearchBar'
import {Badge} from '../ui/Badge'
import {Button} from '../ui/Button'
import ProgressBar from '../ui/ProgressBar'
import Loader from '../Loader'

export default function MyDecksManagement() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const { allData: allDecks, isLoading: loadingDecks } = usePaginatedDecks(40, 10)
  const { data: userProgress, isLoading: loadingProgress } = useUserProgress(user?.id || 0)
  const startGameMutation = useStartSession()

  // Filter only public decks, search, and sort
  const filteredDecks = useMemo(() => {
    const publicDecks = allDecks.filter(deck => deck.is_public)
    const sorted = publicDecks.sort((a, b) => a.name.localeCompare(b.name))
    
    if (!searchQuery) return sorted
    
    const search = searchQuery.toLowerCase()
    return sorted.filter(deck => 
      deck.name.toLowerCase().includes(search) ||
      deck.description.toLowerCase().includes(search)
    )
  }, [allDecks, searchQuery])

  // Auto-correct page when filtered data shrinks
  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(filteredDecks.length / itemsPerPage))
    if (currentPage > maxPage) setCurrentPage(maxPage)
  }, [filteredDecks.length, itemsPerPage, currentPage])

  // Paginate
  const paginatedDecks = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredDecks.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredDecks, currentPage, itemsPerPage])

  const totalItems = filteredDecks.length

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
        pagination={{
          total: totalItems,
          limit: itemsPerPage,
          offset: (currentPage - 1) * itemsPerPage,
          onPageChange: (newOffset) => setCurrentPage(Math.floor(newOffset / itemsPerPage) + 1),
          pageSizeOptions: [5, 10, 20],
          onPageSizeChange: (size) => { setItemsPerPage(size); setCurrentPage(1) },
        }}
      />
    </div>
  )
}

