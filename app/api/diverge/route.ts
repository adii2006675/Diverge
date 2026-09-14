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

const FACT_TEMPLATES = [
  "Fact %d: if [the change] continues, [consequence] follows, use real names/institutions/numbers where documentable",
  "Fact %d: flag any speculation with 'most likely' or 'historians would debate', and name the time horizon",
  "Fact %d: focus on political, economic, military, or social consequences, tied to a specific year or span",
  "Fact %d: include one thing that would NOT change, to show historical honesty",
  "Fact %d: trace a downstream, compounding effect further out in time from an earlier fact",
  "Fact %d: consider international or geopolitical ripple effects, with a concrete timeframe",
  "Fact %d: consider technological or cultural ripple effects, with a concrete timeframe",
]

function buildFactPlaceholders(count: number) {
  return Array.from({ length: count }, (_, i) => `"${FACT_TEMPLATES[i % FACT_TEMPLATES.length].replace('%d', String(i + 1))}"`).join(',\n    ')
}

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
- Be direct and specific

HOUSE WRITING STYLE (apply to every text field in your output):
- Write in active voice.
- Keep sentences direct and concrete. Mix short, medium, and long sentences for rhythm instead of a uniform pace.
- Use plain, practical language. Cut clichés and jargon in favor of specific, clear terms.
- State things directly. When the evidence supports a clear conclusion, say it plainly instead of hedging with "might" or "could."
- Never use em dashes. Use commas, periods, or parentheses instead.
- Avoid semicolons. Use periods or commas instead.
- Do not use hashtags, emojis, or asterisks anywhere in your output.`

export async function POST(req: NextRequest) {
  try {
    const {
      startingEvent,
      previousWhatIfs,
      currentWorldState,
      newQuestion,
      realFacts,
      aiStyle,
      tone,
      plausibility,
      readingLevel,
      focusPoint
    } = await req.json()

    const previousContext = previousWhatIfs.length > 0
      ? `PREVIOUSLY ESTABLISHED FACTS IN THIS ALTERNATE TIMELINE (treat these as locked — do not contradict them):
${previousWhatIfs.map((q: string, i: number) => `Change ${i + 1}: ${q}`).join('\n')}

Current state of the alternate world based on all changes so far:
${currentWorldState}`
      : 'This is the first divergence from real history in this session.'

    const factCount = aiStyle === 'short' || aiStyle === 'concise'
      ? 3
      : aiStyle === 'long' || aiStyle === 'detailed'
      ? 7
      : 5

    const lengthInstruction = factCount === 3
      ? 'LENGTH: Short. Include EXACTLY 3 items in keyFacts (and exactly 3 matching items in factExplanations, one per fact). Each keyFacts item must be about 15-20 words, one tight sentence. No unnecessary words.'
      : factCount === 7
      ? 'LENGTH: Long. Include EXACTLY 7 items in keyFacts (and exactly 7 matching items in factExplanations, one per fact). Each keyFacts item must be about 35-40 words, with fuller context and richer explanation.'
      : 'LENGTH: Medium. Include EXACTLY 5 items in keyFacts (and exactly 5 matching items in factExplanations, one per fact). Each keyFacts item must be about 25-30 words.'

    const toneInstruction = tone === 'dramatic'
      ? 'TONE: Dramatic Narrator — vivid, cinematic storytelling.'
      : tone === 'academic'
      ? 'TONE: Academic — formal, citation-minded, precise. Use phrases like "historical evidence suggests" and "scholars debate".'
      : 'TONE: Neutral Historian — balanced, factual, measured.'

    const readingLevelInstruction = readingLevel === 'simple'
      ? 'READING LEVEL: Simple — write for a 5th-grade reading level, like explaining to a curious 10-year-old. Very short sentences, everyday words only, explain any necessary term in-line the moment you use it. No jargon.'
      : readingLevel === 'complex'
      ? 'READING LEVEL: Complex — college level. Advanced vocabulary, longer and more sophisticated sentence structure, assume a well-read adult audience comfortable with technical and academic language.'
      : 'READING LEVEL: Moderate — write for an 11th-grade reading level. Clear, moderately varied sentence structure, common vocabulary with occasional precise terms that a high school junior would understand.'

    const plausibilityInstruction = plausibility === 'speculative'
      ? 'PLAUSIBILITY: Creative & Speculative — you may explore bigger, more novel, less-certain ripple effects than a cautious historian would. Still ground everything in real historical mechanisms, but do not be afraid of larger, more imaginative consequences. This should generally push divergenceScore higher than a conservative reading of the same change would.'
      : 'PLAUSIBILITY: Realistic & Accurate — stay conservative. Only include consequences you can defend with real historical mechanisms and precedent. When in doubt, favor the more restrained outcome.'

    const styleInstruction = `${lengthInstruction}\n${toneInstruction}\n${readingLevelInstruction}\n${plausibilityInstruction}`

    const today = new Date()
    const todayLabel = today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    const presentDayContext = `PRESENT-DAY CONTEXT:
Today's real-world date is ${todayLabel}. When a what-if scenario involves an ongoing trend, technology, or economic condition rather than a single past event, reason forward realistically all the way to today and beyond. Do not freeze your analysis at the year the original anchor event occurred. Incorporate what has plausibly happened in the intervening years up to now, including major recent developments relevant to the scenario (for example, how AI-driven demand has reshaped chip and memory markets, or other current economic conditions), when they logically connect to the question.`

    const focusInstruction = focusPoint
      ? `\n\nPRIORITY FOCUS — the user clicked to drill deeper into this specific thread: "${focusPoint}". Center your reasoning on how THIS specific consequence develops further, rather than a general continuation of the whole timeline.`
      : ''

    const prompt = `${styleInstruction}

${presentDayContext}

STARTING HISTORICAL EVENT: ${startingEvent}

DOCUMENTED REAL HISTORY FACTS FOR THIS EVENT:
${realFacts.map((f: string, i: number) => `${i + 1}. ${f}`).join('\n')}

${previousContext}

THE USER'S QUESTION: "${newQuestion}"${focusInstruction}

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

BULLET STRUCTURE — apply this to every item in keyFacts:
Do not state a static, disconnected fact. Chain cause to effect to a concrete time horizon, in the shape: "If [the change/condition] continues or holds, [specific consequence] happens, which by [a specific year or timeframe] leads to [downstream effect]." Every keyFacts item should make clear WHAT changes, WHY it changes (the causal mechanism), and WHEN the consequence plays out or compounds further. This matters most for open-ended or ongoing scenarios (for example "what if COVID was still happening" or "what if this trend continues") — reason forward through time explicitly with real, specific years or time spans, rather than describing a frozen snapshot.

NOW OUTPUT ONLY THIS JSON — no markdown, no backticks, no text outside the JSON:
{
  "paragraph": "2-3 sentences describing the immediate consequence. Cinematic and grounded. Real names, real places, real causal logic. If refusing, explain why here.",
  "keyFacts": [
    ${buildFactPlaceholders(factCount)}
  ],
  "factExplanations": [
    ${Array.from({ length: factCount }, (_, i) => `"Historical reasoning for fact ${i + 1}, citing real mechanisms, forces, or precedents"`).join(',\n    ')}
  ],
  "worldMood": "exactly one of: STABLE, TENSE, CRITICAL, AT WAR, CATASTROPHIC, REBUILDING, FLOURISHING",
  "divergenceScore": <integer 1-100. Start low for small changes. Compound upward for each additional what-if. A world where one small decision changed is maybe 15-25. A world where WW2 never happened is 70+. A world without the Industrial Revolution is 95+>,
  "mapChanges": "Specific description of which nations, empires, or regions gain or lose power and why",
  "year": "The effective year the alternate world has reached, kept short (e.g. '1550' or '2031') — never a full sentence. May be ahead or behind real history depending on consequences.",
  "confidenceScore": <integer 1-100 — how confident you are in these specific predictions, calibrated as: 90-100 = directly follows a documented historical mechanism, 60-89 = well-supported historical inference with strong precedent, 30-59 = plausible but genuinely speculative, 1-29 = highly uncertain guesswork. Be honest and use the full range — do not default to the middle.>,
  "comparison": [
    { "category": "Short category name (e.g. 'Technology', 'Politics', 'Economy')", "real": "What actually happened in real history, kept to about 12 words", "diverged": "What happens instead in this alternate timeline, kept to about 12 words" },
    { "category": "A second, different category", "real": "...", "diverged": "..." },
    { "category": "A third, different category", "real": "...", "diverged": "..." }
  ]
}`

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      temperature: 0.3,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }]
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const clean = text.replace(/```json|```/g, '').replace(/,(\s*[\]}])/g, '$1').trim()

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

    return NextResponse.json(stripEmDashes(data))
  } catch (err) {
    console.error('Diverge API error:', err)
    return NextResponse.json(
      { error: 'Failed to generate response. Please try again.' },
      { status: 500 }
    )
  }
}