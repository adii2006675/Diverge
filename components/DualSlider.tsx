'use client'
import { useRef, useCallback } from 'react'

interface Props {
  min: number
  max: number
  valueMin: number
  valueMax: number
  onChangeMin: (val: number) => void
  onChangeMax: (val: number) => void
}

export default function DualSlider({ min, max, valueMin, valueMax, onChangeMin, onChangeMax }: Props) {
  const trackRef = useRef<HTMLDivElement>(null)
  const dragging = useRef<'min' | 'max' | null>(null)

  const pct = (val: number) => ((val - min) / (max - min)) * 100

  const valFromClientX = useCallback((clientX: number) => {
    if (!trackRef.current) return null
    const rect = trackRef.current.getBoundingClientRect()
    const p = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    return Math.round(min + p * (max - min))
  }, [min, max])

  function startDrag(e: React.MouseEvent, handle: 'min' | 'max') {
    e.preventDefault()
    dragging.current = handle

    function onMove(e: MouseEvent) {
      const val = valFromClientX(e.clientX)
      if (val === null) return
      if (dragging.current === 'min' && val < valueMax - 5) onChangeMin(val)
      if (dragging.current === 'max' && val > valueMin + 5) onChangeMax(val)
    }

    function onUp() {
      dragging.current = null
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  function handleTrackClick(e: React.MouseEvent) {
    const val = valFromClientX(e.clientX)
    if (val === null) return
    const distMin = Math.abs(val - valueMin)
    const distMax = Math.abs(val - valueMax)
    if (distMin <= distMax && val < valueMax - 5) onChangeMin(val)
    else if (val > valueMin + 5) onChangeMax(val)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>{valueMin}</span>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>{valueMax}</span>
      </div>

      <div
        ref={trackRef}
        onClick={handleTrackClick}
        style={{ position: 'relative', height: 28, display: 'flex', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}
      >
        {/* Background track */}
        <div style={{ position: 'absolute', left: 0, right: 0, height: 3, background: 'rgba(255,255,255,0.1)', borderRadius: 99 }} />

        {/* Active track */}
        <div style={{
          position: 'absolute', height: 3, background: 'var(--accent)', borderRadius: 99,
          left: `${pct(valueMin)}%`,
          right: `${100 - pct(valueMax)}%`,
        }} />

        {/* Min thumb */}
        <div
          onMouseDown={e => startDrag(e, 'min')}
          style={{
            position: 'absolute',
            left: `${pct(valueMin)}%`,
            transform: 'translateX(-50%)',
            width: 18, height: 18, borderRadius: '50%',
            background: 'var(--accent)',
            border: '2px solid var(--bg)',
            boxShadow: '0 0 10px color-mix(in srgb, var(--accent) 70%, transparent)',
            cursor: 'grab',
            zIndex: 3,
          }}
        />

        {/* Max thumb */}
        <div
          onMouseDown={e => startDrag(e, 'max')}
          style={{
            position: 'absolute',
            left: `${pct(valueMax)}%`,
            transform: 'translateX(-50%)',
            width: 18, height: 18, borderRadius: '50%',
            background: 'var(--accent)',
            border: '2px solid var(--bg)',
            boxShadow: '0 0 10px color-mix(in srgb, var(--accent) 70%, transparent)',
            cursor: 'grab',
            zIndex: 3,
          }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>{min}</span>
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>{max}</span>
      </div>
    </div>
  )
}