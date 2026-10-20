'use client'
import { useAuth } from '@/context/AuthContext'
import { translate, normalizeLanguage, LOCALES } from '@/lib/i18n'

/** t('English text') returns the text in the language chosen in Profile. */
export function useT() {
  const { settings } = useAuth()
  const language = normalizeLanguage(settings?.language)
  return { t: (text: string) => translate(language, text), language, locale: LOCALES[language] }
}
