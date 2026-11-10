'use client'
import { motion } from 'motion/react'

const SOFT = { type: 'spring', stiffness: 130, damping: 22, mass: 0.9 } as const

/** Text that lands one word at a time, each word coming into focus. With reduced motion the words only fade. */
export default function RevealWords({ text, delay = 0, reduce = false, scale = 1 }: { text: string; delay?: number; reduce?: boolean | null; scale?: number }) {
  const words = text.split(' ')
  return (
    <>
      {words.map((w, i) => (
        <span key={i}>
          <motion.span
            style={{ display: 'inline-block' }}
            initial={{ opacity: 0, y: reduce ? 0 : 22, filter: reduce ? 'blur(0px)' : 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ ...SOFT, stiffness: SOFT.stiffness / (scale * scale), damping: SOFT.damping / scale, delay: (delay + i * 0.07) * scale }}
          >
            {w}
          </motion.span>
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </>
  )
}
