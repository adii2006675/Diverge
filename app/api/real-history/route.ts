import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic()

// The model doesn't always follow the "no em dashes" house style rule, so enforce it in code too.
function stripEmDashes<T>(value: T): T {
  if (typeof value === 'string') {
    return value.replace(/\s*—\s*/g, ', ').replace(/,\s*,/g, ',') as unknown as T
  }
  if (Array.isArray(value)) {
    return value.map(stripEmDashes) as unknown as T
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value)) out[k] = stripEmDashes(v)
    return out as T
  }
  return value
}

const SYSTEM_PROMPT = `You are a historical research assistant. Your only job is to summarize DOCUMENTED REAL HISTORY — never counterfactuals, never speculation about what could have happened.

SOURCE RELIABILITY PROTOCOL:
1. PRIMARY SOURCES — direct documents, treaties, census data, official records — treat as highly reliable
2. MAJOR ACADEMIC CONSENSUS — facts agreed upon by mainstream historians — treat as reliable
3. WIDELY CORROBORATED FACTS — appears in multiple reputable sources — treat as somewhat reliable
4. If a claim is genuinely disputed among historians, flag it as such rather than stating it flatly

RULES:
- Only state what actually, documented, happened. Do not invent statistics, quotes, or events.
- Use real names, dates, places, and institutions.
- If the user's topic is vague or broad, identify the single clearest, most well-documented historical event or period it refers to and summarize that.
- If the topic could reasonably refer to either an older, well-documented event or a current, ongoing situation (for example, a commodity price, a technology trend, or an economic condition that is still developing today), prefer anchoring to the most recent and currently relevant real-world situation, including up through today, rather than defaulting to an older historical episode just because it is better documented.
- If the topic has no real historical grounding at all (e.g. it's fictional or nonsensical), still respond with your best-effort identification of the closest real historical context — never refuse.

HOUSE WRITING STYLE (apply to every text field in your output):
- Write in active voice.
- Keep sentences direct and concrete. Cut clichés and jargon in favor of specific, clear terms.
- Never use em dashes. Use commas, periods, or parentheses instead.
- Avoid semicolons. Use periods or commas instead.
- Do not use hashtags, emojis, or asterisks anywhere in your output.`

// Look up a real, topic-relevant image via Wikipedia's public search + summary APIs (no key required).
async function fetchTopicImage(query: string): Promise<string | null> {
  try {
    const searchRes = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*&srlimit=1`
    )
    if (!searchRes.ok) return null
    const searchData = await searchRes.json()
    const pageTitle = searchData?.query?.search?.[0]?.title
    if (!pageTitle) return null

    const summaryRes = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pageTitle)}`
    )
    if (!summaryRes.ok) return null
    const summaryData = await summaryRes.json()
    return summaryData?.originalimage?.source || summaryData?.thumbnail?.source || null
  } catch {
    return null
  }
}

export async function POST(req: NextRequest) {
  try {
    const { topic, readingLevel, tone, aiStyle } = await req.json()

    const todayLabel = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

    const factCount = aiStyle === 'short' || aiStyle === 'concise'
      ? 3
      : aiStyle === 'long' || aiStyle === 'detailed'
      ? 7
      : 5

    const readingLevelInstruction = readingLevel === 'simple'
      ? 'READING LEVEL: Simple, write for a 5th-grade reading level, like explaining to a curious 10-year-old. Very short sentences, everyday words only, explain any necessary term in-line the moment you use it. No jargon.'
      : readingLevel === 'complex'
      ? 'READING LEVEL: Complex, college level. Advanced vocabulary, longer and more sophisticated sentence structure, assume a well-read adult audience comfortable with technical and academic language.'
      : 'READING LEVEL: Moderate, write for an 11th-grade reading level. Clear, moderately varied sentence structure, common vocabulary with occasional precise terms that a high school junior would understand.'

    const toneInstruction = tone === 'dramatic'
      ? 'TONE: Dramatic Narrator, vivid and cinematic, like documentary narration, while staying strictly factual.'
      : tone === 'academic'
      ? 'TONE: Academic, formal, citation-minded, precise. Use phrases like "documented sources indicate" where appropriate.'
      : 'TONE: Neutral Historian, balanced, factual, measured.'

    const styleInstruction = `${readingLevelInstruction}\n${toneInstruction}`

    const prompt = `${styleInstruction}

TODAY'S REAL-WORLD DATE: ${todayLabel}

THE USER'S TOPIC: "${topic}"

Identify the specific real historical event or period this topic is grounded in, and summarize what actually, documented, happened. If the topic is an ongoing situation, cover it through today's date above.

NOW OUTPUT ONLY THIS JSON — no markdown, no backticks, no text outside the JSON:
{
  "title": "Short title for the real historical event/period (e.g. 'World War II Begins')",
  "year": "The year or year range this event occurred, kept short (e.g. '1939' or '1914-1918') — never a full sentence",
  "fullDesc": "2-3 sentences of documented historical context, written like an encyclopedia entry.",
  "realFacts": [
    ${Array.from({ length: factCount }, (_, i) => `"Specific documented fact ${i + 1} about what really happened"`).join(',\n    ')}
  ]
}`

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1200,
      temperature: 0.2,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }]
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const clean = text.replace(/```json|```/g, '').replace(/,(\s*[\]}])/g, '$1').trim()

    let data
    try {
      data = JSON.parse(clean)
    } catch {
      const jsonMatch = clean.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        data = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('Could not parse JSON from response')
      }
    }

    let imageUrl = await fetchTopicImage(data.title || topic)
    if (!imageUrl && data.title && data.title !== topic) imageUrl = await fetchTopicImage(topic)
    if (imageUrl) data.imageUrl = imageUrl

    return NextResponse.json(stripEmDashes(data))
  } catch (err) {
    console.error('Real-history API error:', err)
    return NextResponse.json(
      { error: 'Failed to generate real history. Please try again.' },
      { status: 500 }
    )
  }
}
