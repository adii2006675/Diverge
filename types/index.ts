export type WorldMood = 'STABLE' | 'TENSE' | 'CRITICAL' | 'AT WAR' | 'CATASTROPHIC' | 'REBUILDING' | 'FLOURISHING'

export type WhatIfResponse = {
  paragraph: string
  narration: string
  keyFacts: string[]
  factExplanations: string[]
  reliabilityNotes: string
  worldMood: WorldMood
  divergenceScore: number
  mapChanges: string
  year: string
  uncertaintyLevel: 'LOW' | 'MEDIUM' | 'HIGH'
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