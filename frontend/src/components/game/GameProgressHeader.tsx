import { Badge } from '../ui/Badge'
import ProgressBar from '../ui/ProgressBar'

interface GameProgressHeaderProps {
  successCount: number
  remainingCount: number
  totalCards: number
}

export default function GameProgressHeader({
  successCount,
  remainingCount,
  totalCards,
}: GameProgressHeaderProps) {
  const completedCards = totalCards - remainingCount
  const progressPercentage = totalCards > 0 ? (completedCards / totalCards) * 100 : 0

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex gap-4">
          <Badge variant="success">✓ {successCount}</Badge>
          <Badge variant="default">⏳ {remainingCount}</Badge>
        </div>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {completedCards} / {totalCards}
        </span>
      </div>
      <ProgressBar value={progressPercentage} />
    </div>
  )
}


