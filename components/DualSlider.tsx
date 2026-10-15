'use client'
import { useRef, useCallback } from 'react'

interface Props {
  min: number
  max: number
  valueMin: number
  valueMax: number
  onChangeMin: (val: number) => void
  onChangeMax: (val: number) => void
  /** Optional non-linear scale: toPct maps a year to 0-100, fromPct maps 0-1 back to a year. */
  toPct?: (year: number) => number
  fromPct?: (p: number) => number
  /** Years to label under the track. Defaults to six evenly spaced ticks. */
  ticks?: number[]
  /** How to print a year, for example "500 BC". */
  format?: (year: number) => string
}

export default function DualSlider({ min, max, valueMin, valueMax, onChangeMin, onChangeMax, toPct, fromPct, ticks: tickYears, format }: Props) {
  const trackRef = useRef<HTMLDivElement>(null)
  const dragging = useRef<'min' | 'max' | null>(null)

  const pct = (val: number) => (toPct ? toPct(val) : ((val - min) / (max - min)) * 100)
  const fmt = (val: number) => (format ? format(val) : String(val))

  const valFromClientX = useCallback((clientX: number) => {
    if (!trackRef.current) return null
    const rect = trackRef.current.getBoundingClientRect()
    const p = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    return Math.round(fromPct ? fromPct(p) : min + p * (max - min))
  }, [min, max, fromPct])

  function startDrag(e: React.MouseEvent, handle: 'min' | 'max') {
    e.preventDefault()
    dragging.current = handle

    function onMove(e: MouseEvent) {
      const val = valFromClientX(e.clientX)
      if (val === null) return
      if (dragging.current === 'min' && val < valueMax - 5) onChangeMin(val)
      if (dragging.current === 'max' && val > valueMin + 5) onChangeMax(val)
    }

    function onUp() {
      dragging.current = null
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  function handleTrackClick(e: React.MouseEvent) {
    const val = valFromClientX(e.clientX)
    if (val === null) return
    const distMin = Math.abs(val - valueMin)
    const distMax = Math.abs(val - valueMax)
    if (distMin <= distMax && val < valueMax - 5) onChangeMin(val)
    else if (val > valueMin + 5) onChangeMax(val)
  }

  const numTicks = 6
  const rawTicks = Array.from({ length: numTicks }, (_, i) => {
    const year = Math.round(min + (i / (numTicks - 1)) * (max - min))
    return { year, pct: (i / (numTicks - 1)) * 100 }
  })
  const ticks = tickYears
    ? tickYears.map(year => ({ year, pct: pct(year) }))
    : rawTicks.map(t => {
        if (t.year === 1776) return { ...t, year: 1775 }
        if (t.year === 1901) return { ...t, year: 1900 }
        return t
      })

  return (
    <div>
      <div style={{ position: 'relative', minHeight: 24, marginBottom: 8 }}>
        <span style={{ position: 'absolute', left: 0, transform: 'translateX(-50%)', fontSize: 'var(--font-scale)', color: 'var(--text-dim)', fontWeight: 600, whiteSpace: 'nowrap' }}>{fmt(valueMin)}</span>
        <span style={{ position: 'absolute', right: 0, transform: 'translateX(50%)', fontSize: 'var(--font-scale)', color: 'var(--text-dim)', fontWeight: 600, whiteSpace: 'nowrap' }}>{fmt(valueMax)}</span>
      </div>

      <div
        ref={trackRef}
        onClick={handleTrackClick}
        style={{ position: 'relative', height: 28, display: 'flex', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}
      >
        <div style={{ position: 'absolute', left: 0, right: 0, height: 3, background: 'rgba(255,255,255,0.1)', borderRadius: 99 }} />

        <div style={{
          position: 'absolute', height: 3, background: 'var(--accent)', borderRadius: 99,
          left: `${pct(valueMin)}%`,
          right: `${100 - pct(valueMax)}%`,
        }} />

        <div
          onMouseDown={e => startDrag(e, 'min')}
          style={{
            position: 'absolute',
            left: `${pct(valueMin)}%`,
            transform: 'translateX(-50%)',
            width: 18, height: 18, borderRadius: '50%',
            background: 'var(--accent)',
            border: '2px solid var(--bg)',
            boxShadow: '0 0 10px color-mix(in srgb, var(--accent) 70%, transparent)',
            cursor: 'grab',
            zIndex: 3,
          }}
        />

        <div
          onMouseDown={e => startDrag(e, 'max')}
          style={{
            position: 'absolute',
            left: `${pct(valueMax)}%`,
            transform: 'translateX(-50%)',
            width: 18, height: 18, borderRadius: '50%',
            background: 'var(--accent)',
            border: '2px solid var(--bg)',
            boxShadow: '0 0 10px color-mix(in srgb, var(--accent) 70%, transparent)',
            cursor: 'grab',
            zIndex: 3,
          }}
        />
      </div>

      <div style={{ position: 'relative', minHeight: 32, marginTop: 4 }}>
        {ticks.map(t => (
          <div key={t.year} style={{ position: 'absolute', left: `${t.pct}%`, transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            <div style={{ width: 1, height: 6, background: 'var(--border-color)', flexShrink: 0 }} />
            <span style={{ fontSize: 'var(--font-scale)', color: 'var(--text-dim)', opacity: 0.6, whiteSpace: 'nowrap' }}>{fmt(t.year)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}