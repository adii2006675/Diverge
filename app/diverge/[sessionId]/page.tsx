'use client'
import { useState, useRef, useEffect } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { HISTORICAL_EVENTS } from '@/lib/events'
import { WhatIfEntry, WhatIfResponse, WorldMood } from '@/types'
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
  const [showAISettings, setShowAISettings] = useState(false)
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { settings, user, profile, updateSettings, signOut } = useAuth()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const hasAutoSubmitted = useRef(false)

  const currentEntry = whatIfs[activeTimelineIdx] || null
  const currentResponse = currentEntry?.response || null
  const divergence = currentResponse?.divergenceScore || 0
  const mood = (currentResponse?.worldMood || 'STABLE') as WorldMood
  const currentYear = currentResponse?.year || (event?.year?.toString() || '?')
  const currentFacts = currentResponse?.keyFacts || []
  const currentParagraph = currentResponse?.paragraph || ''
  const realFacts = event?.realFacts || []
  const startingEvent = event ? `${event.title} — ${event.year}` : customQ || 'Custom starting point'

  useEffect(() => {
    if (customQ && !event && !hasAutoSubmitted.current) {
      hasAutoSubmitted.current = true
      setCurrentInput(customQ)
      setTimeout(() => handleAsk(), 0)
    }
  }, [])

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

  async function handleManualSave() {
    if (!user || whatIfs.length === 0 || saving) return
    setSaving(true)
    try {
      const sessionData = {
        user_id: user.id,
        event_id: sessionId,
        event_title: startingEvent,
        what_ifs: whatIfs.map(w => ({ question: w.question })),
        divergence_score: currentResponse?.divergenceScore || 0,
        updated_at: new Date().toISOString(),
      }
      if (currentSessionId) {
        await supabase.from('sessions').update(sessionData).eq('id', currentSessionId)
      } else {
        const { data: savedRow } = await supabase.from('sessions').insert(sessionData).select().single()
        if (savedRow) setCurrentSessionId(savedRow.id)
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      console.error(err)
    }
    setSaving(false)
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
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'transparent', color: 'var(--text)', fontFamily: 'Inter, system-ui, sans-serif', position: 'relative' }}>

      {/* Top bar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', padding: '18px 40px', borderBottom: '1px solid var(--border-color)', flexShrink: 0, background: 'var(--nav-bg)', position: 'relative', zIndex: 10 }}>
        <div
          onClick={() => router.push('/')}
          style={{
            fontSize: 17, fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer',
            position: 'relative', zIndex: 1, justifySelf: 'start', display: 'inline-block',
            backgroundImage: 'linear-gradient(to right, var(--accent) 50%, var(--text) 50%)',
            backgroundSize: '200% 100%',
            backgroundPosition: 'right bottom',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            transition: 'background-position 0.4s ease, transform 0.25s ease',
          }}
          onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.backgroundPosition = 'left bottom'; el.style.transform = 'scale(1.08)' }}
          onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.backgroundPosition = 'right bottom'; el.style.transform = 'scale(1)' }}
        >
          DIVERGE
        </div>
        <div style={{ fontSize: 13, color: 'var(--text)', fontWeight: 600, position: 'relative', zIndex: 1, justifySelf: 'center', whiteSpace: 'nowrap' }}>
          {startingEvent}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', position: 'relative', zIndex: 1, justifySelf: 'end' }}>
          <button
            onClick={() => setShowAISettings(true)}
            style={{ ...btnStyle, padding: "7px 12px", fontWeight: 700, position: 'relative', width: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onMouseEnter={e => {
              const btn = e.currentTarget as HTMLButtonElement
              btn.style.color = 'var(--accent)'; btn.style.borderColor = 'var(--accent)'
              const label = btn.querySelector('.ai-label') as HTMLElement
              const gear = btn.querySelector('.ai-gear') as HTMLElement
              if (label) label.style.opacity = '0'
              if (gear) { gear.style.opacity = '1'; gear.style.transform = 'rotate(180deg)' }
            }}
            onMouseLeave={e => {
              const btn = e.currentTarget as HTMLButtonElement
              btn.style.color = 'var(--text-dim)'; btn.style.borderColor = 'var(--border-color)'
              const label = btn.querySelector('.ai-label') as HTMLElement
              const gear = btn.querySelector('.ai-gear') as HTMLElement
              if (label) label.style.opacity = '1'
              if (gear) { gear.style.opacity = '0'; gear.style.transform = 'rotate(0deg)' }
            }}
          >
            <span className="ai-label" style={{ transition: 'opacity 0.15s' }}>AI</span>
            <svg className="ai-gear" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ position: 'absolute', width: 16, height: 16, opacity: 0, transition: 'opacity 0.15s, transform 0.4s ease' }}>
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </button>
          <button
            onClick={() => router.push('/')}
            style={btnStyle}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'color-mix(in srgb, var(--accent) 40%, transparent)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-dim)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-color)' }}
          >
            Exit
          </button>
          {whatIfs.length > 0 && (
            <button
              onClick={handleManualSave}
              disabled={saving}
              style={{ ...btnStyle, background: saved ? '#10B981' : 'var(--card-bg)', color: saved ? '#fff' : 'var(--text-dim)', border: saved ? 'none' : '1px solid var(--border-color)', minWidth: 70, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onMouseEnter={e => { if (!saved) { (e.currentTarget as HTMLButtonElement).style.color = '#10B981'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#10B981' } }}
              onMouseLeave={e => { if (!saved) { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-dim)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-color)' } }}
            >
              {saving ? '...' : saved ? 'Saved ✓' : 'Save'}
            </button>
          )}
          {user && (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                style={{
                  width: 36, height: 36, borderRadius: '50%', border: '1px solid var(--border-color)',
                  background: profile?.avatar_url ? `url(${profile.avatar_url}) center/cover` : 'color-mix(in srgb, var(--accent) 20%, transparent)',
                  color: 'var(--text)', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
                onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent)'}
                onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-color)'}
              >
                {!profile?.avatar_url && (profile?.username?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || '?')}
              </button>
              {showProfileMenu && (
                <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', background: 'var(--nav-bg)', border: '1px solid var(--border-color)', borderRadius: 12, padding: '8px', minWidth: 200, zIndex: 300 }}>
                  <div style={{ padding: '8px 12px 12px', borderBottom: '1px solid var(--border-color)', marginBottom: 6 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{profile?.username || 'User'}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2 }}>{user.email}</div>
                  </div>
                  {[
                    { label: 'Profile', action: () => router.push('/profile') },
                    { label: 'Settings', action: () => router.push('/settings') },
                  ].map(item => (
                    <button key={item.label} onClick={() => { item.action(); setShowProfileMenu(false) }}
                      style={{ display: 'block', width: '100%', padding: '8px 12px', borderRadius: 8, border: 'none', background: 'transparent', color: 'var(--text-dim)', fontSize: 13, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}
                      onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'var(--card-bg)'}
                      onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'transparent'}
                    >{item.label}</button>
                  ))}
                  <div style={{ borderTop: '1px solid var(--border-color)', marginTop: 6, paddingTop: 6 }}>
                    <button
                      onClick={async () => { await signOut(); router.push('/'); setShowProfileMenu(false) }}
                      style={{ display: 'block', width: '100%', padding: '8px 12px', borderRadius: 8, border: 'none', background: 'transparent', color: '#EF4444', fontSize: 13, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}
                      onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.08)'}
                      onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'transparent'}
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        </div>

      {/* Split screen */}
      <div style={{ display: 'flex', flex: 1, flexDirection: 'column', overflow: 'hidden', position: 'relative', zIndex: 1 }}>
        <div style={{ borderBottom: '1px solid var(--border-color)', flexShrink: 0 }} />
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden', alignItems: 'stretch' }}>

        {/* LEFT — Real history */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%' }}>
          <div style={{ padding: '14px 22px 10px', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', color: 'var(--accent)' }}>REAL TIMELINE</span>
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

        {/* CENTER — Divergence % */}
        <div style={{ width: 72, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative', height: '100%' }}>
          <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, background: 'var(--border-color)', transform: 'translateX(-50%)' }} />
          <AnimatePresence>
            {divergence > 0 && (
              <motion.div
                key={divergence}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                style={{ zIndex: 1, background: 'transparent', padding: '10px 4px', textAlign: 'center' }}
              >
                <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--accent)', lineHeight: 1 }}>{divergence}%</div>
                <div style={{ fontSize: 8, color: 'var(--text-dim)', letterSpacing: '0.08em', marginTop: 3 }}>DIVERGED</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT — Your alternate timeline */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%' }}>
          <div style={{ padding: '14px 22px 10px', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', color: 'var(--accent)' }}>DIVERGED TIMELINE</span>
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
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-dim)', textAlign: 'center', gap: 18 }}>
                <div style={{ position: 'relative', width: 56, height: 56 }}>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid transparent', borderTopColor: 'var(--accent)', borderRightColor: 'color-mix(in srgb, var(--accent) 30%, transparent)' }}
                  />
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    style={{ position: 'absolute', inset: 8, borderRadius: '50%', border: '2px solid transparent', borderBottomColor: 'var(--accent)', opacity: 0.6 }}
                  />
                  <motion.div
                    animate={{ scale: [1, 1.15, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                    style={{ position: 'absolute', inset: 20, borderRadius: '50%', background: 'var(--accent)' }}
                  />
                </div>
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ fontSize: 14 }}
                >
                  Diverging history...
                </motion.div>
              </div>
            ) : !currentResponse ? (
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
      <div style={{ padding: '10px 24px', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', flexShrink: 0, position: 'relative', zIndex: 1, background: 'var(--nav-bg)', overflow: 'hidden' }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', overflowX: 'auto', position: 'relative', zIndex: 1 }}>
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
        <button onClick={handleSummary} style={{ marginLeft: 12, padding: '5px 12px', borderRadius: 7, border: '1px solid color-mix(in srgb, var(--accent) 25%, transparent)', background: 'color-mix(in srgb, var(--accent) 7%, transparent)', color: 'var(--accent)', fontSize: 12, fontWeight: 600, cursor: 'pointer', flexShrink: 0, fontFamily: 'inherit', position: 'relative', zIndex: 1 }}>
          View Summary
        </button>
      </div>

      {/* Input */}
      <div style={{ padding: '12px 24px 16px', background: 'var(--nav-bg)', flexShrink: 0, borderTop: '1px solid var(--border-color)', position: 'relative', zIndex: 1, overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', position: 'relative', zIndex: 1 }}>
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
        <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 5, textAlign: 'center', position: 'relative', zIndex: 1 }}>
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

      {/* AI Settings modal */}
      <AnimatePresence>
        {showAISettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, backdropFilter: 'blur(8px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
            onClick={() => setShowAISettings(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ type: 'spring', stiffness: 320, damping: 30 }}
              style={{ background: 'var(--nav-bg)', border: '1px solid var(--border-color)', borderRadius: 20, padding: '28px 32px', maxWidth: 460, width: '100%', maxHeight: '85vh', overflowY: 'auto', position: 'relative' }}
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setShowAISettings(false)}
                style={{ position: 'absolute', top: 16, left: 16, background: 'var(--card-bg)', border: 'none', color: 'var(--text-dim)', width: 28, height: 28, borderRadius: '50%', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                ×
              </button>

              <div style={{ textAlign: 'center', marginTop: 12, marginBottom: 24 }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)' }}>AI Settings</div>
                <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 4 }}>Changes save automatically.</div>
              </div>

              {/* Response length */}
              <div style={{ marginBottom: 22 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 10 }}>Response Length</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['concise', 'detailed'].map(val => (
                    <button
                      key={val}
                      onClick={() => updateSettings({ ai_response_style: val })}
                      style={{
                        flex: 1, padding: '9px', borderRadius: 9, cursor: 'pointer', fontFamily: 'inherit', textTransform: 'capitalize',
                        border: `1px solid ${settings?.ai_response_style === val ? 'var(--accent)' : 'var(--border-color)'}`,
                        background: settings?.ai_response_style === val ? 'color-mix(in srgb, var(--accent) 15%, transparent)' : 'var(--card-bg)',
                        color: settings?.ai_response_style === val ? 'var(--accent)' : 'var(--text-dim)',
                        fontSize: 13, fontWeight: settings?.ai_response_style === val ? 700 : 400,
                      }}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Plausibility */}
              <div style={{ marginBottom: 22 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 10 }}>Plausibility</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[
                    { val: 'realistic', label: 'Realistic' },
                    { val: 'speculative', label: 'Speculative' },
                  ].map(opt => (
                    <button
                      key={opt.val}
                      onClick={() => updateSettings({ ai_plausibility: opt.val })}
                      style={{
                        flex: 1, padding: '9px', borderRadius: 9, cursor: 'pointer', fontFamily: 'inherit',
                        border: `1px solid ${settings?.ai_plausibility === opt.val ? 'var(--accent)' : 'var(--border-color)'}`,
                        background: settings?.ai_plausibility === opt.val ? 'color-mix(in srgb, var(--accent) 15%, transparent)' : 'var(--card-bg)',
                        color: settings?.ai_plausibility === opt.val ? 'var(--accent)' : 'var(--text-dim)',
                        fontSize: 13, fontWeight: settings?.ai_plausibility === opt.val ? 700 : 400,
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tone */}
              <div style={{ marginBottom: 26 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 10 }}>Tone</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { val: 'historian', label: 'Neutral Historian', desc: 'Balanced, factual, measured' },
                    { val: 'dramatic', label: 'Dramatic Narrator', desc: 'Vivid, cinematic storytelling' },
                    { val: 'academic', label: 'Academic', desc: 'Formal, citation-minded, precise' },
                  ].map(opt => (
                    <button
                      key={opt.val}
                      onClick={() => updateSettings({ ai_tone: opt.val })}
                      style={{
                        padding: '10px 12px', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                        border: `1px solid ${settings?.ai_tone === opt.val ? 'var(--accent)' : 'var(--border-color)'}`,
                        background: settings?.ai_tone === opt.val ? 'color-mix(in srgb, var(--accent) 12%, transparent)' : 'var(--card-bg)',
                      }}
                    >
                      <div style={{ fontSize: 13, fontWeight: 600, color: settings?.ai_tone === opt.val ? 'var(--accent)' : 'var(--text)' }}>{opt.label}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2 }}>{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <AIToggle
                  label="Show confidence level"
                  value={settings?.show_confidence_level ?? true}
                  onChange={() => updateSettings({ show_confidence_level: !(settings?.show_confidence_level ?? true) })}
                />
                <AIToggle
                  label="Show historian's note"
                  value={settings?.show_historians_note ?? true}
                  onChange={() => updateSettings({ show_historians_note: !(settings?.show_historians_note ?? true) })}
                />
              </div>
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

function AIToggle({ label, value, onChange }: { label: string; value: boolean; onChange: () => void }) {
  return (
    <div
      onClick={onChange}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--card-bg)', cursor: 'pointer' }}
    >
      <span style={{ fontSize: 13, color: 'var(--text)' }}>{label}</span>
      <div style={{
        width: 40, height: 22, borderRadius: 99, flexShrink: 0,
        background: value ? 'var(--accent)' : 'var(--border-color)',
        position: 'relative', transition: 'background 0.2s',
      }}>
        <div style={{
          position: 'absolute', top: 2, left: value ? 20 : 2,
          width: 18, height: 18, borderRadius: '50%', background: '#fff',
          transition: 'left 0.2s',
        }} />
      </div>
    </div>
  )
}