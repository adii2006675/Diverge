// Event pictures live in /public/events (full size) and /public/events/thumb (small, for cards). Which picture belongs to which event is
// recorded in data/events.json. Sources and licences: public/events/CREDITS.md
import { ALL_EVENTS } from '@/lib/events'

const DEFAULT_POSITION = 'center 30%'
const byId = new Map(ALL_EVENTS.map(e => [e.id, e]))

/** The full-size picture, or null when the event has none. */
export function getEventImage(id: string): string | null {
  return byId.get(id)?.img ?? null
}

/** A small version for cards and thumbnails, falling back to the full picture. */
export function getEventThumb(id: string): string | null {
  const e = byId.get(id)
  return e?.thumb ?? e?.img ?? null
}

export function getEventImagePosition(id: string): string {
  return byId.get(id)?.pos ?? DEFAULT_POSITION
}
