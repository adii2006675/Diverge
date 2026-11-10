'use client'
import { useEffect, useRef, useState } from 'react'
import { animate, useReducedMotion } from 'motion/react'

/** Shows a number that eases to each new value. With reduced motion it just shows the value. */
export default function CountUp({ value, duration = 0.45 }: { value: number; duration?: number }) {
  const reduce = useReducedMotion()
  const [shown, setShown] = useState(value)
  const from = useRef(value)

  useEffect(() => {
    if (reduce || from.current === value) { from.current = value; return }
    const controls = animate(from.current, value, {
      duration,
      ease: [0.23, 1, 0.32, 1],
      onUpdate: v => { from.current = v; setShown(Math.round(v)) },
      onComplete: () => { from.current = value; setShown(value) },
    })
    return () => controls.stop()
  }, [value, reduce, duration])

  return <>{reduce ? value : shown}</>
}
