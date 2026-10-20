import { NextRequest, NextResponse } from 'next/server'
import { resolveCaller, isGateError } from '@/lib/aiServer'

export async function POST(req: NextRequest) {
  // Same rule as the answer route, except a summary does not use up a free question.
  const caller = await resolveCaller(req, { consume: false })
  if (isGateError(caller)) return NextResponse.json({ error: caller.message, code: caller.code }, { status: caller.status })
  const client = caller.client
  try {
    const raw = await req.json()
    const startingEvent = String(raw.startingEvent ?? '').slice(0, 200)
    const whatIfs: string[] = (Array.isArray(raw.whatIfs) ? raw.whatIfs : []).slice(0, 30).map((q: unknown) => String(q).slice(0, 500))
    const finalWorldState = String(raw.finalWorldState ?? '').slice(0, 3000)

    const prompt = `You are a historian summarizing an alternate timeline for the game Diverge.

Starting point: ${startingEvent}

The user made these changes to history:
${whatIfs.map((q: string, i: number) => `${i + 1}. ${q}`).join('\n')}

Final world state: ${finalWorldState}

Write a summary of the alternate world they created. Respond ONLY with valid JSON:
{
  "title": "A compelling title for this alternate timeline eg 'The World Where JFK Lived'",
  "summary": "Three paragraphs describing this alternate world. What exists, what doesn't, who has power, what the quality of life is like. Make it feel real and specific.",
  "comparisonTable": [
    {"category": "Superpowers", "realWorld": "USA and China", "alternateWorld": "your alternate version"},
    {"category": "Population", "realWorld": "8.1 billion", "alternateWorld": "your estimate"},
    {"category": "Technology", "realWorld": "AI and smartphones", "alternateWorld": "your version"},
    {"category": "Major Conflicts", "realWorld": "Russia-Ukraine, Middle East", "alternateWorld": "your version"},
    {"category": "Economic System", "realWorld": "Global capitalism", "alternateWorld": "your version"},
    {"category": "Life Expectancy", "realWorld": "73 years globally", "alternateWorld": "your estimate"},
    {"category": "Biggest Difference", "realWorld": "Current reality", "alternateWorld": "most dramatic change"}
  ]
}`

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }]
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const clean = text.replace(/```json|```/g, '').trim()
    const data = JSON.parse(clean)

    return NextResponse.json(data)
  } catch (err) {
    console.error('Summary API error:', err)
    return NextResponse.json({ error: 'Failed to generate summary' }, { status: 500 })
  }
}