'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import Nav from '@/components/Nav'
import StarBackground from '@/components/StarBackground'
import { HISTORICAL_EVENTS } from '@/lib/events'
import { useAuth } from '@/context/AuthContext'
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

const FEATURED_IDS = ['9-11-2001', 'covid-2020', 'ww1-1914', 'great-depression-1929', 'mlk-march-1963', 'titanic-1912']

export default function LandingPage() {
  const router = useRouter()
  const { user, profile } = useAuth()
  const [freeText, setFreeText] = useState('')
  const [expandedCard, setExpandedCard] = useState<string | null>(null)

  const filtered = FEATURED_IDS
    .map(id => HISTORICAL_EVENTS.find(e => e.id === id))
    .filter((e): e is NonNullable<typeof e> => Boolean(e))

  function handleStart(eventId?: string) {
    if (eventId) router.push(`/diverge/${eventId}`)
    else if (freeText.trim()) router.push(`/diverge/custom?q=${encodeURIComponent(freeText)}`)
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', position: 'relative', overflowX: 'hidden', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <StarBackground />
      <Nav active="home" />

      {/* Hero */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', textAlign: 'center', padding: '0 24px', paddingTop: 80 }}>

        {user && profile?.username && (
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-dim)', marginBottom: 16, letterSpacing: '-0.01em' }}
          >
            Hey, <span style={{ color: 'var(--text)' }}>{profile.username}</span>
          </motion.p>
        )}

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{ fontSize: 'clamp(40px, 7vw, 88px)', fontWeight: 900, lineHeight: 1.08, margin: '0 0 4px', letterSpacing: '-0.02em' }}
        >
          History had a plan.
        </motion.h1>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
          style={{ fontSize: 'clamp(40px, 7vw, 88px)', fontWeight: 900, lineHeight: 1.08, color: 'var(--accent)', margin: '0 0 28px', letterSpacing: '-0.02em' }}
        >
          You don't have to follow it.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: 'easeOut' }}
          style={{ fontSize: 19, color: 'var(--text-dim)', marginBottom: 52, lineHeight: 1.6, whiteSpace: 'nowrap' }}
        >
          Pick any moment in time. Ask to see a change. Watch it unfold.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45, ease: 'easeOut' }}
          style={{ display: 'flex', gap: 10, width: '100%', maxWidth: 680, marginBottom: 18 }}
        >
          <input
            value={freeText}
            onChange={e => setFreeText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && freeText.trim() && handleStart()}
            placeholder="What if the Berlin Wall never fell..."
            style={{ flex: 1, padding: '15px 20px', borderRadius: 12, border: '1px solid var(--border-color)', background: 'var(--card-bg)', color: 'var(--text)', fontSize: 'var(--font-scale)', outline: 'none', fontFamily: 'inherit' }}
          />
          <button
            onClick={() => handleStart()}
            disabled={!freeText.trim()}
            style={{
              padding: '15px 28px', borderRadius: 12, fontSize: 'var(--font-scale)', fontWeight: 700,
              border: 'none', whiteSpace: 'nowrap', transition: 'all 0.25s',
              cursor: freeText.trim() ? 'pointer' : 'not-allowed',
              background: freeText.trim() ? 'var(--accent)' : 'color-mix(in srgb, var(--accent) 15%, transparent)',
              color: freeText.trim() ? '#fff' : 'var(--text-dim)',
            }}
          >
            Explore →
          </button>
        </motion.div>
      </div>

      {/* Scenarios */}
      <div id="scenarios" style={{ position: 'relative', zIndex: 1, padding: '80px 40px 80px', maxWidth: 1100, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 28 }}>
            FEATURED SCENARIOS
          </div>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, paddingTop: 12 }}>
          {filtered.map((event, idx) => (
            <motion.div
              key={event.id}
              className="event-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.07, ease: 'easeOut' }}
              whileHover={{ y: -10 }}
              style={{ borderRadius: 16, border: '1px solid var(--border-color)', background: 'var(--card-bg)', overflow: 'hidden', cursor: 'pointer', position: 'relative', zIndex: 1, isolation: 'isolate', marginBottom: 10 }}
              onClick={() => setExpandedCard(expandedCard === event.id ? null : event.id)}
            >
              <CardBorderTrace radius={16} />
              <div style={{ height: 140, overflow: 'hidden', position: 'relative', background: 'var(--card-bg)' }}>
                <img
                  src={FALLBACK_IMAGES[event.id] || `https://picsum.photos/seed/${event.id}/800/400`}
                  alt={event.title}
                  referrerPolicy="no-referrer"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.5)' }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 30%, var(--bg) 100%)', opacity: 0.92 }} />
                <div style={{ position: 'absolute', top: 12, left: 14 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.1em', background: 'rgba(0,0,0,0.55)', padding: '3px 8px', borderRadius: 4 }}>
                    {event.era.toUpperCase()} · {event.year}
                  </span>
                </div>
              </div>

              <div style={{ padding: '14px 16px 16px' }}>
                <div style={{ fontSize: 'var(--font-scale)', fontWeight: 700, marginBottom: 6, color: 'var(--text)' }}>{event.title}</div>
                <div style={{ fontSize: 'var(--font-scale)', color: 'var(--text-dim)', lineHeight: 1.6, marginBottom: 12 }}>{event.shortDesc}</div>

                {expandedCard === event.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    style={{ marginBottom: 12, padding: '10px 12px', borderRadius: 8, background: 'var(--card-bg)', border: '1px solid var(--border-color)', overflow: 'hidden' }}
                  >
                    <div style={{ fontSize: 'var(--font-scale)', color: 'var(--text-dim)', lineHeight: 1.7 }}>{event.fullDesc}</div>
                  </motion.div>
                )}

                <button
                  onClick={e => { e.stopPropagation(); handleStart(event.id) }}
                  style={{ width: '100%', padding: '9px', borderRadius: 9, border: '1px solid color-mix(in srgb, var(--accent) 35%, transparent)', background: 'color-mix(in srgb, var(--accent) 8%, transparent)', color: 'var(--accent)', fontSize: 'var(--font-scale)', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit' }}
                  onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'color-mix(in srgb, var(--accent) 18%, transparent)'}
                  onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'color-mix(in srgb, var(--accent) 8%, transparent)'}
                >
                  Explore this scenario
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          style={{ marginTop: 32, textAlign: 'center' }}
        >
          <button
            onClick={() => router.push('/explore')}
            style={{ padding: '12px 32px', borderRadius: 12, border: '1px solid var(--border-color)', background: 'var(--card-bg)', color: 'var(--text-dim)', fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit' }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLButtonElement; el.style.borderColor = 'var(--accent)'; el.style.color = 'var(--text)' }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.borderColor = 'var(--border-color)'; el.style.color = 'var(--text-dim)' }}
          >
            Show more scenarios
          </button>
        </motion.div>
      </div>
    </main>
  )
}