// Share links: a frozen snapshot of a timeline stored in public.shared_sessions (see supabase/shared_sessions.sql).
import { supabase } from '@/lib/supabase'
import type { WhatIfEntry, WhatIfResponse } from '@/types'

export type SharedTimeline = {
  eventId: string | null
  title: string
  divergence: number
  createdAt: string
  whatIfs: { question: string; response: WhatIfResponse }[]
}

export function shareUrl(id: string) {
  return `${window.location.origin}/share/${id}`
}

export async function createShare(input: { userId: string; eventId: string; title: string; whatIfs: WhatIfEntry[]; divergence: number }): Promise<string> {
  const { data, error } = await supabase
    .from('shared_sessions')
    .insert({
      user_id: input.userId,
      event_id: input.eventId,
      event_title: input.title,
      what_ifs: input.whatIfs.map(w => ({ question: w.question, response: w.response, timestamp: w.timestamp })),
      divergence_score: input.divergence,
    })
    .select('id')
    .single()
  if (error || !data) {
    if (error?.code === '42P01' || error?.code === 'PGRST205') console.warn('Sharing is not set up yet: run supabase/shared_sessions.sql in the Supabase SQL editor.')
    throw error || new Error('No share id returned')
  }
  return data.id as string
}

export async function revokeShare(id: string) {
  const { error } = await supabase.from('shared_sessions').delete().eq('id', id)
  if (error) throw error
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** Returns null when the link does not exist (or was removed). Throws on a network or server error. */
export async function fetchShared(id: string): Promise<SharedTimeline | null> {
  if (!UUID.test(id)) return null
  const { data, error } = await supabase.rpc('get_shared_session', { p_id: id })
  if (error) throw error
  const row = Array.isArray(data) ? data[0] : data
  if (!row) return null
  const list: unknown[] = Array.isArray(row.what_ifs) ? row.what_ifs : []
  const whatIfs = list.flatMap(w => {
    const o = w as { question?: unknown; response?: Partial<WhatIfResponse> }
    if (!o || typeof o.question !== 'string' || !o.response || typeof o.response.paragraph !== 'string') return []
    return [{ question: o.question, response: o.response as WhatIfResponse }]
  })
  if (whatIfs.length === 0) return null
  return {
    eventId: row.event_id ?? null,
    title: row.event_title || 'Alternate timeline',
    divergence: Number(row.divergence_score) || 0,
    createdAt: row.created_at,
    whatIfs,
  }
}
