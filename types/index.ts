export type WorldMood = 'STABLE' | 'TENSE' | 'CRITICAL' | 'AT WAR' | 'CATASTROPHIC' | 'REBUILDING' | 'FLOURISHING'

export type WhatIfResponse = {
  paragraph: string
  keyFacts: string[]
  factExplanations: string[]
  worldMood: WorldMood
  divergenceScore: number
  mapChanges: string
  year: string
  confidenceScore: number
  comparison: { category: string; real: string; diverged: string }[]
}

export type WhatIfEntry = {
  question: string
  response: WhatIfResponse
  timestamp: number
}

export type Session = {
  id: string
  eventId: string
  eventTitle: string
  whatIfs: WhatIfEntry[]
  currentDivergence: number
  currentMood: WorldMood
  currentYear: string
  createdAt: number
}