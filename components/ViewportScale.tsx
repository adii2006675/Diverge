'use client'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

// Pages are designed at 1440px wide. On wider windows the whole page scales up proportionally
// (CSS `zoom` on .app-shell, driven by --ui-scale) so a big or fullscreen monitor doesn't leave
// a small column floating in empty space. Below 1440px nothing scales; the layouts are fluid.
// The inline script in app/layout.tsx sets the same value before first paint.
export const BASE_WIDTH = 1440
export const MAX_SCALE = 1.75

export function computeScale(width: number, pathname: string): number {
  if (pathname.startsWith('/diverge')) return 1 // the diverge page sizes itself
  return Math.min(MAX_SCALE, Math.max(1, width / BASE_WIDTH))
}

export default function ViewportScale() {
  const pathname = usePathname()

  useEffect(() => {
    const root = document.documentElement
    const supported = typeof CSS !== 'undefined' && CSS.supports('zoom', '1.2')
    let frame = 0

    function apply() {
      const s = supported ? computeScale(window.innerWidth, pathname) : 1
      root.style.setProperty('--ui-scale', s.toFixed(3))
    }
    function onResize() {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(apply)
    }

    apply()
    window.addEventListener('resize', onResize)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', onResize)
    }
  }, [pathname])

  return null
}
