// AI response settings shared by the settings page, the diverge AI modal, AuthContext and api/diverge.

export type AILength = 'short' | 'medium' | 'long'
export type AIDepth = 'simple' | 'in-depth'
export type AITone = 'historian' | 'dramatic' | 'academic'
export type AIPlausibility = 'realistic' | 'speculative'

export const AI_LENGTHS: AILength[] = ['short', 'medium', 'long']
export const AI_DEPTHS: AIDepth[] = ['simple', 'in-depth']
export const AI_TONES: AITone[] = ['historian', 'dramatic', 'academic']
export const AI_PLAUSIBILITIES: AIPlausibility[] = ['realistic', 'speculative']

export const DEFAULT_LENGTH: AILength = 'medium'
export const DEFAULT_DEPTH: AIDepth = 'simple'
export const DEFAULT_TONE: AITone = 'historian'
export const DEFAULT_PLAUSIBILITY: AIPlausibility = 'realistic'

export const AI_OPTION_GROUPS = {
  length: {
    title: 'Response length',
    options: [
      { value: 'short', label: 'Short', desc: 'A couple of sentences and three key facts' },
      { value: 'medium', label: 'Medium', desc: 'A solid paragraph and four key facts' },
      { value: 'long', label: 'Long', desc: 'Full paragraphs and five facts with detailed reasoning' },
    ],
  },
  depth: {
    title: 'Depth',
    options: [
      { value: 'simple', label: 'Simple', desc: 'Plain language, one clear cause and effect at a time' },
      { value: 'in-depth', label: 'In-depth', desc: 'Named institutions and people, chains of cause and effect, competing views' },
    ],
  },
  plausibility: {
    title: 'Plausibility',
    options: [
      { value: 'realistic', label: 'Realistic', desc: 'Stay with the most likely outcomes' },
      { value: 'speculative', label: 'Speculative', desc: 'Explore bolder but still grounded possibilities' },
    ],
  },
  tone: {
    title: 'Tone',
    options: [
      { value: 'historian', label: 'Neutral historian', desc: 'Balanced, factual, measured' },
      { value: 'dramatic', label: 'Dramatic narrator', desc: 'Vivid, cinematic storytelling' },
      { value: 'academic', label: 'Academic', desc: 'Formal, citation-minded, precise' },
    ],
  },
} as const

/**
 * ai_response_style used to hold a mix of length and tone words (concise, detailed, academic, storytelling).
 * It now holds the length. Old saved values are mapped on read; nothing in the database needs rewriting.
 */
export function normalizeLength(value: unknown): AILength {
  if (value === 'short' || value === 'medium' || value === 'long') return value
  if (value === 'concise') return 'short'
  if (value === 'detailed') return 'long'
  return DEFAULT_LENGTH
}

export function normalizeDepth(value: unknown): AIDepth {
  return value === 'in-depth' ? 'in-depth' : value === 'simple' ? 'simple' : DEFAULT_DEPTH
}

export function normalizeTone(value: unknown): AITone {
  return value === 'dramatic' || value === 'academic' || value === 'historian' ? value : DEFAULT_TONE
}

export function normalizePlausibility(value: unknown): AIPlausibility {
  return value === 'speculative' ? 'speculative' : DEFAULT_PLAUSIBILITY
}
