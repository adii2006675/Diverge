'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { ALL_EVENTS, formatEventYear } from '@/lib/events'
import { eventText, useEventText } from '@/lib/localizeEvent'
import { useT } from '@/lib/useT'
import { SPRING } from '@/lib/motion'

const OPEN_EVENT = 'diverge:open-palette'
export function openPalette() { window.dispatchEvent(new Event(OPEN_EVENT)) }

type Item = { id: string; group: 'Pages' | 'Your sessions' | 'Events'; label: string; hint: string; path: string }
type SessionRow = { id: string; event_id: string | null; event_title: string | null }

const PAGES: { label: string; path: string }[] = [
  { label: 'Home', path: '/' }, { label: 'Explore', path: '/explore' }, { label: 'Sessions', path: '/sessions' },
  { label: 'About', path: '/about' }, { label: 'Profile', path: '/profile' }, { label: 'Settings', path: '/settings' }, { label: 'Privacy', path: '/privacy' }, { label: 'Terms', path: '/terms' },
]

export default function CommandPalette() {
  const router = useRouter()
  const { user } = useAuth()
  const { t, language } = useT()
  const { eventText: et, version } = useEventText()
  const reduce = useReducedMotion()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const [sessions, setSessions] = useState<SessionRow[]>([])
  const [instantIn, setInstantIn] = useState(false)
  const [instantOut, setInstantOut] = useState(false)
  const returnFocus = useRef<HTMLElement | null>(null)

  function show(viaKeyboard: boolean) {
    setInstantIn(viaKeyboard)
    returnFocus.current = document.activeElement as HTMLElement | null
    setQuery(''); setActive(0); setOpen(true)
  }
  function hide(viaKeyboard: boolean) {
    setInstantOut(viaKeyboard)
    setOpen(false)
    window.setTimeout(() => returnFocus.current?.focus?.(), 0)
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        if (open) hide(true); else show(true)
      }
    }
    const onOpen = () => show(false)
    window.addEventListener('keydown', onKey)
    window.addEventListener(OPEN_EVENT, onOpen)
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener(OPEN_EVENT, onOpen) }
  }, [open])

  useEffect(() => {
    if (!open || !user) return
    let cancelled = false
    supabase.from('sessions').select('id,event_id,event_title').eq('user_id', user.id).order('updated_at', { ascending: false }).limit(25)
      .then(({ data }) => { if (!cancelled && data) setSessions(data as SessionRow[]) })
    return () => { cancelled = true }
  }, [open, user])

  const items = useMemo<Item[]>(() => {
    const q = query.trim().toLowerCase()
    const match = (...fields: string[]) => !q || fields.some(f => f.toLowerCase().includes(q))
    const pages = PAGES.filter(p => match(p.label, t(p.label))).map(p => ({ id: `p-${p.path}`, group: 'Pages' as const, label: t(p.label), hint: '', path: p.path }))
    const sess = sessions.filter(s => match(s.event_title || '')).slice(0, q ? 6 : 4)
      .map(s => ({ id: `s-${s.id}`, group: 'Your sessions' as const, label: s.event_title || 'Untitled session', hint: '', path: `/diverge/${s.event_id || 'custom'}?session=${s.id}` }))
    const events = q
      ? ALL_EVENTS.filter(e => { const l = eventText(language, e); return match(e.title, l.title, e.era, String(e.year)) }).slice(0, 8)
          .map(e => ({ id: `e-${e.id}`, group: 'Events' as const, label: et(e).title, hint: formatEventYear(e.year), path: `/diverge/${e.id}` }))
      : []
    return [...pages, ...sess, ...events]
  }, [query, sessions, language, t, et, version])

  useEffect(() => {
    document.getElementById(`cp-opt-${active}`)?.scrollIntoView({ block: 'nearest' })
  }, [active])

  function go(item: Item | undefined) {
    if (!item) return
    hide(true)
    router.push(item.path)
  }

  function onInputKey(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(i => (items.length ? (i + 1) % items.length : 0)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(i => (items.length ? (i - 1 + items.length) % items.length : 0)) }
    else if (e.key === 'Enter') { e.preventDefault(); go(items[active]) }
    else if (e.key === 'Escape') { e.preventDefault(); hide(true) }
  }

  const t0 = { duration: 0 }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="palette"
          className="cp-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: instantIn ? t0 : { duration: 0.18 } }}
          exit={{ opacity: 0, transition: instantOut ? t0 : { duration: 0.14 } }}
          onMouseDown={() => hide(false)}
        >
          <motion.div
            className="cp-panel"
            role="dialog"
            aria-modal="true"
            aria-label={t('Search Diverge…')}
            initial={{ opacity: 0, scale: reduce || instantIn ? 1 : 0.965, y: reduce || instantIn ? 0 : -10 }}
            animate={{ opacity: 1, scale: 1, y: 0, transition: instantIn ? t0 : SPRING }}
            exit={{ opacity: 0, scale: reduce || instantOut ? 1 : 0.98, transition: instantOut ? t0 : { duration: 0.14 } }}
            onMouseDown={e => e.stopPropagation()}
          >
            <input
              autoFocus
              className="cp-input"
              value={query}
              onChange={e => { setQuery(e.target.value.slice(0, 80)); setActive(0) }}
              onKeyDown={onInputKey}
              placeholder={t('Search Diverge…')}
              aria-label={t('Search Diverge…')}
              role="combobox"
              aria-expanded="true"
              aria-controls="cp-list"
              aria-activedescendant={items[active] ? `cp-opt-${active}` : undefined}
              autoComplete="off"
              spellCheck={false}
            />
            <div className="cp-list" id="cp-list" role="listbox">
              {items.length === 0 && <div className="cp-empty">{t('No results')}</div>}
              {items.map((item, i) => (
                <div key={item.id}>
                  {(i === 0 || items[i - 1].group !== item.group) && <div className="cp-group">{t(item.group)}</div>}
                  <div
                    id={`cp-opt-${i}`}
                    role="option"
                    aria-selected={i === active}
                    className={`cp-item${i === active ? ' on' : ''}`}
                    onMouseMove={() => active !== i && setActive(i)}
                    onClick={() => go(item)}
                  >
                    <span>{item.label}</span>
                    {item.hint && <span className="cp-hint">{item.hint}</span>}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
