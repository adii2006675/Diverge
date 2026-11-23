'use client'
import { useCallback, useEffect, useState } from 'react'
import { schedulePrefsPush } from '@/lib/prefsSync'

// A short buzz on phones that support it (Android browsers; iPhones ignore it). Off by default and switched on in Settings.
const KEY = 'diverge.haptics'
const EVENT = 'diverge-haptics'

export function hapticsOn(): boolean {
  try { return window.localStorage.getItem(KEY) === 'on' } catch { return false }
}

/** buzz() vibrates briefly when the Settings switch is on. Never on the server, and never when reduced motion is requested. */
export function buzz(ms = 10) {
  if (typeof window === 'undefined' || !('vibrate' in navigator) || !hapticsOn()) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  try { navigator.vibrate(ms) } catch { /* not allowed here */ }
}

export function useHaptics(): [boolean, (on: boolean) => void] {
  const [on, setOn] = useState(false)
  useEffect(() => {
    setOn(hapticsOn())
    const sync = () => setOn(hapticsOn())
    window.addEventListener(EVENT, sync)
    window.addEventListener('storage', sync)
    return () => { window.removeEventListener(EVENT, sync); window.removeEventListener('storage', sync) }
  }, [])
  const set = useCallback((v: boolean) => {
    try { window.localStorage.setItem(KEY, v ? 'on' : 'off') } catch { /* private mode */ }
    setOn(v)
    window.dispatchEvent(new Event(EVENT))
    schedulePrefsPush()
    if (v) buzz(20)
  }, [])
  return [on, set]
}
