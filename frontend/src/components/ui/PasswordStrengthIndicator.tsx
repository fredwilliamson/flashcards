import { useMemo } from 'react'
import { Check, X } from 'lucide-react'
import { passwordStrength } from 'check-password-strength'
import { cn } from '../../lib/utils'

interface PasswordStrengthIndicatorProps {
  password: string
  showCriteria?: boolean
}

interface PasswordCriteria {
  label: string
  met: boolean
}

export function PasswordStrengthIndicator({
  password,
  showCriteria = true,
}: PasswordStrengthIndicatorProps) {
  const strength = useMemo(() => {
    if (!password) return { score: 0, level: '', color: '', bgColor: '', width: '0%', criteria: [] }

    // Use check-password-strength library
    const result = passwordStrength(password)

    // Map library results to our UI
    const levelMap = {
      'Too weak': { level: 'Très faible', color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-500', width: '15%' },
      'Weak': { level: 'Faible', color: 'text-orange-600 dark:text-orange-400', bgColor: 'bg-orange-500', width: '40%' },
      'Medium': { level: 'Moyen', color: 'text-yellow-600 dark:text-yellow-400', bgColor: 'bg-yellow-500', width: '70%' },
      'Strong': { level: 'Fort', color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-500', width: '100%' },
    }

    const strengthInfo = levelMap[result.value as keyof typeof levelMap]

    // Build criteria list
    const criteria: PasswordCriteria[] = [
      { label: 'Au moins 8 caractères', met: result.length >= 8 },
      { label: 'Une lettre majuscule', met: result.contains.includes('uppercase') },
      { label: 'Une lettre minuscule', met: result.contains.includes('lowercase') },
      { label: 'Un chiffre', met: result.contains.includes('number') },
      { label: 'Un caractère spécial', met: result.contains.includes('symbol') },
    ]

    return {
      score: result.id,
      level: strengthInfo.level,
      color: strengthInfo.color,
      bgColor: strengthInfo.bgColor,
      width: strengthInfo.width,
      criteria,
    }
  }, [password])

  if (!password) return null

  return (
    <div className="space-y-2">
      {/* Strength bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={cn('h-full transition-all duration-300', strength.bgColor)}
            style={{ width: strength.width }}
          />
        </div>
        <span className={cn('text-sm font-medium min-w-[80px]', strength.color)}>
          {strength.level}
        </span>
      </div>

      {/* Criteria list */}
      {showCriteria && strength.criteria && (
        <div className="space-y-1">
          {strength.criteria.map((criterion, index) => (
            <div
              key={index}
              className="flex items-center gap-2 text-xs"
            >
              {criterion.met ? (
                <Check className="h-3 w-3 text-green-500" />
              ) : (
                <X className="h-3 w-3 text-gray-400" />
              )}
              <span
                className={cn(
                  'transition-colors',
                  criterion.met
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-gray-500 dark:text-gray-400'
                )}
              >
                {criterion.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

