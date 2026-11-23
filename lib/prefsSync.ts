'use client'
import { supabase } from '@/lib/supabase'

// A few preferences are kept in the browser (feature switches, vibration, pinned sessions). When signed in, they are also saved
// on the account (in the user's own profile data, no extra database table) so they follow you to other devices.
export const PREF_KEYS = ['diverge.askNext', 'diverge.whatChanged', 'diverge.realHistory', 'diverge.haptics', 'diverge.pinned'] as const

export function readLocalPrefs(): Record<string, string> {
  const out: Record<string, string> = {}
  try {
    for (const k of PREF_KEYS) { const v = window.localStorage.getItem(k); if (v !== null) out[k] = v }
  } catch { /* storage unavailable */ }
  return out
}

/** Writes preferences from the account into this browser and tells the open screens to refresh. */
export function applyRemotePrefs(remote: Record<string, unknown>) {
  try {
    for (const k of PREF_KEYS) {
      const v = remote[k]
      if (typeof v === 'string') window.localStorage.setItem(k, v)
    }
  } catch { /* storage unavailable */ }
  window.dispatchEvent(new Event('diverge-feature'))
  window.dispatchEvent(new Event('diverge-haptics'))
  window.dispatchEvent(new Event('diverge-pins'))
}

let timer: ReturnType<typeof setTimeout> | null = null

/** Saves the current preferences to the account a moment after the last change. Does nothing when signed out. */
export function schedulePrefsPush() {
  if (typeof window === 'undefined') return
  if (timer) clearTimeout(timer)
  timer = setTimeout(async () => {
    try {
      const { data } = await supabase.auth.getSession()
      if (!data.session) return
      await supabase.auth.updateUser({ data: { diverge_prefs: readLocalPrefs() } })
    } catch { /* best effort: the browser copy still works */ }
  }, 1500)
}
