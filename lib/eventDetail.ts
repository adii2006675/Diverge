'use client'
import { useEffect, useState } from 'react'

// The long text of an event (full description and real facts) is a small file per event, loaded only when the event is opened.
export type EventDetail = { fullDesc: string; realFacts: string[] }

const cache = new Map<string, EventDetail>()
const pending = new Map<string, Promise<EventDetail | null>>()

export function getEventDetail(id: string): Promise<EventDetail | null> {
  const hit = cache.get(id)
  if (hit) return Promise.resolve(hit)
  let p = pending.get(id)
  if (!p) {
    p = fetch(`/event-data/${encodeURIComponent(id)}.json`)
      .then(r => (r.ok ? r.json() : null))
      .then((d: EventDetail | null) => {
        if (d && typeof d.fullDesc === 'string') { const v = { fullDesc: d.fullDesc, realFacts: Array.isArray(d.realFacts) ? d.realFacts : [] }; cache.set(id, v); return v }
        return null
      })
      .catch(() => null)
      .finally(() => { pending.delete(id) })
    pending.set(id, p)
  }
  return p
}

/** The long text of one event, or null until it has loaded (and for custom starting points, which have none). */
export function useEventDetail(id: string | undefined): EventDetail | null {
  // Loaded text is remembered with the id it belongs to, so switching events never shows the previous event's text.
  const [loaded, setLoaded] = useState<{ id: string; d: EventDetail } | null>(null)
  useEffect(() => {
    if (!id || cache.has(id)) return
    let live = true
    getEventDetail(id).then(d => { if (live && d) setLoaded({ id, d }) })
    return () => { live = false }
  }, [id])
  // Text that is already cached is returned immediately, in the same render, so a pop-up can measure its real height.
  if (!id) return null
  return cache.get(id) ?? (loaded && loaded.id === id ? loaded.d : null)
}
