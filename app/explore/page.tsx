/* eslint-disable @next/next/no-img-element */
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import Nav from '@/components/Nav'
import { HISTORICAL_EVENTS, ERAS } from '@/lib/events'
import DualSlider from '@/components/DualSlider'
import CardBorderTrace from '@/components/CardBorderTrace'

const FALLBACK_IMAGES: Record<string, string> = {
  'jfk-1963': 'https://images.unsplash.com/photo-1569428034239-f9565e32e224?w=800&q=80',
  'ww2-1939': 'https://images.unsplash.com/photo-1541535881962-3b7d3f2f7a3e?w=800&q=80',
  'berlin-wall-1989': 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&q=80',
  '9-11-2001': '/events/9-11-2001.jpg',
  'cuban-missile-1962': 'https://images.unsplash.com/photo-1541844053589-346841d0b34c?w=800&q=80',
  'lincoln-1865': 'https://images.unsplash.com/photo-1617791160588-241658c0f566?w=800&q=80',
  'titanic-1912': '/events/titanic-1912.jpg',
  'moon-1969': 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800&q=80',
  'ww1-1914': '/events/ww1-1914.jpg',
  'soviet-1991': 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&q=80',
  'covid-2020': '/events/covid-2020.jpg',
  'mlk-march-1963': '/events/mlk-march-1963.jpg',
  'great-depression-1929': '/events/great-depression-1929.jpg',
}

const PLACEHOLDER_LONG_DESC = 'This is placeholder expanded description text standing in for the real one hundred to three hundred character version that will eventually replace it here soon enough for testing purposes today.'

export default function ExplorePage() {
  const router = useRouter()
  const [selectedEra, setSelectedEra] = useState('All')
  const [yearMin, setYearMin] = useState(1400)
  const [yearMax, setYearMax] = useState(2026)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filtered = HISTORICAL_EVENTS.filter(e => {
    const eraMatch = selectedEra === 'All' || e.era === selectedEra
    const yearMatch = e.year >= yearMin && e.year <= yearMax
    return eraMatch && yearMatch
  })

  const expandedEvent = filtered.find(e => e.id === expandedId) || HISTORICAL_EVENTS.find(e => e.id === expandedId)

  useEffect(() => {
    if (expandedId) {
      document.body.classList.add('modal-open')
    } else {
      document.body.classList.remove('modal-open')
    }
    return () => { document.body.classList.remove('modal-open') }
  }, [expandedId])

  return (
    <main style={{ minHeight: '100vh', background: 'transparent', color: 'var(--text)', fontFamily: 'Inter, system-ui, sans-serif', position: 'relative' }}>
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
            min={1400}
            max={2026}
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
                transition={{ duration: 0.35, delay: idx * 0.05, ease: 'easeOut' }}
                whileHover={{ y: -7.5 }}
                style={{
                  borderRadius: 16, border: '1px solid var(--border-color)',
                  background: 'var(--bg)', overflow: 'hidden',
                  cursor: 'pointer', position: 'relative', zIndex: 1, isolation: 'isolate',
                }}
                onClick={() => setExpandedId(event.id)}
              >
                <CardBorderTrace radius={16} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ height: 130, overflow: 'hidden', position: 'relative', background: 'var(--bg)' }}>
                    <img
                      src={FALLBACK_IMAGES[event.id] || `https://picsum.photos/seed/${event.id}/800/400`}
                      alt={event.title}
                      referrerPolicy="no-referrer"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{ position: 'absolute', top: 10, left: 12 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.1em', background: 'var(--bg)', padding: '2px 7px', borderRadius: 4 }}>
                        {event.era.toUpperCase()} · {event.year < 0 ? `${Math.abs(event.year)} BC` : event.year}
                      </span>
                    </div>
                  </div>
                  <div style={{ padding: '12px 14px 14px' }}>
                    <div style={{ fontSize: 'var(--font-scale)', fontWeight: 700, marginBottom: 5, color: 'var(--text)' }}>{event.title}</div>
                    <div style={{ fontSize: 'var(--font-scale)', color: 'var(--text-dim)', lineHeight: 1.6, marginBottom: 12 }}>{event.shortDesc}</div>
                    <button
                      onClick={e => { e.stopPropagation(); router.push(`/diverge/${event.id}`) }}
                      style={{
                        width: '100%', padding: '8px', borderRadius: 8,
                        border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)', background: 'color-mix(in srgb, var(--accent) 7%, transparent)',
                        color: 'var(--accent)', fontSize: 'var(--font-scale)', fontWeight: 600, cursor: 'pointer',
                        fontFamily: 'inherit', transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'color-mix(in srgb, var(--accent) 16%, transparent)'}
                      onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'color-mix(in srgb, var(--accent) 7%, transparent)'}
                    >
                      Explore
                    </button>
                  </div>
                </div>
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
                  borderRadius: 20, border: '1px solid var(--border-color)',
                  background: 'var(--bg)', overflow: 'hidden',
                  position: 'relative', isolation: 'isolate',
                  maxWidth: 520, width: '100%', maxHeight: '85vh', overflowY: 'auto',
                  pointerEvents: 'auto',
                }}
              >
                <div style={{ position: 'absolute', inset: 0, background: 'var(--card-bg)', zIndex: 0 }} />
                <CardBorderTrace radius={20} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ height: 220, overflow: 'hidden', position: 'relative', background: 'var(--card-bg)' }}>
                    <img
                      src={FALLBACK_IMAGES[expandedEvent.id] || `https://picsum.photos/seed/${expandedEvent.id}/800/400`}
                      alt={expandedEvent.title}
                      referrerPolicy="no-referrer"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{ position: 'absolute', top: 14, left: 16 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.1em', background: 'var(--bg)', padding: '3px 9px', borderRadius: 5 }}>
                        {expandedEvent.era.toUpperCase()} · {expandedEvent.year < 0 ? `${Math.abs(expandedEvent.year)} BC` : expandedEvent.year}
                      </span>
                    </div>
                  </div>
                  <div style={{ padding: '20px 24px 24px' }}>
                    <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 12, color: 'var(--text)' }}>{expandedEvent.title}</div>
                    <div style={{ fontSize: 14, color: 'var(--text-dim)', lineHeight: 1.7, marginBottom: 24 }}>
                      {PLACEHOLDER_LONG_DESC}
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button
                        onClick={() => setExpandedId(null)}
                        style={{ flex: 1, padding: '12px', borderRadius: 10, border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-dim)', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}
                        onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent)'}
                        onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-color)'}
                      >
                        Back
                      </button>
                      <button
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