'use client'
import { useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { EASE_OUT } from '@/lib/motion'

const SPARKS = 7

/** A heart toggle. Favouriting it pops the heart and sends a small ring and a few sparks outward. */
export default function HeartButton({ saved, onToggle, labelOn, labelOff }: { saved: boolean; onToggle: () => void; labelOn: string; labelOff: string }) {
  const reduce = useReducedMotion()
  const [burst, setBurst] = useState(0)
  const label = saved ? labelOn : labelOff

  return (
    <button
      type="button"
      className="heart-btn"
      aria-pressed={saved}
      aria-label={label}
      title={label}
      onClick={e => {
        e.stopPropagation()
        if (!saved) setBurst(b => b + 1)
        onToggle()
      }}
    >
      {!reduce && saved && burst > 0 && (
        <span key={burst} className="heart-fx" aria-hidden="true">
          <motion.span
            className="heart-ring"
            initial={{ scale: 0.4, opacity: 0.7 }}
            animate={{ scale: 1.9, opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE_OUT }}
          />
          {Array.from({ length: SPARKS }, (_, i) => {
            const a = (i / SPARKS) * Math.PI * 2 - Math.PI / 2
            return (
              <motion.span
                key={i}
                className="heart-spark"
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{ x: Math.cos(a) * 21, y: Math.sin(a) * 21, opacity: 0, scale: 0.3 }}
                transition={{ duration: 0.55, ease: EASE_OUT }}
              />
            )
          })}
        </span>
      )}
      <motion.svg
        key={saved ? 'on' : 'off'}
        viewBox="0 0 24 24"
        initial={{ scale: saved && !reduce ? 0.45 : 1 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 520, damping: 16 }}
        fill={saved ? 'var(--heart)' : 'none'}
        stroke={saved ? 'var(--heart)' : 'currentColor'}
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
      >
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21.2l7.8-7.7 1-1.1a5.5 5.5 0 0 0 0-7.8z" />
      </motion.svg>
    </button>
  )
}
