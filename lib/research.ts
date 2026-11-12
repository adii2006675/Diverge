// Server-only: a short web research step that runs before an answer is written. It searches the open web for the real history
// behind a question, prefers credible sources, and returns notes plus the sources the notes actually cite. It fails soft: any
// problem (search not enabled for the account, a timeout, no usable sources) returns null and the answer is written without it.
import type Anthropic from '@anthropic-ai/sdk'
import { sourceTier, BLOCKED_DOMAINS } from '@/lib/sourceQuality'

export type ResearchSource = { title: string; url: string }
export type Research = { brief: string; sources: ResearchSource[] }

// A small fast model does the searching and note-taking; the main model writes the answer. Set DIVERGE_WEB_SEARCH=off to disable.
const RESEARCH_MODEL = process.env.DIVERGE_RESEARCH_MODEL || 'claude-haiku-4-5'
const MAX_SEARCHES = Math.max(1, Math.min(6, Number(process.env.DIVERGE_MAX_SEARCHES) || 3))
const TIMEOUT_MS = 28000

export const webResearchEnabled = () => (process.env.DIVERGE_WEB_SEARCH || 'on').toLowerCase() !== 'off'

function researchPrompt(startingEvent: string, question: string, realFacts: string[], today: string) {
  return `You are the research step of an alternate-history app. Today's date is ${today}. A user is exploring the event "${startingEvent}" and asked:
<user_question>${question}</user_question>

Use web search (a few focused searches) to find the real, documented history this what-if depends on: the key dates, people, places, numbers, causes and context a historian would need.

Recency matters. Your own knowledge ends before today, so do not assume you know what the newest developments are. If the question refers to something recent ("the latest", "the most recent", "what just happened", "this week", "now") or to a news story that is still developing, search for the newest coverage: include the current month and year (${today.slice(0, 7)}) in a search, and prefer articles from the last few weeks over older ones. A story can have several phases, for example a first report months ago and bigger developments since. Find the latest phase and say which phase each fact belongs to. Put the date next to every fact about a developing story. If the question is vague about which event it means, note the most likely event and its date.

Choose sources carefully. Prefer credible ones: government and official sites (.gov, national archives, libraries), universities and museums (.edu, .ac.uk, Smithsonian), established news organisations and broadcasters (BBC, Reuters, AP, NPR, PBS, major newspapers), and reputable encyclopedias and history publishers (Britannica, History.com editorial articles). Wikipedia is fine as one source but not the only one. Skip social media, forums, personal blogs, content farms, and sites with no editorial standards or an obvious propaganda aim. If the credible sources disagree, say so.

Facts we already hold, so don't spend searches repeating them:
${realFacts.slice(0, 8).map((f, i) => `${i + 1}. ${f}`).join('\n') || '(none)'}

Write RESEARCH NOTES: 8 to 14 short bullet points of concrete facts, using dates, names and figures exactly as the sources give them. Cover the history behind the question, not the imagined alternate world. Do not speculate. Then stop.`
}

export async function researchTopic(client: Anthropic, input: { startingEvent: string; question: string; realFacts: string[]; today?: string }): Promise<Research | null> {
  if (!webResearchEnabled()) return null
  try {
    const messages: any[] = [{ role: 'user', content: researchPrompt(input.startingEvent, input.question, input.realFacts, input.today || new Date().toISOString().slice(0, 10)) }]
    // Every text piece the model writes, with the web addresses it cited for that piece.
    const pieces: { text: string; cites: { url: string; title: string }[] }[] = []

    // The search tool runs on the server; a long search can pause the turn, so continue it a couple of times at most.
    for (let turn = 0; turn < 3; turn++) {
      const res: any = await client.messages.create({
        model: RESEARCH_MODEL,
        max_tokens: 1800,
        messages,
        tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: MAX_SEARCHES, blocked_domains: BLOCKED_DOMAINS }],
      } as any, { timeout: TIMEOUT_MS, maxRetries: 0 })

      for (const block of res.content || []) {
        if (block.type !== 'text') continue
        pieces.push({ text: block.text, cites: (block.citations || []).filter((c: any) => c?.url).map((c: any) => ({ url: c.url as string, title: String(c.title || '') })) })
      }
      if (res.stop_reason !== 'pause_turn') break
      messages.push({ role: 'assistant', content: res.content })
    }

    // Decide which cited sites to use. Trusted ones always count; sites we don't recognise only fill in when fewer than two
    // trusted sources were found; blocked ones never count.
    const cited = new Map<string, string>()
    for (const p of pieces) for (const c of p.cites) if (!cited.has(c.url)) cited.set(c.url, c.title)
    const trusted = [...cited.keys()].filter(u => sourceTier(u) === 'trusted')
    const unknown = [...cited.keys()].filter(u => sourceTier(u) === 'unknown')
    const accepted = new Set<string>(trusted)
    for (const u of unknown) { if (accepted.size >= 2) break; accepted.add(u) }

    // Rebuild the notes from the pieces that rest on an accepted source (a piece with no citation is a heading or a link word and
    // stays). Pieces that only cite rejected sites are dropped, so nothing in the notes comes from a site we don't trust.
    const sources: ResearchSource[] = []
    const indexOf = (url: string) => {
      let i = sources.findIndex(x => x.url === url)
      if (i < 0) { sources.push({ title: (cited.get(url) || url).slice(0, 160), url }); i = sources.length - 1 }
      return i + 1
    }
    let brief = ''
    for (const p of pieces) {
      const ok = p.cites.filter(c => accepted.has(c.url))
      if (p.cites.length > 0 && ok.length === 0) continue
      brief += p.text
      const nums = [...new Set(ok.map(c => indexOf(c.url)))]
      if (nums.length) brief += ` [${nums.join(', ')}]`
    }
    // Start at the notes themselves; anything before is the model announcing that it is about to search.
    const start = brief.search(/RESEARCH NOTES/i)
    brief = (start >= 0 ? brief.slice(start) : brief).replace(/^[ \t]*[•*-][ \t]*([,.;:)].*)?$/gm, '').replace(/\n{3,}/g, '\n\n').trim()
    if (!brief || sources.length === 0) return null // no accepted citations means nothing usable was found
    return { brief: brief.slice(0, 3600), sources: sources.slice(0, 6) }
  } catch (err: any) {
    console.warn('diverge: web research skipped:', err?.status || '', String(err?.message || err).slice(0, 160))
    return null
  }
}

export { hostOf } from '@/lib/sourceHost'
