'use client'
import { useAskNext, useFeature } from '@/lib/askNext'
import { useT } from '@/lib/useT'
import { useAutoT } from '@/lib/autoTranslate'
import { useState, useRef, useEffect } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { ALL_EVENTS, formatEventYear } from '@/lib/events'
import { WhatIfEntry, WhatIfResponse, WorldMood } from '@/types'
import { useAuth } from '@/context/AuthContext'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { supabase } from '@/lib/supabase'
import EventImage from '@/components/EventImage'
import CountUp from '@/components/CountUp'
import TwoTimelines from '@/components/TwoTimelines'
import Nav from '@/components/Nav'
import AIResponseSettings from '@/components/AIResponseSettings'
import { streamAnswer, aiHeaders, AiError, setUserApiKey } from '@/lib/aiClient'
import { createShare, revokeShare, shareUrl } from '@/lib/share'
import { hostOf, isWikipedia } from '@/lib/sourceHost'
import { renderTimelineImage, downloadBlob } from '@/lib/exportImage'
import { normalizeLength, normalizeDepth, normalizeTone, normalizePlausibility } from '@/lib/aiSettings'
import { LOCALES, normalizeLanguage } from '@/lib/i18n'
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
type Toast = { id: number; message: string; undo?: () => void; actionLabel?: string }

// Stage 0: nothing written yet (looking up the record). 1: the paragraph is streaming. 2: key facts and explanations. 3: score, mood, year.
const WAIT_STAGES = ['Reading the historical record', 'Tracing the causes', 'Weighing the ripple effects', 'Writing your answer']
// Measured typical times for each length setting.
const WAIT_USUAL: Record<'short' | 'medium' | 'long', string> = { short: '20–25', medium: '25–40', long: '40–70' }

const CUSTOM_START_COPY =
  'This is a custom starting point, so there is no recorded timeline to compare against. Diverge will anchor its answer in documented history for this topic.'

type CustomInfo = { title: string; extract: string; image: string | null; url: string }

// Up to about 420 characters of a summary, ended on a full sentence.
function cleanSessionTitle(t: string) {
  return (t || '').replace(/\s+[-–—]\s+\d{1,4}(\s*BC)?\s*$/i, '').trim() || 'Diverge timeline'
}

function trimSummary(text: string, max = 420) {
  if (text.length <= max) return text
  const cut = text.slice(0, max)
  const end = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('! '), cut.lastIndexOf('? '))
  return end > 120 ? cut.slice(0, end + 1) : cut.replace(/\s+\S*$/, '') + '…'
}

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
  const { t } = useT()
  const { at } = useAutoT()
  const tm = (k: string, n: string | number, m: string | number = '') => t(k).replace('{n}', String(n)).replace('{m}', String(m))
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
  const [toast, setToast] = useState<Toast | null>(null)
  const toastTimer = useRef<number | null>(null)
  const toastSeq = useRef(0)
  const instantScroll = useRef(false)
  const lastShare = useRef<{ signature: string; id: string } | null>(null)
  const [sharing, setSharing] = useState(false)
  const [branching, setBranching] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [speakingIdx, setSpeakingIdx] = useState<number | null>(null)
  const speakToken = useRef(0)
  const reduceMotion = useReducedMotion()

  function showToast(message: string, undo?: () => void, actionLabel?: string) {
    if (toastTimer.current) window.clearTimeout(toastTimer.current)
    setToast({ id: ++toastSeq.current, message, undo, actionLabel })
    toastTimer.current = window.setTimeout(() => setToast(null), undo ? 8000 : 3000)
  }
  function dismissToast() {
    if (toastTimer.current) window.clearTimeout(toastTimer.current)
    setToast(null)
  }


  // A custom starting point has no entry in the event list, so once the first answer names the Wikipedia article it is
  // grounded in, the "Real timeline" card is filled from that article's public summary.
  const customSource = !event ? whatIfs.flatMap(w => w.response.sources || []).find(src => isWikipedia(src.url)) : undefined
  const [customInfo, setCustomInfo] = useState<CustomInfo | null>(null)
  const customSourceUrl = customSource?.url
  const customSourceTitle = customSource?.title
  useEffect(() => {
    if (!customSourceUrl || !customSourceTitle) return
    let live = true
    fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(customSourceTitle.replace(/ /g, '_'))}`)
      .then(r => (r.ok ? r.json() : null))
      .then(d => {
        if (!live || !d || typeof d.extract !== 'string' || !d.extract) return
        setCustomInfo({ title: d.title || customSourceTitle, extract: d.extract, image: d.thumbnail?.source || d.originalimage?.source || null, url: customSourceUrl })
      })
      .catch(() => {})
    return () => { live = false }
  }, [customSourceUrl, customSourceTitle])
  const customCardTitle = customInfo?.title || customQ || resumedTitle || 'Custom starting point'
  // One setting (Settings page, Display Options) shows or hides all four tags: year, world mood, confidence and the +N% change.
  const showTags = settings?.show_confidence_level !== false
  // How much this answer moved the divergence compared with the one before it.
  const deltaAt = (i: number) => whatIfs[i].response.divergenceScore - (i > 0 ? whatIfs[i - 1].response.divergenceScore : 0)
  const fmtDelta = (d: number) => `${d >= 0 ? '+' : '−'}${Math.abs(d)}%`
  // Clicking anywhere on an answer opens or closes it, except on the key facts, links and buttons. The hidden button
  // at the top of each answer keeps this working from the keyboard and for screen readers.
  function toggleAnswer(e: React.MouseEvent, i: number, open: boolean) {
    const hit = (e.target as HTMLElement).closest('.dv-chip, a, button')
    if (hit && !hit.classList.contains('dv-ans-head')) return
    if (window.getSelection()?.toString()) return
    setOpenAnswers(m => ({ ...m, [i]: !open }))
    setActiveTimelineIdx(i)
  }
  // The waiting card follows what the model is actually writing. The answer streams as JSON in a fixed order:
  // paragraph, then key facts and their explanations, then mood, score, year and confidence, then suggestions.
  const waitStage = !streamText ? 0
    : /"(worldMood|impact|year|uncertaintyLevel|suggestions)"\s*:/.test(streamText) ? 3
    : /"(keyFacts|factTypes|factExplanations)"\s*:/.test(streamText) ? 2
    : 1
  // Phone layout: the World panel (ring, timelines, suggestions, real history) is a sheet that slides up from the bottom.
  const [worldOpen, setWorldOpen] = useState(false)
  const sheetY = useRef<number | null>(null)
  useEffect(() => {
    if (!worldOpen) return
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setWorldOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [worldOpen])
  // Keep the current answer's dot in view when the dots row scrolls sideways (many answers on a narrow screen).
  useEffect(() => {
    const track = document.querySelector<HTMLElement>('.dv-track')
    const dot = track?.querySelector<HTMLElement>('.dv-dot.now')
    if (track && dot) track.scrollTo({ left: dot.offsetLeft - track.clientWidth / 2 + dot.clientWidth / 2, behavior: 'smooth' })
  }, [activeTimelineIdx, whatIfs.length])
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
  const unanswered = yearNow === null ? [] : ALL_EVENTS
    .filter(e => e.year > yearNow && e.id !== event?.id && !askedEvents.includes(e.id))
    .sort((a, b) => a.year - b.year)
    .slice(0, 4)
  // Optional field: the API will start returning 2-3 next questions in a later step.
  const [askNextOn, setAskNextOn] = useAskNext()
  const [whatChangedOn, setWhatChangedOn] = useFeature('whatChanged')
  const [realHistoryOn, setRealHistoryOn] = useFeature('realHistory')
  const suggestions = !askNextOn ? [] : (latest?.response.suggestions || []).filter(s => typeof s === 'string' && s.trim()).slice(0, 3)
  const startingEvent = event ? `${event.title} - ${formatEventYear(event.year)}` : resumedTitle || customQ || 'Custom starting point'

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
    dismissToast()
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
        previousScore: latest ? latest.response.divergenceScore : 0,
        suggestions: askNextOn, // off means the AI is not asked to write them, so it costs nothing
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
        message: err instanceof Error && err.message ? err.message : t('Something went wrong while generating the answer.'),
        question,
      })
      setCurrentInput(question)
    }
    setPendingQuestion(null)
    setLoading(false)
  }

  // Downloads the real history and every question and answer as a PDF. The Ask next questions are not included.
  const [downloading, setDownloading] = useState(false)
  async function handleDownloadPdf() {
    if (downloading || whatIfs.length === 0) return
    setDownloading(true)
    try {
      const { downloadChatPdf } = await import('@/lib/exportPdf')
      await downloadChatPdf({
        title: cleanSessionTitle(startingEvent),
        realTitle: event?.title || customInfo?.title || customCardTitle,
        realSummary: event ? at(event.fullDesc) : (customInfo ? at(trimSummary(customInfo.extract, 900)) : ''),
        realFacts: realFacts.map(f => at(f)),
        whatIfs,
      })
    } catch (err) {
      console.error(err)
      showToast(t('Could not make the PDF. Please try again.'))
    } finally {
      setDownloading(false)
    }
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

  // After a new answer arrives, bring its question to the top of the thread.
  useEffect(() => {
    if (scrollTarget === null) return
    const behavior: ScrollBehavior = instantScroll.current || reduceMotion ? 'instant' : 'smooth'
    document.getElementById(`ans-${scrollTarget}`)?.scrollIntoView({ behavior, block: 'start' })
    instantScroll.current = false
    setScrollTarget(null)
  }, [scrollTarget, reduceMotion])

  // Selecting a dot (or prev/next) opens that answer and scrolls to it.
  function selectAnswer(i: number, viaKeyboard = false) {
    if (i < 0 || i >= whatIfs.length) return
    instantScroll.current = viaKeyboard
    setActiveTimelineIdx(i)
    setOpenAnswers(m => ({ ...m, [i]: true }))
    setScrollTarget(i)
  }

  // Keeps the saved Supabase row in step with the timeline after a rewind or an undo.
  async function persistTimeline(list: WhatIfEntry[]) {
    if (!user || !currentSessionId) return true
    const { error } = await supabase.from('sessions').update({
      what_ifs: list.map(w => ({ question: w.question, response: w.response, timestamp: w.timestamp })),
      divergence_score: list.length > 0 ? list[list.length - 1].response.divergenceScore : 0,
      updated_at: new Date().toISOString(),
    }).eq('id', currentSessionId)
    if (error) console.error(error)
    return !error
  }

  // Cuts the on-screen timeline back to its first i + 1 answers.
  function truncateLocal(kept: WhatIfEntry[], i: number) {
    stopSpeaking()
    setWhatIfs(kept)
    setActiveTimelineIdx(i)
    setFreshIdx(null)
    setOpenAnswers(m => Object.fromEntries(Object.entries(m).filter(([k]) => Number(k) <= i)))
    setOpenFacts(m => Object.fromEntries(Object.entries(m).filter(([k]) => Number(k.split('-')[0]) <= i)))
    setAskedEvents(list => list.filter(id => {
      const e = ALL_EVENTS.find(x => x.id === id)
      return !!e && kept.some(w => w.question.startsWith(`What if ${e.title} (`))
    }))
  }

  // Drops every answer after index i so the user can continue from there. Undo puts them back.
  async function rewindTo(i: number) {
    if (loading || i < 0 || i >= whatIfs.length - 1) return
    const before = whatIfs
    const kept = before.slice(0, i + 1)
    truncateLocal(kept, i)
    showToast(tm('Rewound to question {n}. {m} removed.', i + 1, before.length - 1 - i), async () => {
      setWhatIfs(before)
      setActiveTimelineIdx(i)
      dismissToast()
      if (!(await persistTimeline(before))) showToast(t('Restored here, but the saved copy could not be updated.'))
    })
    if (!(await persistTimeline(kept))) showToast(t('Rewound here, but the saved copy could not be updated.'))
  }

  // Copies the timeline up to answer i into a new saved session and carries on there. The original stays in Sessions.
  async function branchFrom(i: number) {
    if (loading || branching || i < 0 || i >= whatIfs.length - 1) return
    if (!user) { showToast(t('Sign in to branch a timeline.')); return }
    const kept = whatIfs.slice(0, i + 1)
    setBranching(true)
    const { data, error } = await supabase.from('sessions').insert({
      user_id: user.id,
      event_id: sessionId,
      event_title: `${startingEvent} (branch)`,
      what_ifs: kept.map(w => ({ question: w.question, response: w.response, timestamp: w.timestamp })),
      divergence_score: kept[i].response.divergenceScore,
      updated_at: new Date().toISOString(),
    }).select('id').single()
    setBranching(false)
    if (error || !data) { console.error(error); showToast(t('Could not branch this timeline. Try again.')); return }
    truncateLocal(kept, i)
    setCurrentSessionId(data.id)
    window.history.replaceState(null, '', `?session=${data.id}`)
    showToast(tm('Branched from question {n}. The original is still in Sessions.', i + 1))
  }

  // Publishes a frozen copy of the timeline and copies its link. The same unchanged timeline reuses its link.
  async function handleShare() {
    if (whatIfs.length === 0 || sharing) return
    if (!user) { showToast(t('Sign in to share this timeline.')); return }
    const last = whatIfs[whatIfs.length - 1]
    const signature = `${whatIfs.length}:${last.timestamp}`
    setSharing(true)
    try {
      let id = lastShare.current?.signature === signature ? lastShare.current.id : null
      const isNew = !id
      if (!id) {
        id = await createShare({ userId: user.id, eventId: sessionId, title: startingEvent, whatIfs, divergence: last.response.divergenceScore })
        lastShare.current = { signature, id }
      }
      const link = shareUrl(id)
      let copied = true
      try { await navigator.clipboard.writeText(link) } catch { copied = false }
      const shareId = id
      showToast(
        copied ? t('Link copied. Anyone with it can read this timeline.') : `${t('Share link:')} ${link}`,
        isNew ? async () => {
          dismissToast()
          try { await revokeShare(shareId); if (lastShare.current?.id === shareId) lastShare.current = null; showToast(t('Sharing stopped. The link no longer works.')) }
          catch (err) { console.error(err); showToast(t('Could not stop sharing. Try again.')) }
        } : undefined,
        t('Stop sharing'),
      )
    } catch (err) {
      console.error(err)
      const code = (err as { code?: string } | null)?.code
      showToast(code === 'PGRST205' || code === '42P01' ? t('Sharing is not switched on for this site yet.') : t('Could not create a share link. Please try again.'))
    }
    setSharing(false)
  }

  function stopSpeaking() {
    speakToken.current++
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel()
    setSpeakingIdx(null)
  }

  // Reads an answer aloud with the browser's own voice, one sentence at a time (long utterances get cut off otherwise).
  function toggleSpeak(i: number) {
    if (!('speechSynthesis' in window)) return
    if (speakingIdx === i) { stopSpeaking(); return }
    window.speechSynthesis.cancel()
    const r = whatIfs[i]?.response
    if (!r) return
    const token = ++speakToken.current
    const text = [r.paragraph, ...r.keyFacts.map((f, k) => `Point ${k + 1}: ${f}`)].join('\n')
    const chunks = text.split(/(?<=[.!?])\s+|\n+/).map(c => c.trim()).filter(Boolean)
    const lang = LOCALES[normalizeLanguage(settings?.language)]
    chunks.forEach((chunk, k) => {
      const u = new SpeechSynthesisUtterance(chunk)
      u.lang = lang
      u.rate = 1
      const done = () => { if (speakToken.current === token && k === chunks.length - 1) setSpeakingIdx(null) }
      u.onend = done
      u.onerror = () => { if (speakToken.current === token) setSpeakingIdx(null) }
      window.speechSynthesis.speak(u)
    })
    setSpeakingIdx(i)
  }

  // Stop talking when leaving the page.
  useEffect(() => () => { if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel() }, [])

  async function handleExportImage() {
    if (!event || whatIfs.length === 0 || exporting) return
    setExporting(true)
    try {
      const blob = await renderTimelineImage({
        title: event.title,
        startYear: event.year,
        excludeEventId: event.id,
        nodes: whatIfs.map(w => ({ question: w.question, year: w.response.year, score: w.response.divergenceScore, yearNum: parseYear(w.response.year) })),
      })
      downloadBlob(blob, `diverge-${event.id}.png`)
      showToast(t('Image saved to your downloads.'))
    } catch (err) {
      console.error(err)
      showToast(t('Could not create the image.'))
    }
    setExporting(false)
  }

  async function copySummary() {
    if (!summary) return
    const rows = (summary.comparisonTable || []).map((r: { category: string; realWorld: string; alternateWorld: string }) => `- ${r.category}: ${r.realWorld} -> ${r.alternateWorld}`)
    const text = [summary.title, `Divergence: ${divergence}% from real history`, '', summary.summary, '', ...(rows.length ? ['Real world -> Your world', ...rows] : [])].join('\n')
    try {
      await navigator.clipboard.writeText(text)
      showToast('Summary copied to clipboard.')
    } catch {
      showToast('Could not copy. Select the text and copy it instead.')
    }
  }

  // Keyboard: Escape closes the top-most layer, "/" focuses the question box, "[" and "]" step through answers.
  // Keyboard actions never animate, so they scroll instantly.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        if (showAISettings) setShowAISettings(false)
        else if (showSummary) setShowSummary(false)
        else if (toast) dismissToast()
        return
      }
      if (e.metaKey || e.ctrlKey || e.altKey || showAISettings || showSummary) return
      const t = e.target as HTMLElement | null
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) return
      if (e.key === '/') {
        e.preventDefault()
        inputRef.current?.focus()
      } else if (e.key === '[' || e.key === ']') {
        const next = activeTimelineIdx + (e.key === ']' ? 1 : -1)
        if (next < 0 || next >= whatIfs.length) return
        e.preventDefault()
        selectAnswer(next, true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showAISettings, showSummary, toast, activeTimelineIdx, whatIfs.length])

  function askAboutEvent(e: (typeof ALL_EVENTS)[number]) {
    setAskedEvents(list => [...list, e.id])
    handleAsk(`What if ${e.title} (${formatEventYear(e.year)}) had unfolded differently in this timeline?`)
  }


  return (
    <div className="dv" style={{ height: 'var(--vh-fit, 100vh)' }}>
      <Nav />

      <div className="dv-bar">
        <div className="dv-ev">
          <div className="dv-ev-th">
            {!event && customInfo?.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={customInfo.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <EventImage id={event?.id} title={event?.title || 'Custom'} year={event?.year} compact />
            )}
          </div>
          <div>
            <b title={startingEvent}>{event ? at(event.title) : t('Custom starting point')}</b>
            <span>
              {event ? formatEventYear(event.year) : <i className={whatIfs.length > 0 ? 'dv-ev-lead' : undefined} style={{ fontStyle: 'normal' }}>{t('Your own question')}</i>}
              {whatIfs.length > 0 && <>{event ? ' · ' : <i className="dv-ev-lead" style={{ fontStyle: 'normal' }}> · </i>}{activeTimelineIdx >= 0 ? tm('Question {n} of {m}', activeTimelineIdx + 1, whatIfs.length) : t('Start')}</>}
            </span>
          </div>
        </div>
        <div className="dv-sp" />
        <button className="dv-btn" type="button" onClick={() => setShowAISettings(true)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
          <span className="dv-lbl">{t('AI settings')}</span>
        </button>
        {whatIfs.length > 0 && (
          <button className="dv-btn" type="button" onClick={handleShare} disabled={sharing} title={t('Copy a public link to this timeline')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" /></svg>
            <span className="dv-lbl">{sharing ? t('Sharing…') : t('Share')}</span>
          </button>
        )}
        {whatIfs.length > 0 && (
          <button
            className="dv-btn pri dv-dl"
            type="button"
            onClick={handleDownloadPdf}
            disabled={downloading}
            aria-label={t('Download this timeline as a PDF')}
            title={t('Download as PDF')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 4v11" /><path d="M7 11l5 5 5-5" /><path d="M5 20h14" /></svg>
          </button>
        )}
      </div>

      <button type="button" className="dv-strip" onClick={() => setWorldOpen(true)} aria-label={t('Open the world panel: divergence, timelines and history')}>
        <svg className="dv-ring" viewBox="0 0 46 46" aria-hidden="true">
          <circle cx="23" cy="23" r="18" fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="5" />
          <circle cx="23" cy="23" r="18" fill="none" stroke="var(--acc)" strokeWidth="5" strokeLinecap="round" strokeDasharray={`${(Math.min(100, divergence) / 100) * 113.1} 113.1`} transform="rotate(-90 23 23)" />
          <text x="23" y="27" textAnchor="middle" fill="currentColor" fontSize="11" fontWeight="800">{divergence}%</text>
        </svg>
        {showTags ? (
          <span className="dv-tags">
            {currentYear !== '?' && <span className="dv-tag">{currentYear}</span>}
            {currentResponse ? (
              <>
                <span className="dv-tag" style={{ ['--c' as string]: MOOD_COLORS[mood] || '#fff' }}><i />{t(moodLabel(mood))}</span>
                <span className="dv-tag" style={{ ['--c' as string]: confidenceInfo(currentResponse.uncertaintyLevel).color }}><i />{t(confidenceInfo(currentResponse.uncertaintyLevel).label)}</span>
              </>
            ) : (
              <span className="dv-tag">{t('Real history')}</span>
            )}
            {currentResponse && activeTimelineIdx >= 0 && <span className="dv-tag">{fmtDelta(deltaAt(activeTimelineIdx))}</span>}
          </span>
        ) : (
          <span className="dv-strip-label">{t('World')}</span>
        )}
        <svg className="chev" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 15l6-6 6 6" /></svg>
      </button>

      <div className="dv-body">
        <div className="dv-left">
          <div className="dv-thread" ref={threadRef} role="log" aria-label={t('Your questions and answers')}>
            <div className="dv-thread-in">
              {whatIfs.length === 0 && !loading && (
                <div className="dv-empty">
                  <div className="dv-empty-orb" aria-hidden="true">?</div>
                  <h2>{t('What would have changed?')}</h2>
                  <p><span className="dv-desk">{t('Ask a “what if” about {name} below, or tap a suggestion in the panel on the right.').replace('{name}', event ? at(event.title) : t('this moment in history'))}</span><span className="dv-mob">{t('Ask a “what if” about {name} below, or tap a suggestion in the world panel (tap the strip above).').replace('{name}', event ? at(event.title) : t('this moment in history'))}</span></p>
                </div>
              )}

              {whatIfs.map((w, i) => {
                const r = w.response
                const open = isAnswerOpen(i)
                return (
                  <div className={`dv-ex${activeTimelineIdx === i ? ' active' : ''}`} id={`ans-${i}`} key={i}>
                    <div className="dv-q">{w.question}</div>
                    <div className="dv-ans" onClick={e => toggleAnswer(e, i, open)}>
                      <button
                        type="button"
                        className="dv-ans-head dv-sr"
                        aria-expanded={open}
                        aria-controls={`ans-body-${i}`}
                        aria-label={open ? t('Collapse this answer') : t('Expand this answer')}
                      />
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
                                      <span className="dv-chip-kind" title={r.factTypes[k] === 'inference' ? t('A reasoned consequence of the change, not a recorded fact') : t('A bolder possibility, not a prediction')}>{t(r.factTypes[k].charAt(0).toUpperCase() + r.factTypes[k].slice(1))}</span>
                                    )}
                                    {r.factTypes?.[k] === 'documented' && r.unverified?.includes(k) && (
                                      <span className="dv-chip-kind warn" title={t('A second check could not confirm this against the reference')}>{t('unconfirmed')}</span>
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
                          <div className="dv-foot-row">
                          {r.sources && r.sources.length > 0 && (
                            <p className="dv-sources">{t('Sources:')} {r.sources.map((src, n) => (
                              <span key={src.url}>{n > 0 && ', '}<a href={src.url} target="_blank" rel="noreferrer">{src.title} ({hostOf(src.url) || t('source')})</a></span>
                            ))}</p>
                          )}
                          <div className="dv-ans-foot">
                            {typeof window !== 'undefined' && 'speechSynthesis' in window && (
                              <button
                                type="button"
                                className="dv-btn ghost sm"
                                aria-pressed={speakingIdx === i}
                                onClick={() => toggleSpeak(i)}
                                title={speakingIdx === i ? t('Stop reading') : t('Read this answer aloud')}
                              >
                                {speakingIdx === i ? (
                                  <span className="dv-wave" aria-hidden="true"><i /><i /><i /></span>
                                ) : (
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11 5L6 9H3v6h3l5 4V5z" /><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" /></svg>
                                )}
                                {speakingIdx === i ? t('Stop') : t('Listen')}
                              </button>
                            )}
                            {i < whatIfs.length - 1 && (<>
                              <button
                                type="button"
                                className="dv-btn ghost sm"
                                disabled={loading || branching}
                                onClick={() => branchFrom(i)}
                                title={t('Start a new saved timeline from this answer and keep the original')}
                              >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="6" cy="5" r="2.2" /><circle cx="6" cy="19" r="2.2" /><circle cx="18" cy="9" r="2.2" /><path d="M6 7.2v9.6M18 11.2c0 4-6 3-12 6" /></svg>
                                {branching ? t('Branching…') : t('Branch from here')}
                              </button>
                              <button
                                type="button"
                                className="dv-btn ghost sm"
                                disabled={loading}
                                onClick={() => rewindTo(i)}
                                title={t('Remove the answers after this one and continue from here')}
                              >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></svg>
                                {t('Rewind to here')}
                              </button>
                            </>)}
                          </div>
                          </div>
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
                        <b>{t(WAIT_STAGES[waitStage])}…</b>
                        <span className="dv-wait-sub">{tm('{n}s · usually {m} seconds', elapsed, WAIT_USUAL[normalizeLength(settings?.ai_response_style)])}</span>
                      </div>
                    </div>
                    <div className="dv-steps" aria-hidden="true">
                      {WAIT_STAGES.map((label, i) => {
                        return <span key={label} className={i < waitStage ? 'done' : i === waitStage ? 'now' : ''}><i />{t(label)}</span>
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
                  <b>{t('Welcome back')}</b>
                  <p>{t('This session was saved before answers were kept, so only your questions survived. Tap a question to ask it again and rebuild the timeline.')}</p>
                  <div className="dv-note-actions" style={{ flexWrap: 'wrap' }}>
                    {resumeNote.questions.map(q => (
                      <button key={q} className="dv-btn" type="button" onClick={() => { setResumeNote(null); handleAsk(q) }}>{q.length > 70 ? q.slice(0, 69) + '…' : q}</button>
                    ))}
                  </div>
                </div>
              )}

              {askError && !loading && (
                <div className="dv-note err" role="alert">
                  <b>{t('Couldn’t get an answer')}</b>
                  <p>{t(askError.message)} {t('Your question is back in the box below.')}</p>
                  <div className="dv-note-actions">
                    <button className="dv-btn" type="button" onClick={() => handleAsk(askError.question)}>{t('Try again')}</button>
                    <button className="dv-btn ghost" type="button" onClick={() => setAskError(null)}>{t('Dismiss')}</button>
                  </div>
                </div>
              )}
              {gate && !loading && (
                <div className="dv-note" role="alert">
                  <b>{gate.code === 'free_limit_reached' ? t('You’ve used your 2 free questions') : gate.code === 'sign_in_required' ? t('Sign in to ask') : gate.code === 'invalid_api_key' ? t('That API key didn’t work') : t('Free questions unavailable')}</b>
                  <p>{t(gate.message)}</p>
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
                      placeholder={t('sk-ant-… your Anthropic API key')}
                      aria-label={t('Your Anthropic API key')}
                      style={{ flex: '1 1 240px', minWidth: 0, padding: '9px 12px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text)', fontSize: 13 }}
                    />
                    <button className="dv-btn" type="submit" disabled={!keyDraft.trim()}>{t('Use my key')}</button>
                    {!user && <button className="dv-btn ghost" type="button" onClick={() => router.push('/auth')}>{t('Sign in')}</button>}
                    <button className="dv-btn ghost" type="button" disabled title={t('Payments are coming soon')}>{t('Pay (coming soon)')}</button>
                  </form>
                  <p style={{ fontSize: 12, opacity: 0.7, marginTop: 8 }}>{t('Your key stays in this browser and is sent only with your own requests. It is never saved on the server.')}</p>
                </div>
              )}
              {refusal && !loading && (
                <div className="dv-note" role="status">
                  <b>{t('That one isn’t a historical what-if')}</b>
                  <p>{refusal.message} {t('Edit your question below and ask again.')}</p>
                  <div className="dv-note-actions">
                    <button className="dv-btn ghost" type="button" onClick={() => setRefusal(null)}>{t('Dismiss')}</button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="dv-dockwrap">
            <div className="dv-dock">
              {suggestions.length > 0 && (
                <div className="dv-chiprow">
                  {suggestions.map(sg => (
                    <button key={sg} type="button" disabled={loading} onClick={() => handleAsk(sg)}>{sg}</button>
                  ))}
                </div>
              )}
              <div className="dv-trackrow">
                <button className="dv-circ" type="button" aria-label={t('Previous answer')} disabled={whatIfs.length === 0 || activeTimelineIdx <= 0} onClick={() => selectAnswer(activeTimelineIdx - 1)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
                </button>
                <div className="dv-track">
                  <button className={`dv-dot start${activeTimelineIdx === -1 ? ' now' : ''}`} type="button" aria-label={t('Back to the start')} onClick={() => { setActiveTimelineIdx(-1); threadRef.current?.scrollTo({ top: 0, behavior: 'smooth' }) }}>{t('Start')}</button>
                  {whatIfs.map((w, i) => {
                    const r = w.response
                    const c = confidenceInfo(r.uncertaintyLevel)
                    return (
                      <span key={i} style={{ display: 'contents' }}>
                        <span className={`dv-seg${i <= activeTimelineIdx ? ' on' : ''}`} />
                        <button className={`dv-dot${i === activeTimelineIdx ? ' now' : ''}`} type="button" aria-label={tm('Question {n}: {m}', i + 1, w.question)} onClick={() => selectAnswer(i)}>
                          {i + 1}
                          <span className="dv-hc" role="tooltip">
                            <span className="dv-hq">{w.question}</span>
                            {showTags && (
                              <span className="dv-hs">
                                <span className="dv-tag">{r.year}</span>
                                <span className="dv-tag">{fmtDelta(deltaAt(i))}</span>
                                <span className="dv-tag" style={{ ['--c' as string]: MOOD_COLORS[r.worldMood] || '#fff' }}><i />{moodLabel(r.worldMood)}</span>
                                <span className="dv-tag" style={{ ['--c' as string]: c.color }}><i />{c.label}</span>
                              </span>
                            )}
                          </span>
                        </button>
                      </span>
                    )
                  })}
                </div>
                <button className="dv-circ" type="button" aria-label={t('Next answer')} disabled={whatIfs.length === 0 || activeTimelineIdx >= whatIfs.length - 1} onClick={() => selectAnswer(activeTimelineIdx + 1)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
                </button>
              </div>
              <label className="dv-ask">
                <input
                  ref={inputRef}
                  value={currentInput}
                  onChange={e => setCurrentInput(e.target.value.slice(0, 500))}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAsk() } }}
                  placeholder={t('What if…')}
                  aria-label={t('Ask a what-if question')}
                  aria-keyshortcuts="/"
                  title={t('Press / to jump here')}
                  disabled={loading}
                />
                <span className="dv-cnt">{currentInput.length}/500</span>
                <button className="dv-send" type="button" aria-label={t('Ask Diverge')} onClick={() => handleAsk()} disabled={loading || !currentInput.trim()}>
                  {loading ? <span className="dv-spin sm" aria-hidden="true" /> : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>}
                </button>
              </label>
            </div>
          </div>
        </div>

        {worldOpen && <div className="dv-scrim" onClick={() => setWorldOpen(false)} />}
        <aside className={`dv-world${worldOpen ? ' open' : ''}`} aria-label={t('World state')}>
          <div
            className="dv-sheet-head"
            onTouchStart={e => { sheetY.current = e.touches[0].clientY }}
            onTouchEnd={e => { if (sheetY.current !== null && e.changedTouches[0].clientY - sheetY.current > 60) setWorldOpen(false); sheetY.current = null }}
          >
            <b>{t('World')}</b>
            <button type="button" className="dv-circ" aria-label={t('Close the world panel')} onClick={() => setWorldOpen(false)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>
          </div>
          <div className="dv-card gauge-card" style={{ ['--mood' as string]: MOOD_COLORS[mood] || '#F59E0B' }}>
            <div className="dv-gauge" style={{ ['--p' as string]: divergence }} role="img" aria-label={tm('{n}% diverged from real history', divergence)}>
              <div><b><CountUp value={divergence} />%</b><small>{t('diverged')}</small></div>
            </div>
            {showTags && <div className="dv-tags center">
                {currentYear !== '?' && <span className="dv-tag">{currentYear}</span>}
                {currentResponse ? (
                  <>
                    <span className="dv-tag" style={{ ['--c' as string]: MOOD_COLORS[mood] || '#fff' }}><i />{t(moodLabel(mood))}</span>
                    <span className="dv-tag" style={{ ['--c' as string]: confidenceInfo(currentResponse.uncertaintyLevel).color }}><i />{t(confidenceInfo(currentResponse.uncertaintyLevel).label)}</span>
                  </>
                ) : (
                  <span className="dv-tag">{t('Real history')}</span>
                )}
              {currentResponse && activeTimelineIdx >= 0 && <span className="dv-tag">{fmtDelta(deltaAt(activeTimelineIdx))}</span>}
            </div>}
          </div>

          {event && whatIfs.length > 0 && (
            <TwoTimelines
              startYear={event.year}
              excludeEventId={event.id}
              onExport={handleExportImage}
              exporting={exporting}
              nodes={whatIfs.map(w => ({ question: w.question, year: w.response.year, score: w.response.divergenceScore, yearNum: parseYear(w.response.year) }))}
              activeIdx={activeTimelineIdx}
              onSelect={i => { setWorldOpen(false); selectAnswer(i) }}
              onSelectStart={() => { setWorldOpen(false); setActiveTimelineIdx(-1); threadRef.current?.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }) }}
            />
          )}

          {whatChangedOn && whatIfs.length > 0 && (
            <div className="dv-card">
              <h3>{t('What changed')}</h3>
              <p className="dv-sub">{t('How this timeline differs from real history, one line per answer. Tap one to jump to it.')}</p>
              <div className="dv-chg">
                {whatIfs.map((w, i) => (
                  <button key={i} type="button" className={`dv-chg-b${i === activeTimelineIdx ? ' on' : ''}`} onClick={() => { setWorldOpen(false); selectAnswer(i) }}>
                    <b>{w.response.year}</b><span>{w.response.keyFacts?.[0] || w.question}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {unanswered.length > 0 && (
            <div className="dv-card">
              <h3>{t('Unanswered history')}</h3>
              <p className="dv-sub">{tm('Real events after {n} that this timeline hasn’t touched. Tap one to ask about it.', currentYear)}</p>
              <div className="dv-un">
                {unanswered.map(e => (
                  <button key={e.id} type="button" className="dv-un-b" disabled={loading} onClick={() => { setWorldOpen(false); askAboutEvent(e) }}>
                    <b>{formatEventYear(e.year)}</b>{at(e.title)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {realHistoryOn && (
            <div className="dv-card">
              <h3>{event ? tm('Real timeline · {n}', formatEventYear(event.year)) : customInfo ? tm('Real history · {n}', customInfo.title) : t('Real history')}</h3>
              <div className="dv-ph">
                {!event && customInfo?.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={customInfo.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.75) saturate(0.8)' }} />
                ) : (
                  <EventImage key={event?.id || 'custom'} id={event?.id} title={event?.title || t(customCardTitle)} year={event?.year} imgStyle={{ filter: 'brightness(0.75) saturate(0.8)' }} />
                )}
              </div>
              <p className="dv-prose soft">
                {event ? at(event.fullDesc) : (customInfo ? at(trimSummary(customInfo.extract)) : whatIfs.length === 0 ? t('Ask a what-if and the real history behind it will show up here.') : t(CUSTOM_START_COPY))}
              </p>
              {!event && customInfo && (
                <p className="dv-sources" style={{ marginTop: '.6em' }}><a href={customInfo.url} target="_blank" rel="noreferrer">{t('Read more on Wikipedia')}</a></p>
              )}
              <ul className="dv-facts">
                {realFacts.map(f => <li key={f}>{at(f)}</li>)}
              </ul>
            </div>
          )}

        </aside>
      </div>

      {/* Summary modal */}
      <AnimatePresence>
        {showSummary && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          onClick={() => setShowSummary(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            style={{ background: 'var(--surface)', border: '1px solid var(--border-color)', borderRadius: 20, padding: 32, maxWidth: 680, width: '100%', maxHeight: 'calc(88vh / var(--ui-scale, 1))', overflowY: 'auto' }}
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
                  <button onClick={handleSummary} style={{ ...btnStyle, color: 'var(--text)' }}>{t('Try again')}</button>
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
                  <button onClick={copySummary} style={{ flex: 1, padding: '11px', borderRadius: 9, border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text)', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                    Copy summary
                  </button>
                  <button onClick={() => setShowSummary(false)} style={{ flex: 1, padding: '11px', borderRadius: 9, border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text)', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                    Keep Exploring
                  </button>
                  <button onClick={() => router.push('/')} style={{ flex: 1, padding: '11px', borderRadius: 9, border: 'none', background: 'var(--accent)', color: 'var(--on-accent, #fff)', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
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
            style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
            onClick={() => setShowAISettings(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ type: 'spring', stiffness: 320, damping: 30 }}
              style={{ background: 'var(--surface)', border: '1px solid var(--border-color)', borderRadius: 20, padding: '28px 32px', maxWidth: 460, width: '100%', maxHeight: 'calc(85vh / var(--ui-scale, 1))', overflowY: 'auto', position: 'relative' }}
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setShowAISettings(false)}
                style={{ position: 'absolute', top: 16, left: 16, background: 'var(--card-bg)', border: 'none', color: 'var(--text-dim)', width: 28, height: 28, borderRadius: '50%', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                ×
              </button>

              <div style={{ textAlign: 'center', marginTop: 12, marginBottom: 24 }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)' }}>{t('AI Settings')}</div>
              </div>

              <div style={{ marginBottom: 22 }}>
                <AIResponseSettings showDescriptions />
              </div>

              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 10 }}>{t('Features')}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <AIToggle
                  label={t('Ask next questions')}
                  info={t('Two or three follow-up what-if questions you can tap after each answer.')}
                  value={askNextOn}
                  onChange={() => setAskNextOn(!askNextOn)}
                />
                <AIToggle
                  label={t('What changed')}
                  info={t('A card in the World panel with one line per answer, showing how your timeline differs from real history.')}
                  value={whatChangedOn}
                  onChange={() => setWhatChangedOn(!whatChangedOn)}
                />
                <AIToggle
                  label={t('Real history')}
                  info={t('A card in the World panel with the real event\'s picture, summary and key facts, to compare against your alternate timeline.')}
                  value={realHistoryOn}
                  onChange={() => setRealHistoryOn(!realHistoryOn)}
                />
                {/* The same setting as Settings, Display Options */}
                <AIToggle
                  label={t('Answer tags')}
                  info={t('Small labels on each answer: the year, world mood, how confident the AI is, and the % change from the last answer.')}
                  value={showTags}
                  onChange={() => updateSettings({ show_confidence_level: !showTags })}
                />
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="dv-toast-wrap" aria-live="polite" role="status">
        <AnimatePresence>
          {toast && (
            <motion.div
              key={toast.id}
              className="dv-toast"
              initial={{ opacity: 0, y: reduceMotion ? 0 : 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduceMotion ? 0 : 6 }}
              transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
            >
              <span>{toast.message}</span>
              {toast.undo && <button type="button" onClick={toast.undo}>{toast.actionLabel || 'Undo'}</button>}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

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

function AIToggle({ label, info, value, onChange }: { label: string; info?: string; value: boolean; onChange: () => void }) {
  const { t } = useT()
  return (
    <div
      role="switch"
      aria-checked={value}
      tabIndex={0}
      onClick={onChange}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onChange() } }}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--card-bg)', cursor: 'pointer' }}
    >
      <span style={{ fontSize: 13, color: 'var(--text)', display: 'inline-flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
        {label}
        {info && <button type="button" className="dv-info" aria-label={t('About {n}').replace('{n}', label)} data-tip={info} onClick={e => e.stopPropagation()} onKeyDown={e => e.stopPropagation()}><svg viewBox="0 0 16 16" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden="true"><circle cx="8" cy="8" r="6.6" /><path d="M8 7.2v3.6" /><circle cx="8" cy="4.9" r=".5" fill="currentColor" /></svg></button>}
      </span>
      <div style={{
        width: 40, height: 22, borderRadius: 99, flexShrink: 0,
        background: value ? 'var(--accent)' : 'var(--border-color)',
        position: 'relative', transition: 'background 0.2s',
      }}>
        <div style={{
          position: 'absolute', top: 2, left: value ? 20 : 2,
          width: 18, height: 18, borderRadius: '50%', background: 'var(--on-accent, #fff)',
          transition: 'left 0.2s',
        }} />
      </div>
    </div>
  )
}
