import {useMemo, useState} from 'react'
import {useNavigate, useParams} from 'react-router-dom'
import {useTranslation} from 'react-i18next'
import {ArrowLeft, Plus, Upload} from 'lucide-react'
import LogoutButton from '../../components/LogoutButton'
import Loader from '../../components/Loader'
import FlashCard from '../../components/FlashCard'
import SearchAutocomplete from '../../components/SearchAutocomplete'
import Breadcrumb from '../../components/ui/Breadcrumb'
import {Card, CardContent} from '../../components/ui/Card'
import {Button} from '../../components/ui/Button'
import {Badge} from '../../components/ui/Badge'
import CreateCardModal from '../../components/admin/CreateCardModal'
import EditCardModal from '../../components/admin/EditCardModal'
import ImportCSVModal from '../../components/admin/ImportCSVModal'
import {useCardsByDeck, useDeck, useDeleteCard} from '../../hooks/query'
import {useAuth} from '../../contexts/AuthContext'
import type {Card as CardType} from '../../types'

export default function DeckCardsPage() {
  const { t } = useTranslation()
  const { deckId } = useParams<{ deckId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [editingCard, setEditingCard] = useState<CardType | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const { deck, isLoading: deckLoading } = useDeck(deckId ? parseInt(deckId) : null)
  const { cards, isLoading: cardsLoading } = useCardsByDeck(deckId ? parseInt(deckId) : null)
  const { mutate: deleteCard } = useDeleteCard()

  // Sort cards by ID to maintain consistent order
  const sortedCards = useMemo(() => {
    return [...cards].sort((a, b) => a.id - b.id)
  }, [cards])

  // Filter cards based on search query
  const filteredCards = useMemo(() => {
    if (!searchQuery.trim()) return sortedCards

    const query = searchQuery.toLowerCase()
    return sortedCards.filter((card) =>
      card.question.toLowerCase().includes(query) ||
      card.answer.toLowerCase().includes(query) ||
      card.keywords.some((keyword) => keyword.toLowerCase().includes(query))
    )
  }, [sortedCards, searchQuery])

  // Generate suggestions from card questions
  const suggestions = useMemo(() => {
    return sortedCards.map((card) => card.question)
  }, [sortedCards])

  const handleDeleteCard = (cardId: number) => {
    if (confirm(t('admin.confirmDeleteCard'))) {
      deleteCard({ id: cardId, deckId: parseInt(deckId!) })
    }
  }

  if (deckLoading || cardsLoading) {
    return <Loader text={t('admin.loadingDeck')} />
  }

  if (!deck) {
    return <Loader text={t('admin.deckNotFound')} size="md" />
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Navbar */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title={t('admin.backToDashboard')}
              >
                <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">{deck.name}</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('admin.manageCards')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="success">{t('admin.admin')}</Badge>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {user?.first_name} {user?.last_name}
              </span>
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Breadcrumb
          items={[
            { label: t('admin.decks'), href: '/admin?tab=decks' },
            { label: deck.name },
          ]}
        />

        {/* Actions */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{deck.description}</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              {sortedCards.length} {sortedCards.length !== 1 ? t('admin.cards') : t('admin.card')}
              {searchQuery && ` (${filteredCards.length} ${t('admin.matching')})`}
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setShowImportModal(true)}>
              <Upload className="h-4 w-4 mr-1" />
              {t('admin.importCSV')}
            </Button>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-1" />
              {t('admin.newCard')}
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <SearchAutocomplete
            value={searchQuery}
            onChange={setSearchQuery}
            suggestions={suggestions}
            placeholder={t('admin.searchPlaceholder')}
          />
        </div>

        {/* Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCards.map((card) => (
            <FlashCard
              key={card.id}
              card={card}
              onEdit={setEditingCard}
              onDelete={handleDeleteCard}
            />
          ))}
        </div>

        {filteredCards.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                {searchQuery
                  ? t('admin.noCardsMatch')
                  : t('admin.noCardsYet')}
              </p>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Create Card Modal */}
      <CreateCardModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        deckId={parseInt(deckId!)}
      />

      {/* Edit Card Modal */}
      {editingCard && (
        <EditCardModal
          card={editingCard}
          isOpen={!!editingCard}
          onClose={() => setEditingCard(null)}
        />
      )}

      {/* Import CSV Modal */}
      <ImportCSVModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        deckId={parseInt(deckId!)}
      />
    </div>
  )
}

