/* eslint-disable @next/next/no-img-element */
import fs from 'node:fs'
import path from 'node:path'
import Nav from '@/components/Nav'
import { ALL_EVENTS } from '@/lib/events'

export const metadata = { title: 'Image credits · Diverge' }

type Row = { id: string; file: string; author: string; licence: string; sourceLabel: string; sourceUrl: string }

// Renders public/events/CREDITS.md, so the credits file stays the single source of truth.
function readCredits() {
  const md = fs.readFileSync(path.join(process.cwd(), 'public', 'events', 'CREDITS.md'), 'utf8').replace(/\r\n/g, '\n')
  const notes = md
    .split('\n')
    .filter(l => l.startsWith('- '))
    .map(l => l.slice(2).replace(/`/g, ''))
  const rows: Row[] = md
    .split('\n')
    .filter(l => l.startsWith('| ') && !l.startsWith('| Event id') && !l.startsWith('| ---'))
    .map(l => {
      const cells = l.split('|').slice(1, -1).map(c => c.trim())
      const link = /\[(.*)\]\((.*)\)/.exec(cells[4] || '')
      return { id: cells[0], file: cells[1], author: cells[2], licence: cells[3], sourceLabel: link?.[1] || '', sourceUrl: link?.[2] || '' }
    })
  return { notes, rows }
}

export default function CreditsPage() {
  const { notes, rows } = readCredits()
  const titleOf = (id: string) => ALL_EVENTS.find(e => e.id === id)?.title || id

  const th: React.CSSProperties = { textAlign: 'left', padding: '10px 14px', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim, rgba(255,255,255,0.55))', borderBottom: '1px solid var(--border-color, rgba(255,255,255,0.1))' }
  const td: React.CSSProperties = { padding: '10px 14px', fontSize: 13, lineHeight: 1.5, verticalAlign: 'middle', borderBottom: '1px solid var(--border-color, rgba(255,255,255,0.1))' }

  return (
    <main style={{ minHeight: '100vh', background: 'transparent', color: 'var(--text, #fff)', fontFamily: 'Inter, system-ui, sans-serif', position: 'relative' }}>
      <Nav />
      <div style={{ position: 'relative', zIndex: 1, width: 'min(92vw, 1200px)', margin: '0 auto', padding: '120px 0 80px' }}>
        <h1 style={{ fontSize: 40, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 12 }}>Image credits</h1>
        {notes.map(n => (
          <p key={n} style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-dim, rgba(255,255,255,0.55))', maxWidth: '75ch', marginBottom: 8 }}>{n}</p>
        ))}

        <div style={{ marginTop: 28, borderRadius: 14, border: '1px solid var(--border-color, rgba(255,255,255,0.1))', background: 'var(--card-bg, rgba(255,255,255,0.03))', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ ...th, width: 84 }}><span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>Image</span></th>
                <th style={th}>Event</th>
                <th style={th}>Author / credit</th>
                <th style={th}>Licence</th>
                <th style={th}>Source</th>
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
                  <td style={{ ...td, fontWeight: 600 }}>{titleOf(r.id)}</td>
                  <td style={{ ...td, color: 'var(--text-dim, rgba(255,255,255,0.55))' }}>{r.author}</td>
                  <td style={{ ...td, whiteSpace: 'nowrap' }}>{r.licence}</td>
                  <td style={{ ...td, whiteSpace: 'nowrap' }}>
                    {r.sourceUrl ? (
                      <a href={r.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent, #F59E0B)', textDecoration: 'underline', textUnderlineOffset: 3 }}>
                        Commons page
                      </a>
                    ) : '—'}
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
