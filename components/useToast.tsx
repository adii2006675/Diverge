'use client'
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'

/** A small bottom-centre notice. Render `toast` once in the page and call `showToast(message)` from handlers. */
export function useToast(): { toast: ReactNode; showToast: (message: string) => void } {
  const reduce = useReducedMotion()
  const [item, setItem] = useState<{ id: number; message: string } | null>(null)
  const seq = useRef(0)
  const timer = useRef<number | null>(null)

  const showToast = useCallback((message: string) => {
    if (timer.current) window.clearTimeout(timer.current)
    setItem({ id: ++seq.current, message })
    timer.current = window.setTimeout(() => setItem(null), 3000)
  }, [])

  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current) }, [])

  const toast = (
    <div className="app-toast-wrap" role="status" aria-live="polite">
      <AnimatePresence>
        {item && (
          <motion.div
            key={item.id}
            className="app-toast"
            initial={{ opacity: 0, y: reduce ? 0 : 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduce ? 0 : 6 }}
            transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
          >
            {item.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
  return { toast, showToast }
}
