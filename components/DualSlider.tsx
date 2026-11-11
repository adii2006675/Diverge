'use client'
import { useRef, useCallback, useEffect } from 'react'
import { motion, animate, useMotionValue, useSpring, useTransform, useReducedMotion } from 'motion/react'

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
  /** Magnetic stops: given the value under the pointer and the handle's current value, returns the value to use. */
  snap?: (value: number, current: number) => number
}

// While dragging, a handle sits exactly under the pointer (no spring, so it can never trail behind a fast drag). The only
// thing that is smoothed is the pull toward a snap point: the page snaps the value, and the gap between the pointer and the
// snapped position is eased out with this spring, so locking onto 1900 and letting go of it both glide instead of popping.
const SNAP_SPRING = { stiffness: 620, damping: 42, mass: 0.7 }
// A change that does not come from dragging (clicking the track, resetting filters) glides to its new place.
const MOVE_SPRING = { type: 'spring' as const, stiffness: 380, damping: 34, mass: 0.9 }

export default function DualSlider({ min, max, valueMin, valueMax, onChangeMin, onChangeMax, toPct, fromPct, ticks: tickYears, format, snap }: Props) {
  const trackRef = useRef<HTMLDivElement>(null)
  const dragging = useRef<'min' | 'max' | null>(null)
  const reduce = useReducedMotion()

  const pct = useCallback((val: number) => (toPct ? toPct(val) : ((val - min) / (max - min)) * 100), [toPct, min, max])
  const fmt = (val: number) => (format ? format(val) : String(Math.round(val)))

  // Shown position (in %) of each handle = where the pointer is (raw) + the eased snap offset.
  const minRaw = useMotionValue(pct(valueMin))
  const maxRaw = useMotionValue(pct(valueMax))
  const minOff = useSpring(0, SNAP_SPRING)
  const maxOff = useSpring(0, SNAP_SPRING)

  const cur = useRef({ min: valueMin, max: valueMax })
  useEffect(() => { cur.current = { min: valueMin, max: valueMax } })

  const rawOf = (which: 'min' | 'max') => (which === 'min' ? minRaw : maxRaw)
  const offOf = (which: 'min' | 'max') => (which === 'min' ? minOff : maxOff)

  // The value changed. While dragging, that is the snap: ease the gap between pointer and snapped position. Otherwise the
  // change came from somewhere else, so glide the handle there (or jump with reduced motion).
  function follow(which: 'min' | 'max', value: number) {
    const raw = rawOf(which)
    const off = offOf(which)
    const target = pct(value)
    if (dragging.current === which) {
      const gap = target - raw.get()
      if (reduce) off.jump(gap); else off.set(gap)
      return
    }
    const shown = raw.get() + off.get()
    off.jump(0)
    raw.set(shown)
    if (reduce) raw.set(target); else animate(raw, target, MOVE_SPRING)
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { follow('min', valueMin) }, [valueMin])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { follow('max', valueMax) }, [valueMax])

  const minLeft = useTransform([minRaw, minOff], ([r, o]: number[]) => `${r + o}%`)
  const maxLeft = useTransform([maxRaw, maxOff], ([r, o]: number[]) => `${r + o}%`)
  const fillRight = useTransform([maxRaw, maxOff], ([r, o]: number[]) => `${100 - (r + o)}%`)

  const valFromClientX = useCallback((clientX: number) => {
    if (!trackRef.current) return null
    const rect = trackRef.current.getBoundingClientRect()
    const p = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    return fromPct ? fromPct(p) : min + p * (max - min)
  }, [min, max, fromPct])

  function startDrag(e: React.MouseEvent, handle: 'min' | 'max') {
    e.preventDefault()
    dragging.current = handle
    // Stop any glide in progress and start from where the handle is drawn right now.
    const raw = rawOf(handle)
    const off = offOf(handle)
    const shown = raw.get() + off.get()
    raw.stop()
    raw.set(shown)
    off.jump(0)

    function onMove(e: MouseEvent) {
      const val = valFromClientX(e.clientX)
      if (val === null) return
      const which = dragging.current
      if (which === 'min' && val < cur.current.max - 5) {
        // The snap is decided here, at the same moment as the pointer moves, so the handle's offset from the pointer is
        // always the exact distance to the stop it is locked on (it stays centred on the tick while the pointer wanders).
        const s = snap ? snap(val, cur.current.min) : val
        minRaw.set(pct(val)); const gap = pct(s) - pct(val); if (reduce) minOff.jump(gap); else minOff.set(gap)
        onChangeMin(s)
      }
      if (which === 'max' && val > cur.current.min + 5) {
        const s = snap ? snap(val, cur.current.max) : val
        maxRaw.set(pct(val)); const gap = pct(s) - pct(val); if (reduce) maxOff.jump(gap); else maxOff.set(gap)
        onChangeMax(s)
      }
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
    if (distMin <= distMax && val < valueMax - 5) onChangeMin(snap ? snap(val, valueMin) : val)
    else if (val > valueMin + 5) onChangeMax(snap ? snap(val, valueMax) : val)
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
