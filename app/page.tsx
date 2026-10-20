'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import Nav from '@/components/Nav'
import { HISTORICAL_EVENTS } from '@/lib/events'
import { useAuth } from '@/context/AuthContext'
import TiltCard from '@/components/TiltCard'
import EventImage from '@/components/EventImage'
import { useT } from '@/lib/useT'
import { eventText } from '@/lib/localizeEvent'

const FEATURED_IDS = ['9-11-2001', 'ww1-1914', 'titanic-1912', 'great-depression-1929', 'covid-2020', 'mlk-march-1963']

const LONG_DESCRIPTIONS: Record<string, string> = {
  '9-11-2001': 'On September 11, 2001, nineteen al-Qaeda hijackers seized four commercial airliners, crashing two into the World Trade Center towers, one into the Pentagon, and a fourth into a Pennsylvania field after passengers fought back. Nearly 3,000 people died, reshaping American foreign policy and security for decades.',
  'ww1-1914': 'The assassination of Archduke Franz Ferdinand in Sarajevo on June 28, 1914 triggered a cascade of alliances that plunged Europe into total war within weeks. Trench warfare, new weapons of mass destruction, and imperial rivalries combined to kill an estimated 20 million people before the war ended in 1918.',
  'titanic-1912': 'On April 15, 1912, the RMS Titanic, believed unsinkable, struck an iceberg during its maiden voyage and sank in the North Atlantic, killing over 1,500 passengers and crew. The disaster exposed fatal shortcomings in maritime safety regulations and forever changed how ships were built and equipped.',
  'great-depression-1929': 'The Wall Street crash of October 1929 wiped out billions in wealth almost overnight, triggering the Great Depression, a decade-long global economic collapse. Unemployment soared past 25 percent in the United States, banks failed en masse, and the crisis reshaped government economic policy worldwide.',
  'covid-2020': 'Beginning in early 2020, a novel coronavirus spread rapidly across the globe, prompting unprecedented lockdowns, school closures, and economic disruption. Scientists developed effective vaccines within a year, an unprecedented achievement, while the pandemic ultimately claimed millions of lives worldwide.',
  'mlk-march-1963': 'On August 28, 1963, Martin Luther King Jr. delivered his iconic "I Have a Dream" speech to over 250,000 people gathered at the March on Washington. The demonstration became a defining moment of the Civil Rights Movement, helping build momentum toward the Civil Rights Act passed the following year.',
}

export default function LandingPage() {
  const router = useRouter()
  const { user, profile } = useAuth()
  const { t, language } = useT()
  const [freeText, setFreeText] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filtered = FEATURED_IDS
    .map(id => HISTORICAL_EVENTS.find(e => e.id === id))
    .filter((e): e is NonNullable<typeof e> => Boolean(e))

  const expandedEvent = filtered.find(e => e.id === expandedId)

  useEffect(() => {
    document.body.style.overflow = expandedId ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [expandedId])

  function handleStart(eventId?: string) {
    if (eventId) router.push(`/diverge/${eventId}`)
    else if (freeText.trim()) router.push(`/diverge/custom?q=${encodeURIComponent(freeText)}`)
  }

  return (
    <main style={{ minHeight: 'var(--vh-fit, 100vh)', background: 'transparent', color: 'var(--text)', position: 'relative', overflowX: 'hidden', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Nav active="home" />

      {/* Hero */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'var(--vh-fit, 100vh)', textAlign: 'center', padding: '0 24px', paddingTop: 80 }}>

        {user && profile?.username && (
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-dim)', marginBottom: 16, letterSpacing: '-0.01em' }}
          >
            {t('Hey,')} <span style={{ color: 'var(--text)' }}>{profile.username}</span>
          </motion.p>
        )}

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{ fontSize: 'clamp(40px, 7vw, 88px)', fontWeight: 900, lineHeight: 1.08, margin: '0 0 4px', letterSpacing: '-0.02em' }}
        >
          {t('History had a plan.')}
        </motion.h1>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
          style={{ fontSize: 'clamp(40px, 7vw, 88px)', fontWeight: 900, lineHeight: 1.08, color: 'var(--accent)', margin: '0 0 28px', letterSpacing: '-0.02em' }}
        >
          {t('You don\'t have to follow it.')}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: 'easeOut' }}
          style={{ fontSize: 19, color: 'var(--text-dim)', marginBottom: 52, lineHeight: 1.6, whiteSpace: 'nowrap' }}
        >
          {t('Pick any event in time. Ask to see a change. Watch it Diverge.')}
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
            placeholder={t('What if 9/11 never happened...')}
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
            {t('Diverge')}
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
            {t('Featured scenarios').toUpperCase()}
          </div>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, paddingTop: 12 }}>
          {filtered.map((event, idx) => (
            <motion.div
              key={event.id}
              layoutId={`card-${event.id}`}
              className="event-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: Math.min(idx, 11) * 0.05, ease: 'easeOut' }}
              style={{ borderRadius: 16, marginBottom: 10 }}
              onClick={() => setExpandedId(event.id)}
            >
              <TiltCard radius={16}>
              <div style={{ height: 140, overflow: 'hidden', position: 'relative', background: 'var(--bg)' }}>
                <EventImage key={event.id} id={event.id} title={event.title} year={event.year} loading="lazy" />
                <div style={{ position: 'absolute', top: 12, left: 14 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.1em', background: 'var(--bg)', padding: '3px 8px', borderRadius: 4 }}>
                    {t(event.era).toUpperCase()} · {event.year}
                  </span>
                </div>
              </div>

              <div style={{ padding: '14px 16px 16px' }}>
                <div style={{ fontSize: 'var(--font-scale)', fontWeight: 700, marginBottom: 6, color: 'var(--text)' }}>{eventText(language, event).title}</div>
                <div style={{ fontSize: 'var(--font-scale)', color: 'var(--text-dim)', lineHeight: 1.6 }}>{eventText(language, event).shortDesc}</div>
              </div>
              </TiltCard>
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
            {t('Show more events')}
          </button>
        </motion.div>
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
                        {t(expandedEvent.era).toUpperCase()} · {expandedEvent.year}
                      </span>
                    </div>
                  </div>
                  <div style={{ padding: '20px 24px 24px' }}>
                    <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 12, color: 'var(--text)' }}>{eventText(language, expandedEvent).title}</div>
                    <div style={{ fontSize: 14, color: 'var(--text-dim)', lineHeight: 1.7, marginBottom: 24 }}>
                      {eventText(language, expandedEvent).longDesc || (language === 'English' ? LONG_DESCRIPTIONS[expandedEvent.id] : undefined) || eventText(language, expandedEvent).fullDesc}
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button
                        className="modal-btn"
                        onClick={() => setExpandedId(null)}
                        style={{ flex: 1, padding: '12px', borderRadius: 10, border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-dim)', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}
                        onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent)'}
                        onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-color)'}
                      >
                        {t('Back')}
                      </button>
                      <button
                        className="modal-btn modal-btn-go"
                        onClick={() => router.push(`/diverge/${expandedEvent.id}`)}
                        style={{ flex: 1, padding: '12px', borderRadius: 10, border: 'none', background: 'var(--accent)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
                      >
                        {t('Diverge')}
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