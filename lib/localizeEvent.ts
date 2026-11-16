'use client'
import { useCallback } from 'react'
import translations from '@/lib/eventsI18n.json'
import { useAutoT } from '@/lib/autoTranslate'
import { normalizeLanguage } from '@/lib/i18n'

type EventText = { title: string; shortDesc: string; fullDesc: string; longDesc?: string }
const TABLE = translations as Record<string, Record<string, EventText>>

/** Returns the event's title and descriptions in the chosen language, or the English originals when no translation exists. */
export function eventText<T extends { id: string; title: string; shortDesc: string; fullDesc: string }>(language: unknown, ev: T): EventText {
  const lang = normalizeLanguage(language)
  const hit = lang === 'English' ? undefined : TABLE[lang]?.[ev.id]
  return { title: hit?.title || ev.title, shortDesc: hit?.shortDesc || ev.shortDesc, fullDesc: hit?.fullDesc || ev.fullDesc, longDesc: hit?.longDesc }
}

/**
 * Hook version: uses a stored translation when there is one, otherwise asks the server to translate the text once and keeps it in this
 * browser. Until the translation arrives the English text shows. Returns eventText-style objects, plus a way to translate a plain string.
 */
export function useEventText() {
  const { at, language, version } = useAutoT()
  const text = useCallback(<T extends { id: string; title: string; shortDesc: string; fullDesc: string }>(ev: T): EventText => {
    const base = eventText(language, ev)
    if (normalizeLanguage(language) === 'English') return base
    const stored = TABLE[normalizeLanguage(language)]?.[ev.id]
    return {
      title: stored?.title || at(ev.title),
      shortDesc: stored?.shortDesc || at(ev.shortDesc),
      fullDesc: stored?.fullDesc || at(ev.fullDesc),
      longDesc: base.longDesc,
    }
  }, [language, at])
  return { eventText: text, at, language, version }
}
