'use client'
import { useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { formatEventYear } from '@/lib/events'
import { computeTimelineGeometry, VIEW_W as W, VIEW_H, X0, X1, BASE } from '@/lib/timelineGeometry'

export type TimelineNode = { question: string; year: string; score: number; yearNum: number | null }

/** Real history (straight line) against the user's timeline (curving away as the divergence score grows). */
export default function TwoTimelines({
  startYear, nodes, activeIdx, onSelect, onSelectStart, excludeEventId, onExport, exporting,
}: {
  startYear: number
  nodes: TimelineNode[]
  activeIdx: number
  onSelect: (i: number) => void
  onSelectStart: () => void
  excludeEventId?: string
  onExport?: () => void
  exporting?: boolean
}) {
  const reduce = useReducedMotion()
  const [hover, setHover] = useState<number | null>(null)

  const geo = useMemo(() => computeTimelineGeometry(nodes, startYear, excludeEventId), [nodes, startYear, excludeEventId])

  if (nodes.length === 0) return null
  const last = nodes[nodes.length - 1]
  const hovered = hover !== null ? nodes[hover] : null
  const hoveredPt = hover !== null ? geo.pts[hover] : null

  return (
    <div className="dv-card dv-tt">
      <div className="dv-tt-head">
        <h3>Two timelines</h3>
        {onExport && (
          <button type="button" className="dv-tt-export" onClick={onExport} disabled={exporting} aria-label="Save as image" title="Save as image">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3v12M7 10l5 5 5-5M5 21h14" /></svg>
          </button>
        )}
      </div>
      <p className="dv-sub">Real history vs yours, from {formatEventYear(startYear)}</p>
      <div className="dv-tt-stage">
        <svg viewBox={`0 0 ${W} ${VIEW_H}`} role="group" aria-label={`Your timeline has diverged ${last.score}% from real history by ${last.year}`}>
          <motion.path
            key={`fill-${nodes.length}`}
            d={geo.fill}
            fill="var(--acc)"
            initial={{ opacity: reduce ? 0.12 : 0 }}
            animate={{ opacity: 0.12 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          />
          <path d={`M${X0} ${BASE} L${X1} ${BASE}`} stroke="var(--real)" strokeWidth="4" strokeLinecap="round" fill="none" />
          {geo.ticks.map(t => (
            <g key={t.id}>
              <title>{t.title}</title>
              <path d={`M${t.x} ${BASE - 9} L${t.x} ${BASE + 9}`} stroke="var(--real)" strokeWidth="2" strokeLinecap="round" opacity=".8" />
            </g>
          ))}
          <motion.path
            key={`line-${nodes.length}`}
            d={geo.d}
            stroke="var(--acc)"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
            initial={{ pathLength: reduce ? 1 : 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          />

          <g role="button" tabIndex={0} aria-label="Back to the start" className="dv-tt-node" onClick={onSelectStart} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelectStart() } }}>
            <circle cx={X0} cy={BASE} r="14" fill="transparent" />
            <circle cx={X0} cy={BASE} r="6" fill="var(--bg, #0b0b17)" stroke="var(--ink)" strokeWidth="3" />
          </g>

          {geo.pts.map((p, i) => {
            const on = i === activeIdx
            return (
              <g
                key={i}
                role="button"
                tabIndex={0}
                aria-label={`Question ${i + 1}: ${nodes[i].question}`}
                aria-current={on ? 'true' : undefined}
                className="dv-tt-node"
                onClick={() => onSelect(i)}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(i) } }}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(h => (h === i ? null : h))}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(h => (h === i ? null : h))}
              >
                {on && <circle className="dv-tt-pulse" cx={p.x} cy={p.y} r="19" fill="none" stroke="var(--acc)" strokeOpacity=".45" strokeWidth="2" />}
                <circle cx={p.x} cy={p.y} r={on ? 13 : 11} fill={on ? 'var(--acc)' : 'color-mix(in srgb, var(--acc) 18%, #0b0b17)'} stroke="var(--acc)" strokeWidth="2.5" />
                <text x={p.x} y={p.y + 4} textAnchor="middle" fontSize="12.5" fontWeight="800" fill={on ? 'var(--on-accent-dark, #1b1305)' : 'var(--acc)'}>{i + 1}</text>
                <text x={p.x} y={BASE - 25} textAnchor="middle" fontSize="12.5" fill="var(--dim)" className="dv-tt-year">{nodes[i].year}</text>
              </g>
            )
          })}
          <text x={X0} y={BASE - 25} textAnchor="middle" fontSize="12.5" fill="var(--dim)" className="dv-tt-year">{formatEventYear(startYear)}</text>
        </svg>

        {hovered && hoveredPt && (
          <div className="dv-tt-tip" role="tooltip" style={{ left: `${Math.min(80, Math.max(20, (hoveredPt.x / W) * 100))}%`, top: `${(hoveredPt.y / VIEW_H) * 100}%` }}>
            <b>{hovered.question}</b>
            <span>{hovered.year} · {hovered.score}% diverged</span>
          </div>
        )}
      </div>
      <div className="dv-tt-legend"><span><i style={{ background: 'var(--real)' }} />Real history</span><span><i style={{ background: 'var(--acc)' }} />Your timeline</span></div>
    </div>
  )
}
