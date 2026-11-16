import Link from 'next/link'
import Nav from '@/components/Nav'

export const metadata = { title: 'Terms · Diverge' }

const sections: { title: string; body: string[] }[] = [
  {
    title: 'What Diverge is',
    body: [
      'Diverge is a small creative project. You pick a historical event, ask a what-if question, and an AI writes a possible alternate history. It is made for curiosity and learning.',
    ],
  },
  {
    title: 'Answers are not facts',
    body: [
      'Everything about the alternate world is the AI imagining what might have happened. It can be wrong, and the divergence score is an estimate, not a measurement. The real-history facts shown come from public sources and can contain mistakes. Check anything important yourself.',
    ],
  },
  {
    title: 'Using the site',
    body: [
      'Be kind and use it for lawful purposes. Do not try to break the site, overload it, or use it to produce content that targets or harms real people. Accounts get a limited number of free questions; after that you can add your own Anthropic API key.',
    ],
  },
  {
    title: 'Your content',
    body: [
      'The questions you ask and the timelines you save are yours. If you press Share, anyone with the link can read that timeline until you stop sharing it.',
    ],
  },
  {
    title: 'No guarantees',
    body: [
      'Diverge is provided as it is, with no promise that it will always be available or free of errors. It may change or shut down at any time. To the extent the law allows, the person who runs the site is not liable for losses from using it.',
    ],
  },
  {
    title: 'Questions',
    body: [
      'See the Privacy page for how data is handled. For anything else, contact the person who runs this site from the About page.',
    ],
  },
]

export default function TermsPage() {
  return (
    <main style={{ minHeight: 'var(--vh-fit, 100vh)', color: 'var(--text)', fontFamily: 'Figtree, system-ui, sans-serif', position: 'relative' }}>
      <Nav />
      <div className="page-wrap" style={{ position: 'relative', zIndex: 1, maxWidth: 720, margin: '0 auto', padding: '140px 24px 80px' }}>
        <h1 style={{ fontSize: 'calc(var(--font-scale) * 2.67)', fontWeight: 900, letterSpacing: '-0.02em', margin: '0 0 8px' }}>Terms</h1>
        <p style={{ fontSize: 'var(--font-scale)', color: 'var(--text-dim)', margin: '0 0 36px', lineHeight: 1.7 }}>
          The short version of the rules for using Diverge.
        </p>
        {sections.map(s => (
          <section key={s.title} style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 'calc(var(--font-scale) * 1.3)', fontWeight: 800, margin: '0 0 8px' }}>{s.title}</h2>
            {s.body.map((p, i) => (
              <p key={i} style={{ fontSize: 'var(--font-scale)', color: 'var(--text-dim)', lineHeight: 1.75, margin: '0 0 8px' }}>{p}</p>
            ))}
          </section>
        ))}
        <Link href="/" style={{ color: 'var(--accent)', fontSize: 'var(--font-scale)', fontWeight: 600 }}>Back to Diverge</Link>
      </div>
    </main>
  )
}
