'use client'
import { useEffect, useRef } from 'react'
import { getPointer } from '@/lib/pointerTrack'

type Props = {
  children: React.ReactNode
  /** Corner radius in px. The outline ring and the clipping use the same value, so nothing bleeds. */
  radius?: number
  /** Maximum tilt in degrees at the very edge of the card. */
  maxTilt?: number
}

const EASE = 0.22 // fraction of the remaining distance covered each frame: snappy but smooth

type State = { rx: number; ry: number; mx: number; my: number; glow: number; lift: number }

// A card that lifts toward you and tilts to follow the mouse, with an outline that glows
// at the edge nearest the cursor. All motion runs from one requestAnimationFrame loop that
// reads the pointer position against the card's untransformed wrapper, so there is no
// feedback jitter, and it only runs while something is still moving.
export default function TiltCard({ children, radius = 16, maxTilt = 9 }: Props) {
  const outer = useRef<HTMLDivElement>(null)
  const inner = useRef<HTMLDivElement>(null)
  const cur = useRef<State>({ rx: 0, ry: 0, mx: 50, my: 50, glow: 0, lift: 0 })
  const tgt = useRef<State>({ rx: 0, ry: 0, mx: 50, my: 50, glow: 0, lift: 0 })
  const raf = useRef(0)

  function frame() {
    const c = cur.current
    const t = tgt.current
    let moving = false
    for (const k of Object.keys(c) as (keyof State)[]) {
      const d = t[k] - c[k]
      if (Math.abs(d) > 0.01) { c[k] += d * EASE; moving = true } else c[k] = t[k]
    }
    const el = inner.current
    if (el) {
      el.style.setProperty('--rx', `${c.rx.toFixed(2)}deg`)
      el.style.setProperty('--ry', `${c.ry.toFixed(2)}deg`)
      el.style.setProperty('--mx', `${c.mx.toFixed(1)}%`)
      el.style.setProperty('--my', `${c.my.toFixed(1)}%`)
      el.style.setProperty('--glow', c.glow.toFixed(3))
      el.style.setProperty('--lift', c.lift.toFixed(3))
      // The shadow leans away from the light: opposite the tilt direction.
      el.style.setProperty('--sx', (-c.ry * 1.6).toFixed(2))
      el.style.setProperty('--sy', (c.rx * 1.6).toFixed(2))
    }
    raf.current = moving ? requestAnimationFrame(frame) : 0
  }
  function kick() {
    if (!raf.current) raf.current = requestAnimationFrame(frame)
  }

  function reduced() {
    return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }

  type Pt = { clientX: number; clientY: number }
  function aim(e: Pt) {
    const box = outer.current?.getBoundingClientRect()
    if (!box || box.width === 0) return
    const px = Math.min(1, Math.max(0, (e.clientX - box.left) / box.width))
    const py = Math.min(1, Math.max(0, (e.clientY - box.top) / box.height))
    const t = tgt.current
    t.mx = px * 100
    t.my = py * 100
    if (!reduced()) {
      // Pointer near the top pushes the top edge back; near the left pushes the left edge back.
      t.rx = (0.5 - py) * 2 * maxTilt
      t.ry = (px - 0.5) * 2 * maxTilt
    }
    kick()
  }

  function enter(e: Pt) {
    outer.current?.classList.add('is-hover')
    const c = cur.current
    // Start the outline glow where the pointer entered instead of sweeping in from the middle.
    const box = outer.current?.getBoundingClientRect()
    if (box && box.width) {
      c.mx = tgt.current.mx = ((e.clientX - box.left) / box.width) * 100
      c.my = tgt.current.my = ((e.clientY - box.top) / box.height) * 100
    }
    tgt.current.glow = 1
    tgt.current.lift = reduced() ? 0 : 1
    aim(e)
  }
  function onEnter(e: React.PointerEvent) {
    if (e.pointerType !== 'mouse') return
    enter(e)
  }
  function onMove(e: React.PointerEvent) {
    if (e.pointerType !== 'mouse') return
    // A card that appears under a cursor that is already resting there (for example after clicking "Show more events")
    // gets a move event but never an enter event, so the first move counts as the enter.
    if (tgt.current.glow === 0) { enter(e); return }
    aim(e)
  }
  function onLeave(e: React.PointerEvent) {
    if (e.pointerType !== 'mouse') return
    const t = tgt.current
    t.rx = 0; t.ry = 0; t.glow = 0; t.lift = 0
    kick()
    // Keep it above its neighbours until it has settled back.
    window.setTimeout(() => { if (tgt.current.glow === 0) outer.current?.classList.remove('is-hover') }, 260)
  }

  // A card that appears under a cursor that is not moving gets no pointer events at all, so look at where the cursor last
  // was once the card has settled (the cards fade in over about half a second) and light it up if the cursor is on it.
  useEffect(() => {
    function check() {
      const p = getPointer()
      const el = outer.current
      if (!p || !el || tgt.current.glow !== 0) return
      const hit = document.elementFromPoint(p.x, p.y)
      if (hit && el.contains(hit)) enter({ clientX: p.x, clientY: p.y })
    }
    const ids = [60, 350, 900].map(ms => window.setTimeout(check, ms))
    return () => ids.forEach(id => window.clearTimeout(id))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div ref={outer} className="tilt-outer" onPointerEnter={onEnter} onPointerMove={onMove} onPointerLeave={onLeave} style={{ borderRadius: radius }}>
      <div ref={inner} className="tilt-card" style={{ borderRadius: radius }}>
        {children}
        <div className="tilt-glare" aria-hidden="true" />
        <div className="tilt-edge" aria-hidden="true" />
        <div className="tilt-ring" aria-hidden="true" />
      </div>
    </div>
  )
}
