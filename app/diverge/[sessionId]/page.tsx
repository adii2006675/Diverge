'use client'
import { useState, useRef, useEffect } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { ALL_EVENTS, formatEventYear } from '@/lib/events'
import { WhatIfEntry, WhatIfResponse, WorldMood } from '@/types'
import { useAuth } from '@/context/AuthContext'
import { motion, AnimatePresence } from 'motion/react'
import { supabase } from '@/lib/supabase'
import EventImage from '@/components/EventImage'
import Nav from '@/components/Nav'
import AIResponseSettings from '@/components/AIResponseSettings'
import { streamAnswer, aiHeaders, AiError, setUserApiKey } from '@/lib/aiClient'
import { normalizeLength, normalizeDepth, normalizeTone, normalizePlausibility } from '@/lib/aiSettings'
import './diverge.css'

const MOOD_COLORS: Record<string, string> = {
  STABLE: '#10B981', TENSE: '#F59E0B', CRITICAL: '#EF4444',
  'AT WAR': '#EF4444', CATASTROPHIC: '#7C3AED',
  REBUILDING: '#06B6D4', FLOURISHING: '#10B981',
}

// The model's year field is free text ("1968", "Approximately 1600 CE", "300 BC"). Pull out a year if there is one.
function parseYear(text: string | undefined | null): number | null {
  const m = /(\d{1,4})\s*(BC|BCE|AD|CE)?/i.exec(text || '')
  if (!m) return null
  const n = parseInt(m[1], 10)
  return m[2] && /^BC/i.test(m[2]) ? -n : n
}

function firstSentence(text: string, max = 260) {
  const m = /^[\s\S]*?[.!?](?=\s|$)/.exec(text || '')
  const s = (m ? m[0] : text || '').trim()
  return s.length > max ? s.slice(0, max - 1).trimEnd() + '…' : s
}

// While the JSON streams in, show just the paragraph text that has arrived so far.
function liveParagraph(raw: string) {
  const m = /"paragraph"\s*:\s*"((?:[^"\\]|\\.)*)/.exec(raw)
  if (!m) return ''
  return m[1].replace(/\\n/g, ' ').replace(/\\"/g, '"').replace(/\\\\/g, '\\')
}

function moodLabel(mood: string) {
  return mood.charAt(0) + mood.slice(1).toLowerCase()
}

// The API field is named uncertaintyLevel but its prompt asks "how confident are you": HIGH is good.
function confidenceInfo(level: string) {
  if (level === 'HIGH') return { label: 'High confidence', color: '#10B981' }
  if (level === 'LOW') return { label: 'Low confidence', color: '#EF4444' }
  return { label: 'Medium confidence', color: '#F59E0B' }
}

type AskError = { message: string; question: string }
type Refusal = { message: string; question: string }
type Gate = { code: string; message: string; question: string }

const WAIT_STAGES = ['Reading the historical record', 'Tracing the causes', 'Weighing the ripple effects', 'Writing your answer']
// Measured typical times for each length setting.
const WAIT_USUAL: Record<'short' | 'medium' | 'long', string> = { short: '10–15', medium: '15–30', long: '30–60' }

const CUSTOM_START_COPY =
  'This is a custom starting point, so there is no recorded timeline to compare against. Diverge will anchor its answer in documented history for this topic.'

export default function DivergePage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const sessionId = params.sessionId as string

  const event = ALL_EVENTS.find(e => e.id === sessionId)
  const customQ = searchParams.get('q')
  const resumeId = searchParams.get('session')

  const [whatIfs, setWhatIfs] = useState<WhatIfEntry[]>([])
  const [currentInput, setCurrentInput] = useState('')
  const [loading, setLoading] = useState(false)
  // Answer i is open if the user toggled it, otherwise only the latest answer starts open. Facts toggle independently.
  const [openAnswers, setOpenAnswers] = useState<Record<number, boolean>>({})
  const [openFacts, setOpenFacts] = useState<Record<string, boolean>>({})
  const [askedEvents, setAskedEvents] = useState<string[]>([])
  const threadRef = useRef<HTMLDivElement>(null)
  const [showSummary, setShowSummary] = useState(false)
  const [summary, setSummary] = useState<any>(null)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [activeTimelineIdx, setActiveTimelineIdx] = useState(0)
  const [showAISettings, setShowAISettings] = useState(false)
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { settings, user, updateSettings, loading: authLoading } = useAuth()
  const hasAutoSubmitted = useRef(false)
  const hasResumed = useRef(false)
  const [resumedTitle, setResumedTitle] = useState<string | null>(null)
  const [resumeNote, setResumeNote] = useState<{ questions: string[] } | null>(null)
  const [elapsed, setElapsed] = useState(0)
  // Index of the answer that just arrived, so only it plays the reveal animation.
  const [freshIdx, setFreshIdx] = useState<number | null>(null)
  const [scrollTarget, setScrollTarget] = useState<number | null>(null)
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null)
  const [askError, setAskError] = useState<AskError | null>(null)
  const [refusal, setRefusal] = useState<Refusal | null>(null)
  const [summaryError, setSummaryError] = useState<string | null>(null)
  const [gate, setGate] = useState<Gate | null>(null)
  const [keyDraft, setKeyDraft] = useState('')
  const [streamText, setStreamText] = useState('')

  const latest = whatIfs.length > 0 ? whatIfs[whatIfs.length - 1] : null
  const currentEntry = whatIfs[activeTimelineIdx] || null
  const currentResponse = currentEntry?.response || null
  const divergence = currentResponse?.divergenceScore || 0
  const mood = (currentResponse?.worldMood || 'STABLE') as WorldMood
  const currentYear = currentResponse?.year || (event ? formatEventYear(event.year) : '?')
  const realFacts = event?.realFacts || []
  const isAnswerOpen = (i: number) => openAnswers[i] ?? i === whatIfs.length - 1

  // Real events around and after the timeline's current year, from the static event list.
  const yearNow = currentResponse ? parseYear(currentResponse.year) : (event?.year ?? null)
  const meanwhile = (() => {
    if (yearNow === null) return { near: true, list: [] as typeof ALL_EVENTS }
    const byDistance = [...ALL_EVENTS].filter(e => e.id !== event?.id).sort((a, b) => Math.abs(a.year - yearNow) - Math.abs(b.year - yearNow))
    const near = byDistance.filter(e => Math.abs(e.year - yearNow) <= 25).slice(0, 3)
    return near.length > 0 ? { near: true, list: near } : { near: false, list: byDistance.slice(0, 2) }
  })()
  const unanswered = yearNow === null ? [] : ALL_EVENTS
    .filter(e => e.year > yearNow && e.id !== event?.id && !askedEvents.includes(e.id))
    .sort((a, b) => a.year - b.year)
    .slice(0, 4)
  // Optional field: the API will start returning 2-3 next questions in a later step.
  const suggestions = (latest?.response.suggestions || []).filter(s => typeof s === 'string' && s.trim()).slice(0, 3)
  const startingEvent = event ? `${event.title} — ${formatEventYear(event.year)}` : resumedTitle || customQ || 'Custom starting point'

  // A custom starting point (from the home page) arrives as ?q=... and is asked automatically,
  // once auth has resolved so the user's AI settings and autosave apply to this first question.
  useEffect(() => {
    if (authLoading) return
    // Continue from Sessions: reload the saved session instead of starting over.
    if (resumeId) {
      if (hasResumed.current || !user) return
      hasResumed.current = true
      supabase.from('sessions').select('*').eq('id', resumeId).eq('user_id', user.id).single().then(({ data }) => {
        if (!data) return
        const saved = Array.isArray(data.what_ifs) ? data.what_ifs : []
        const withAnswers = saved.filter((w: { question?: unknown; response?: unknown }) => w && typeof w.question === 'string' && w.response && typeof (w.response as { paragraph?: unknown }).paragraph === 'string')
        setCurrentSessionId(data.id)
        if (!event && typeof data.event_title === 'string') setResumedTitle(data.event_title)
        if (withAnswers.length > 0 && withAnswers.length === saved.length) {
          const entries: WhatIfEntry[] = withAnswers.map((w: { question: string; response: WhatIfResponse; timestamp?: number }) => ({ question: w.question, response: w.response, timestamp: w.timestamp || 0 }))
          setWhatIfs(entries)
          setActiveTimelineIdx(entries.length - 1)
          setScrollTarget(entries.length - 1)
        } else {
          // Saved before answers were stored: only the questions survive.
          setResumeNote({ questions: saved.map((w: unknown) => (typeof w === 'string' ? w : (w as { question?: string })?.question || '')).filter(Boolean) })
        }
      })
      return
    }
    if (customQ && !event && !hasAutoSubmitted.current) {
      hasAutoSubmitted.current = true
      handleAsk(customQ)
    }
  }, [authLoading, user])

  async function handleAsk(override?: string) {
    const question = (override ?? currentInput).trim()
    if (!question || loading) return
    setLoading(true)
    setAskError(null)
    setRefusal(null)
    setGate(null)
    setStreamText('')
    setPendingQuestion(question)
    setCurrentInput('')

    try {
      const previousWhatIfs = whatIfs.map(w => w.question)
      const currentWorldState = latest
        ? latest.response.keyFacts.join('. ')
        : 'History as it really happened.'

      let data: any = null
      let streamErr: { code: string; message: string } | null = null
      await streamAnswer({
        startingEvent, previousWhatIfs, currentWorldState, newQuestion: question, realFacts,
        length: normalizeLength(settings?.ai_response_style),
        depth: normalizeDepth(settings?.ai_depth),
        tone: normalizeTone(settings?.ai_tone),
        plausibility: normalizePlausibility(settings?.ai_plausibility),
        language: settings?.language || 'English',
        // The timeline can only move forward: the next answer's year must not be earlier than this.
        previousYear: latest ? parseYear(latest.response.year) : (event?.year ?? null),
      }, ev => {
        if (ev.t === 'delta') setStreamText(t => t + ev.text)
        else if (ev.t === 'done') data = { ...ev.data }
        else if (ev.t === 'error') streamErr = { code: ev.code, message: ev.message }
        else if (ev.t === 'verify') {
          // The second check runs after the answer is shown; mark the facts it could not confirm.
          setWhatIfs(list => list.map((w, i) => (i === list.length - 1 ? { ...w, response: { ...w.response, unverified: ev.unverified } } : w)))
        }
      })
      if (streamErr) throw new AiError((streamErr as { message: string }).message, (streamErr as { code: string }).code)
      if (!data || typeof data.paragraph !== 'string' || !Array.isArray(data.keyFacts)) {
        throw new Error('The answer came back in an unexpected format.')
      }

      // Off-topic questions come back as a refusal with a divergence score of 0.
      // Show the message, keep it out of the timeline, and give the question back.
      if (data.divergenceScore === 0) {
        setRefusal({ message: data.paragraph, question })
        setCurrentInput(question)
        setPendingQuestion(null)
        setLoading(false)
        return
      }

      const newEntry: WhatIfEntry = { question, response: data as WhatIfResponse, timestamp: Date.now() }
      const newWhatIfs = [...whatIfs, newEntry]
      setWhatIfs(newWhatIfs)
      setActiveTimelineIdx(newWhatIfs.length - 1)
      setScrollTarget(newWhatIfs.length - 1)
      setFreshIdx(newWhatIfs.length - 1)

      if (user) {
        try {
          const sessionData = {
            user_id: user.id,
            event_id: sessionId,
            event_title: startingEvent,
            what_ifs: newWhatIfs.map(w => ({ question: w.question, response: w.response, timestamp: w.timestamp })),
            divergence_score: data.divergenceScore || 0,
            updated_at: new Date().toISOString(),
          }
          if (currentSessionId) {
            await supabase.from('sessions').update(sessionData).eq('id', currentSessionId)
          } else {
            const { data: saved } = await supabase.from('sessions').insert(sessionData).select().single()
            if (saved) setCurrentSessionId(saved.id)
          }
        } catch (err) {
          // The answer is already on screen; a failed autosave shouldn't turn it into an error.
          console.error(err)
        }
      }
    } catch (err) {
      console.error(err)
      if (err instanceof AiError && ['sign_in_required', 'free_limit_reached', 'invalid_api_key', 'usage_unavailable'].includes(err.code)) {
        setGate({ code: err.code, message: err.message, question })
        setCurrentInput(question)
        setPendingQuestion(null)
        setLoading(false)
        return
      }
      setAskError({
        message: err instanceof Error && err.message ? err.message : 'Something went wrong while generating the answer.',
        question,
      })
      setCurrentInput(question)
    }
    setPendingQuestion(null)
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
        what_ifs: whatIfs.map(w => ({ question: w.question, response: w.response, timestamp: w.timestamp })),
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
    setSummaryError(null)
    setShowSummary(true)
    try {
      const res = await fetch('/api/summary', {
        method: 'POST',
        headers: await aiHeaders(),
        body: JSON.stringify({
          startingEvent,
          whatIfs: whatIfs.map(w => w.question),
          finalWorldState: currentResponse?.keyFacts.join('. ') || ''
        })
      })
      const data = await res.json().catch(() => null)
      if (!res.ok || !data || typeof data.title !== 'string') {
        throw new Error(data?.error || 'The summary came back in an unexpected format.')
      }
      setSummary(data)
    } catch (err) {
      console.error(err)
      setSummaryError(err instanceof Error && err.message ? err.message : 'Something went wrong while building the summary.')
    }
    setSummaryLoading(false)
  }

  // The nav logo runs its lines while an answer is being written.
  useEffect(() => {
    document.documentElement.classList.toggle('dv-thinking', loading)
    return () => document.documentElement.classList.remove('dv-thinking')
  }, [loading])

  // Seconds since the question was sent, for the waiting card.
  useEffect(() => {
    if (!loading) { setElapsed(0); return }
    const started = Date.now()
    setElapsed(0)
    const id = window.setInterval(() => setElapsed(Math.floor((Date.now() - started) / 1000)), 1000)
    return () => window.clearInterval(id)
  }, [loading])

  // Escape closes the top-most layer. Keyboard action, so no animation is added for it.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== 'Escape') return
      if (showAISettings) setShowAISettings(false)
      else if (showSummary) setShowSummary(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showAISettings, showSummary])

  // After a new answer arrives, bring its question to the top of the thread.
  useEffect(() => {
    if (scrollTarget === null) return
    document.getElementById(`ans-${scrollTarget}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setScrollTarget(null)
  }, [scrollTarget])

  // Selecting a dot (or prev/next) opens that answer and scrolls to it.
  function selectAnswer(i: number) {
    if (i < 0 || i >= whatIfs.length) return
    setActiveTimelineIdx(i)
    setOpenAnswers(m => ({ ...m, [i]: true }))
    setScrollTarget(i)
  }

  function askAboutEvent(e: (typeof ALL_EVENTS)[number]) {
    setAskedEvents(list => [...list, e.id])
    handleAsk(`What if ${e.title} (${formatEventYear(e.year)}) had unfolded differently in this timeline?`)
  }


  return (
    <div className="dv" style={{ height: 'var(--vh-fit, 100vh)' }}>
      <Nav />

      <div className="dv-bar">
        <div className="dv-ev">
          <div className="dv-ev-th"><EventImage id={event?.id} title={event?.title || 'Custom'} year={event?.year} compact /></div>
          <div>
            <b title={startingEvent}>{event?.title || 'Custom starting point'}</b>
            <span>{event ? formatEventYear(event.year) : 'Your own question'}{whatIfs.length > 0 ? ` · ${activeTimelineIdx >= 0 ? `Question ${activeTimelineIdx + 1} of ${whatIfs.length}` : 'Start'}` : ''}</span>
          </div>
        </div>
        <div className="dv-sp" />
        <button className="dv-btn" type="button" onClick={() => setShowAISettings(true)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
          AI settings
        </button>
        {whatIfs.length > 0 && (
          <button
            className="dv-btn pri"
            type="button"
            onClick={user ? handleManualSave : () => window.open('/auth', '_blank', 'noopener')}
            disabled={saving}
            title={user ? undefined : 'Opens sign in in a new tab so this session stays open'}
          >
            {!user ? 'Sign in to save' : saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save'}
          </button>
        )}
      </div>

      <div className="dv-body">
        <div className="dv-left">
          <div className="dv-thread" ref={threadRef} role="log" aria-label="Your questions and answers">
            <div className="dv-thread-in">
              {whatIfs.length === 0 && !loading && (
                <div className="dv-empty">
                  <div className="dv-empty-orb" aria-hidden="true">?</div>
                  <h2>What would have changed?</h2>
                  <p>Ask a &ldquo;what if&rdquo; about {event ? event.title : 'this moment in history'} below, or tap a suggestion in the panel on the right.</p>
                </div>
              )}

              {whatIfs.map((w, i) => {
                const r = w.response
                const open = isAnswerOpen(i)
                const prevScore = i > 0 ? whatIfs[i - 1].response.divergenceScore : 0
                const delta = r.divergenceScore - prevScore
                const c = confidenceInfo(r.uncertaintyLevel)
                return (
                  <div className={`dv-ex${activeTimelineIdx === i ? ' active' : ''}`} id={`ans-${i}`} key={i}>
                    <div className="dv-q">{w.question}</div>
                    <div className="dv-ans">
                      <button
                        type="button"
                        className="dv-ans-head"
                        aria-expanded={open}
                        aria-controls={`ans-body-${i}`}
                        onClick={() => { setOpenAnswers(m => ({ ...m, [i]: !open })); setActiveTimelineIdx(i) }}
                      >
                        <span className="dv-tags">
                          <span className="dv-tag">{r.year}</span>
                          <span className="dv-tag up">{delta >= 0 ? '+' : '−'}{Math.abs(delta)}% to {r.divergenceScore}% diverged</span>
                          <span className="dv-tag" style={{ ['--c' as string]: MOOD_COLORS[r.worldMood] || '#fff' }}><i />{moodLabel(r.worldMood)}</span>
                          {settings?.show_confidence_level !== false && (
                            <span className="dv-tag" style={{ ['--c' as string]: c.color }}><i />{c.label}</span>
                          )}
                        </span>
                        <span className={`dv-chev${open ? ' open' : ''}`} aria-hidden="true">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
                        </span>
                      </button>
                      {!open && <p className="dv-head">{firstSentence(r.paragraph)}</p>}
                      <div className={`dv-collapse${open ? ' open' : ''}`} id={`ans-body-${i}`}>
                        <div>
                          <div className={`dv-reveal${freshIdx === i ? ' go' : ''}`}><p className="dv-prose dv-para">{r.paragraph}</p></div>
                          <div className="dv-chips">
                            {r.keyFacts.map((f, k) => {
                              const key = `${i}-${k}`
                              const factOpen = !!openFacts[key]
                              const expl = r.factExplanations?.[k]
                              return (
                                <div className={`dv-chip${factOpen ? ' open' : ''}${freshIdx === i ? ' fresh' : ''}`} key={k} style={freshIdx === i ? { animationDelay: `${420 + k * 70}ms` } : undefined}>
                                  <button
                                    type="button"
                                    className="dv-chip-head"
                                    aria-expanded={factOpen}
                                    disabled={!expl}
                                    onClick={() => setOpenFacts(m => ({ ...m, [key]: !factOpen }))}
                                  >
                                    <span className="dv-chip-n">{k + 1}</span>
                                    <span className="dv-chip-t">{f}</span>
                                    {r.factTypes?.[k] && r.factTypes[k] !== 'documented' && (
                                      <span className="dv-chip-kind" title={r.factTypes[k] === 'inference' ? 'A reasoned consequence of the change, not a recorded fact' : 'A bolder possibility, not a prediction'}>{r.factTypes[k]}</span>
                                    )}
                                    {r.factTypes?.[k] === 'documented' && r.unverified?.includes(k) && (
                                      <span className="dv-chip-kind warn" title="A second check could not confirm this against the reference">unconfirmed</span>
                                    )}
                                  </button>
                                  {expl && (
                                    <div className={`dv-collapse${factOpen ? ' open' : ''}`}>
                                      <div><p className="dv-chip-x">{expl}</p></div>
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                          {r.sources && r.sources.length > 0 && (
                            <p className="dv-sources">Grounded in: {r.sources.map((src, n) => (
                              <span key={src.url}>{n > 0 && ', '}<a href={src.url} target="_blank" rel="noreferrer">{src.title} (Wikipedia)</a></span>
                            ))}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}

              {loading && (
                <div className="dv-ex" id="ans-loading">
                  {pendingQuestion && <div className="dv-q">{pendingQuestion}</div>}
                  <div className="dv-ans dv-wait" role="status" aria-live="polite">
                    <div className="dv-wait-head">
                      <svg className="dv-think" viewBox="0 0 64 40" aria-hidden="true">
                        <path className="a" pathLength={100} d="M4 23 H18 Q25 23 29 16 Q33 9 41 9 H60" />
                        <path className="b" pathLength={100} d="M4 17 H18 Q25 17 29 24 Q33 31 41 31 H60" />
                      </svg>
                      <div>
                        <b>{WAIT_STAGES[Math.min(WAIT_STAGES.length - 1, Math.floor(elapsed / 7))]}…</b>
                        <span className="dv-wait-sub">{elapsed}s · usually {WAIT_USUAL[normalizeLength(settings?.ai_response_style)]} seconds</span>
                      </div>
                    </div>
                    <div className="dv-steps" aria-hidden="true">
                      {WAIT_STAGES.map((label, i) => {
                        const stage = Math.min(WAIT_STAGES.length - 1, Math.floor(elapsed / 7))
                        return <span key={label} className={i < stage ? 'done' : i === stage ? 'now' : ''}><i />{label}</span>
                      })}
                    </div>
                    <span className="dv-bar-wait" aria-hidden="true" />
                    {streamText ? (
                      <p className="dv-prose dv-para" style={{ marginTop: 10 }}>{liveParagraph(streamText)}</p>
                    ) : (
                      <>
                        <span className="dv-skel" style={{ width: '92%' }} />
                        <span className="dv-skel" style={{ width: '84%' }} />
                        <span className="dv-skel" style={{ width: '58%' }} />
                      </>
                    )}
                  </div>
                </div>
              )}

              {resumeNote && !loading && whatIfs.length === 0 && (
                <div className="dv-note" role="status">
                  <b>Welcome back</b>
                  <p>This session was saved before answers were kept, so only your questions survived. Tap a question to ask it again and rebuild the timeline.</p>
                  <div className="dv-note-actions" style={{ flexWrap: 'wrap' }}>
                    {resumeNote.questions.map(q => (
                      <button key={q} className="dv-btn" type="button" onClick={() => { setResumeNote(null); handleAsk(q) }}>{q.length > 70 ? q.slice(0, 69) + '…' : q}</button>
                    ))}
                  </div>
                </div>
              )}

              {askError && !loading && (
                <div className="dv-note err" role="alert">
                  <b>Couldn’t get an answer</b>
                  <p>{askError.message} Your question is back in the box below.</p>
                  <div className="dv-note-actions">
                    <button className="dv-btn" type="button" onClick={() => handleAsk(askError.question)}>Try again</button>
                    <button className="dv-btn ghost" type="button" onClick={() => setAskError(null)}>Dismiss</button>
                  </div>
                </div>
              )}
              {gate && !loading && (
                <div className="dv-note" role="alert">
                  <b>{gate.code === 'free_limit_reached' ? 'You’ve used your 2 free questions' : gate.code === 'sign_in_required' ? 'Sign in to ask' : gate.code === 'invalid_api_key' ? 'That API key didn’t work' : 'Free questions unavailable'}</b>
                  <p>{gate.message}</p>
                  <form
                    className="dv-note-actions"
                    style={{ flexWrap: 'wrap' }}
                    onSubmit={e => {
                      e.preventDefault()
                      if (!keyDraft.trim()) return
                      setUserApiKey(keyDraft)
                      setKeyDraft('')
                      const q = gate.question
                      setGate(null)
                      handleAsk(q)
                    }}
                  >
                    <input
                      type="password"
                      autoComplete="off"
                      spellCheck={false}
                      value={keyDraft}
                      onChange={e => setKeyDraft(e.target.value)}
                      placeholder="sk-ant-… your Anthropic API key"
                      aria-label="Your Anthropic API key"
                      style={{ flex: '1 1 240px', minWidth: 0, padding: '9px 12px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text)', fontSize: 13 }}
                    />
                    <button className="dv-btn" type="submit" disabled={!keyDraft.trim()}>Use my key</button>
                    {!user && <button className="dv-btn ghost" type="button" onClick={() => router.push('/auth')}>Sign in</button>}
                    <button className="dv-btn ghost" type="button" disabled title="Payments are coming soon">Pay (coming soon)</button>
                  </form>
                  <p style={{ fontSize: 12, opacity: 0.7, marginTop: 8 }}>Your key stays in this browser and is sent only with your own requests. It is never saved on the server.</p>
                </div>
              )}
              {refusal && !loading && (
                <div className="dv-note" role="status">
                  <b>That one isn’t a historical what-if</b>
                  <p>{refusal.message} Edit your question below and ask again.</p>
                  <div className="dv-note-actions">
                    <button className="dv-btn ghost" type="button" onClick={() => setRefusal(null)}>Dismiss</button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="dv-dockwrap">
            <div className="dv-dock">
              <div className="dv-trackrow">
                <button className="dv-circ" type="button" aria-label="Previous answer" disabled={whatIfs.length === 0 || activeTimelineIdx <= 0} onClick={() => selectAnswer(activeTimelineIdx - 1)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
                </button>
                <div className="dv-track">
                  <button className={`dv-dot start${activeTimelineIdx === -1 ? ' now' : ''}`} type="button" aria-label="Back to the start" onClick={() => { setActiveTimelineIdx(-1); threadRef.current?.scrollTo({ top: 0, behavior: 'smooth' }) }}>Start</button>
                  {whatIfs.map((w, i) => {
                    const r = w.response
                    const c = confidenceInfo(r.uncertaintyLevel)
                    return (
                      <span key={i} style={{ display: 'contents' }}>
                        <span className={`dv-seg${i <= activeTimelineIdx ? ' on' : ''}`} />
                        <button className={`dv-dot${i === activeTimelineIdx ? ' now' : ''}`} type="button" aria-label={`Question ${i + 1}: ${w.question}`} onClick={() => selectAnswer(i)}>
                          {i + 1}
                          <span className="dv-hc" role="tooltip">
                            <span className="dv-hq">{w.question}</span>
                            <span className="dv-hs">
                              <span className="dv-tag">{r.year}</span>
                              <span className="dv-tag">{r.divergenceScore}% diverged</span>
                              <span className="dv-tag" style={{ ['--c' as string]: MOOD_COLORS[r.worldMood] || '#fff' }}><i />{moodLabel(r.worldMood)}</span>
                              <span className="dv-tag" style={{ ['--c' as string]: c.color }}><i />{c.label}</span>
                            </span>
                            <span className="dv-hl">{firstSentence(r.paragraph, 170)}</span>
                          </span>
                        </button>
                      </span>
                    )
                  })}
                </div>
                <button className="dv-circ" type="button" aria-label="Next answer" disabled={whatIfs.length === 0 || activeTimelineIdx >= whatIfs.length - 1} onClick={() => selectAnswer(activeTimelineIdx + 1)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
                </button>
                <button className="dv-btn" type="button" onClick={handleSummary} disabled={whatIfs.length === 0}>View summary</button>
              </div>
              <label className="dv-ask">
                <input
                  ref={inputRef}
                  value={currentInput}
                  onChange={e => setCurrentInput(e.target.value.slice(0, 500))}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAsk() } }}
                  placeholder="What if…"
                  aria-label="Ask a what-if question"
                  disabled={loading}
                />
                <span className="dv-cnt">{currentInput.length}/500</span>
                <button className="dv-send" type="button" aria-label="Ask Diverge" onClick={() => handleAsk()} disabled={loading || !currentInput.trim()}>
                  {loading ? <span className="dv-spin sm" aria-hidden="true" /> : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>}
                </button>
              </label>
            </div>
          </div>
        </div>

        <aside className="dv-world" aria-label="World state">
          <div className="dv-card gauge-card" style={{ ['--mood' as string]: MOOD_COLORS[mood] || '#F59E0B' }}>
            <div className="dv-gauge" style={{ ['--p' as string]: divergence }} role="img" aria-label={`${divergence}% diverged from real history`}>
              <div><b>{divergence}%</b><small>diverged</small></div>
            </div>
            <div className="dv-tags center">
              {currentYear !== '?' && <span className="dv-tag">{currentYear}</span>}
              {currentResponse ? (
                <>
                  <span className="dv-tag" style={{ ['--c' as string]: MOOD_COLORS[mood] || '#fff' }}><i />{moodLabel(mood)}</span>
                  {settings?.show_confidence_level !== false && (
                    <span className="dv-tag" style={{ ['--c' as string]: confidenceInfo(currentResponse.uncertaintyLevel).color }}><i />{confidenceInfo(currentResponse.uncertaintyLevel).label}</span>
                  )}
                </>
              ) : (
                <span className="dv-tag">Real history</span>
              )}
            </div>
          </div>

          {suggestions.length > 0 && (
            <div className="dv-card">
              <h3>Ask next</h3>
              <div className="dv-sug">
                {suggestions.map(s => (
                  <button key={s} type="button" className="dv-sug-b" disabled={loading} onClick={() => handleAsk(s)}>{s}</button>
                ))}
              </div>
            </div>
          )}

          {meanwhile.list.length > 0 && (
            <div className="dv-card">
              <h3>Meanwhile in real history</h3>
              <p className="dv-sub">{meanwhile.near ? `Around ${currentYear}` : `Nothing recorded near ${currentYear}. The closest events:`}</p>
              <ul className="dv-list">
                {meanwhile.list.map(e => (
                  <li key={e.id}><b>{formatEventYear(e.year)}</b><span><i>{e.title}</i>{e.shortDesc}</span></li>
                ))}
              </ul>
            </div>
          )}

          {unanswered.length > 0 && (
            <div className="dv-card">
              <h3>Unanswered history</h3>
              <p className="dv-sub">Real events after {currentYear} that this timeline hasn’t touched. Tap one to ask about it.</p>
              <div className="dv-un">
                {unanswered.map(e => (
                  <button key={e.id} type="button" className="dv-un-b" disabled={loading} onClick={() => askAboutEvent(e)}>
                    <b>{formatEventYear(e.year)}</b>{e.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="dv-card">
            <h3>Real timeline{event ? ` · ${formatEventYear(event.year)}` : ''}</h3>
            <div className="dv-ph">
              <EventImage key={event?.id || 'custom'} id={event?.id} title={event?.title || 'Custom starting point'} year={event?.year} imgStyle={{ filter: 'brightness(0.75) saturate(0.8)' }} />
            </div>
            <p className="dv-prose soft">{event?.fullDesc || CUSTOM_START_COPY}</p>
            <ul className="dv-facts">
              {realFacts.map(f => <li key={f}>{f}</li>)}
            </ul>
          </div>

        </aside>
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
            style={{ background: 'var(--nav-bg)', border: '1px solid var(--border-color)', borderRadius: 20, padding: 32, maxWidth: 680, width: '100%', maxHeight: 'calc(88vh / var(--ui-scale, 1))', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}
          >
            <button onClick={() => setShowSummary(false)} style={{ float: 'right', background: 'var(--card-bg)', border: 'none', color: 'var(--text-dim)', width: 28, height: 28, borderRadius: '50%', cursor: 'pointer', fontSize: 14 }}>×</button>

            {summaryLoading ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', border: '2px solid var(--border-color)', borderTopColor: 'var(--accent)', animation: 'spin 0.8s linear infinite', margin: '0 auto 14px' }} />
                <div style={{ color: 'var(--text-dim)', fontSize: 14 }}>Building your alternate timeline...</div>
              </div>
            ) : summaryError ? (
              <div role="alert" style={{ textAlign: 'center', padding: '48px 0 24px' }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Couldn’t build the summary</div>
                <div style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.6, marginBottom: 18 }}>{summaryError}</div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                  <button onClick={handleSummary} style={{ ...btnStyle, color: 'var(--text)' }}>Try again</button>
                  <button onClick={() => setShowSummary(false)} style={{ ...btnStyle, background: 'transparent' }}>Close</button>
                </div>
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
                    Pick another event
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
              style={{ background: 'var(--nav-bg)', border: '1px solid var(--border-color)', borderRadius: 20, padding: '28px 32px', maxWidth: 460, width: '100%', maxHeight: 'calc(85vh / var(--ui-scale, 1))', overflowY: 'auto', position: 'relative' }}
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

              <div style={{ marginBottom: 26 }}>
                <AIResponseSettings showDescriptions />
              </div>

              {/* Toggles */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <AIToggle
                  label="Show confidence level"
                  value={settings?.show_confidence_level ?? true}
                  onChange={() => updateSettings({ show_confidence_level: !(settings?.show_confidence_level ?? true) })}
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