import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { isLimited } from '@/lib/aiServer'

// Translates site text (About, Terms, Privacy, event titles and descriptions) into the language chosen in Settings.
// The browser keeps what it gets back, and this server remembers it too, so each piece of text is translated once per language.
const MODEL = process.env.DIVERGE_TRANSLATE_MODEL || 'claude-haiku-4-5'
const LANGS = ['Spanish', 'French', 'German', 'Japanese', 'Portuguese', 'Hindi', 'Chinese']
const MAX_TEXTS = 80
const MAX_TEXT_CHARS = 2500
const MAX_TOTAL_CHARS = 30000
const CHUNK_CHARS = 5000

const cache = new Map<string, string>()
const hits = new Map<string, number[]>()

function ipOf(req: NextRequest) {
  return (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'local'
}

// A simple per-address limit so the endpoint can't be used as a free general translator.
function tooMany(ip: string) {
  const now = Date.now()
  const recent = (hits.get(ip) || []).filter(t => now - t < 10 * 60 * 1000)
  recent.push(now)
  hits.set(ip, recent)
  if (hits.size > 5000) hits.clear()
  return recent.length > 150
}

async function translateChunk(client: Anthropic, language: string, texts: string[]): Promise<string[]> {
  const res: any = await client.messages.create({
    model: MODEL,
    max_tokens: 8000,
    system: `You translate text for a website about alternate history. Translate each item into ${language}. Translate titles and names of historical events into the name normally used in that language (for example, the Cuban Missile Crisis becomes its usual name in that language). Keep personal names, product names, numbers, dates and any {placeholders} as they are, written in the script of that language where that is normal. Do not add notes. Keep the tone and meaning. Do not use em dashes; use commas or periods instead. Return exactly one translation per item, in the same order.`,
    messages: [{ role: 'user', content: JSON.stringify(texts) }],
    output_config: { format: { type: 'json_schema', schema: { type: 'object', properties: { translations: { type: 'array', items: { type: 'string' } } }, required: ['translations'], additionalProperties: false } } },
  } as any, { timeout: 60000, maxRetries: 1 })
  const block = (res.content || []).find((b: any) => b.type === 'text')
  const out = JSON.parse(block?.text || '{}')?.translations
  if (!Array.isArray(out) || out.length !== texts.length) throw new Error('bad translation shape')
  return out.map((s: unknown) => String(s))
}

export async function POST(req: NextRequest) {
  let body: any
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Bad request.' }, { status: 400 }) }
  const language = String(body?.language || '')
  const texts: unknown = body?.texts
  if (!LANGS.includes(language)) return NextResponse.json({ error: 'Unsupported language.' }, { status: 400 })
  if (!Array.isArray(texts) || texts.length === 0 || texts.length > MAX_TEXTS || texts.some(t => typeof t !== 'string' || !t.trim() || t.length > MAX_TEXT_CHARS)) {
    return NextResponse.json({ error: 'Bad texts.' }, { status: 400 })
  }
  const list = texts as string[]
  if (list.reduce((n, t) => n + t.length, 0) > MAX_TOTAL_CHARS) return NextResponse.json({ error: 'Too much text.' }, { status: 413 })
  if (await isLimited(`tr:${ipOf(req)}`, 150, 600)) return NextResponse.json({ error: 'Too many requests.' }, { status: 429 })

  const result: string[] = list.map(t => cache.get(`${language}|${t}`) ?? '')
  const missing = list.map((t, i) => ({ t, i })).filter(x => !result[x.i])
  if (missing.length > 0) {
    const userKey = (req.headers.get('x-user-api-key') || '').trim()
    if (!userKey && !process.env.ANTHROPIC_API_KEY) return NextResponse.json({ error: 'No key.' }, { status: 503 })
    const client = userKey.startsWith('sk-ant-') ? new Anthropic({ apiKey: userKey }) : new Anthropic()
    const chunks: { t: string; i: number }[][] = []
    let cur: { t: string; i: number }[] = []; let size = 0
    for (const m of missing) {
      if (cur.length > 0 && size + m.t.length > CHUNK_CHARS) { chunks.push(cur); cur = []; size = 0 }
      cur.push(m); size += m.t.length
    }
    if (cur.length) chunks.push(cur)
    try {
      await Promise.all(chunks.map(async ch => {
        const out = await translateChunk(client, language, ch.map(x => x.t))
        ch.forEach((x, k) => { result[x.i] = out[k]; cache.set(`${language}|${x.t}`, out[k]) })
      }))
    } catch (err: any) {
      console.warn('diverge: translate failed:', err?.status || '', String(err?.message || err).slice(0, 160))
      return NextResponse.json({ error: 'Translation failed.' }, { status: 502 })
    }
    if (cache.size > 20000) cache.clear()
  }
  return NextResponse.json({ translations: result })
}
