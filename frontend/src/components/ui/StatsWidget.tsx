import { LucideIcon } from 'lucide-react'
import { ReactNode } from 'react'

interface StatsWidgetProps {
  title: string
  value: string | number
  icon?: LucideIcon
  trend?: {
    value: number
    label: string
  }
  footer?: ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
}

const variantClasses = {
  default: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
  success: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
  warning: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400',
  danger: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
  info: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
}

export default function StatsWidget({
  title,
  value,
  icon: Icon,
  trend,
  footer,
  variant = 'default',
}: StatsWidgetProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
          {trend && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              <span
                className={`font-medium ${
                  trend.value > 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {trend.value > 0 ? '+' : ''}
                {trend.value}%
              </span>{' '}
              {trend.label}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-full ${variantClasses[variant]}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
      {footer && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          {footer}
        </div>
      )}
    </div>
  )
}



