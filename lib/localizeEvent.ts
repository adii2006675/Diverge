import translations from '@/lib/eventsI18n.json'
import { normalizeLanguage } from '@/lib/i18n'

type EventText = { title: string; shortDesc: string; fullDesc: string; longDesc?: string }
const TABLE = translations as Record<string, Record<string, EventText>>

/** Returns the event's title and descriptions in the chosen language, or the English originals when no translation exists. */
export function eventText<T extends { id: string; title: string; shortDesc: string; fullDesc: string }>(language: unknown, ev: T): EventText {
  const lang = normalizeLanguage(language)
  const hit = lang === 'English' ? undefined : TABLE[lang]?.[ev.id]
  return { title: hit?.title || ev.title, shortDesc: hit?.shortDesc || ev.shortDesc, fullDesc: hit?.fullDesc || ev.fullDesc, longDesc: hit?.longDesc }
}
