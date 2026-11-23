// Finds a freely licensed picture for each new event and merges the events into data/events.json.
//
//   node scripts/fetch-event-images.cjs scripts/batches/batch1a.json [more batch files...]
//
// For each event it looks at the Wikipedia articles listed in "wiki" (in order), takes the lead picture if it is stored on Wikimedia
// Commons with a free licence (public domain, CC0, CC BY, CC BY-SA), downloads it at 960px wide into public/events/, and records its
// credit in public/events/CREDITS.md. Events with no usable picture are still added, and the app shows a title card for them.
// It saves after every event, so it can be stopped and started again.
const fs = require('fs')
const path = require('path')
const root = path.join(__dirname, '..')
const rel = p => path.join(root, p)
const UA = { 'User-Agent': 'DivergeEventImages/1.0 (educational project; image licence check)' }
const sleep = ms => new Promise(r => setTimeout(r, ms))

async function get(url, wantJson) {
  for (let i = 0; i < 6; i++) {
    let r
    try { r = await fetch(url, { headers: UA, redirect: 'follow' }) } catch { await sleep(4000 * (i + 1)); continue }
    const bad = r.status === 429 || r.status >= 500 || (wantJson && r.status === 200 && !(r.headers.get('content-type') || '').includes('json'))
    if (bad) { await sleep(6000 * (i + 1)); continue }
    return r
  }
  return null
}

const FREE = /^(public domain|pd\b|pd-|cc0|cc[ -]by(?![- ]?(nc|nd))|cc[ -]by-sa|attribution)/i
function isFree(lic) {
  const l = (lic || '').trim()
  if (/nc|nd|non-?commercial|no derivatives|fair use|all rights/i.test(l) && !/^public domain/i.test(l)) return false
  return FREE.test(l)
}

async function pictureFor(titles) {
  for (const title of titles) {
    await sleep(1200)
    const r = await get('https://en.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(title.replace(/ /g, '_')), true)
    if (!r || !r.ok) continue
    const d = await r.json()
    const src = d.originalimage && d.originalimage.source
    if (!src || !src.includes('/wikipedia/commons/')) continue // stored only on English Wikipedia: not freely licensed
    // The address may carry a query string, and for scaled pictures the file name is the folder just before the size.
    const parts = src.split('?')[0].split('/')
    const file = decodeURIComponent(src.includes('/commons/thumb/') ? parts[parts.indexOf('thumb') + 3] : parts[parts.length - 1])
    if (!/\.(jpe?g|png|webp)$/i.test(file)) continue
    await sleep(3000)
    const mr = await get('https://commons.wikimedia.org/w/api.php?' + new URLSearchParams({ action: 'query', format: 'json', titles: 'File:' + file, prop: 'imageinfo', iiprop: 'extmetadata|size' }), true)
    if (!mr || !mr.ok) continue
    const page = Object.values((await mr.json()).query.pages)[0]
    const ii = page.imageinfo && page.imageinfo[0]
    if (!ii) continue
    const md = ii.extmetadata || {}
    const lic = md.LicenseShortName && md.LicenseShortName.value
    if (!isFree(lic) || (ii.width && ii.width < 400)) continue
    const author = ((md.Artist && md.Artist.value) || 'Unknown').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').replace(/\|/g, '/').trim().slice(0, 70)
    return { file, lic, author, ext: /\.png$/i.test(file) ? 'png' : 'jpg' }
  }
  return null
}

async function main() {
  const args = process.argv.slice(2)
  const requirePic = args.includes('--require-picture') // only add events that get a picture
  const fill = args.includes('--fill') // only look for pictures for existing events that have none
  const files = args.filter(a => !a.startsWith('--'))
  if (!files.length) { console.error('give at least one batch file'); process.exit(1) }
  const events = JSON.parse(fs.readFileSync(rel('data/events.json'), 'utf8'))
  const have = new Set(events.map(e => e.id))
  const credits = rel('public/events/CREDITS.md')
  let added = 0, withPic = 0, without = []
  for (const f of files) {
    const batch = JSON.parse(fs.readFileSync(f, 'utf8'))
    for (const b of batch) {
      const existing = events.find(e => e.id === b.id)
      if (fill !== !!existing) continue // normal mode adds new events; fill mode only touches existing ones
      if (existing && existing.img) continue
      const ev = existing || { id: b.id, year: b.year, title: b.title, shortDesc: b.shortDesc, fullDesc: b.fullDesc, era: b.era, realFacts: b.realFacts }
      let pic = null
      try { pic = await pictureFor(b.wiki || []) } catch (err) { console.warn('picture lookup failed for', b.id, err.message) }
      if (pic) {
        await sleep(3000)
        const dl = await get('https://commons.wikimedia.org/wiki/Special:FilePath/' + encodeURIComponent(pic.file.replace(/ /g, '_')) + '?width=960', false)
        if (dl && dl.ok) {
          const buf = Buffer.from(await dl.arrayBuffer())
          if (buf.length > 5000) {
            const name = `${b.id}.${pic.ext}`
            fs.writeFileSync(rel('public/events/' + name), buf)
            ev.img = '/events/' + name
            fs.appendFileSync(credits, `| ${b.id} | ${name} | ${pic.author} | ${pic.lic} | [${pic.file}](https://commons.wikimedia.org/wiki/File:${pic.file.replace(/ /g, '_')}) |\n`)
            withPic++
          }
        }
      }
      if (!ev.img) {
        without.push(b.id)
        if (requirePic && !existing) { console.log(`skipped ${b.id} (no picture)`); continue }
      }
      if (!existing) events.push(ev)
      have.add(b.id)
      added++
      fs.writeFileSync(rel('data/events.json'), JSON.stringify(events, null, 2) + '\n')
      console.log(`${added}. ${b.id} ${ev.img ? 'picture ok (' + pic.lic + ')' : 'NO PICTURE'}`)
    }
  }
  console.log(`done: ${added} events added, ${withPic} with a picture, ${without.length} without`)
  if (without.length) console.log('without a picture:', without.join(', '))
}
main()
