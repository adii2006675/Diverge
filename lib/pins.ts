'use client'
import { useCallback, useEffect, useState } from 'react'
import { schedulePrefsPush } from '@/lib/prefsSync'

// Pinned sessions stay at the top of the Sessions page. Kept in this browser only.
const KEY = 'diverge.pinned'
const EVENT = 'diverge-pins'

function read(): string[] {
  try { const v = JSON.parse(window.localStorage.getItem(KEY) || '[]'); return Array.isArray(v) ? v.filter(x => typeof x === 'string') : [] } catch { return [] }
}

export function usePins() {
  const [ids, setIds] = useState<string[]>([])
  useEffect(() => {
    setIds(read())
    const sync = () => setIds(read())
    window.addEventListener(EVENT, sync)
    window.addEventListener('storage', sync)
    return () => { window.removeEventListener(EVENT, sync); window.removeEventListener('storage', sync) }
  }, [])
  const toggle = useCallback((id: string) => {
    const cur = read()
    const next = cur.includes(id) ? cur.filter(x => x !== id) : [id, ...cur]
    try { window.localStorage.setItem(KEY, JSON.stringify(next)) } catch { /* private mode */ }
    setIds(next)
    window.dispatchEvent(new Event(EVENT))
    schedulePrefsPush()
  }, [])
  return { ids, has: (id: string) => ids.includes(id), toggle }
}
