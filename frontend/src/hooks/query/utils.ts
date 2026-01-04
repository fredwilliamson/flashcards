import i18n from '../../i18n'

/**
 * Get translated toast message
 */
export const t = (key: string, params?: Record<string, unknown>) => {
  return i18n.t(key, params)
}


