// Server-only helpers shared by the AI routes: who is calling, free-question gate, burst limits,
// and Wikipedia grounding. Never import this from client code.
import Anthropic from '@anthropic-ai/sdk'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { NextRequest } from 'next/server'

export const FREE_QUESTIONS = 2

export type Caller =
  | { kind: 'user-key'; client: Anthropic }
  | { kind: 'account'; client: Anthropic; token: string; db: SupabaseClient }

export type GateError = { status: number; code: string; message: string }

function bearer(req: NextRequest): string | null {
  const h = req.headers.get('authorization') || ''
  return h.toLowerCase().startsWith('bearer ') ? h.slice(7).trim() || null : null
}

function dbFor(token: string): SupabaseClient {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

// ---- burst limit for requests that run on the owner's key (in memory; fine for one server instance)
const hits = new Map<string, number[]>()
export function burstLimited(key: string, max: number, windowMs = 3_600_000): boolean {
  const now = Date.now()
  const recent = (hits.get(key) || []).filter(t => now - t < windowMs)
  if (recent.length >= max) { hits.set(key, recent); return true }
  recent.push(now)
  hits.set(key, recent)
  return false
}

/**
 * Request limit that survives restarts and works across servers when supabase/rate_limits.sql has been run.
 * Without it (or if the database is unreachable) it falls back to the in-memory limit above, so requests never fail because of it.
 */
export async function isLimited(key: string, max: number, windowSeconds: number): Promise<boolean> {
  try {
    const anon = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { persistSession: false, autoRefreshToken: false } })
    const { data, error } = await anon.rpc('hit_rate_limit', { p_key: key, p_max: max, p_window_seconds: windowSeconds })
    if (!error && typeof data === 'boolean') return data
  } catch { /* fall through to the memory limit */ }
  return burstLimited(key, max, windowSeconds * 1000)
}

export function clientIp(req: NextRequest): string {
  return (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'local'
}

/**
 * Decides whose API key pays for this request.
 *  - A user-supplied key (x-user-api-key) always wins, is never stored or logged, and is not counted.
 *  - Otherwise the caller must be a signed-in account; `consume` uses one of their free questions.
 */
export async function resolveCaller(req: NextRequest, opts: { consume: boolean }): Promise<Caller | GateError> {
  const userKey = (req.headers.get('x-user-api-key') || '').trim()
  if (userKey) {
    if (!/^sk-ant-[A-Za-z0-9_\-]{20,}$/.test(userKey)) {
      return { status: 400, code: 'invalid_api_key', message: 'That doesn’t look like an Anthropic API key. It should start with sk-ant-.' }
    }
    return { kind: 'user-key', client: new Anthropic({ apiKey: userKey }) }
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return { status: 503, code: 'server_not_configured', message: 'The server has no API key configured.' }
  }
  const token = bearer(req)
  if (!token) {
    return { status: 401, code: 'sign_in_required', message: 'Sign in to get 2 free questions, or add your own Anthropic API key.' }
  }
  const db = dbFor(token)
  if (await isLimited(`ai:${clientIp(req)}`, 40, 3600)) {
    return { status: 429, code: 'rate_limited', message: 'Too many requests from this network. Try again in a while, or add your own API key.' }
  }

  if (opts.consume) {
    const { data, error } = await db.rpc('consume_free_question', { limit_count: FREE_QUESTIONS })
    if (error) {
      const missing = /function|does not exist|schema cache/i.test(error.message)
      return missing
        ? { status: 503, code: 'usage_unavailable', message: 'Free-question tracking isn’t set up yet. Add your own Anthropic API key to continue.' }
        : { status: 401, code: 'sign_in_required', message: 'Your session expired. Sign in again, or add your own Anthropic API key.' }
    }
    const row = Array.isArray(data) ? data[0] : data
    if (!row?.allowed) {
      return { status: 402, code: 'free_limit_reached', message: `You’ve used your ${FREE_QUESTIONS} free questions. Add your own Anthropic API key to keep going.` }
    }
  } else {
    // Light check that the token is a real signed-in session (the summary does not use up a free question).
    const { data } = await db.auth.getUser(token)
    if (!data?.user) return { status: 401, code: 'sign_in_required', message: 'Sign in, or add your own Anthropic API key.' }
  }
  return { kind: 'account', client: new Anthropic(), token, db }
}

export function isGateError(x: Caller | GateError): x is GateError {
  return 'status' in x
}

export async function refundFreeQuestion(caller: Caller) {
  if (caller.kind !== 'account') return
  try { await caller.db.rpc('refund_free_question') } catch { /* best effort */ }
}

// ---- Wikipedia grounding -------------------------------------------------------------------
export type Reference = { title: string; url: string; extract: string }
const refCache = new Map<string, { at: number; ref: Reference | null }>()

async function timedFetch(url: string, ms = 2500): Promise<Response | null> {
  const ctl = new AbortController()
  const t = setTimeout(() => ctl.abort(), ms)
  try {
    return await fetch(url, { signal: ctl.signal, headers: { 'User-Agent': 'DivergeApp/0.1 (history what-if tool)' } })
  } catch {
    return null
  } finally {
    clearTimeout(t)
  }
}

/** Looks up the lead section of the best-matching Wikipedia article. Fails soft: returns null on any problem. */
export async function getReference(query: string): Promise<Reference | null> {
  const q = query.replace(/\s+[—–-]\s+-?\d{1,4}( BC)?$/, '').trim().slice(0, 120)
  if (!q) return null
  const cached = refCache.get(q)
  if (cached && Date.now() - cached.at < 6 * 3_600_000) return cached.ref
  let ref: Reference | null = null
  try {
    const s = await timedFetch(`https://en.wikipedia.org/w/api.php?action=query&format=json&list=search&srlimit=1&srsearch=${encodeURIComponent(q)}`)
    const top = s && s.ok ? (await s.json()).query?.search?.[0]?.title : null
    if (top) {
      const e = await timedFetch(`https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&exintro=1&explaintext=1&exchars=3200&redirects=1&titles=${encodeURIComponent(top)}`)
      const page = e && e.ok ? Object.values((await e.json()).query?.pages || {})[0] as { title?: string; extract?: string } | undefined : undefined
      if (page?.extract && page.extract.length > 200) {
        ref = { title: page.title || top, url: `https://en.wikipedia.org/wiki/${encodeURIComponent((page.title || top).replace(/ /g, '_'))}`, extract: page.extract.trim() }
      }
    }
  } catch { ref = null }
  refCache.set(q, { at: Date.now(), ref })
  return ref
}
