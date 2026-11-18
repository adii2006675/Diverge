// Works out the daily question streak from the times the questions were asked.
const dayKey = (ms: number) => { const d = new Date(ms); return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate() }
const prevDay = (key: number) => { const y = Math.floor(key / 10000), m = Math.floor((key % 10000) / 100) - 1, d = key % 100; return dayKey(new Date(y, m, d - 1).getTime()) }

/** Days in a row with at least one question. A streak is still alive if the last question was yesterday. */
export function computeStreak(times: number[], now = Date.now()): { streak: number; askedToday: boolean } {
  const days = new Set(times.filter(t => Number.isFinite(t) && t > 0).map(dayKey))
  const today = dayKey(now)
  const askedToday = days.has(today)
  let cursor = askedToday ? today : prevDay(today)
  let streak = 0
  while (days.has(cursor)) { streak++; cursor = prevDay(cursor) }
  return { streak, askedToday }
}
