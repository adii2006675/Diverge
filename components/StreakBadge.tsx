'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useT } from '@/lib/useT'
import { computeStreak } from '@/lib/streak'

// A flame and the number of days in a row you have asked a question. Counted from the times saved with your timelines.
export default function StreakBadge({ userId }: { userId: string }) {
  const { t } = useT()
  const [state, setState] = useState<{ streak: number; askedToday: boolean } | null>(null)

  useEffect(() => {
    let live = true
    supabase.from('sessions').select('what_ifs, created_at, updated_at').eq('user_id', userId).limit(500).then(({ data }) => {
      if (!live) return
      const times: number[] = []
      for (const row of (data || []) as { what_ifs: unknown; created_at?: string; updated_at?: string }[]) {
        const list = Array.isArray(row.what_ifs) ? row.what_ifs : []
        let any = false
        for (const w of list as { timestamp?: unknown }[]) {
          const ts = Number(w?.timestamp)
          if (Number.isFinite(ts) && ts > 0) { times.push(ts); any = true }
        }
        if (!any) { const f = Date.parse(row.updated_at || row.created_at || ''); if (Number.isFinite(f)) times.push(f) }
      }
      setState(computeStreak(times))
    })
    return () => { live = false }
  }, [userId])

  if (!state) return null
  const alive = state.streak > 0
  const lit = state.askedToday
  return (
    <div
      title={alive ? (lit ? t('You asked a question today. Keep it going tomorrow.') : t('Ask a question today to keep your streak.')) : t('Ask a question today to start a streak.')}
      style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, padding: '6px 4px 6px 12px', color: lit ? '#F59E0B' : 'var(--text-dim)', transition: 'color .2s' }}
    >
      <svg viewBox="0 0 24 24" width="28" height="28" fill={lit ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
      </svg>
      <div style={{ lineHeight: 1.15, textAlign: 'left' }}>
        <div style={{ fontSize: 22, fontWeight: 900, color: lit ? 'var(--text)' : 'var(--text-dim)', fontVariantNumeric: 'tabular-nums' }}>{state.streak}</div>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', color: 'var(--text-dim)' }}>{t('day streak')}</div>
      </div>
    </div>
  )
}
