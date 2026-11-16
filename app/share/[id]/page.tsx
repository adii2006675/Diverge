'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { hostOf } from '@/lib/sourceHost'
import Nav from '@/components/Nav'
import { useT } from '@/lib/useT'
import { useAutoT } from '@/lib/autoTranslate'
import EventImage from '@/components/EventImage'
import { ALL_EVENTS, formatEventYear } from '@/lib/events'
import { fetchShared, type SharedTimeline } from '@/lib/share'
import '../../diverge/[sessionId]/diverge.css'
import './share.css'

const MOOD_COLORS: Record<string, string> = {
  STABLE: '#10B981', TENSE: '#F59E0B', CRITICAL: '#EF4444',
  'AT WAR': '#EF4444', CATASTROPHIC: '#7C3AED',
  REBUILDING: '#06B6D4', FLOURISHING: '#10B981',
}

const moodLabel = (m: string) => m.charAt(0) + m.slice(1).toLowerCase()
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

function confidence(level: string) {
  if (level === 'HIGH') return { label: 'High confidence', color: '#10B981' }
  if (level === 'LOW') return { label: 'Low confidence', color: '#EF4444' }
  return { label: 'Medium confidence', color: '#F59E0B' }
}

type State = { kind: 'loading' } | { kind: 'missing' } | { kind: 'error' } | { kind: 'ready'; data: SharedTimeline }

export default function SharedTimelinePage() {
  const { id } = useParams<{ id: string }>()
  const { t, tn } = useT()
  const { at } = useAutoT()
  const [state, setState] = useState<State>({ kind: 'loading' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    fetchShared(id)
      .then(data => { if (!cancelled) setState(data ? { kind: 'ready', data } : { kind: 'missing' }) })
      .catch(err => { console.error(err); if (!cancelled) setState({ kind: 'error' }) })
    return () => { cancelled = true }
  }, [id, attempt])

  const data = state.kind === 'ready' ? state.data : null
  const event = data?.eventId ? ALL_EVENTS.find(e => e.id === data.eventId) : undefined
  const last = data ? data.whatIfs[data.whatIfs.length - 1].response : null

  return (
    <div className="dv dv-share">
      <Nav />
      <main className="dv-share-in">
        {state.kind === 'loading' && (
          <div className="dv-share-state" role="status" aria-live="polite">
            <span className="dv-skel" style={{ width: '46%', height: '1.6em' }} />
            <span className="dv-skel" style={{ width: '30%' }} />
            <span className="dv-skel" style={{ width: '92%', marginTop: '1.5em' }} />
            <span className="dv-skel" style={{ width: '84%' }} />
            <span className="dv-skel" style={{ width: '58%' }} />
          </div>
        )}

        {state.kind === 'missing' && (
          <div className="dv-share-state center" role="status">
            <div className="dv-empty-orb" aria-hidden="true">?</div>
            <h1>{t('This timeline isn’t available')}</h1>
            <p>{t('The link may be wrong, or its owner stopped sharing it.')}</p>
            <Link className="dv-btn pri" href="/explore">{t('Explore events')}</Link>
          </div>
        )}

        {state.kind === 'error' && (
          <div className="dv-share-state center" role="alert">
            <h1>{t('Couldn’t load this timeline')}</h1>
            <p>{t('Check your connection and try again.')}</p>
            <button className="dv-btn" type="button" onClick={() => { setState({ kind: 'loading' }); setAttempt(a => a + 1) }}>{t('Try again')}</button>
          </div>
        )}

        {data && last && (
          <>
            <header className="dv-share-head">
              <div className="dv-ev-th big"><EventImage id={event?.id} title={event?.title || data.title} year={event?.year} compact /></div>
              <div>
                <p className="dv-share-kicker">{t('Shared alternate timeline')}</p>
                <h1>{event ? at(event.title) : data.title}</h1>
                <div className="dv-tags">
                  {event && <span className="dv-tag">{tn('Starts {n}', formatEventYear(event.year))}</span>}
                  <span className="dv-tag">{tn(data.whatIfs.length === 1 ? '{n} question' : '{n} questions', data.whatIfs.length)}</span>
                  <span className="dv-tag up">{tn('{n}% diverged', data.divergence)}</span>
                  <span className="dv-tag">{tn('Now {n}', last.year)}</span>
                </div>
              </div>
            </header>

            <div className="dv-share-thread">
              {data.whatIfs.map((w, i) => {
                const r = w.response
                const c = confidence(r.uncertaintyLevel)
                return (
                  <section className="dv-ex" key={i} aria-label={`${t('Question')} ${i + 1}`}>
                    <div className="dv-q">{w.question}</div>
                    <div className="dv-ans">
                      <div className="dv-tags">
                        <span className="dv-tag">{r.year}</span>
                        <span className="dv-tag up">{tn('{n}% diverged', r.divergenceScore)}</span>
                        <span className="dv-tag" style={{ ['--c' as string]: MOOD_COLORS[r.worldMood] || '#fff' }}><i />{t(moodLabel(r.worldMood))}</span>
                        <span className="dv-tag" style={{ ['--c' as string]: c.color }}><i />{t(c.label)}</span>
                      </div>
                      <p className="dv-prose dv-para">{r.paragraph}</p>
                      <ol className="dv-share-facts">
                        {r.keyFacts.map((f, k) => (
                          <li key={k}>
                            <span className="dv-chip-n">{k + 1}</span>
                            <div>
                              <span>{f}</span>
                              {r.factTypes?.[k] && r.factTypes[k] !== 'documented' && <span className="dv-chip-kind">{t(cap(r.factTypes[k]))}</span>}
                              {r.factExplanations?.[k] && <p>{r.factExplanations[k]}</p>}
                            </div>
                          </li>
                        ))}
                      </ol>
                      {r.sources && r.sources.length > 0 && (
                        <p className="dv-sources">{t('Sources:')} {r.sources.map((src, n) => (
                          <span key={src.url}>{n > 0 && ', '}<a href={src.url} target="_blank" rel="noreferrer">{src.title} ({hostOf(src.url) || t('source')})</a></span>
                        ))}</p>
                      )}
                    </div>
                  </section>
                )
              })}
            </div>

            <footer className="dv-share-foot">
              <p>{t('Written by an AI as alternate history. Treat it as informed speculation, not fact.')}</p>
              <Link className="dv-btn pri" href="/explore">{t('Start your own timeline')}</Link>
            </footer>
          </>
        )}
      </main>
    </div>
  )
}
