// Builds everything the app loads about events from ONE source file: data/events.json.
//
//   node scripts/build-events.cjs            -> writes lib/eventIndex.json (small list used by Explore, search, cards),
//                                               public/event-data/<id>.json (long text, loaded only when an event is opened),
//                                               and public/events/thumb/<id>.webp (small card pictures).
//   node scripts/build-events.cjs --import   -> one-time: reads the old lib/events.ts and lib/moreEvents.ts into data/events.json.
//
// To add an event: add an entry to data/events.json (id, year, title, shortDesc, fullDesc, era, realFacts, optional img and pos),
// put its picture in public/events/, then run `npm run build:events`.
const fs = require('fs')
const path = require('path')
const root = path.join(__dirname, '..')
const rel = p => path.join(root, p)

function importOld() {
  const ts = require('typescript')
  const load = (file, shims) => {
    const src = fs.readFileSync(rel(file), 'utf8')
    const out = ts.transpileModule(src, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText
    const mod = { exports: {} }
    new Function('require', 'module', 'exports', out)(id => (shims && shims[id]) || {}, mod, mod.exports)
    return mod.exports
  }
  const more = load('lib/moreEvents.ts')
  const main = load('lib/events.ts', { '@/lib/moreEvents': more })
  const all = main.ALL_EVENTS
  const imgSrc = fs.readFileSync(rel('lib/eventImages.ts'), 'utf8')
  const imgs = Object.fromEntries([...imgSrc.matchAll(/^\s*'([^']+)':\s*'(\/events\/[^']+)'/gm)].map(m => [m[1], m[2]]))
  const pos = {}
  const posBlock = /const POSITIONS[^{]*\{([\s\S]*?)\n\}/.exec(imgSrc)
  if (posBlock) for (const m of posBlock[1].matchAll(/'([^']+)':\s*'([^']+)'/g)) pos[m[1]] = m[2]
  const events = all.map(e => {
    const o = { id: e.id, year: e.year, title: e.title, shortDesc: e.shortDesc, fullDesc: e.fullDesc, era: e.era, realFacts: e.realFacts || [] }
    if (imgs[e.id]) o.img = imgs[e.id]
    if (pos[e.id]) o.pos = pos[e.id]
    return o
  })
  fs.mkdirSync(rel('data'), { recursive: true })
  fs.writeFileSync(rel('data/events.json'), JSON.stringify(events, null, 2) + '\n')
  console.log('imported', events.length, 'events,', Object.keys(imgs).length, 'images')
}

async function build() {
  const events = JSON.parse(fs.readFileSync(rel('data/events.json'), 'utf8'))
  const ids = new Set()
  for (const e of events) {
    if (ids.has(e.id)) throw new Error('duplicate id: ' + e.id)
    ids.add(e.id)
    for (const k of ['id', 'year', 'title', 'shortDesc', 'fullDesc', 'era']) if (e[k] === undefined || e[k] === '') throw new Error(`event ${e.id} is missing ${k}`)
  }
  // small card pictures
  let sharp = null
  try { sharp = require('sharp') } catch { console.warn('sharp is not installed: card pictures were not made') }
  fs.mkdirSync(rel('public/events/thumb'), { recursive: true })
  let made = 0
  const thumbs = new Set(fs.readdirSync(rel('public/events/thumb')).filter(f => f.endsWith('.webp')).map(f => f.slice(0, -5)))
  if (sharp) {
    for (const e of events) {
      if (!e.img) continue
      const from = rel('public' + e.img)
      const to = rel(`public/events/thumb/${e.id}.webp`)
      if (!fs.existsSync(from)) continue
      if (!fs.existsSync(to) || fs.statSync(to).mtimeMs < fs.statSync(from).mtimeMs) {
        await sharp(from).resize({ width: 480, withoutEnlargement: true }).webp({ quality: 72 }).toFile(to)
        made++
      }
      thumbs.add(e.id)
    }
  }
  // small list used by Explore, cards and search
  const index = events.map(e => {
    const o = { id: e.id, year: e.year, title: e.title, shortDesc: e.shortDesc, era: e.era }
    if (e.img) o.img = e.img
    if (thumbs.has(e.id)) o.thumb = `/events/thumb/${e.id}.webp`
    if (e.pos) o.pos = e.pos
    return o
  })
  fs.writeFileSync(rel('lib/eventIndex.json'), JSON.stringify(index))
  // long text, one small file per event
  fs.mkdirSync(rel('public/event-data'), { recursive: true })
  const keep = new Set()
  for (const e of events) {
    fs.writeFileSync(rel(`public/event-data/${e.id}.json`), JSON.stringify({ fullDesc: e.fullDesc, realFacts: e.realFacts || [] }))
    keep.add(e.id + '.json')
  }
  for (const f of fs.readdirSync(rel('public/event-data'))) if (!keep.has(f)) fs.unlinkSync(rel('public/event-data/' + f))
  console.log(`built ${index.length} events (${made} new card pictures); index ${(fs.statSync(rel('lib/eventIndex.json')).size / 1024).toFixed(0)} KB`)
}

if (process.argv.includes('--import')) importOld()
else build().catch(err => { console.error(err.message); process.exit(1) })
