import { ReactNode } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Button } from './Button'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description?: string
  children?: ReactNode
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
  size?: 'sm' | 'md' | 'lg'
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  children,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'warning',
  size = 'sm',
}: ConfirmDialogProps) {
  if (!isOpen) return null

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  }

  const iconColors = {
    danger: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500',
  }

  const iconBgColors = {
    danger: 'bg-red-100 dark:bg-red-900/20',
    warning: 'bg-yellow-100 dark:bg-yellow-900/20',
    info: 'bg-blue-100 dark:bg-blue-900/20',
  }

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        {/* Dialog */}
        <div
          className={cn(
            'relative w-full bg-white dark:bg-gray-800 rounded-xl shadow-2xl transform transition-all',
            sizes[size]
          )}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Content */}
          <div className="p-6">
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div
                className={cn(
                  'rounded-full p-3',
                  iconBgColors[variant]
                )}
              >
                <AlertTriangle
                  className={cn('h-6 w-6', iconColors[variant])}
                />
              </div>
            </div>

            {/* Title */}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-center mb-2">
              {title}
            </h3>

            {/* Description */}
            {description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4">
                {description}
              </p>
            )}

            {/* Custom children */}
            {children && (
              <div className="mb-4">
                {children}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={onClose}
              >
                {cancelText}
              </Button>
              <Button
                variant={variant === 'danger' ? 'danger' : 'primary'}
                className="flex-1"
                onClick={handleConfirm}
              >
                {confirmText}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

