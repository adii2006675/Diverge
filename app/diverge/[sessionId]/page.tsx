'use client'
import { useState, useRef } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { HISTORICAL_EVENTS } from '@/lib/events'
import { WhatIfEntry, WhatIfResponse, WorldMood } from '@/types'
import StarBackground from '@/components/StarBackground'
import { useAuth } from '@/context/AuthContext'
import { motion, AnimatePresence } from 'motion/react'
import { supabase } from '@/lib/supabase'

const MOOD_COLORS: Record<string, string> = {
  STABLE: '#10B981', TENSE: '#F59E0B', CRITICAL: '#EF4444',
  'AT WAR': '#EF4444', CATASTROPHIC: '#7C3AED',
  REBUILDING: '#06B6D4', FLOURISHING: '#10B981',
}

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

export default function DivergePage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const sessionId = params.sessionId as string

  const event = HISTORICAL_EVENTS.find(e => e.id === sessionId)
  const customQ = searchParams.get('q')

  const [whatIfs, setWhatIfs] = useState<WhatIfEntry[]>([])
  const [currentInput, setCurrentInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [expandedFact, setExpandedFact] = useState<string | null>(null)
  const [showSummary, setShowSummary] = useState(false)
  const [summary, setSummary] = useState<any>(null)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [activeTimelineIdx, setActiveTimelineIdx] = useState(0)
  const [showSettings, setShowSettings] = useState(false)
  const [theme, setTheme] = useState('dark')
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { settings, user } = useAuth()

  const currentEntry = whatIfs[activeTimelineIdx] || null
  const currentResponse = currentEntry?.response || null
  const divergence = currentResponse?.divergenceScore || 0
  const mood = (currentResponse?.worldMood || 'STABLE') as WorldMood
  const currentYear = currentResponse?.year || (event?.year?.toString() || '?')
  const currentFacts = currentResponse?.keyFacts || []
  const currentParagraph = currentResponse?.paragraph || ''
  const realFacts = event?.realFacts || []
  const startingEvent = event ? `${event.title} — ${event.year}` : customQ || 'Custom starting point'

  const uncertaintyColor = currentResponse?.uncertaintyLevel === 'LOW'
    ? '#10B981'
    : currentResponse?.uncertaintyLevel === 'HIGH'
      ? '#EF4444'
      : '#F59E0B'

  async function handleAsk() {
    if (!currentInput.trim() || loading) return
    setLoading(true)
    const question = currentInput.trim()
    setCurrentInput('')

    try {
      const previousWhatIfs = whatIfs.map(w => w.question)
      const currentWorldState = currentResponse
        ? currentResponse.keyFacts.join('. ')
        : 'History as it really happened.'

      const res = await fetch('/api/diverge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startingEvent, previousWhatIfs, currentWorldState, newQuestion: question, realFacts, aiStyle: settings?.ai_response_style || 'detailed' })
      })

      const data: WhatIfResponse = await res.json()
      const newEntry: WhatIfEntry = { question, response: data, timestamp: Date.now() }
      const newWhatIfs = [...whatIfs, newEntry]
      setWhatIfs(newWhatIfs)
      setActiveTimelineIdx(newWhatIfs.length - 1)

      if (user) {
        const sessionData = {
          user_id: user.id,
          event_id: sessionId,
          event_title: startingEvent,
          what_ifs: newWhatIfs.map(w => ({ question: w.question })),
          divergence_score: data.divergenceScore || 0,
          updated_at: new Date().toISOString(),
        }
        if (currentSessionId) {
          await supabase.from('sessions').update(sessionData).eq('id', currentSessionId)
        } else {
          const { data: saved } = await supabase.from('sessions').insert(sessionData).select().single()
          if (saved) setCurrentSessionId(saved.id)
        }
      }
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  async function handleSummary() {
    if (whatIfs.length === 0) return
    setSummaryLoading(true)
    setShowSummary(true)
    try {
      const res = await fetch('/api/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startingEvent,
          whatIfs: whatIfs.map(w => w.question),
          finalWorldState: currentResponse?.keyFacts.join('. ') || ''
        })
      })
      setSummary(await res.json())
    } catch (err) { console.error(err) }
    setSummaryLoading(false)
  }

  const eventImage = FALLBACK_IMAGES[sessionId] || `https://picsum.photos/seed/${sessionId}/800/400`

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', color: 'var(--text)', fontFamily: 'Inter, system-ui, sans-serif', overflow: 'hidden', position: 'relative' }}>
      <StarBackground />

      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px', borderBottom: '1px solid var(--border-color)', flexShrink: 0, background: 'var(--nav-bg)', position: 'relative', zIndex: 10 }}>
        <div style={{ fontSize: 14, fontWeight: 900, letterSpacing: '0.15em', cursor: 'pointer', textTransform: 'uppercase', color: 'var(--text)' }} onClick={() => router.push('/')}>DIVERGE</div>
        <div style={{ fontSize: 13, color: 'var(--text-dim)' }}>
          Starting point: <span style={{ color: 'var(--text)', fontWeight: 600 }}>{startingEvent}</span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button style={btnStyle}>Save</button>
          <button onClick={handleSummary} style={{ ...btnStyle, color: 'var(--accent)', borderColor: 'color-mix(in srgb, var(--accent) 25%, transparent)', background: 'color-mix(in srgb, var(--accent) 7%, transparent)' }}>
            Summary →
          </button>
          <button onClick={() => router.push('/')} style={btnStyle}>New Game</button>
          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowSettings(!showSettings)} style={{ ...btnStyle, padding: '7px 12px', fontSize: 15 }}>⚙</button>
            {showSettings && (
              <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', background: 'var(--nav-bg)', border: '1px solid var(--border-color)', borderRadius: 12, padding: '12px 8px', minWidth: 180, zIndex: 100 }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--text-dim)', padding: '4px 10px 8px' }}>SETTINGS</div>
                {[
                  { label: 'Profile', action: () => router.push('/profile') },
                  { label: 'Full Settings', action: () => router.push('/settings') },
                ].map(item => (
                  <button key={item.label} onClick={() => { item.action(); setShowSettings(false) }}
                    style={{ display: 'block', width: '100%', padding: '8px 10px', borderRadius: 8, border: 'none', background: 'transparent', color: 'var(--text-dim)', fontSize: 13, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}
                    onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'var(--card-bg)'}
                    onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'transparent'}
                  >{item.label}</button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Split screen */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative', zIndex: 1 }}>

        {/* LEFT — Your alternate timeline */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRight: '1px solid var(--border-color)' }}>
          <div style={{ padding: '14px 22px 10px', borderBottom: '1px solid var(--border-color)', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', color: 'var(--accent)' }}>YOUR TIMELINE</span>
            {currentYear && (
              <span style={{ padding: '2px 9px', borderRadius: 999, background: 'color-mix(in srgb, var(--accent) 12%, transparent)', border: '1px solid color-mix(in srgb, var(--accent) 25%, transparent)', fontSize: 11, fontWeight: 700, color: 'var(--accent)' }}>
                {currentYear}
              </span>
            )}
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, alignItems: 'center' }}>
              {currentResponse?.uncertaintyLevel && settings?.show_confidence_level !== false && (
                <span style={{
                  padding: '2px 9px', borderRadius: 999, fontSize: 10, fontWeight: 700,
                  background: `${uncertaintyColor}18`,
                  border: `1px solid ${uncertaintyColor}44`,
                  color: uncertaintyColor,
                }}>
                  {currentResponse.uncertaintyLevel} CONFIDENCE
                </span>
              )}
              {mood && (
                <span style={{ padding: '2px 9px', borderRadius: 999, background: `${MOOD_COLORS[mood] || '#fff'}18`, border: `1px solid ${MOOD_COLORS[mood] || '#fff'}44`, fontSize: 10, fontWeight: 700, color: MOOD_COLORS[mood] || '#fff' }}>
                  {mood}
                </span>
              )}
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 22px' }}>
            {!currentResponse ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-dim)', textAlign: 'center', gap: 10 }}>
                <div style={{ fontSize: 36 }}>🌍</div>
                <div style={{ fontSize: 14 }}>Ask your first "what if" below to begin</div>
              </div>
            ) : (
              <motion.div
                key={activeTimelineIdx}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              >
                <p style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 14, lineHeight: 1.8, color: 'var(--text)', marginBottom: 20, fontStyle: 'italic' }}>
                  {currentParagraph}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {currentFacts.map((fact, i) => {
                    const key = `alt-${activeTimelineIdx}-${i}`
                    const isExp = expandedFact === key
                    return (
                      <motion.div key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: i * 0.06 }}
                        onClick={() => setExpandedFact(isExp ? null : key)}
                        style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px', borderRadius: 10, background: isExp ? 'color-mix(in srgb, var(--accent) 6%, transparent)' : 'var(--card-bg)', border: `1px solid ${isExp ? 'color-mix(in srgb, var(--accent) 25%, transparent)' : 'var(--border-color)'}`, cursor: 'pointer', transition: 'all 0.18s' }}
                        onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = 'color-mix(in srgb, var(--accent) 5%, transparent)'}
                        onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = isExp ? 'color-mix(in srgb, var(--accent) 6%, transparent)' : 'var(--card-bg)'}
                      >
                        <div style={{ flexShrink: 0, marginTop: 5 }}>
                          <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)', boxShadow: isExp ? '0 0 6px var(--accent)' : 'none' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, color: isExp ? 'var(--text)' : 'var(--text-dim)', lineHeight: 1.5, fontWeight: isExp ? 500 : 400 }}>{fact}</div>
                          {isExp && currentResponse.factExplanations?.[i] && (
                            <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 7, lineHeight: 1.65, paddingTop: 7, borderTop: '1px solid var(--border-color)', animation: 'fadeIn 0.2s ease' }}>
                              {currentResponse.factExplanations[i]}
                            </div>
                          )}
                        </div>
                        <button style={{ flexShrink: 0, width: 18, height: 18, borderRadius: '50%', border: `1px solid ${isExp ? 'var(--accent)' : 'var(--border-color)'}`, background: isExp ? 'color-mix(in srgb, var(--accent) 15%, transparent)' : 'transparent', color: isExp ? 'var(--accent)' : 'var(--text-dim)', fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.15s', transform: isExp ? 'rotate(180deg)' : 'rotate(0)' }}>
                          ▾
                        </button>
                      </motion.div>
                    )
                  })}
                </div>

                {/* Reliability notes */}
                {currentResponse.reliabilityNotes && settings?.show_historians_note !== false && (
                  <div style={{ marginTop: 14, padding: '10px 12px', borderRadius: 10, background: 'color-mix(in srgb, var(--accent) 5%, transparent)', border: '1px solid color-mix(in srgb, var(--accent) 15%, transparent)' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.1em', marginBottom: 4 }}>HISTORIAN'S NOTE</div>
                    <div style={{ fontSize: 11, color: 'var(--text-dim)', lineHeight: 1.65 }}>{currentResponse.reliabilityNotes}</div>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>

        {/* CENTER — Divergence % */}
        <div style={{ width: 72, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, bottom: 0, width: 1, background: 'var(--border-color)' }} />
          <AnimatePresence>
            {divergence > 0 && (
              <motion.div
                key={divergence}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                style={{ zIndex: 1, background: 'var(--bg)', padding: '10px 4px', textAlign: 'center' }}
              >
                <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--accent)', lineHeight: 1 }}>{divergence}%</div>
                <div style={{ fontSize: 8, color: 'var(--text-dim)', letterSpacing: '0.08em', marginTop: 3 }}>DIVERGED</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT — Real history */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '14px 22px 10px', borderBottom: '1px solid var(--border-color)', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', color: 'var(--accent)' }}>REAL HISTORY</span>
            {event?.year && (
              <span style={{ padding: '2px 9px', borderRadius: 999, background: 'color-mix(in srgb, var(--accent) 12%, transparent)', border: '1px solid color-mix(in srgb, var(--accent) 25%, transparent)', fontSize: 11, fontWeight: 700, color: 'var(--accent)' }}>
                {event.year}
              </span>
            )}
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 22px' }}>
            <div style={{ height: 130, borderRadius: 10, overflow: 'hidden', marginBottom: 18, position: 'relative' }}>
              <img
                src={eventImage}
                alt={event?.title || 'Historical event'}
                referrerPolicy="no-referrer"
                style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.45) saturate(0.4)' }}
                onError={e => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${sessionId}/800/400` }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent, rgba(8,8,16,0.85))' }} />
              <div style={{ position: 'absolute', bottom: 10, left: 12, fontSize: 11, color: 'var(--text-dim)', fontWeight: 500 }}>
                {event?.title || startingEvent} · {event?.year || ''}
              </div>
            </div>

            <p style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 14, lineHeight: 1.8, color: 'var(--text-dim)', marginBottom: 18, fontStyle: 'italic' }}>
              {event?.fullDesc || 'Real history as it happened.'}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {realFacts.map((fact, i) => {
                const key = `real-${i}`
                const isExp = expandedFact === key
                return (
                  <div key={i}
                    onClick={() => setExpandedFact(isExp ? null : key)}
                    style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px', borderRadius: 10, background: 'var(--card-bg)', border: `1px solid ${isExp ? 'color-mix(in srgb, var(--accent) 25%, transparent)' : 'var(--border-color)'}`, cursor: 'pointer', transition: 'all 0.18s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = 'color-mix(in srgb, var(--accent) 4%, transparent)'}
                    onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'var(--card-bg)'}
                  >
                    <div style={{ flexShrink: 0, marginTop: 5 }}>
                      <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.5 }}>{fact}</div>
                      {isExp && (
                        <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 7, lineHeight: 1.65, paddingTop: 7, borderTop: '1px solid var(--border-color)', animation: 'fadeIn 0.2s ease' }}>
                          This is what actually happened in recorded history.
                        </div>
                      )}
                    </div>
                    <button style={{ flexShrink: 0, width: 18, height: 18, borderRadius: '50%', border: `1px solid ${isExp ? 'var(--accent)' : 'var(--border-color)'}`, background: isExp ? 'color-mix(in srgb, var(--accent) 15%, transparent)' : 'transparent', color: isExp ? 'var(--accent)' : 'var(--text-dim)', fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.15s', transform: isExp ? 'rotate(180deg)' : 'rotate(0)' }}>
                      ▾
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Narration */}
      {currentResponse?.narration && (
        <div style={{ padding: '14px 40px', borderTop: '1px solid var(--border-color)', background: 'var(--card-bg)', flexShrink: 0, position: 'relative', zIndex: 1 }}>
          <p style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 13, lineHeight: 1.8, color: 'var(--text-dim)', margin: 0, fontStyle: 'italic', textAlign: 'center', maxWidth: 860, marginInline: 'auto' }}>
            {currentResponse.narration}
          </p>
        </div>
      )}

      {/* Timeline dots */}
      <div style={{ padding: '10px 24px', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', flexShrink: 0, position: 'relative', zIndex: 1 }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', overflowX: 'auto' }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--text-dim)', border: '2px solid var(--border-color)', flexShrink: 0, cursor: 'pointer' }} />
          {whatIfs.map((entry, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
              <div style={{ width: 36, height: 1, background: 'var(--border-color)' }} />
              <div
                title={entry.question}
                onClick={() => setActiveTimelineIdx(i)}
                style={{ width: 10, height: 10, borderRadius: '50%', background: i === activeTimelineIdx ? 'var(--accent)' : 'var(--text-dim)', border: `2px solid ${i === activeTimelineIdx ? 'var(--accent)' : 'var(--border-color)'}`, cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s', boxShadow: i === activeTimelineIdx ? '0 0 8px var(--accent)' : 'none' }}
              />
            </div>
          ))}
        </div>
        <button onClick={handleSummary} style={{ marginLeft: 12, padding: '5px 12px', borderRadius: 7, border: '1px solid color-mix(in srgb, var(--accent) 25%, transparent)', background: 'color-mix(in srgb, var(--accent) 7%, transparent)', color: 'var(--accent)', fontSize: 12, fontWeight: 600, cursor: 'pointer', flexShrink: 0, fontFamily: 'inherit' }}>
          View Summary →
        </button>
      </div>

      {/* Input */}
      <div style={{ padding: '12px 24px 16px', background: 'var(--nav-bg)', flexShrink: 0, borderTop: '1px solid var(--border-color)', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <input
            ref={inputRef}
            value={currentInput}
            onChange={e => setCurrentInput(e.target.value.slice(0, 500))}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAsk() } }}
            placeholder="What if..."
            disabled={loading}
            style={{ flex: 1, padding: '12px 16px', borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--card-bg)', color: 'var(--text)', fontSize: 14, outline: 'none', fontFamily: 'inherit', opacity: loading ? 0.6 : 1 }}
          />
          <span style={{ fontSize: 11, color: 'var(--text-dim)', flexShrink: 0 }}>{currentInput.length}/500</span>
          <button
            onClick={handleAsk}
            disabled={loading || !currentInput.trim()}
            style={{ padding: '12px 22px', borderRadius: 10, background: loading || !currentInput.trim() ? 'color-mix(in srgb, var(--accent) 40%, transparent)' : 'var(--accent)', color: '#fff', fontSize: 14, fontWeight: 700, border: 'none', cursor: loading || !currentInput.trim() ? 'not-allowed' : 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'inherit' }}
          >
            {loading
              ? <><div style={{ width: 13, height: 13, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.25)', borderTopColor: '#fff', animation: 'spin 0.8s linear infinite' }} />Thinking...</>
              : 'Ask Diverge →'
            }
          </button>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 5, textAlign: 'center' }}>
          Press Enter to ask · Shift+Enter for new line
        </div>
      </div>

      {/* Summary modal */}
      <AnimatePresence>
        {showSummary && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          onClick={() => setShowSummary(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            style={{ background: 'var(--nav-bg)', border: '1px solid var(--border-color)', borderRadius: 20, padding: 32, maxWidth: 680, width: '100%', maxHeight: '88vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}
          >
            <button onClick={() => setShowSummary(false)} style={{ float: 'right', background: 'var(--card-bg)', border: 'none', color: 'var(--text-dim)', width: 28, height: 28, borderRadius: '50%', cursor: 'pointer', fontSize: 14 }}>×</button>

            {summaryLoading ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', border: '2px solid var(--border-color)', borderTopColor: 'var(--accent)', animation: 'spin 0.8s linear infinite', margin: '0 auto 14px' }} />
                <div style={{ color: 'var(--text-dim)', fontSize: 14 }}>Building your alternate timeline...</div>
              </div>
            ) : summary ? (
              <>
                <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 6, paddingRight: 32 }}>{summary.title}</div>
                <div style={{ fontSize: 13, color: 'var(--accent)', marginBottom: 24 }}>Divergence: {divergence}% from real history</div>
                <div style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 14, lineHeight: 1.85, color: 'var(--text-dim)', marginBottom: 28, whiteSpace: 'pre-line' }}>
                  {summary.summary}
                </div>

                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: 'var(--text-dim)', marginBottom: 10 }}>COMPARISON</div>
                <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', background: 'var(--card-bg)', padding: '8px 14px' }}>
                    {['CATEGORY', 'REAL WORLD', 'YOUR WORLD'].map((h, i) => (
                      <span key={h} style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: i === 0 ? 'var(--text-dim)' : 'var(--accent)' }}>{h}</span>
                    ))}
                  </div>
                  {summary.comparisonTable?.map((row: any, i: number) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', padding: '9px 14px', borderTop: '1px solid var(--border-color)', background: i % 2 === 0 ? 'transparent' : 'var(--card-bg)' }}>
                      <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>{row.category}</span>
                      <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>{row.realWorld}</span>
                      <span style={{ fontSize: 12, color: 'var(--accent)' }}>{row.alternateWorld}</span>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: 8, marginTop: 22 }}>
                  <button onClick={() => setShowSummary(false)} style={{ flex: 1, padding: '11px', borderRadius: 9, border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text)', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                    Keep Exploring
                  </button>
                  <button onClick={() => router.push('/')} style={{ flex: 1, padding: '11px', borderRadius: 9, border: 'none', background: 'var(--accent)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                    New Game
                  </button>
                </div>
              </>
            ) : null}
          </motion.div>
        </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform:rotate(360deg); } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 99px; }
      `}</style>
    </div>
  )
}

const btnStyle: React.CSSProperties = {
  padding: '7px 16px', borderRadius: 8,
  border: '1px solid var(--border-color)',
  background: 'var(--card-bg)',
  color: 'var(--text-dim)',
  fontSize: 13, fontWeight: 500, cursor: 'pointer',
  fontFamily: 'inherit',
}