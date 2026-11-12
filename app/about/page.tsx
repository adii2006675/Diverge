'use client'
import { useRouter } from 'next/navigation'
import Nav from '@/components/Nav'
import { useId, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { EASE_OUT } from '@/lib/motion'

const SOFT = { type: 'spring', stiffness: 130, damping: 22, mass: 0.9 } as const

type Point = { lead: string; text: string }

const HOW: Point[] = [
  { lead: "Strict rules first.", text: "Every question starts with a long set of instructions, about 1,000 words. They tell the AI to act like a historian, stick to history, never invent numbers, dates or quotes, and say when it is guessing." },
  { lead: "Real facts go in with your question.", text: "Each event comes with real facts that I wrote in ahead of time. Then a quick research step searches the web for credible sources, like government sites, universities, museums and established news outlets, and the AI gets those notes along with a Wikipedia excerpt. Blogs, forums and content farms are filtered out, and the sources it used are listed under each answer." },
  { lead: "A set way of thinking.", text: "The rules make it work in steps: what changes right away (0 to 2 years), the ripple effects (2 to 10 years), the long term (10 to 50 years), what would have happened anyway, and where it is unsure." },
  { lead: "Every answer has the same structure.", text: "You always get the year, a divergence score, the world mood, a confidence level and a list of key facts, so answers are easy to compare. A normal chat just gives you a wall of text." },
  { lead: "A second AI checks the first one.", text: "After an answer shows up, a smaller AI looks over the facts labeled documented and flags the ones it can't confirm as unconfirmed." },
  { lead: "Your timeline stays consistent.", text: "Your earlier questions are locked in so a new answer can't contradict them, and the year can only move forward." },
  { lead: "It stays on topic and on guard.", text: "Questions that aren't about history get refused. Your question is treated as a question and not as orders, which blocks most tricks. There is also a test script with 17 checks for facts, refusals, tricks and false premises." },
  { lead: "You can tune it.", text: "Settings let you pick how long the answer is, how simple or detailed, the tone, and whether the guesses are realistic or bolder. There is also a library of real events to start from, so you are never staring at a blank box." },
]

const NUMBERS: Point[] = [
  { lead: "Model:", text: "Claude Sonnet 4.6, made by Anthropic, writes the answers and the final summary. Claude Haiku 4.5 does the web research (up to 3 searches per question) and the fact check." },
  { lead: "Randomness:", text: "The temperature is set to 0.2, so answers stay steady instead of wild." },
  { lead: "Tokens in:", text: "Roughly 4,500 to 5,500 tokens go in with every question. That covers the rules (about 1,750), the instructions for your settings (about 800), the event facts, web research notes and Wikipedia text (about 1,800) and your earlier questions. The research step has its own usage on top of that." },
  { lead: "Tokens out:", text: "Up to 2,000 for Short answers, 3,500 for Medium and 7,000 for Long. The fact check uses at most 600." },
  { lead: "Speed and cost:", text: "The long rules are set up to be cached, so follow-up questions can reuse them. These counts are estimates based on the size of my prompts." },
]

const WHY: Point[] = [
  { lead: "It predicts, it doesn't know.", text: "The AI writes the words that seem most likely to come next. It can sound completely sure and still be wrong, and it can mix up names, dates and numbers." },
  { lead: "There is no answer key.", text: "Nobody knows what would really have happened, and even expert historians would disagree about these what ifs." },
  { lead: "The checker has blind spots too.", text: "The second AI is smaller, only looks at facts labeled documented, and works from the research notes and a short Wikipedia excerpt that do not always match your question. It can miss mistakes, and the first AI can label a guess as a fact." },
  { lead: "The web is not all trustworthy.", text: "I filter out sites that look unreliable, but a search can still pick up a page that is out of date or wrong, and even a respected outlet makes mistakes. Check the sources listed under an answer before you rely on it." },
  { lead: "Mistakes pile up.", text: "Every answer builds on the last one, so a small error early on can grow the longer you keep going." },
  { lead: "Its knowledge has limits.", text: "It may not know about very recent events, and what it learned from the internet can be biased or incomplete." },
]

// A plain list. It sits inside a dropdown, which does the reveal.
function PointList({ items }: { items: Point[] }) {
  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
      {items.map(it => (
        <li key={it.lead} style={{ position: 'relative', paddingLeft: 20, fontSize: 'calc(var(--font-scale) * 1.2)', lineHeight: 1.7, color: 'var(--text-dim)' }}>
          <span aria-hidden="true" style={{ position: 'absolute', left: 0, top: '0.72em', width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }} />
          <strong style={{ color: 'var(--text)', fontWeight: 600 }}>{it.lead}</strong> {it.text}
        </li>
      ))}
    </ul>
  )
}

// A headline with a chevron that opens and closes the content under it.
function Dropdown({ title, defaultOpen = false, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen)
  const id = useId()
  return (
    <div className="about-acc">
      <button type="button" className="about-acc-head" aria-expanded={open} aria-controls={id} onClick={() => setOpen(o => !o)}>
        <span>{title}</span>
        <svg className={`about-chev${open ? ' open' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
      </button>
      <div id={id} role="region" aria-label={title} className={`about-collapse${open ? ' open' : ''}`}>
        <div><div style={{ padding: '6px 4px 22px' }}>{children}</div></div>
      </div>
    </div>
  )
}

// The headline lands one word at a time, each coming into focus.
function Words({ text, reduce }: { text: string; reduce: boolean | null }) {
  return (
    <>
      {text.split(' ').map((w, i, all) => (
        <span key={i}>
        <motion.span
          style={{ display: 'inline-block' }}
          initial={{ opacity: 0, y: reduce ? 0 : 22, filter: reduce ? 'blur(0px)' : 'blur(10px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ ...SOFT, delay: i * 0.07 }}
        >
          {w}
        </motion.span>
        {i < all.length - 1 ? ' ' : ''}
        </span>
      ))}
    </>
  )
}

export default function AboutPage() {
  const router = useRouter()

  const reduce = useReducedMotion()
  // A lighter reveal for the very tall accuracy section.
  const fadeLight = reduce
    ? { hidden: { opacity: 0 }, show: { opacity: 1 } }
    : { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }
  // Content rises in from slightly soft and small; with reduced motion it only fades.
  const fadeUp = reduce
    ? { hidden: { opacity: 0 }, show: { opacity: 1 } }
    : { hidden: { opacity: 0, y: 30, scale: 0.985, filter: 'blur(10px)' }, show: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' } }

  return (
    <main style={{ minHeight: 'var(--vh-fit, 100vh)', background: 'transparent', color: 'var(--text)', fontFamily: 'Inter, system-ui, sans-serif', position: 'relative' }}>
      <Nav active="about" />

      <div className="font-scale-wrapper page-wrap" style={{ position: 'relative', zIndex: 1, maxWidth: 680, margin: '0 auto', padding: '120px 24px 80px' }}>
        <h1 className="about-title" style={{ fontSize: 'calc(var(--font-scale) * 3.5)', fontWeight: 900, marginBottom: 24, letterSpacing: '-0.02em', textAlign: 'center' }}>
          <Words text="What is Diverge?" reduce={reduce} />
        </h1>

        <motion.p
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          variants={fadeUp}
          transition={{ ...SOFT, delay: 0.05 }}
          style={{ fontSize: 'calc(var(--font-scale) * 1.33)', lineHeight: 1.85, color: 'var(--text-dim)', marginBottom: 24 }}
        >
          Diverge is a site where you pick a moment in history and ask what would have happened if it went a different way. You get an answer right away, and you can see how it compares to what really happened.
        </motion.p>

        <motion.p
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          variants={fadeUp}
          transition={{ ...SOFT, delay: 0.1 }}
          style={{ fontSize: 'calc(var(--font-scale) * 1.33)', lineHeight: 1.85, color: 'var(--text-dim)', marginBottom: 24 }}
        >
          The answers come from Claude, an AI made by Anthropic. It uses real history, like who was allied with who, how strong each army was, and how the economy worked, to figure out what would change. It&apos;s not just making stuff up. It&apos;s trying to think through cause and effect the way a historian would.
        </motion.p>

        <motion.p
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          variants={fadeUp}
          transition={{ ...SOFT, delay: 0.15 }}
          style={{ fontSize: 'calc(var(--font-scale) * 1.33)', lineHeight: 1.85, color: 'var(--text-dim)', marginBottom: 40 }}
        >
          You can keep going, too. Each answer builds on the one before it, so your what ifs stack up into one alternate world that gets further from ours with every question. When you&apos;re done, a summary shows how different your world turned out.
        </motion.p>

        <div style={{ borderTop: '1px solid var(--accent)', paddingTop: 40, marginBottom: 40 }}>
          <motion.h2
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.5, margin: '-15% 0px -15% 0px' }}
            variants={fadeUp}
            transition={{ ...SOFT }}
            style={{ fontSize: 'calc(var(--font-scale) * 1.83)', fontWeight: 700, marginBottom: 16, textAlign: 'center' }}
          >
            How it works
          </motion.h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              { step: '01', title: 'Pick a moment', desc: "Pick any event from history, or just type in your own starting point if you already know exactly what you want to ask about." },
              { step: '02', title: 'Ask what if', desc: "Type the change you want to make. The AI thinks through what would really happen next, using what we know about that time." },
              { step: '03', title: 'Watch it diverge', desc: "Your answers show up on the left and real history stays on the right, so you can easily compare the two as you keep asking." },
              { step: '04', title: 'Keep going', desc: "Ask follow-up what ifs. Each one builds on the last one, so your alternate world keeps growing and drifting further away." },
              { step: '05', title: 'Get your summary', desc: "When you finish, you get a side by side comparison of your world and ours, covering things like population, tech and power." },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: reduce ? 0 : -32, filter: reduce ? 'blur(0px)' : 'blur(8px)' }}
                whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                viewport={{ once: true, amount: 0.5, margin: '-15% 0px -15% 0px' }}
                transition={{ ...SOFT, delay: 0.04 }}
                style={{
                  display: 'flex', gap: 20, alignItems: 'flex-start',
                  paddingLeft: 20, paddingTop: 14, paddingBottom: 14,
                  marginLeft: 10, position: 'relative',
                }}
              >
                {i < 4 && (
                  <>
                    <span aria-hidden="true" style={{ position: 'absolute', left: -2, top: 36, bottom: -26, width: 2, borderRadius: 2, background: 'var(--border-color)' }} />
                    <motion.span
                      aria-hidden="true"
                      initial={{ scaleY: reduce ? 1 : 0 }}
                      whileInView={{ scaleY: 1 }}
                      viewport={{ once: true, amount: 0.5, margin: '-15% 0px -15% 0px' }}
                      transition={{ duration: 0.7, ease: EASE_OUT, delay: 0.25 }}
                      style={{ position: 'absolute', left: -2, top: 36, bottom: -26, width: 2, borderRadius: 2, background: 'var(--accent)', transformOrigin: 'top' }}
                    />
                  </>
                )}
                <motion.div
                  initial={{ scale: reduce ? 1 : 0.3 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true, amount: 0.5, margin: '-15% 0px -15% 0px' }}
                  transition={{ type: 'spring', stiffness: 520, damping: 16, delay: 0.12 }}
                  style={{
                    position: 'absolute', left: -11, top: 16,
                    width: 20, height: 20, borderRadius: '50%',
                    background: 'var(--bg)', border: '2px solid var(--accent)',
                    color: 'var(--accent)', fontSize: 10, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  {item.step.replace('0', '')}
                </motion.div>
                <div style={{ marginLeft: 14 }}>
                  <div style={{ fontSize: 'calc(var(--font-scale) * 1.25)', fontWeight: 600, marginBottom: 4 }}>{item.title}</div>
                  <div style={{ fontSize: 'calc(var(--font-scale) * 1.33)', color: 'var(--text-dim)', lineHeight: 1.65 }}>{item.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.02 }}
          variants={fadeLight}
          transition={{ ...SOFT }}
          style={{ borderTop: '1px solid var(--accent)', paddingTop: 40, marginBottom: 40 }}
        >
          <h2 style={{ fontSize: 'calc(var(--font-scale) * 1.83)', fontWeight: 700, marginBottom: 12, textAlign: 'center' }}>Accuracy disclaimer</h2>
          <p style={{ fontSize: 'calc(var(--font-scale) * 1.33)', lineHeight: 1.75, color: 'var(--text-dim)' }}>
            Diverge writes alternate history, so there is no answer key. Nobody can check what would really have happened. What I can do is make the AI be honest about what is real and what is a guess, so I built in a bunch of safeguards. Here is what they are and why it still is not perfect. Tap a heading to open it.
          </p>
          <div style={{ marginTop: 28 }}>
            <Dropdown title="How an answer gets made">
              <PointList items={HOW} />
            </Dropdown>
            <Dropdown title="The numbers"><PointList items={NUMBERS} /></Dropdown>
            <Dropdown title="Why it can still be wrong"><PointList items={WHY} /></Dropdown>
          </div>
          <p style={{ fontSize: 'calc(var(--font-scale) * 1.33)', lineHeight: 1.75, color: 'var(--text-dim)', marginTop: 28 }}>
            So use Diverge to explore and get curious, not as a source for homework or for facts you plan to repeat. If something really matters, check it with a real source.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.5, margin: '-15% 0px -15% 0px' }}
          variants={fadeUp}
          transition={{ ...SOFT }}
          style={{ borderTop: '1px solid var(--accent)', paddingTop: 40 }}
        >
          <h2 style={{ fontSize: 'calc(var(--font-scale) * 1.83)', fontWeight: 700, marginBottom: 12, textAlign: 'center' }}>Built by</h2>
          <p style={{ fontSize: 'calc(var(--font-scale) * 1.33)', lineHeight: 1.75, color: 'var(--text-dim)', marginBottom: 20 }}>
            Diverge was built by Adi Sharma, a CS student at the University of Delaware. It uses the Claude API from Anthropic for the AI answers, Next.js for the front end, and Supabase to store your sessions.
          </p>

          <div className="about-links" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
            <a href="https://github.com/adii2006675/Diverge" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--card-bg)', color: 'var(--text-dim)', fontSize: 14, textDecoration: 'none', transition: 'all 0.2s' }} onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.borderColor = '#9CA3AF'; el.style.transform = 'scale(1.06)'; const span = el.querySelector('span') as HTMLSpanElement; span.style.backgroundImage = 'linear-gradient(45deg, #ffffff, #6e7681, #24292e)'; span.style.webkitBackgroundClip = 'text'; span.style.backgroundClip = 'text'; span.style.color = 'transparent' }} onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.borderColor = 'var(--border-color)'; el.style.transform = 'scale(1)'; const span = el.querySelector('span') as HTMLSpanElement; span.style.backgroundImage = 'none'; span.style.color = 'var(--text-dim)' }}><span style={{ transition: 'color 0.2s' }}>GitHub</span></a>
            <a href="https://www.linkedin.com/in/adisharma06/" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--card-bg)', color: 'var(--text-dim)', fontSize: 14, textDecoration: 'none', transition: 'all 0.2s' }} onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.borderColor = '#0A66C2'; el.style.transform = 'scale(1.06)'; const span = el.querySelector('span') as HTMLSpanElement; span.style.backgroundImage = 'linear-gradient(45deg, #0A66C2, #ffffff)'; span.style.webkitBackgroundClip = 'text'; span.style.backgroundClip = 'text'; span.style.color = 'transparent' }} onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.borderColor = 'var(--border-color)'; el.style.transform = 'scale(1)'; const span = el.querySelector('span') as HTMLSpanElement; span.style.backgroundImage = 'none'; span.style.color = 'var(--text-dim)' }}><span style={{ transition: 'color 0.2s' }}>LinkedIn</span></a>
            <a href="https://www.instagram.com/adii.sharma__/" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--card-bg)', color: 'var(--text-dim)', fontSize: 14, textDecoration: 'none', transition: 'all 0.2s' }} onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.borderColor = '#d62976'; el.style.transform = 'scale(1.06)'; const span = el.querySelector('span') as HTMLSpanElement; span.style.backgroundImage = 'linear-gradient(45deg, #4f5bd5, #962fbf, #d62976, #fa7e1e, #feda75)'; span.style.webkitBackgroundClip = 'text'; span.style.backgroundClip = 'text'; span.style.color = 'transparent' }} onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.borderColor = 'var(--border-color)'; el.style.transform = 'scale(1)'; const span = el.querySelector('span') as HTMLSpanElement; span.style.backgroundImage = 'none'; span.style.color = 'var(--text-dim)' }}><span style={{ transition: 'color 0.2s' }}>Instagram</span></a>
            <a href="https://adii2006675.github.io" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--card-bg)', color: 'var(--text-dim)', fontSize: 14, textDecoration: 'none', transition: 'all 0.2s' }} onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.color = 'var(--accent)'; el.style.borderColor = 'var(--accent)'; el.style.transform = 'scale(1.06)' }} onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.color = 'var(--text-dim)'; el.style.borderColor = 'var(--border-color)'; el.style.transform = 'scale(1)' }}>Portfolio</a>
          </div>

        </motion.div>
      </div>
    </main>
  )
}