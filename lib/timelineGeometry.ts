import { ALL_EVENTS, formatEventYear } from '@/lib/events'

// Layout of the "Two timelines" graphic in a 396 x 190 box. Shared by the on-screen card and the exported image.
export const VIEW_W = 396
export const VIEW_H = 190
export const X0 = 24
export const X1 = 372
export const BASE = 95
const MAX_DROP = 78
const MIN_GAP = 40

export type GeoNode = { score: number; yearNum: number | null }

export function computeTimelineGeometry(nodes: GeoNode[], startYear: number, excludeEventId?: string) {
  const years = nodes.map((n, i) => n.yearNum ?? (i === 0 ? startYear + 1 : startYear + i + 1))
  const lastYear = Math.max(startYear + 1, ...years)
  const span = lastYear - startYear
  const yearToX = (y: number) => X0 + ((y - startYear) / span) * (X1 - X0)

  // Place nodes by year, then push apart any that crowd, then squeeze back into the track.
  const xs = years.map(yearToX)
  for (let i = 0; i < xs.length; i++) xs[i] = Math.max(xs[i], i === 0 ? X0 + MIN_GAP : xs[i - 1] + MIN_GAP)
  const over = xs.length ? xs[xs.length - 1] - X1 : 0
  if (over > 0) {
    const room = X1 - X0
    for (let i = 0; i < xs.length; i++) xs[i] = X0 + ((xs[i] - X0) / (xs[xs.length - 1] - X0)) * room
  }
  const pts = nodes.map((n, i) => ({ x: xs[i], y: BASE + (Math.max(0, Math.min(100, n.score)) / 100) * MAX_DROP }))

  let d = `M${X0} ${BASE}`
  let px = X0, py = BASE
  for (const p of pts) {
    const mid = (p.x - px) / 2
    d += ` C${px + mid} ${py} ${p.x - mid} ${p.y} ${p.x} ${p.y}`
    px = p.x; py = p.y
  }
  const endX = pts.length ? pts[pts.length - 1].x : X0
  const fill = `${d} L${endX} ${BASE} Z`

  const ticks = ALL_EVENTS
    .filter(e => e.id !== excludeEventId && e.year > startYear && e.year <= lastYear)
    .sort((a, b) => a.year - b.year)
    .slice(0, 10)
    .map(e => ({ id: e.id, x: Math.min(yearToX(e.year), endX), title: `${e.title} (${formatEventYear(e.year)})` }))

  return { pts, d, fill, endX, ticks }
}
