'use client'
import { useCallback, useEffect, useState } from 'react'

// On/off switches for parts of the session page ("features"). Kept in this browser only; every feature is on by default.
export type Feature = 'askNext' | 'whatChanged' | 'realHistory'
const EVENT = 'diverge-feature'
const key = (f: Feature) => `diverge.${f}`

function read(f: Feature): boolean {
  try { return window.localStorage.getItem(key(f)) !== 'off' } catch { return true }
}

export function useFeature(f: Feature): [boolean, (on: boolean) => void] {
  const [on, setOn] = useState(true)
  useEffect(() => {
    setOn(read(f))
    const sync = () => setOn(read(f))
    window.addEventListener(EVENT, sync)
    window.addEventListener('storage', sync)
    return () => { window.removeEventListener(EVENT, sync); window.removeEventListener('storage', sync) }
  }, [f])
  const set = useCallback((v: boolean) => {
    try { window.localStorage.setItem(key(f), v ? 'on' : 'off') } catch { /* private mode: keep the change for this page only */ }
    setOn(v)
    window.dispatchEvent(new Event(EVENT))
  }, [f])
  return [on, set]
}

export const useAskNext = () => useFeature('askNext')
