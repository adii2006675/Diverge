import type { WhatIfEntry } from '@/types'

// Builds a PDF of the whole timeline: the real history, then every question and answer with its key facts, tags and sources.
// The "Ask next" questions are left out on purpose. The PDF is made in the browser; nothing is sent anywhere.

type Block = { kind: 'title' | 'h2' | 'h3' | 'p' | 'small' | 'li' | 'gap'; text: string }

export type PdfInput = {
  title: string
  startYear?: string
  realTitle: string
  realSummary: string
  realFacts: string[]
  whatIfs: WhatIfEntry[]
}

const TYPE_LABEL = { documented: 'Documented', inference: 'Inference', speculation: 'Speculation' } as const
const MOOD = (m: string) => m.charAt(0) + m.slice(1).toLowerCase()

function buildBlocks(i: PdfInput): Block[] {
  const b: Block[] = []
  const last = i.whatIfs[i.whatIfs.length - 1]?.response
  b.push({ kind: 'title', text: i.title })
  const meta = [`${i.whatIfs.length} question${i.whatIfs.length === 1 ? '' : 's'}`]
  if (last) meta.push(`${last.divergenceScore}% diverged`, `Year ${last.year}`, `World mood: ${MOOD(last.worldMood)}`)
  meta.push(`Saved ${new Date().toLocaleDateString()}`)
  b.push({ kind: 'small', text: meta.join('  |  ') }, { kind: 'gap', text: '' })

  if (i.realSummary || i.realFacts.length) {
    b.push({ kind: 'h2', text: `Real history: ${i.realTitle}` })
    if (i.realSummary) b.push({ kind: 'p', text: i.realSummary })
    for (const f of i.realFacts) b.push({ kind: 'li', text: f })
    b.push({ kind: 'gap', text: '' })
  }

  i.whatIfs.forEach((w, n) => {
    const r = w.response
    b.push({ kind: 'h2', text: `${n + 1}. What if: ${w.question.replace(/^what if[\s:,]*/i, '')}` })
    b.push({ kind: 'small', text: `${r.year}  |  ${MOOD(r.worldMood)}  |  ${r.uncertaintyLevel.charAt(0) + r.uncertaintyLevel.slice(1).toLowerCase()} confidence  |  ${r.divergenceScore}% diverged` })
    r.paragraph.split(/\n{2,}/).forEach(p => p.trim() && b.push({ kind: 'p', text: p.trim() }))
    if (r.keyFacts?.length) {
      b.push({ kind: 'h3', text: 'Key facts' })
      r.keyFacts.forEach((f, k) => {
        const t = r.factTypes?.[k]
        b.push({ kind: 'li', text: `${f}${t ? `  [${TYPE_LABEL[t]}]` : ''}` })
        if (r.factExplanations?.[k]) b.push({ kind: 'small', text: r.factExplanations[k] })
      })
    }
    if (r.sources?.length) {
      b.push({ kind: 'h3', text: 'Sources' })
      r.sources.forEach(s => b.push({ kind: 'small', text: `${s.title} - ${s.url}` }))
    }
    b.push({ kind: 'gap', text: '' })
  })
  return b
}

// The built-in PDF font covers Latin letters only. Swap common typographic marks for plain ones; anything else means another script.
function plain(t: string) {
  return t.replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/…/g, '...').replace(/[–—]/g, '-').replace(/ /g, ' ')
}
const hasOtherScript = (t: string) => /[^\u0000-ÿ]/.test(t)

function safeName(t: string) {
  return (t || 'diverge').replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '-').slice(0, 60) || 'diverge'
}

export async function downloadChatPdf(input: PdfInput): Promise<void> {
  const blocks = buildBlocks(input).map(x => ({ ...x, text: plain(x.text) }))
  if (blocks.some(x => hasOtherScript(x.text))) return printDocument(blocks, input.title)

  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const W = doc.internal.pageSize.getWidth()
  const H = doc.internal.pageSize.getHeight()
  const M = 52
  const maxW = W - M * 2
  let y = M

  const style: Record<Block['kind'], { size: number; bold: boolean; color: [number, number, number]; gap: number; indent: number }> = {
    title: { size: 22, bold: true, color: [20, 20, 30], gap: 8, indent: 0 },
    h2: { size: 14, bold: true, color: [90, 60, 200], gap: 6, indent: 0 },
    h3: { size: 10.5, bold: true, color: [60, 60, 70], gap: 4, indent: 0 },
    p: { size: 10.5, bold: false, color: [30, 30, 38], gap: 7, indent: 0 },
    li: { size: 10.5, bold: false, color: [30, 30, 38], gap: 4, indent: 14 },
    small: { size: 9, bold: false, color: [100, 100, 112], gap: 5, indent: 0 },
    gap: { size: 10, bold: false, color: [0, 0, 0], gap: 8, indent: 0 },
  }

  for (const blk of blocks) {
    const st = style[blk.kind]
    if (blk.kind === 'gap') { y += st.gap; continue }
    doc.setFont('helvetica', st.bold ? 'bold' : 'normal')
    doc.setFontSize(st.size)
    doc.setTextColor(...st.color)
    const lines: string[] = doc.splitTextToSize(blk.text, maxW - st.indent)
    const lh = st.size * 1.4
    if (blk.kind === 'h2' && y > H - M - lh * 4) { doc.addPage(); y = M } // keep a heading with its first lines
    for (let k = 0; k < lines.length; k++) {
      if (y + lh > H - M) { doc.addPage(); y = M }
      if (blk.kind === 'li' && k === 0) doc.text('-', M + 3, y + st.size)
      doc.text(lines[k], M + st.indent, y + st.size)
      y += lh
    }
    y += st.gap
  }

  const pages = doc.getNumberOfPages()
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p)
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(140, 140, 150)
    doc.text(`Diverge  |  page ${p} of ${pages}`, W / 2, H - 24, { align: 'center' })
  }
  doc.save(`${safeName(input.title)}.pdf`)
}

// For other scripts (Hindi, Japanese, Chinese): print a clean page so the browser's own fonts draw it; "Save as PDF" there.
function printDocument(blocks: Block[], title: string) {
  const esc = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const tag = { title: 'h1', h2: 'h2', h3: 'h3', p: 'p', small: 'p class="s"', li: 'li', gap: '' } as const
  const html = blocks.map(b => {
    if (b.kind === 'gap') return '<br>'
    const t = tag[b.kind]
    const open = t.split(' ')[0]
    return `<${t}>${esc(b.text)}</${open}>`
  }).join('')
  const frame = document.createElement('iframe')
  frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0'
  document.body.appendChild(frame)
  const d = frame.contentDocument!
  d.open()
  d.write(`<!doctype html><title>${esc(title)}</title><style>body{font:14px/1.5 system-ui,sans-serif;color:#1c1c24;margin:32px}h1{font-size:26px}h2{font-size:17px;color:#5a3cc8;margin:18px 0 4px}h3{font-size:13px;margin:10px 0 2px}p.s{font-size:11px;color:#666;margin:2px 0}li{margin:3px 0}</style>${html}`)
  d.close()
  setTimeout(() => { frame.contentWindow?.focus(); frame.contentWindow?.print(); setTimeout(() => frame.remove(), 2000) }, 250)
}
