'use client'
import { useRef, useCallback, useEffect } from 'react'
import { motion, useSpring, useTransform, useReducedMotion } from 'motion/react'

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

// The handles glide to their target with a short spring, so following the pointer, snapping to a tick and letting go of
// a tick all move smoothly instead of jumping. Values passed to onChange are continuous (not rounded to whole years).
const HANDLE_SPRING = { stiffness: 620, damping: 42, mass: 0.7 }

export default function DualSlider({ min, max, valueMin, valueMax, onChangeMin, onChangeMax, toPct, fromPct, ticks: tickYears, format }: Props) {
  const trackRef = useRef<HTMLDivElement>(null)
  const dragging = useRef<'min' | 'max' | null>(null)
  const reduce = useReducedMotion()

  const pct = useCallback((val: number) => (toPct ? toPct(val) : ((val - min) / (max - min)) * 100), [toPct, min, max])
  const fmt = (val: number) => (format ? format(val) : String(Math.round(val)))

  const minPct = useSpring(pct(valueMin), HANDLE_SPRING)
  const maxPct = useSpring(pct(valueMax), HANDLE_SPRING)
  useEffect(() => { if (reduce) minPct.jump(pct(valueMin)); else minPct.set(pct(valueMin)) }, [valueMin, reduce, minPct, pct])
  useEffect(() => { if (reduce) maxPct.jump(pct(valueMax)); else maxPct.set(pct(valueMax)) }, [valueMax, reduce, maxPct, pct])
  const minLeft = useTransform(minPct, v => `${v}%`)
  const maxLeft = useTransform(maxPct, v => `${v}%`)
  const fillRight = useTransform(maxPct, v => `${100 - v}%`)

  const valFromClientX = useCallback((clientX: number) => {
    if (!trackRef.current) return null
    const rect = trackRef.current.getBoundingClientRect()
    const p = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    return fromPct ? fromPct(p) : min + p * (max - min)
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

  const handleStyle = {
    position: 'absolute' as const,
    width: 18, height: 18, borderRadius: '50%',
    background: 'var(--accent)',
    border: '2px solid var(--bg)',
    boxShadow: '0 0 10px color-mix(in srgb, var(--accent) 70%, transparent)',
    cursor: 'grab',
    zIndex: 3,
    touchAction: 'none' as const,
  }

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

        <motion.div style={{ position: 'absolute', height: 3, background: 'var(--accent)', borderRadius: 99, left: minLeft, right: fillRight }} />

        <motion.div onMouseDown={e => startDrag(e, 'min')} style={{ ...handleStyle, left: minLeft, x: '-50%' }} />
        <motion.div onMouseDown={e => startDrag(e, 'max')} style={{ ...handleStyle, left: maxLeft, x: '-50%' }} />
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
