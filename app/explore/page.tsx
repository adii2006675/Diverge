'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import Nav from '@/components/Nav'
import StarBackground from '@/components/StarBackground'
import { HISTORICAL_EVENTS, ERAS } from '@/lib/events'
import DualSlider from '@/components/DualSlider'

const FALLBACK_IMAGES: Record<string, string> = {
  'jfk-1963': 'https://images.unsplash.com/photo-1569428034239-f9565e32e224?w=800&q=80',
  'ww2-1939': 'https://images.unsplash.com/photo-1524536765000-b76084ca0f01?w=800&q=80',
  'berlin-wall-1989': 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&q=80',
  '9-11-2001': 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80',
  'cuban-missile-1962': 'https://images.unsplash.com/photo-1541844053589-346841d0b34c?w=800&q=80',
  'lincoln-1865': 'https://images.unsplash.com/photo-1617791160588-241658c0f566?w=800&q=80',
  'titanic-1912': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80',
  'moon-1969': 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800&q=80',
  'ww1-1914': 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=800&q=80',
  'soviet-1991': 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&q=80',
}

export default function ExplorePage() {
  const router = useRouter()
  const [selectedEra, setSelectedEra] = useState('All')
  const [yearMin, setYearMin] = useState(1400)
  const [yearMax, setYearMax] = useState(2026)

  const filtered = HISTORICAL_EVENTS.filter(e => {
    const eraMatch = selectedEra === 'All' || e.era === selectedEra
    const yearMatch = e.year >= yearMin && e.year <= yearMax
    return eraMatch && yearMatch
  })

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', fontFamily: 'Inter, system-ui, sans-serif', position: 'relative' }}>
      <StarBackground />
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
          <p style={{ fontSize: 16, color: 'var(--text-dim)', marginBottom: 40 }}>
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
                fontSize: 12, fontWeight: 500, transition: 'all 0.18s',
              }}
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
            style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-dim)', fontSize: 15 }}
          >
            No events match your filters
          </motion.div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {filtered.map((event, idx) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: idx * 0.05, ease: 'easeOut' }}
                whileHover={{ y: -3 }}
                style={{
                  borderRadius: 16, border: '1px solid var(--border-color)',
                  background: 'var(--card-bg)', overflow: 'hidden',
                  cursor: 'pointer', position: 'relative', zIndex: 1, isolation: 'isolate',
                }}
              >
                <div style={{ height: 130, overflow: 'hidden', position: 'relative', background: 'var(--card-bg)' }}>
                  <img
                    src={FALLBACK_IMAGES[event.id] || `https://picsum.photos/seed/${event.id}/800/400`}
                    alt={event.title}
                    referrerPolicy="no-referrer"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.5)' }}
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 30%, var(--bg) 100%)', opacity: 0.92 }} />
                  <div style={{ position: 'absolute', top: 10, left: 12 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.1em', background: 'rgba(0,0,0,0.55)', padding: '2px 7px', borderRadius: 4 }}>
                      {event.era.toUpperCase()} · {event.year < 0 ? `${Math.abs(event.year)} BC` : event.year}
                    </span>
                  </div>
                </div>
                <div style={{ padding: '12px 14px 14px' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 5, color: 'var(--text)' }}>{event.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.6, marginBottom: 12 }}>{event.shortDesc}</div>
                  <button
                    onClick={() => router.push(`/diverge/${event.id}`)}
                    style={{
                      width: '100%', padding: '8px', borderRadius: 8,
                      border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)', background: 'color-mix(in srgb, var(--accent) 7%, transparent)',
                      color: 'var(--accent)', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      fontFamily: 'inherit', transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'color-mix(in srgb, var(--accent) 16%, transparent)'}
                    onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'color-mix(in srgb, var(--accent) 7%, transparent)'}
                  >
                    Explore →
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}