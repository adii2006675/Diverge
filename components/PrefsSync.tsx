'use client'
import { useEffect, useRef } from 'react'
import { useAuth } from '@/context/AuthContext'
import { applyRemotePrefs, readLocalPrefs, schedulePrefsPush } from '@/lib/prefsSync'

// On sign in, brings the account's saved preferences into this browser (or saves this browser's preferences if the account has none yet).
export default function PrefsSync() {
  const { user } = useAuth()
  const doneFor = useRef('')
  useEffect(() => {
    if (!user || doneFor.current === user.id) return
    doneFor.current = user.id
    const remote = (user.user_metadata as { diverge_prefs?: unknown } | undefined)?.diverge_prefs
    if (remote && typeof remote === 'object') applyRemotePrefs(remote as Record<string, unknown>)
    else if (Object.keys(readLocalPrefs()).length > 0) schedulePrefsPush()
  }, [user])
  return null
}
