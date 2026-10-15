'use client'
/* eslint-disable @next/next/no-img-element */
import { useState } from 'react'
import { getEventImage, getEventImagePosition } from '@/lib/eventImages'

type Props = {
  /** Event id. Omit for a custom starting point (no image exists). */
  id?: string
  title: string
  year?: number
  /** Styles for the <img> only, for example a dimming filter. */
  imgStyle?: React.CSSProperties
  /** Small text shown bottom-left over the photo. */
  caption?: string
  /** Fallback shows only the year (or "?" for a custom start) instead of the full title. For thumbnails. */
  compact?: boolean
  loading?: 'lazy' | 'eager'
}

function formatYear(year?: number) {
  if (year === undefined) return ''
  return year < 0 ? `${Math.abs(year)} BC` : String(year)
}

/**
 * Fills its parent (which must be position: relative with a set height). Shows the event's photo,
 * or a typographic title card if the event has no photo or the file fails to load.
 */
export default function EventImage({ id, title, year, imgStyle, caption, compact, loading = 'eager' }: Props) {
  const src = id ? getEventImage(id) : null
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return (
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, textAlign: 'center', padding: compact ? 0 : '0 20px' }}>
        {compact ? (
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', color: 'var(--accent)' }}>
            {year !== undefined ? formatYear(year) : '?'}
          </div>
        ) : (
          <>
            <div style={{ fontFamily: 'Playfair Display, Georgia, serif', fontStyle: 'italic', fontSize: 20, color: 'var(--text)' }}>{title}</div>
            {year !== undefined && <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.15em', color: 'var(--accent)' }}>{formatYear(year)}</div>}
          </>
        )}
      </div>
    )
  }

  return (
    <>
      <img
        src={src}
        alt={title}
        loading={loading}
        decoding="async"
        onError={() => setFailed(true)}
        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: getEventImagePosition(id!), ...imgStyle }}
      />
      {caption && (
        <div style={{ position: 'absolute', bottom: 10, left: 12, fontSize: 11, color: 'var(--text-dim)', fontWeight: 500 }}>{caption}</div>
      )}
    </>
  )
}
