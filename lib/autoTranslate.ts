'use client'
import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { normalizeLanguage } from '@/lib/i18n'
import { getUserApiKey } from '@/lib/aiClient'

// Long text that isn't in the hand-written dictionary (About, Terms, Privacy, event titles and descriptions) is translated by the
// server the first time it is needed, then kept in this browser. Until it arrives the English text is shown.
const STORE = 'diverge.tr.v1.'
const BATCH_CHARS = 20000
const BATCH_TEXTS = 60

type Lang = string
const mem = new Map<Lang, Map<string, string>>()
const pending = new Map<Lang, Set<string>>()
const inFlight = new Set<string>()
const failedAt = new Map<Lang, number>()
const listeners = new Set<() => void>()
let timer: ReturnType<typeof setTimeout> | null = null

function hash(text: string) {
  let h = 2166136261
  for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619) }
  return (h >>> 0).toString(36) + '.' + text.length
}

function table(lang: Lang) {
  let m = mem.get(lang)
  if (!m) {
    m = new Map()
    try {
      const raw = window.localStorage.getItem(STORE + lang)
      if (raw) for (const [k, v] of Object.entries(JSON.parse(raw) as Record<string, string>)) m.set(k, v)
    } catch { /* storage unavailable: translations just won't persist */ }
    mem.set(lang, m)
  }
  return m
}

function persist(lang: Lang) {
  try { window.localStorage.setItem(STORE + lang, JSON.stringify(Object.fromEntries(table(lang)))) } catch { /* full or blocked */ }
}

async function flush() {
  timer = null
  for (const [lang, set] of pending) {
    if (set.size === 0) continue
    if (Date.now() - (failedAt.get(lang) || 0) < 60000) { set.clear(); continue }
    const texts = [...set].filter(t => !inFlight.has(lang + '|' + t))
    set.clear()
    // Split into requests the server accepts.
    const batches: string[][] = []
    let cur: string[] = []; let size = 0
    for (const t of texts) {
      if (cur.length >= BATCH_TEXTS || (cur.length > 0 && size + t.length > BATCH_CHARS)) { batches.push(cur); cur = []; size = 0 }
      cur.push(t); size += t.length
    }
    if (cur.length) batches.push(cur)
    for (const batch of batches) {
      batch.forEach(t => inFlight.add(lang + '|' + t))
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      const key = getUserApiKey()
      if (key) headers['x-user-api-key'] = key
      fetch('/api/translate', { method: 'POST', headers, body: JSON.stringify({ language: lang, texts: batch }) })
        .then(r => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
        .then((d: { translations?: string[] }) => {
          const m = table(lang)
          batch.forEach((t, i) => { const out = d.translations?.[i]; if (out) m.set(hash(t), out) })
          persist(lang)
          listeners.forEach(l => l())
        })
        .catch(() => { failedAt.set(lang, Date.now()) })
        .finally(() => batch.forEach(t => inFlight.delete(lang + '|' + t)))
    }
  }
}

function want(lang: Lang, text: string) {
  let set = pending.get(lang)
  if (!set) { set = new Set(); pending.set(lang, set) }
  set.add(text)
  if (!timer) timer = setTimeout(flush, 80)
}

/** at('English text') gives the text in the chosen language once it has been translated, and the English text until then. */
export function useAutoT() {
  const { settings } = useAuth()
  const language = normalizeLanguage(settings?.language)
  const [version, bump] = useState(0)
  useEffect(() => {
    const l = () => bump(n => n + 1)
    listeners.add(l)
    return () => { listeners.delete(l) }
  }, [])
  const at = useCallback((text: string | undefined | null): string => {
    if (!text) return text || ''
    if (language === 'English' || typeof window === 'undefined') return text
    const hit = table(language).get(hash(text))
    if (hit) return hit
    if (!inFlight.has(language + '|' + text)) want(language, text)
    return text
  }, [language])
  return { at, language, version }
}
