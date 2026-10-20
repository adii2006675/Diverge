// One-off build script: translates every event's title and descriptions into the supported languages and
// writes lib/eventsI18n.json. Re-run it after adding events:   node scripts/translate-events.mjs
// It uses ANTHROPIC_API_KEY from .env.local, so it costs a few cents. Existing translations are kept unless --force.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Anthropic from '@anthropic-ai/sdk'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const key = /^ANTHROPIC_API_KEY=(.+)$/m.exec(fs.readFileSync(path.join(root, '.env.local'), 'utf8'))?.[1]?.trim()
if (!key) throw new Error('ANTHROPIC_API_KEY not found in .env.local')
const client = new Anthropic({ apiKey: key })
const force = process.argv.includes('--force')

const LANGS = ['Spanish', 'French', 'German', 'Japanese', 'Portuguese', 'Hindi', 'Chinese']
const lit = s => new Function(`return ${s}`)()

// Pull id/title/shortDesc/fullDesc out of lib/events.ts.
const src = fs.readFileSync(path.join(root, 'lib', 'events.ts'), 'utf8')
const STR = `('(?:[^'\\\\]|\\\\.)*'|"(?:[^"\\\\]|\\\\.)*")`
const re = new RegExp(`id: '([^']+)',[\\s\\S]*?title: ${STR},\\s*shortDesc: ${STR},\\s*fullDesc: ${STR}`, 'g')
const events = {}
for (const m of src.matchAll(re)) events[m[1]] = { title: lit(m[2]), shortDesc: lit(m[3]), fullDesc: lit(m[4]) }

// The home page shows longer descriptions for its featured events.
const home = fs.readFileSync(path.join(root, 'app', 'page.tsx'), 'utf8')
const longRe = /'([^']+)': ('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"),?\n/g
const block = home.slice(home.indexOf('LONG_DESCRIPTIONS'), home.indexOf('export default'))
for (const m of block.matchAll(longRe)) if (events[m[1]]) events[m[1]].longDesc = lit(m[2])

console.log(`${Object.keys(events).length} events found`)

const outFile = path.join(root, 'lib', 'eventsI18n.json')
const out = fs.existsSync(outFile) && !force ? JSON.parse(fs.readFileSync(outFile, 'utf8')) : {}

async function translate(lang) {
  const todo = Object.fromEntries(Object.entries(events).filter(([id]) => force || !out[lang]?.[id]))
  const ids = Object.keys(todo)
  if (!ids.length) return console.log(`${lang}: up to date`)
  const result = {}
  // Batches keep each response well under the output limit.
  for (let i = 0; i < ids.length; i += 25) {
    const batch = Object.fromEntries(ids.slice(i, i + 25).map(id => [id, todo[id]]))
    const items = Object.entries(batch).map(([id, v]) => ({ id, ...v }))
    const schema = {
      type: 'object', additionalProperties: false, required: ['items'],
      properties: { items: { type: 'array', items: {
        type: 'object', additionalProperties: false, required: ['id', 'title', 'shortDesc', 'fullDesc', 'longDesc'],
        properties: { id: { type: 'string' }, title: { type: 'string' }, shortDesc: { type: 'string' }, fullDesc: { type: 'string' }, longDesc: { type: 'string' } },
      } } },
    }
    const stream = client.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 16000,
      system: `You translate text for a history app. Translate the title, shortDesc, fullDesc and longDesc of every item into ${lang}, keeping each id unchanged. Translate completely and faithfully: every sentence of the source must appear, nothing added or cut off. Use the natural, standard ${lang} names for people, places and events, and keep numbers and dates accurate. If an item's longDesc is empty, return an empty string for it.`,
      messages: [{ role: 'user', content: JSON.stringify(items.map(it => ({ longDesc: '', ...it }))) }],
      output_config: { format: { type: 'json_schema', schema } },
    })
    const msg = await stream.finalMessage()
    const text = msg.content.filter(b => b.type === 'text').map(b => b.text).join('')
    const json = JSON.parse(text)
    const cjk = ['Japanese', 'Chinese'].includes(lang)
    for (const t of json.items) {
      const srcEv = batch[t.id]
      if (!srcEv) continue
      const lo = cjk ? 0.2 : 0.5
      const okLen = (a, b) => a.length >= b.length * lo && a.length <= b.length * 2.5
      const ok = t.title && okLen(t.shortDesc, srcEv.shortDesc) && okLen(t.fullDesc, srcEv.fullDesc) && (!srcEv.longDesc || okLen(t.longDesc, srcEv.longDesc))
      if (ok) result[t.id] = { title: t.title, shortDesc: t.shortDesc, fullDesc: t.fullDesc, ...(srcEv.longDesc ? { longDesc: t.longDesc } : {}) }
      else console.warn(`${lang}: rejected ${t.id} (length check)`)
    }
  }
  out[lang] = { ...(out[lang] || {}), ...result }
  console.log(`${lang}: ${Object.keys(result).length} translated`)
}

await Promise.all(LANGS.map(translate))
fs.writeFileSync(outFile, JSON.stringify(out, null, 1))
console.log('wrote lib/eventsI18n.json')
