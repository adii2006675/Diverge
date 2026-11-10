'use client'
import { useCallback, useMemo, useSyncExternalStore } from 'react'

const KEY = 'diverge_saved_events'
const CHANGED = 'diverge:saved-events'

function read(): string {
  try { return localStorage.getItem(KEY) || '[]' } catch { return '[]' }
}
function parse(raw: string): string[] {
  try { const a = JSON.parse(raw); return Array.isArray(a) ? a.filter((x): x is string => typeof x === 'string') : [] } catch { return [] }
}
function subscribe(cb: () => void) {
  window.addEventListener('storage', cb)
  window.addEventListener(CHANGED, cb)
  return () => { window.removeEventListener('storage', cb); window.removeEventListener(CHANGED, cb) }
}

/** Events the visitor has hearted. Kept in this browser only. */
export function useBookmarks() {
  const raw = useSyncExternalStore(subscribe, read, () => '[]')
  const ids = useMemo(() => parse(raw), [raw])
  const set = useMemo(() => new Set(ids), [ids])
  const toggle = useCallback((id: string) => {
    const current = parse(read())
    const next = current.includes(id) ? current.filter(x => x !== id) : [...current, id]
    try { localStorage.setItem(KEY, JSON.stringify(next)) } catch { /* private mode */ }
    window.dispatchEvent(new Event(CHANGED))
  }, [])
  return { ids, has: (id: string) => set.has(id), toggle }
}
