import fs from 'node:fs'
import path from 'node:path'
import CreditsView from '@/components/CreditsView'
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
  return <CreditsView notes={notes} rows={rows.map(r => ({ ...r, title: titleOf(r.id) }))} />
}
