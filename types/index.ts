export type WorldMood = 'STABLE' | 'TENSE' | 'CRITICAL' | 'AT WAR' | 'CATASTROPHIC' | 'REBUILDING' | 'FLOURISHING'

export type WhatIfResponse = {
  paragraph: string
  narration: string
  keyFacts: string[]
  factExplanations: string[]
  reliabilityNotes: string
  worldMood: WorldMood
  divergenceScore: number
  year: string
  uncertaintyLevel: 'LOW' | 'MEDIUM' | 'HIGH'
  /** 2-3 follow-up "What if..." questions. Not returned by the API yet. */
  suggestions?: string[]
  /** A short title for the what-if, used to name saved custom sessions. */
  title?: string
  /** Per key fact: documented history, a reasoned inference, or speculation. */
  factTypes?: ('documented' | 'inference' | 'speculation')[]
  /** Reference articles the answer was grounded in. */
  sources?: { title: string; url: string }[]
  /** Indexes of documented facts a second check could not confirm. */
  unverified?: number[]
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