'use client'
/* eslint-disable @next/next/no-img-element */
import Nav from '@/components/Nav'
import { useT } from '@/lib/useT'

export type CreditRow = { id: string; file: string; author: string; licence: string; sourceLabel: string; sourceUrl: string; title: string }

export default function CreditsView({ notes, rows }: { notes: string[]; rows: CreditRow[] }) {
  const { t } = useT()

  const th: React.CSSProperties = { textAlign: 'left', padding: '10px 14px', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim, rgba(255,255,255,0.55))', borderBottom: '1px solid var(--border-color, rgba(255,255,255,0.1))' }
  const td: React.CSSProperties = { padding: '10px 14px', fontSize: 13, lineHeight: 1.5, verticalAlign: 'middle', borderBottom: '1px solid var(--border-color, rgba(255,255,255,0.1))' }

  return (
    <main style={{ minHeight: 'var(--vh-fit, 100vh)', background: 'transparent', color: 'var(--text, #fff)', fontFamily: 'Figtree, system-ui, sans-serif', position: 'relative' }}>
      <Nav />
      <div className="page-wrap" style={{ position: 'relative', zIndex: 1, width: 'min(92vw, 1200px)', margin: '0 auto', padding: '120px 0 80px' }}>
        <h1 style={{ fontSize: 40, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 12 }}>{t('Image credits')}</h1>
        {notes.map(n => (
          <p key={n} style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-dim, rgba(255,255,255,0.55))', maxWidth: '75ch', marginBottom: 8 }}>{t(n)}</p>
        ))}

        <div style={{ marginTop: 28, borderRadius: 14, border: '1px solid var(--border-color, rgba(255,255,255,0.1))', background: 'var(--card-bg, rgba(255,255,255,0.03))', overflow: 'hidden' }}>
          <table className="cr-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ ...th, width: 84 }}><span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>{t('Image')}</span></th>
                <th style={th}>{t('Event')}</th>
                <th style={th}>{t('Author / credit')}</th>
                <th style={th}>{t('Licence')}</th>
                <th style={th}>{t('Source')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id}>
                  <td style={td}>
                    <div style={{ width: 56, height: 40, borderRadius: 6, overflow: 'hidden', background: 'var(--card-bg, rgba(255,255,255,0.03))' }}>
                      <img src={`/events/${r.file}`} alt="" loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  </td>
                  <td style={{ ...td, fontWeight: 600 }}>{r.title}</td>
                  <td style={{ ...td, color: 'var(--text-dim, rgba(255,255,255,0.55))', overflowWrap: 'anywhere' }}>{r.author}</td>
                  <td style={{ ...td, whiteSpace: 'nowrap' }}>{r.licence}</td>
                  <td style={{ ...td, whiteSpace: 'nowrap' }}>
                    {r.sourceUrl ? (
                      <a href={r.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent, #F59E0B)', textDecoration: 'underline', textUnderlineOffset: 3 }}>
                        {t('Commons page')}
                      </a>
                    ) : t('None')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
