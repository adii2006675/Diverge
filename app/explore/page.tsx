'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import Nav from '@/components/Nav'
import { ALL_EVENTS, ERAS, formatEventYear } from '@/lib/events'
import DualSlider from '@/components/DualSlider'
import TiltCard from '@/components/TiltCard'
import EventImage from '@/components/EventImage'

// The year slider covers 2600 BC to 2026. It is not linear: the ancient world gets 15% of the track and
// the Middle Ages another 23%, so the modern centuries (most of the events) still have room to separate.
const YEAR_MIN = -2600
const YEAR_MAX = 2026
const SCALE_BREAKS: [number, number][] = [[YEAR_MIN, 0], [0, 15], [1400, 38], [YEAR_MAX, 100]]
const SLIDER_TICKS = [-2600, -500, 1400, 1650, 1900, 2026]

function yearToPct(year: number): number {
  for (let i = 1; i < SCALE_BREAKS.length; i++) {
    const [y0, p0] = SCALE_BREAKS[i - 1]
    const [y1, p1] = SCALE_BREAKS[i]
    if (year <= y1) return p0 + ((year - y0) / (y1 - y0)) * (p1 - p0)
  }
  return 100
}

function pctToYear(p: number): number {
  const pct = p * 100
  for (let i = 1; i < SCALE_BREAKS.length; i++) {
    const [y0, p0] = SCALE_BREAKS[i - 1]
    const [y1, p1] = SCALE_BREAKS[i]
    if (pct <= p1) return y0 + ((pct - p0) / (p1 - p0)) * (y1 - y0)
  }
  return YEAR_MAX
}

export default function ExplorePage() {
  const router = useRouter()
  const [selectedEra, setSelectedEra] = useState('All')
  const [yearMin, setYearMin] = useState(YEAR_MIN)
  const [yearMax, setYearMax] = useState(YEAR_MAX)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filtered = ALL_EVENTS.filter(e => {
    const eraMatch = selectedEra === 'All' || e.era === selectedEra
    const yearMatch = e.year >= yearMin && e.year <= yearMax
    return eraMatch && yearMatch
  })

  const expandedEvent = filtered.find(e => e.id === expandedId) || ALL_EVENTS.find(e => e.id === expandedId)

  useEffect(() => {
    if (expandedId) {
      document.body.classList.add('modal-open')
    } else {
      document.body.classList.remove('modal-open')
    }
    return () => { document.body.classList.remove('modal-open') }
  }, [expandedId])

  return (
    <main style={{ minHeight: 'var(--vh-fit, 100vh)', background: 'transparent', color: 'var(--text)', fontFamily: 'Inter, system-ui, sans-serif', position: 'relative' }}>
      <Nav active="explore" />

      {/* Hero */}
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '120px 40px 48px' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 style={{ fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 12 }}>
            Explore history
          </h1>
          <p style={{ fontSize: 'var(--font-scale)', color: 'var(--text-dim)', marginBottom: 40 }}>
            A list of major world events
          </p>
        </motion.div>

        {/* Era filters */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, flexWrap: 'wrap', maxWidth: 900, margin: '0 auto 28px' }}
        >
          {ERAS.map(era => (
            <button
              key={era}
              onClick={() => setSelectedEra(era)}
              style={{
                padding: '7px 16px', borderRadius: 999, cursor: 'pointer', fontFamily: 'inherit',
                border: `1px solid ${selectedEra === era ? 'var(--accent)' : 'var(--border-color)'}`,
                background: selectedEra === era ? 'color-mix(in srgb, var(--accent) 12%, transparent)' : 'transparent',
                color: selectedEra === era ? 'var(--accent)' : 'var(--text-dim)',
                fontSize: 'var(--font-scale)', fontWeight: 500, transition: 'all 0.18s',
              }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLButtonElement; el.style.fontSize = 'calc(var(--font-scale) * 1.08)'; el.style.color = selectedEra === era ? 'var(--accent)' : 'var(--text)' }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.fontSize = 'var(--font-scale)'; el.style.color = selectedEra === era ? 'var(--accent)' : 'var(--text-dim)' }}
            >
              {era}
            </button>
          ))}
        </motion.div>

        {/* Dual slider */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          style={{ width: '100%', maxWidth: 700, margin: '0 auto' }}
        >
          <DualSlider
            min={YEAR_MIN}
            max={YEAR_MAX}
            toPct={yearToPct}
            fromPct={pctToYear}
            ticks={SLIDER_TICKS}
            format={formatEventYear}
            valueMin={yearMin}
            valueMax={yearMax}
            onChangeMin={setYearMin}
            onChangeMax={setYearMax}
          />
        </motion.div>
      </div>

      {/* Cards grid */}
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto', padding: '0 40px 80px' }}>
        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-dim)', fontSize: 'var(--font-scale)' }}
          >
            No events match your filters
          </motion.div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {filtered.map((event, idx) => (
              <motion.div
                key={event.id}
                layoutId={`card-${event.id}`}
                className="event-card"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: Math.min(idx, 11) * 0.04, ease: 'easeOut' }}
                style={{ borderRadius: 16 }}
                onClick={() => setExpandedId(event.id)}
              >
                <TiltCard radius={16}>
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ height: 130, overflow: 'hidden', position: 'relative', background: 'var(--bg)' }}>
                    <EventImage key={event.id} id={event.id} title={event.title} year={event.year} loading="lazy" />
                    <div style={{ position: 'absolute', top: 10, left: 12 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.1em', background: 'var(--bg)', padding: '2px 7px', borderRadius: 4 }}>
                        {event.era.toUpperCase()} · {formatEventYear(event.year)}
                      </span>
                    </div>
                  </div>
                  <div style={{ padding: '12px 14px 14px' }}>
                    <div style={{ fontSize: 'var(--font-scale)', fontWeight: 700, marginBottom: 5, color: 'var(--text)' }}>{event.title}</div>
                    <div style={{ fontSize: 'var(--font-scale)', color: 'var(--text-dim)', lineHeight: 1.6, marginBottom: 0 }}>{event.shortDesc}</div>
                  </div>
                </div>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Expanded modal */}
      <AnimatePresence>
        {expandedEvent && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setExpandedId(null)}
              style={{
                position: 'fixed', inset: 0, zIndex: 100,
                background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
              }}
            />
            <div style={{ position: 'fixed', inset: 0, zIndex: 101, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, pointerEvents: 'none' }}>
              <motion.div
                layoutId={`card-${expandedEvent.id}`}
                className="event-card always-trace"
                transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
                style={{
                  borderRadius: 20,
                  background: 'var(--bg)', overflow: 'hidden',
                  position: 'relative', isolation: 'isolate',
                  maxWidth: 520, width: '100%', maxHeight: 'calc(85vh / var(--ui-scale, 1))', overflowY: 'auto',
                  pointerEvents: 'auto',
                }}
              >
                <div style={{ position: 'absolute', inset: 0, background: 'var(--card-bg)', zIndex: 0 }} />
                <div className="tilt-ring static" aria-hidden="true" />
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ height: 220, overflow: 'hidden', position: 'relative', background: 'var(--card-bg)' }}>
                    <EventImage key={expandedEvent.id} id={expandedEvent.id} title={expandedEvent.title} year={expandedEvent.year} />
                    <div style={{ position: 'absolute', top: 14, left: 16 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.1em', background: 'var(--bg)', padding: '3px 9px', borderRadius: 5 }}>
                        {expandedEvent.era.toUpperCase()} · {formatEventYear(expandedEvent.year)}
                      </span>
                    </div>
                  </div>
                  <div style={{ padding: '20px 24px 24px' }}>
                    <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 12, color: 'var(--text)' }}>{expandedEvent.title}</div>
                    <div style={{ fontSize: 14, color: 'var(--text-dim)', lineHeight: 1.7, marginBottom: 24 }}>
                      {expandedEvent.fullDesc}
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button
                        className="modal-btn"
                        onClick={() => setExpandedId(null)}
                        style={{ flex: 1, padding: '12px', borderRadius: 10, border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-dim)', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}
                        onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent)'}
                        onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-color)'}
                      >
                        Back
                      </button>
                      <button
                        className="modal-btn modal-btn-go"
                        onClick={() => router.push(`/diverge/${expandedEvent.id}`)}
                        style={{ flex: 1, padding: '12px', borderRadius: 10, border: 'none', background: 'var(--accent)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
                      >
                        Diverge
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </main>
  )
}