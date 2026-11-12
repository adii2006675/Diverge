'use client'
import { useState, useEffect, useRef, useLayoutEffect, useCallback, useDeferredValue, memo } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence, useReducedMotion, animate } from 'motion/react'
import Nav from '@/components/Nav'
import { ALL_EVENTS, FILTER_GROUPS, formatEventYear } from '@/lib/events'
import DualSlider from '@/components/DualSlider'
import TiltCard from '@/components/TiltCard'
import EventImage from '@/components/EventImage'
import { useT } from '@/lib/useT'
import { eventText } from '@/lib/localizeEvent'
import { translate } from '@/lib/i18n'
import type { HistoricalEvent } from '@/lib/events'
import { useBookmarks } from '@/lib/bookmarks'
import HeartButton from '@/components/HeartButton'
import { SPRING, EASE_OUT } from '@/lib/motion'

// The year slider runs from 1800 to 2026 with a tick every 50 years. The left handle sitting at 1800 means "no lower
// limit", so older events are still listed until the handle is moved to the right.
const YEAR_MAX = 2026
const START_YEAR = 1800
const SCALE_BREAKS: [number, number][] = [[START_YEAR, 0], [YEAR_MAX, 100]]
const SNAP_POINTS = [START_YEAR, 1850, 1900, 1950, 2000, YEAR_MAX]
const SLIDER_TICKS = SNAP_POINTS
// Magnetic stops: a handle within 5 years of a tick year locks onto it, and comes unlocked as soon as it is more than
// 5 years away on either side.
const SNAP_IN = 5
const SNAP_OUT = 5
function magnet(value: number, current: number): number {
  if (SNAP_POINTS.includes(current) && Math.abs(value - current) <= SNAP_OUT) return current
  const near = SNAP_POINTS.find(p => Math.abs(value - p) <= SNAP_IN)
  return near ?? value
}

// The search bar grows out from the right end of the filter bar. Opened or closed from the keyboard it just appears and
// disappears (no animation), and with reduced motion it only fades.
type BarMotion = { instant: boolean; reduce: boolean }
const SEARCH_BAR_VARIANTS = {
  hidden: (c: BarMotion) => ({ opacity: 0, scaleX: c.instant || c.reduce ? 1 : 0.2 }),
  show: (c: BarMotion) => ({ opacity: 1, scaleX: 1, transition: c.instant ? { duration: 0 } : SPRING }),
  exit: (c: BarMotion) => ({ opacity: 0, scaleX: c.instant || c.reduce ? 1 : 0.2, transition: c.instant ? { duration: 0 } : { duration: 0.2 } }),
}

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

// Where the pop-up has to be to sit exactly on a card. The whole app sits inside a wrapper with CSS zoom (it scales up on big
// screens), and a transform or height set on the pop-up is in that zoomed unit while getBoundingClientRect is in screen
// pixels, so every length from the screen is divided by the zoom (z). The pop-up is centred in a fixed, full-screen box, so
// that box's centre is where the pop-up rests.
function zoomTarget(el: HTMLElement, target: DOMRect) {
  const holder = el.parentElement as HTMLElement
  const box = holder.getBoundingClientRect()
  const z = box.width / (holder.offsetWidth || 1)
  const scale = Math.min(1, target.width / (el.offsetWidth * z))
  return {
    x: (target.left + target.width / 2 - (box.left + box.width / 2)) / z,
    y: (target.top + target.height / 2 - (box.top + box.height / 2)) / z,
    scale,
    height: Math.min(el.offsetHeight, target.height / (scale * z)),
    radius: 16 / scale,
  }
}

type CardProps = {
  event: HistoricalEvent
  idx: number
  entered: boolean
  language: string
  saved: boolean
  lifted: boolean
  onOpen: (id: string, el: HTMLElement) => void
  onToggle: (id: string) => void
}

const EventCardItem = memo(function EventCardItem({ event, idx, entered, language, saved, lifted, onOpen, onToggle }: CardProps) {
  const tr = (text: string) => translate(language, text)
  const year = event.year < 0 ? `${Math.abs(event.year)} ${tr('BC')}` : String(event.year)
  const text = eventText(language, event)
  return (
    <motion.div
      className={`event-card${lifted ? ' is-lifted' : ''}`}
      // The first load fades up in a stagger; after that, cards that appear because of a filter just fade in quickly.
      initial={entered ? { opacity: 0 } : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={entered ? { duration: 0.18 } : { duration: 0.35, delay: Math.min(idx, 11) * 0.04, ease: 'easeOut' }}
      style={{ borderRadius: 16 }}
      onClick={e => onOpen(event.id, e.currentTarget as HTMLElement)}
    >
      <TiltCard radius={16}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="ev-img" style={{ height: 130, overflow: 'hidden', position: 'relative', background: 'var(--bg)' }}>
            <EventImage key={event.id} id={event.id} title={event.title} year={event.year} loading="lazy" />
            <HeartButton saved={saved} onToggle={() => onToggle(event.id)} labelOn={tr('Remove from favorites')} labelOff={tr('Add to favorites')} />
            <div className="ev-badge" style={{ position: 'absolute', top: 10, left: 12 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.1em', background: 'var(--bg)', padding: '2px 7px', borderRadius: 4 }}>
                {tr(event.era).toUpperCase()} · {year}
              </span>
            </div>
          </div>
          <div className="ev-body" style={{ padding: '12px 14px 14px' }}>
            <div className="ev-title" style={{ fontSize: 'var(--font-scale)', fontWeight: 700, marginBottom: 5, color: 'var(--text)' }}>{text.title}</div>
            <div className="ev-desc" style={{ fontSize: 'var(--font-scale)', color: 'var(--text-dim)', lineHeight: 1.6, marginBottom: 0 }}>{text.shortDesc}</div>
          </div>
        </div>
      </TiltCard>
    </motion.div>
  )
})

export default function ExplorePage() {
  const router = useRouter()
  const { t, language } = useT()
  const fmtYear = (y: number) => (y < 0 ? `${Math.abs(y)} ${t('BC')}` : String(y))
  const reduce = useReducedMotion()
  // Several eras can be on at once. An empty list means "All".
  const [selectedEras, setSelectedEras] = useState<string[]>([])
  const isOn = (era: string) => (era === 'All' ? selectedEras.length === 0 : selectedEras.includes(era))
  function toggleEra(era: string) {
    if (era === 'All') return setSelectedEras([])
    setSelectedEras(list => (list.includes(era) ? list.filter(x => x !== era) : [...list, era]))
  }
  const [yearMin, setYearMin] = useState(START_YEAR)
  const [yearMax, setYearMax] = useState(YEAR_MAX)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  // The pop-up zooms out of the card that was clicked and back into it when closed. (Giving every card a shared layout id
  // made cards fly around whenever the list changed, so the zoom is done by hand.)
  const modalRef = useRef<HTMLDivElement>(null)
  const fromRect = useRef<DOMRect | null>(null)
  const fromEl = useRef<HTMLElement | null>(null)
  const zoomBack = useRef<{ x: number; y: number; scale: number; height: number; radius: number } | null>(null)
  const [closing, setClosing] = useState(false)
  // Near the end of closing the real card fades back in underneath the pop-up as it fades out.
  const [revealing, setRevealing] = useState(false)
  // Escape closes the pop-up with no animation (keyboard actions never animate); clicking Back or the backdrop zooms it home.
  const [kbClose, setKbClose] = useState(false)
  const openCard = useCallback((id: string, el: HTMLElement) => { fromEl.current = el; fromRect.current = el.getBoundingClientRect(); setClosing(false); setRevealing(false); setKbClose(false); setExpandedId(id) }, [])
  function closeCard() {
    const el = modalRef.current
    const stored = zoomBack.current
    if (!el || !stored || reduce || closing) { setExpandedId(null); return }
    setClosing(true)
    // Measure the card where it is right now, not where it was when the pop-up opened.
    const cardNow = fromEl.current && fromEl.current.isConnected ? fromEl.current.getBoundingClientRect() : null
    const back = cardNow ? zoomTarget(el, cardNow) : stored
    // The pop-up is taller than the card (full description and buttons), so as it travels home it also gets shorter: the
    // bottom half is clipped away until it is exactly the card's shape. The real card fades in underneath near the end.
    el.style.overflowY = 'hidden'
    window.setTimeout(() => setRevealing(true), 170)
    const to = { duration: 0.3, ease: EASE_OUT }
    animate(el, { opacity: [1, 1, 0] }, { duration: 0.3, times: [0, 0.7, 1], ease: 'linear' })
    animate(el, { height: [el.offsetHeight, back.height], borderRadius: [20, back.radius] }, to)
    animate(el, { x: back.x, y: back.y, scale: back.scale }, to).then(() => { setExpandedId(null); setClosing(false) })
  }
  const [query, setQuery] = useState('')
  const [savedOnly, setSavedOnly] = useState(false)
  const bookmarks = useBookmarks()
  const searchRef = useRef<HTMLInputElement>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchInstant, setSearchInstant] = useState(false)
  const barMotion = { instant: searchInstant, reduce: !!reduce }
  function openSearch(viaKeyboard: boolean) { setSearchInstant(viaKeyboard); setSearchOpen(true); window.setTimeout(() => searchRef.current?.focus(), 0) }
  function closeSearch(viaKeyboard: boolean) { setSearchInstant(viaKeyboard); setQuery(''); setSearchOpen(false) }
  const needle = query.trim().toLowerCase()
  // The handles follow the pointer immediately; the card list catches up a moment later so dragging stays smooth.
  const filterMin = useDeferredValue(yearMin)
  const filterMax = useDeferredValue(yearMax)
  const [entered, setEntered] = useState(false)
  useEffect(() => { const id = window.setTimeout(() => setEntered(true), 1600); return () => window.clearTimeout(id) }, [])
  const bookmarkSet = new Set(bookmarks.ids)
  const filtersActive = selectedEras.length > 0 || yearMin > START_YEAR || yearMax < YEAR_MAX || needle !== '' || savedOnly
  function clearFilters() { setSelectedEras([]); setYearMin(START_YEAR); setYearMax(YEAR_MAX); setQuery(''); setSavedOnly(false) }

  const filtered = ALL_EVENTS.filter(e => {
    const eraMatch = selectedEras.length === 0 || FILTER_GROUPS.some(g => selectedEras.includes(g.label) && g.eras.includes(e.era))
    const yearMatch = (filterMin <= START_YEAR || e.year >= filterMin) && e.year <= filterMax
    if (!eraMatch || !yearMatch) return false
    if (savedOnly && !bookmarks.has(e.id)) return false
    if (!needle) return true
    const local = eventText(language, e)
    return [e.title, e.shortDesc, local.title, local.shortDesc, e.era, fmtYear(e.year), String(e.year)].some(f => f.toLowerCase().includes(needle))
  })

  const expandedEvent = filtered.find(e => e.id === expandedId) || ALL_EVENTS.find(e => e.id === expandedId)

  useLayoutEffect(() => {
    const el = modalRef.current
    const from = fromRect.current
    if (!expandedId || !el) return
    if (!from || reduce) { zoomBack.current = null; animate(el, { opacity: [0, 1] }, { duration: 0.2 }); return }
    const g = zoomTarget(el, from)
    const natural = el.offsetHeight
    zoomBack.current = g
    el.style.overflowY = 'hidden'
    animate(el, { x: [g.x, 0], y: [g.y, 0], scale: [g.scale, 1], opacity: [0.2, 1] }, SPRING)
    animate(el, { height: [g.height, natural], borderRadius: [g.radius, 20] }, SPRING).then(() => { el.style.height = ''; el.style.overflowY = 'auto' })
  }, [expandedId, reduce])

  // "/" opens the search bar. Keyboard action, so nothing animates.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey || expandedId) return
      const t = e.target as HTMLElement | null
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return
      e.preventDefault()
      openSearch(true)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [expandedId])

  useEffect(() => {
    if (!expandedId) return
    function onKey(e: KeyboardEvent) {
      if (e.key !== 'Escape') return
      e.preventDefault()
      setKbClose(true)
      setClosing(false)
      setExpandedId(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [expandedId])

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
      <div className="ex-hero" style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '120px 40px 48px' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 style={{ fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 12 }}>
            {t('Explore history')}
          </h1>
          <p style={{ fontSize: 'var(--font-scale)', color: 'var(--text-dim)', marginBottom: 40 }}>
            {t('A list of major world events')}
          </p>
        </motion.div>

        {/* The filters and the year slider share one width, so 1800 sits under the first filter and 2026 under the last. */}
        <div className="ex-bar" style={{ width: 'fit-content', maxWidth: '100%', margin: '0 auto' }}>
        {/* Filters. The search icon opens a search bar that fills this whole bar. */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          style={{ position: 'relative', margin: '0 0 28px', minHeight: 44 }}
        >
          <div
            inert={searchOpen}
            className="ex-filters"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, flexWrap: 'wrap', minHeight: 44,
              opacity: searchOpen ? 0 : 1,
              transform: searchOpen && !searchInstant && !reduce ? 'scale(0.985)' : 'none',
              transition: searchInstant || reduce ? 'none' : 'opacity .22s ease, transform .32s cubic-bezier(.32,.72,0,1)',
            }}
          >
            {['All', ...FILTER_GROUPS.map(g => g.label)].map(era => (
              <button
                key={era}
                onClick={() => toggleEra(era)}
                aria-pressed={isOn(era)}
                style={{
                  padding: '7px clamp(6px, 0.75vw, 14px)', borderRadius: 999, cursor: 'pointer', fontFamily: 'inherit',
                  border: `1px solid ${isOn(era) ? 'var(--accent)' : 'var(--border-color)'}`,
                  background: isOn(era) ? 'color-mix(in srgb, var(--accent) 12%, transparent)' : 'transparent',
                  color: isOn(era) ? 'var(--accent)' : 'var(--text-dim)',
                  fontSize: 'var(--font-scale)', fontWeight: 500, transition: 'all 0.18s',
                }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLButtonElement; el.style.fontSize = 'calc(var(--font-scale) * 1.08)'; el.style.color = isOn(era) ? 'var(--accent)' : 'var(--text)' }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.fontSize = 'var(--font-scale)'; el.style.color = isOn(era) ? 'var(--accent)' : 'var(--text-dim)' }}
              >
                {t(era)}
              </button>
            ))}
            <button
              type="button"
              className="fav-chip"
              onClick={() => setSavedOnly(v => !v)}
              aria-pressed={savedOnly}
              aria-label={t('Favorites') + (bookmarks.ids.length > 0 ? ` (${bookmarks.ids.length})` : '')}
              title={t('Favorites') + (bookmarks.ids.length > 0 ? ` (${bookmarks.ids.length})` : '')}
            >
              <svg viewBox="0 0 24 24" fill={savedOnly ? 'var(--heart)' : 'none'} stroke={savedOnly ? 'var(--heart)' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21.2l7.8-7.7 1-1.1a5.5 5.5 0 0 0 0-7.8z" /></svg>
            </button>
            <button
              type="button"
              className="fav-chip"
              onClick={() => openSearch(false)}
              aria-label={t('Search events…')}
              aria-keyshortcuts="/"
              title={t('Search events…') + ' (/)'}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
            </button>
          </div>

          <AnimatePresence custom={barMotion}>
            {searchOpen && (
              <motion.div
                key="searchbar"
                className="explore-searchbar"
                style={{ transformOrigin: 'right center' }}
                custom={barMotion}
                variants={SEARCH_BAR_VARIANTS}
                initial="hidden"
                animate="show"
                exit="exit"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
                <input
                  ref={searchRef}
                  autoFocus
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value.slice(0, 80))}
                  onKeyDown={e => { if (e.key === 'Escape') { e.preventDefault(); closeSearch(true) } }}
                  placeholder={t('Search events…')}
                  aria-label={t('Search events…')}
                  autoComplete="off"
                  spellCheck={false}
                />
                <button type="button" aria-label={t('Close search')} title={t('Close search')} onClick={() => closeSearch(false)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Dual slider */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          style={{ width: '100%', padding: '0 9px', boxSizing: 'border-box' }}
        >
          <DualSlider
            min={START_YEAR}
            max={YEAR_MAX}
            toPct={yearToPct}
            fromPct={pctToYear}
            ticks={SLIDER_TICKS}
            format={y => fmtYear(Math.round(y))}
            valueMin={yearMin}
            valueMax={yearMax}
            snap={magnet}
            onChangeMin={v => setYearMin(Math.max(v, START_YEAR))}
            onChangeMax={v => setYearMax(Math.max(v, START_YEAR))}
          />
        </motion.div>
        </div>
      </div>

      {/* Cards grid */}
      <div className="ex-wrap" style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto', padding: '0 40px 80px' }}>
        {filtered.length > 0 && (
          <div role="status" aria-live="polite" style={{ textAlign: 'center', margin: '-8px 0 14px', color: 'var(--text-dim)', fontSize: 'calc(var(--font-scale) * 0.9)' }}>
            {filtered.length} {t(filtered.length === 1 ? 'event' : 'events')}
          </div>
        )}
        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            role="status"
            style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-dim)', fontSize: 'var(--font-scale)' }}
          >
            <div>{savedOnly && bookmarks.ids.length === 0 ? t('No favorites yet. Tap the heart on an event to add one.') : t('No events match your filters')}</div>
            {filtersActive && (
              <button type="button" className="modal-btn" onClick={clearFilters} style={{ marginTop: 16, padding: '9px 18px', borderRadius: 999, border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text)', fontSize: 'var(--font-scale)', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                {t('Clear filters')}
              </button>
            )}
          </motion.div>
        ) : (
          <div className="ex-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {filtered.map((event, idx) => (
              <EventCardItem
                key={event.id}
                event={event}
                idx={entered ? 0 : idx}
                entered={entered}
                language={language}
                saved={bookmarkSet.has(event.id)}
                lifted={expandedId === event.id && !revealing}
                onOpen={openCard}
                onToggle={bookmarks.toggle}
              />
            ))}
          </div>
        )}
      </div>

      {/* Expanded modal */}
      <AnimatePresence custom={kbClose}>
        {expandedEvent && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: closing ? 0 : 1 }}
              variants={{ hide: (instant: boolean) => ({ opacity: 0, transition: { duration: instant ? 0 : 0.25 } }) }}
              custom={kbClose}
              exit="hide"
              transition={{ duration: closing ? 0.3 : 0.25 }}
              onClick={closeCard}
              style={{
                position: 'fixed', inset: 0, zIndex: 100,
                background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
              }}
            />
            <div style={{ position: 'fixed', inset: 0, zIndex: 101, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, pointerEvents: 'none' }}>
              <motion.div
                ref={modalRef}
                className="event-card always-trace"
                variants={{ hide: (instant: boolean) => ({ opacity: 0, transition: { duration: instant ? 0 : 0.12 } }) }}
                custom={kbClose}
                exit="hide"
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
                        {t(expandedEvent.era).toUpperCase()} · {fmtYear(expandedEvent.year)}
                      </span>
                    </div>
                  </div>
                  <div style={{ padding: '20px 24px 24px' }}>
                    <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 12, color: 'var(--text)' }}>{eventText(language, expandedEvent).title}</div>
                    <div style={{ fontSize: 14, color: 'var(--text-dim)', lineHeight: 1.7, marginBottom: 24 }}>
                      {eventText(language, expandedEvent).fullDesc}
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button
                        className="modal-btn"
                        onClick={closeCard}
                        style={{ flex: 1, padding: '12px', borderRadius: 10, border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-dim)', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}
                        onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent)'}
                        onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-color)'}
                      >
                        {t('Back')}
                      </button>
                      <button
                        className="modal-btn modal-btn-go"
                        onClick={() => router.push(`/diverge/${expandedEvent.id}`)}
                        style={{ flex: 1, padding: '12px', borderRadius: 10, border: 'none', background: 'var(--accent)', color: 'var(--on-accent, #fff)', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
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