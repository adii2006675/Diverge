import { computeTimelineGeometry, VIEW_W, X0, X1, BASE } from '@/lib/timelineGeometry'
import { formatEventYear } from '@/lib/events'

export type ExportNode = { question: string; year: string; score: number; yearNum: number | null }

const W = 1200
const H = 675

function cssVar(name: string, fallback: string) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return v || fallback
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number): string[] {
  const words = text.split(/\s+/)
  const lines: string[] = []
  let line = ''
  for (const w of words) {
    const test = line ? `${line} ${w}` : w
    if (ctx.measureText(test).width <= maxWidth || !line) line = test
    else { lines.push(line); line = w }
  }
  if (line) lines.push(line)
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines)
    let last = kept[maxLines - 1]
    while (last.length > 1 && ctx.measureText(last + '…').width > maxWidth) last = last.slice(0, -1)
    kept[maxLines - 1] = last.replace(/[\s.,;:]+$/, '') + '…'
    return kept
  }
  return lines
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

/** Draws a 1200 x 675 share card for a timeline and returns it as a PNG. */
export async function renderTimelineImage(opts: { title: string; startYear: number; excludeEventId?: string; nodes: ExportNode[] }): Promise<Blob> {
  try { await document.fonts.ready } catch { /* fonts are optional */ }
  const { title, startYear, excludeEventId, nodes } = opts
  const bg = cssVar('--bg', '#080810')
  const text = cssVar('--text', '#ffffff')
  const dim = cssVar('--text-dim', 'rgba(255,255,255,0.6)')
  const accent = cssVar('--accent', '#F59E0B')
  const onAccent = cssVar('--on-accent-dark', '#1b1305')
  const real = '#7FD1C7'
  const font = 'Inter, system-ui, sans-serif'

  const canvas = document.createElement('canvas')
  canvas.width = W; canvas.height = H
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas is not available')

  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)
  const glow = ctx.createRadialGradient(W * 0.85, H * 0.1, 0, W * 0.85, H * 0.1, 620)
  glow.addColorStop(0, 'rgba(255,255,255,0.07)')
  glow.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, W, H)

  // Logo mark and wordmark
  ctx.save()
  ctx.translate(60, 58)
  ctx.scale(0.8, 0.8)
  ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.lineJoin = 'round'
  ctx.strokeStyle = accent; ctx.stroke(new Path2D('M4 23 H18 Q25 23 29 16 Q33 9 41 9 H60'))
  ctx.strokeStyle = text; ctx.stroke(new Path2D('M4 17 H18 Q25 17 29 24 Q33 31 41 31 H60'))
  ctx.restore()
  ctx.fillStyle = text
  ctx.font = `800 24px ${font}`
  ctx.textBaseline = 'alphabetic'
  ;(ctx as unknown as { letterSpacing: string }).letterSpacing = '6px'
  ctx.fillText('DIVERGE', 126, 86)
  ;(ctx as unknown as { letterSpacing: string }).letterSpacing = '0px'

  // Title
  ctx.fillStyle = text
  ctx.font = `800 48px ${font}`
  const titleLines = wrap(ctx, title, 520, 3)
  titleLines.forEach((l, i) => ctx.fillText(l, 60, 190 + i * 58))

  // Big score
  const last = nodes[nodes.length - 1]
  ctx.fillStyle = accent
  ctx.font = `800 110px ${font}`
  ctx.fillText(`${last.score}%`, 60, 480)
  ctx.fillStyle = dim
  ctx.font = `500 24px ${font}`
  ctx.fillText(`diverged from real history by ${last.year}`, 60, 520)
  ctx.fillText(`${nodes.length} what-if${nodes.length === 1 ? '' : 's'}, starting ${formatEventYear(startYear)}`, 60, 556)

  ctx.fillStyle = dim
  ctx.font = `500 18px ${font}`
  ctx.fillText(`Made with Diverge · ${location.host}`, 60, 628)

  // Graph card
  const cx = 640, cy = 56, cw = 500, ch = 322
  roundRect(ctx, cx, cy, cw, ch, 30)
  ctx.fillStyle = 'rgba(255,255,255,0.05)'
  ctx.fill()
  ctx.strokeStyle = 'rgba(255,255,255,0.1)'
  ctx.lineWidth = 1.5
  ctx.stroke()

  const geo = computeTimelineGeometry(nodes, startYear, excludeEventId)
  const sc = 1.2
  ctx.save()
  ctx.translate(cx + (cw - VIEW_W * sc) / 2, cy + 34)
  ctx.scale(sc, sc)
  ctx.globalAlpha = 0.14
  ctx.fillStyle = accent
  ctx.fill(new Path2D(geo.fill))
  ctx.globalAlpha = 1
  ctx.lineCap = 'round'
  ctx.lineWidth = 4
  ctx.strokeStyle = real
  ctx.beginPath(); ctx.moveTo(X0, BASE); ctx.lineTo(X1, BASE); ctx.stroke()
  ctx.lineWidth = 2; ctx.globalAlpha = 0.8
  for (const t of geo.ticks) { ctx.beginPath(); ctx.moveTo(t.x, BASE - 9); ctx.lineTo(t.x, BASE + 9); ctx.stroke() }
  ctx.globalAlpha = 1
  ctx.lineWidth = 4; ctx.strokeStyle = accent
  ctx.stroke(new Path2D(geo.d))
  // start dot
  ctx.beginPath(); ctx.arc(X0, BASE, 6, 0, Math.PI * 2); ctx.fillStyle = bg; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = text; ctx.stroke()
  ctx.textAlign = 'center'
  ctx.font = `600 12.5px ${font}`
  ctx.fillStyle = dim
  ctx.fillText(formatEventYear(startYear), X0, BASE - 25)
  geo.pts.forEach((p, i) => {
    const on = i === geo.pts.length - 1
    ctx.beginPath(); ctx.arc(p.x, p.y, on ? 13 : 11, 0, Math.PI * 2)
    ctx.fillStyle = on ? accent : bg; ctx.fill()
    ctx.lineWidth = 2.5; ctx.strokeStyle = accent; ctx.stroke()
    ctx.font = `800 12.5px ${font}`
    ctx.fillStyle = on ? onAccent : accent
    ctx.fillText(String(i + 1), p.x, p.y + 4.3)
    ctx.font = `600 12.5px ${font}`
    ctx.fillStyle = dim
    ctx.fillText(nodes[i].year, p.x, BASE - 25)
  })
  ctx.restore()

  // Legend
  ctx.textAlign = 'left'
  ctx.font = `500 15px ${font}`
  const ly = cy + ch - 28
  ctx.fillStyle = real; roundRect(ctx, cx + 36, ly - 4, 22, 6, 3); ctx.fill()
  ctx.fillStyle = dim; ctx.fillText('Real history', cx + 66, ly + 3)
  ctx.fillStyle = accent; roundRect(ctx, cx + 200, ly - 4, 22, 6, 3); ctx.fill()
  ctx.fillStyle = dim; ctx.fillText('Your timeline', cx + 230, ly + 3)

  // Questions
  ctx.font = `600 21px ${font}`
  const shown = nodes.slice(0, 3)
  shown.forEach((n, i) => {
    const y = 424 + i * 62
    ctx.beginPath(); ctx.arc(cx + 16, y + 6, 14, 0, Math.PI * 2); ctx.fillStyle = accent; ctx.fill()
    ctx.fillStyle = onAccent; ctx.font = `800 15px ${font}`; ctx.textAlign = 'center'; ctx.fillText(String(i + 1), cx + 16, y + 11.5)
    ctx.textAlign = 'left'; ctx.fillStyle = text; ctx.font = `600 21px ${font}`
    const lines = wrap(ctx, n.question, 440, 2)
    lines.forEach((l, k) => ctx.fillText(l, cx + 46, y + 12 + k * 26 - (lines.length > 1 ? 12 : 0)))
  })
  if (nodes.length > shown.length) {
    ctx.fillStyle = dim; ctx.font = `500 18px ${font}`
    ctx.fillText(`+ ${nodes.length - shown.length} more`, cx + 46, 424 + shown.length * 62 + 6)
  }

  return await new Promise<Blob>((resolve, reject) => canvas.toBlob(b => (b ? resolve(b) : reject(new Error('Could not create the image'))), 'image/png'))
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 2000)
}
