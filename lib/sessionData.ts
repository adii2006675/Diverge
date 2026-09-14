import { WhatIfEntry } from '@/types'

export type RealTimelineData = { title: string; year: string; fullDesc: string; realFacts: string[]; imageUrl?: string }

export type PersistedPayload = {
  entries: WhatIfEntry[]
  activeTimelineIdx: number
  realTimeline: RealTimelineData | null
  summary: any | null
}

// `what_ifs` used to be stored as a plain array of {question}. Newer sessions store a
// richer object with full responses. Normalize both shapes so old saved sessions keep working.
export function normalizeWhatIfs(raw: any): PersistedPayload {
  if (Array.isArray(raw)) {
    return { entries: raw, activeTimelineIdx: Math.max(0, raw.length - 1), realTimeline: null, summary: null }
  }
  const entries = raw?.entries || []
  return {
    entries,
    activeTimelineIdx: raw?.activeTimelineIdx ?? Math.max(0, entries.length - 1),
    realTimeline: raw?.realTimeline || null,
    summary: raw?.summary || null,
  }
}
