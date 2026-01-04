import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BookOpen, Plus, Edit, Trash2, Eye, BarChart3 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useDecks, useDeleteDeck } from '../../hooks/query/decks.query'
import { usePaginatedSearch } from '../../hooks/usePaginatedSearch'
import type { Deck } from '../../types'
import DataTable, { Column } from '../ui/DataTable'
import Pagination from '../ui/Pagination'
import SearchBar from '../ui/SearchBar'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import EditDeckModal from './EditDeckModal'
import CreateDeckModal from './CreateDeckModal'

export default function DecksManagement() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [editingDeck, setEditingDeck] = useState<Deck | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const { decks = [], isLoading } = useDecks()
  const deleteDeckMutation = useDeleteDeck()

  // Use paginated search hook
  const {
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    paginatedItems: paginatedDecks,
    totalPages,
    totalItems,
  } = usePaginatedSearch({
    items: decks,
    searchFields: (deck) => [deck.name, deck.description],
    initialItemsPerPage: 20,
    sortFn: (a, b) => a.name.localeCompare(b.name),
  })

  const handleDelete = async (deckId: number) => {
    if (confirm(t('admin.confirmDeleteDeck'))) {
      deleteDeckMutation.mutate(deckId)
    }
  }

  const handleViewCards = (deckId: number) => {
    navigate(`/admin/decks/${deckId}/cards`)
  }

  const handleViewAnalytics = (deckId: number) => {
    navigate(`/admin/decks/${deckId}?tab=analytics`)
  }

  const columns: Column<Deck>[] = [
    {
      key: 'name',
      header: t('admin.deckName'),
      render: (deck) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">
            {deck.name}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
            {deck.description}
          </div>
        </div>
      ),
    },
    {
      key: 'visibility',
      header: t('admin.visibility'),
      render: (deck) => (
        <Badge variant={deck.is_public ? 'success' : 'default'}>
          {deck.is_public ? t('admin.public') : t('admin.private')}
        </Badge>
      ),
    },
    {
      key: 'created',
      header: t('admin.createdAt'),
      render: (deck) => (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {new Date(deck.created_at).toLocaleDateString()}
        </div>
      ),
    },
    {
      key: 'actions',
      header: t('common.actions'),
      render: (deck) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleViewCards(deck.id)}
            title={t('admin.viewCards')}
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleViewAnalytics(deck.id)}
            title={t('admin.viewAnalytics')}
          >
            <BarChart3 className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setEditingDeck(deck)}
            title={t('common.edit')}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleDelete(deck.id)}
            title={t('common.delete')}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <BookOpen className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('admin.decksManagement')}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('admin.totalDecks', { count: totalItems })}
            </p>
          </div>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          {t('admin.createDeck')}
        </Button>
      </div>

      {/* Search */}
      <SearchBar
        placeholder={t('admin.searchDecks')}
        onSearch={setSearchQuery}
      />

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
        <DataTable
          columns={columns}
          data={paginatedDecks}
          keyExtractor={(deck) => deck.id}
          isLoading={isLoading}
          emptyMessage={t('admin.noDecksFound')}
        />
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      </div>

      {/* Edit Deck Modal */}
      {editingDeck && (
        <EditDeckModal
          deck={editingDeck}
          isOpen={!!editingDeck}
          onClose={() => setEditingDeck(null)}
        />
      )}

      {/* Create Deck Modal */}
      <CreateDeckModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  )
}

