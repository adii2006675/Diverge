import index from '@/lib/eventIndex.json'

// The small list of events used everywhere (Explore, cards, search, Sessions). The long text of each event is loaded only when it is
// needed: see lib/eventDetail.ts. Events live in data/events.json; run `npm run build:events` after changing it.
export type HistoricalEvent = {
  id: string
  year: number
  title: string
  shortDesc: string
  era: string
  /** Full-size picture, and a small version for cards. */
  img?: string
  thumb?: string
  /** CSS object-position for the picture, when the default crop cuts off the subject. */
  pos?: string
}

export const ERAS = ['All', 'Ancient', 'Medieval', 'Renaissance', 'Industrial', 'WWI/WWII', 'Cold War', 'Wars', 'Modern', 'Politics', 'Civil Rights', 'Tech', 'AI', 'Games', 'Business', 'Finance', 'Celebrities', 'Music', 'Movies & TV', 'Social Media', 'Sports', 'Science', 'Disasters', 'Food', 'Cars']

// The filter bar on Explore groups the finer categories above into ten chips so every filter fits on one line.
export const FILTER_GROUPS: { label: string; eras: string[] }[] = [
  { label: 'History', eras: ['Ancient', 'Medieval', 'Renaissance', 'Industrial'] },
  { label: 'War', eras: ['WWI/WWII', 'Cold War', 'Wars'] },
  { label: 'Modern', eras: ['Modern'] },
  { label: 'Politics & Rights', eras: ['Politics', 'Civil Rights'] },
  { label: 'Tech & AI', eras: ['Tech', 'AI', 'Games', 'Science'] },
  { label: 'Money', eras: ['Business', 'Finance'] },
  { label: 'Entertainment', eras: ['Celebrities', 'Music', 'Movies & TV', 'Social Media'] },
  { label: 'Sports', eras: ['Sports'] },
  { label: 'Disasters', eras: ['Disasters'] },
  { label: 'Everyday Life', eras: ['Food', 'Cars'] },
]

export const ALL_EVENTS: HistoricalEvent[] = index as HistoricalEvent[]

export function formatEventYear(year: number): string {
  return year < 0 ? `${Math.abs(year)} BC` : String(year)
}
