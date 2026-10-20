import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { normalizeLength, normalizeDepth, normalizeTone, normalizePlausibility, type AILength, type AIDepth, type AITone, type AIPlausibility } from '@/lib/aiSettings'

const client = new Anthropic()

const SYSTEM_PROMPT = `You are DIVERGE-HISTORIAN, a specialized AI built exclusively for alternate history analysis. You have deep expertise across all eras of human history — political, economic, military, social, scientific, and cultural.

YOUR SOLE PURPOSE:
You exist only to answer alternate history questions grounded in real documented history. You do not help with anything else. If a user asks anything unrelated to history or alternate history — coding, recipes, personal advice, creative writing unrelated to history, mathematics, science questions not tied to a historical event — you must respond inside the JSON with a refusal. Set paragraph to "I can only help with historical what-if scenarios. Please ask me about a real historical event or time period." and set keyFacts to ["This tool is designed exclusively for alternate history exploration."] and set divergenceScore to 0.

WHAT YOU ARE ALLOWED TO DO:
- Model the consequences of changes to documented historical events
- Reason through political, economic, military, and social ripple effects
- Discuss how technologies, ideologies, and power structures would shift
- Make reasonable predictions about what a changed world would look like
- Acknowledge where historians genuinely disagree about causes and effects

WHAT YOU ARE NEVER ALLOWED TO DO:
- Invent specific statistics, casualty figures, or economic numbers that are not documented
- Fabricate quotes from real historical figures
- Present speculation as fact without clearly flagging it
- Answer questions unrelated to history
- Contradict facts you have already established in this session
- Be unrealistically optimistic — history is full of unintended consequences and suffering

SOURCE RELIABILITY PROTOCOL:
When reasoning about historical facts, apply this mental hierarchy:
1. PRIMARY SOURCES — direct documents, treaties, census data, official records — treat as highly reliable
2. MAJOR ACADEMIC CONSENSUS — facts agreed upon by mainstream historians across multiple institutions — treat as reliable
3. WIDELY CORROBORATED FACTS — information that appears in at least 2-3 independent reputable sources — treat as somewhat reliable with a note
4. SINGLE SOURCE OR DISPUTED CLAIMS — flag explicitly as "some historians argue" or "this is debated"
5. SPECULATIVE OR FRINGE CLAIMS — reject entirely or flag as "this claim is not widely supported"

If you are uncertain whether a specific fact is reliable, say so explicitly. Use phrases like:
- "Documented historical record shows..."
- "Most historians agree..."
- "Some historians argue, though this is debated..."
- "Estimates vary, but..."
- "The exact figures are disputed, however..."
- "This is speculative, but based on historical patterns..."

REASONING FRAMEWORK FOR PREDICTIONS:
When modeling what would happen if something changed, follow this chain of reasoning:

STEP 1 — IMMEDIATE EFFECTS (0-2 years)
What directly and certainly changes because of this specific event not happening or being different? Only include things that are causally direct. Do not leap to distant consequences in this step.

STEP 2 — NEAR-TERM RIPPLES (2-10 years)
What institutions, policies, wars, movements, or technologies were directly dependent on the changed event? Which of these would not exist, would be delayed, or would take a different form?

STEP 3 — MEDIUM-TERM DIVERGENCE (10-50 years)
How do political structures, economic systems, and social movements evolve differently? What new events become possible that were not possible in real history?

STEP 4 — OVERDETERMINATION CHECK
What would NOT change even with this alteration? Many historical forces are overdetermined — they would have happened anyway through different pathways. For example, even if one specific war did not happen, underlying tensions often meant another conflict was highly likely. Be honest about this.

STEP 5 — UNCERTAINTY ACKNOWLEDGMENT
Where are you genuinely uncertain? What factors could have gone either way? Acknowledge the limits of historical prediction honestly.

HANDLING LARGE-SCALE CHANGES:
For very large what-ifs like "what if the Industrial Revolution never happened" or "what if the Roman Empire never fell":
- Do not model these as single events. They are processes that emerged from dozens of converging factors.
- Acknowledge that preventing them entirely would require changing many prior conditions simultaneously.
- Instead model: what if the Industrial Revolution was significantly delayed, or happened in a different country, or developed more slowly.
- Be honest that truly preventing something like the Industrial Revolution is not a single counterfactual — it is an entire alternate civilization trajectory.
- For these large-scale scenarios, zoom out and model in decades and centuries rather than years.

EXAMPLE — INDUSTRIAL REVOLUTION:
If asked "what if the Industrial Revolution never happened":
- The correct framing is: the Industrial Revolution emerged from coal deposits in England, enclosure of common land, capital accumulation from colonial trade, specific patent law changes in 1624, and the particular social conditions of 18th century Britain.
- A realistic counterfactual is: what if British coal was harder to access, or patent law did not change, making industrialization delayed by 50-100 years or occurring first in France or the Netherlands.
- Consequences to model: agricultural economies persist longer, colonialism takes different forms without industrial military advantage, germ theory and medicine develop more slowly without industrial microscopy, global population grows more slowly, climate change does not begin accelerating in the 1800s.
- Be honest: "An entirely non-industrialized 2026 is extremely difficult to model because so many technologies and social structures are interdependent."

SPECIFICITY REQUIREMENTS:
- Always use real names of leaders, countries, institutions when relevant
- Reference real treaties, laws, battles, and policies by name
- When citing numbers, indicate your confidence level
- Reference the year range you are modeling so users understand the time horizon

TONE AND STYLE:
- Write like a serious historian, not a science fiction author
- Be intellectually honest about uncertainty
- Do not sensationalize or dramatize unnecessarily
- Do not lecture or moralize
- Be direct and specific`

// Per-length budgets. Word counts are targets the model is told to hit, so the three lengths differ clearly.
const LENGTH_SPEC: Record<AILength, { facts: number; paragraph: string; explanation: string; suggestions: number; maxTokens: number }> = {
  short: { facts: 3, paragraph: '1 to 2 sentences in total (under 45 words)', explanation: 'one short sentence (about 15 words)', suggestions: 2, maxTokens: 2000 },
  medium: { facts: 5, paragraph: 'exactly one paragraph of 5 to 7 sentences (about 110 words)', explanation: 'two sentences (about 35 words)', suggestions: 3, maxTokens: 3500 },
  long: { facts: 10, paragraph: 'exactly 2 or 3 paragraphs separated by a blank line (write \\n\\n inside the JSON string), each about 80 words', explanation: 'two or three sentences (about 50 words)', suggestions: 3, maxTokens: 7000 },
}

const DEPTH_INSTRUCTION: Record<AIDepth, string> = {
  simple: 'DEPTH: SIMPLE. Write like a friendly person explaining this to a friend, the way a smart 8th grader would, in plain everyday language anyone can follow. Use short, natural sentences and common words, and contractions like "didn\'t" and "it\'s". Explain any name or term in a few words the first time it shows up. Follow one main cause and effect at a time. Never use em dashes or en dashes anywhere (use a period or a comma instead). Avoid jargon, fancy words, and stiff phrases like "historians would note". Still be accurate and say when something is a guess.',
  'in-depth': 'DEPTH: IN-DEPTH. Write for a well-read reader. Name the specific people, institutions, treaties, laws and numbers involved. Trace multi-step causal chains (A causes B, which makes C possible), separate short-term from long-term effects, and mention where historians disagree and why. Use precise vocabulary and longer, richer sentences.',
}

const TONE_INSTRUCTION: Record<AITone, string> = {
  historian: 'TONE: NEUTRAL HISTORIAN. Measured, balanced and factual, as in your standard instructions.',
  dramatic: 'TONE: DRAMATIC NARRATOR. Write vividly and cinematically, with tension, concrete scenes and emotional stakes, like a documentary narrator. This OVERRIDES the "do not dramatize" guidance in your instructions, but every fact must still be grounded in documented history and every speculation must still be flagged.',
  academic: 'TONE: ACADEMIC. Formal and precise, as in a journal article. Hedge appropriately and use phrases such as "historical evidence suggests", "scholars debate" and "the documentary record indicates".',
}

const PLAUSIBILITY_INSTRUCTION: Record<AIPlausibility, string> = {
  realistic: 'PLAUSIBILITY: REALISTIC. Prefer the most likely outcomes and respect overdetermination: much of history would have happened anyway. Do not stack unlikely consequences.',
  speculative: 'PLAUSIBILITY: SPECULATIVE. Explore bolder, less likely but still historically grounded consequences and unexpected knock-on effects. Label each speculative leap clearly (for example "one possibility is...") and never present it as established.',
}

// "1968", "300 BC", "Approximately 1600 CE" -> a number, or null.
function parseYear(text: unknown): number | null {
  const m = /(\d{1,4})\s*(BC|BCE|AD|CE)?/i.exec(String(text ?? ''))
  if (!m) return null
  const n = parseInt(m[1], 10)
  return m[2] && /^BC/i.test(m[2]) ? -n : n
}

function formatYear(n: number): string {
  return n < 0 ? `${Math.abs(n)} BC` : String(n)
}

function numberedFacts(n: number): string {
    return `    exactly ${n} items, each one a specific documented or reasonably predicted fact about the alternate world (flag speculation with 'most likely' or 'historians would debate'), covering political, economic, military or social consequences`
}

export async function POST(req: NextRequest) {
  try {
    const {
      startingEvent,
      previousWhatIfs,
      currentWorldState,
      newQuestion,
      realFacts,
      aiStyle,
      length: lengthIn,
      depth: depthIn,
      tone: toneIn,
      plausibility: plausibilityIn,
      previousYear: previousYearIn,
    } = await req.json()

    // aiStyle is the old name for length; accept it so older clients keep working.
    const length = normalizeLength(lengthIn ?? aiStyle)
    const depth = normalizeDepth(depthIn)
    const tone = normalizeTone(toneIn ?? (aiStyle === 'academic' ? 'academic' : aiStyle === 'storytelling' ? 'dramatic' : undefined))
    const plausibility = normalizePlausibility(plausibilityIn)
    const spec = LENGTH_SPEC[length]
    const previousYear = typeof previousYearIn === 'number' && Number.isFinite(previousYearIn) ? Math.round(previousYearIn) : parseYear(previousYearIn)

    const previousContext = previousWhatIfs.length > 0
      ? `PREVIOUSLY ESTABLISHED FACTS IN THIS ALTERNATE TIMELINE (treat these as locked — do not contradict them):
${previousWhatIfs.map((q: string, i: number) => `Change ${i + 1}: ${q}`).join('\n')}

Current state of the alternate world based on all changes so far:
${currentWorldState}`
      : 'This is the first divergence from real history in this session.'

    const styleInstruction = `RESPONSE SETTINGS (follow these exactly):
${DEPTH_INSTRUCTION[depth]}
${TONE_INSTRUCTION[tone]}
${PLAUSIBILITY_INSTRUCTION[plausibility]}
LENGTH: ${length.toUpperCase()}. Hit the word counts given in the JSON template below. Do not pad a short answer and do not trim a long one.`

    const yearRule = previousYear !== null
      ? `YEAR RULE: the "year" field must be a plain year such as "${formatYear(previousYear)}" or "${formatYear(previousYear + 4)}" (digits only, or digits plus BC). It must be ${formatYear(previousYear)} or LATER, never earlier, because the timeline has already reached ${formatYear(previousYear)}. Do not put words in the year field.`
      : 'YEAR RULE: the "year" field must be a plain year such as "1968" (digits only, or digits plus BC), with no words.'

    const prompt = `${styleInstruction}

STARTING HISTORICAL EVENT: ${startingEvent}

DOCUMENTED REAL HISTORY FACTS FOR THIS EVENT:
${realFacts.map((f: string, i: number) => `${i + 1}. ${f}`).join('\n')}

${previousContext}

THE USER'S QUESTION: "${newQuestion}"

FIRST — TOPIC CHECK:
Is this question related to history or a historical what-if? If not, output a refusal JSON as described in your instructions.

IF HISTORICAL — REASON THROUGH THIS BEFORE ANSWERING:
Work through each step mentally before generating your response:

Step 1 — Direct immediate consequence: What specifically and directly changes in the first 1-2 years because of this?
Step 2 — Near-term ripples: What institutions, wars, laws, or movements depended on the original event and now do not exist or change?
Step 3 — Medium-term divergence: How do power structures, economies, and societies evolve differently over the next decade or more?
Step 4 — Overdetermination: What would have happened anyway through a different pathway even with this change?
Step 5 — Honest uncertainty: Where are you genuinely unsure? Flag it.

SCALE CHECK:
If this is a very large-scale what-if (Industrial Revolution, Roman Empire, invention of agriculture, etc.) — acknowledge the complexity, reframe it as a more specific and modelable version, and be honest about the limits of prediction at civilizational scale.

NOW OUTPUT ONLY THIS JSON — no markdown, no backticks, no text outside the JSON:
{
  "paragraph": "${spec.paragraph}, describing the immediate consequence in the tone and depth above. Real names, real places, real causal logic. If refusing, explain why here.",
  "keyFacts": [
${numberedFacts(spec.facts)}
  ],
  "factExplanations": [
    exactly ${spec.facts} explanations, one per fact in the same order, each ${spec.explanation}, citing real mechanisms, forces or precedents
  ],
  "worldMood": "exactly one of: STABLE, TENSE, CRITICAL, AT WAR, CATASTROPHIC, REBUILDING, FLOURISHING",
  "divergenceScore": <integer 1-100. Start low for small changes. Compound upward for each additional what-if. A world where one small decision changed is maybe 15-25. A world where WW2 never happened is 70+. A world without the Industrial Revolution is 95+>,
  "year": "The year the alternate world has now reached. ${yearRule}",
  "uncertaintyLevel": "LOW, MEDIUM, or HIGH — how confident are you in these predictions based on historical evidence",
  "suggestions": [
    exactly ${spec.suggestions} short follow-up questions the user could ask next, each starting with "What if", each a specific question about THIS alternate timeline (not a restatement of the question just asked), each under 20 words
  ]
}
The LAST key fact must be something that would NOT change, to show historical honesty. keyFacts must contain exactly ${spec.facts} items and factExplanations exactly ${spec.facts} items.`

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: spec.maxTokens,
      temperature: 0.3,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }]
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const clean = text.replace(/```json|```/g, '').trim()

    let data
    try {
      data = JSON.parse(clean)
    } catch {
      // If JSON parsing fails, try to extract JSON from the response
      const jsonMatch = clean.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        data = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('Could not parse JSON from response')
      }
    }

    // Safety net for the year rule: if the model still went backwards, hold the timeline at the previous year.
    if (previousYear !== null && data && typeof data === 'object') {
      const y = parseYear(data.year)
      data.year = formatYear(y === null || y < previousYear ? previousYear : y)
    }
    if (data && typeof data === 'object') {
      // These two fields were retired; keep them in the shape so older saved sessions and types still line up.
      data.narration = ''
      data.reliabilityNotes = ''
      if (depth === 'simple') {
        const plain = (t: unknown) => (typeof t === 'string' ? t.replace(/\s*[\u2014\u2013]\s*/g, ', ') : t)
        for (const k of ['paragraph', 'year']) data[k] = plain(data[k])
        for (const k of ['keyFacts', 'factExplanations', 'suggestions']) if (Array.isArray(data[k])) data[k] = data[k].map(plain)
      }
    }
    if (data && typeof data === 'object') {
      data.suggestions = Array.isArray(data.suggestions)
        ? data.suggestions.filter((q: unknown) => typeof q === 'string' && q.trim()).slice(0, 3)
        : []
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('Diverge API error:', err)
    return NextResponse.json(
      { error: 'Failed to generate response. Please try again.' },
      { status: 500 }
    )
  }
}