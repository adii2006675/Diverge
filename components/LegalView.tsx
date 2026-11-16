'use client'
import Link from 'next/link'
import Nav from '@/components/Nav'
import { useAutoT } from '@/lib/autoTranslate'
import { useT } from '@/lib/useT'

export type LegalSection = { title: string; body: string[] }

// The page shell shared by Privacy and Terms. The text is translated into the chosen language as it is shown.
export default function LegalView({ title, intro, sections }: { title: string; intro: string; sections: LegalSection[] }) {
  const { at } = useAutoT()
  const { t } = useT()
  return (
    <main style={{ minHeight: 'var(--vh-fit, 100vh)', color: 'var(--text)', fontFamily: 'Figtree, system-ui, sans-serif', position: 'relative' }}>
      <Nav />
      <div className="page-wrap" style={{ position: 'relative', zIndex: 1, maxWidth: 720, margin: '0 auto', padding: '140px 24px 80px' }}>
        <h1 style={{ fontSize: 'calc(var(--font-scale) * 2.67)', fontWeight: 900, letterSpacing: '-0.02em', margin: '0 0 8px' }}>{t(title)}</h1>
        <p style={{ fontSize: 'var(--font-scale)', color: 'var(--text-dim)', margin: '0 0 36px', lineHeight: 1.7 }}>{at(intro)}</p>
        {sections.map(s => (
          <section key={s.title} style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 'calc(var(--font-scale) * 1.3)', fontWeight: 800, margin: '0 0 8px' }}>{at(s.title)}</h2>
            {s.body.map((p, i) => (
              <p key={i} style={{ fontSize: 'var(--font-scale)', color: 'var(--text-dim)', lineHeight: 1.75, margin: '0 0 8px' }}>{at(p)}</p>
            ))}
          </section>
        ))}
        <Link href="/" style={{ color: 'var(--accent)', fontSize: 'var(--font-scale)', fontWeight: 600 }}>{t('Back to Diverge')}</Link>
      </div>
    </main>
  )
}
