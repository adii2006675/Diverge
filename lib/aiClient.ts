// Browser-side helpers for calling the AI routes: auth + optional user API key headers, and the NDJSON stream reader.
import { supabase } from '@/lib/supabase'

const KEY_STORAGE = 'diverge_user_api_key'

export function getUserApiKey(): string {
  try { return localStorage.getItem(KEY_STORAGE) || '' } catch { return '' }
}
export function setUserApiKey(key: string) {
  try { key ? localStorage.setItem(KEY_STORAGE, key.trim()) : localStorage.removeItem(KEY_STORAGE) } catch { /* private mode */ }
}

export async function aiHeaders(): Promise<Record<string, string>> {
  const h: Record<string, string> = { 'Content-Type': 'application/json' }
  const key = getUserApiKey()
  if (key) h['x-user-api-key'] = key
  try {
    const { data } = await supabase.auth.getSession()
    if (data.session?.access_token) h['Authorization'] = `Bearer ${data.session.access_token}`
  } catch { /* guests have no session */ }
  return h
}

export class AiError extends Error {
  code: string
  constructor(message: string, code = 'error') { super(message); this.code = code }
}

export type StreamEvent =
  | { t: 'delta'; text: string }
  | { t: 'done'; data: Record<string, unknown>; meta?: unknown }
  | { t: 'verify'; unverified: number[] }
  | { t: 'error'; code: string; message: string }

/** Reads the route's newline-delimited JSON stream, calling onEvent for each line. Throws AiError for gate/HTTP errors. */
export async function streamAnswer(body: unknown, onEvent: (e: StreamEvent) => void): Promise<void> {
  const res = await fetch('/api/diverge', { method: 'POST', headers: await aiHeaders(), body: JSON.stringify(body) })
  if (!res.ok || !res.body) {
    const j = await res.json().catch(() => null)
    throw new AiError(j?.error || j?.message || 'The answer could not be generated.', j?.code || 'error')
  }
  const reader = res.body.getReader()
  const dec = new TextDecoder()
  let buf = ''
  for (;;) {
    const { value, done } = await reader.read()
    if (done) break
    buf += dec.decode(value, { stream: true })
    let nl: number
    while ((nl = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, nl).trim()
      buf = buf.slice(nl + 1)
      if (!line) continue
      try { onEvent(JSON.parse(line) as StreamEvent) } catch { /* ignore a malformed line */ }
    }
  }
}
