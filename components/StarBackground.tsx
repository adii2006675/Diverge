'use client'
import { useEffect, useRef } from 'react'

const SHOT_INTERVAL_MS = 5000
let globalLastSpawnSlot = -1

function getGlobalSlot() {
  return Math.floor(Date.now() / SHOT_INTERVAL_MS)
}

export default function StarBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let animId: number

    function getStarColor() {
      const root = document.documentElement
      const color = getComputedStyle(root).getPropertyValue('--star-color').trim()
      return color || '#ffffff'
    }

    function hexToRgb(hex: string) {
      let h = hex.replace('#', '')
      if (h.length === 3) h = h.split('').map(c => c + c).join('')
      const num = parseInt(h, 16)
      return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 }
    }

    type Star = {
      x: number; y: number; r: number
      vx: number; vy: number
      alpha: number; pulse: number
    }

    type ShootingStar = {
      x: number; y: number
      vx: number; vy: number
      r: number; alpha: number
      trail: { x: number; y: number }[]
      life: number; maxLife: number
    }

    let stars: Star[] = []
    let shootingStars: ShootingStar[] = []
    const SHOT_INTERVAL_MS = 5000
    let lastShotSlot = Math.floor(Date.now() / SHOT_INTERVAL_MS)
    let lastGlobalSlot = getGlobalSlot()

    function getSize() {
      const parent = canvas.parentElement
      if (parent) {
        const rect = parent.getBoundingClientRect()
        return { width: Math.max(rect.width, 1), height: Math.max(rect.height, 1) }
      }
      return { width: window.innerWidth, height: window.innerHeight }
    }

    function resize() {
      const { width, height } = getSize()
      canvas.width = width
      canvas.height = height
      const density = (width * height) / (1920 * 1080)
      const starCount = Math.max(20, Math.round(120 * density))
      stars = Array.from({ length: starCount }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.2 + 0.3,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        alpha: Math.random() * 0.6 + 0.2,
        pulse: Math.random() * Math.PI * 2,
      }))
    }

    function spawnShootingStar() {
      const edge = Math.floor(Math.random() * 4)
      let x = 0, y = 0, vx = 0, vy = 0
      const speed = 4 + Math.random() * 3
      if (edge === 0) {
        x = Math.random() * canvas.width; y = -20
        vx = (Math.random() - 0.5) * speed * 0.6; vy = speed
      } else if (edge === 1) {
        x = canvas.width + 20; y = Math.random() * canvas.height
        vx = -speed; vy = (Math.random() - 0.5) * speed * 0.6
      } else if (edge === 2) {
        x = Math.random() * canvas.width; y = canvas.height + 20
        vx = (Math.random() - 0.5) * speed * 0.6; vy = -speed
      } else {
        x = -20; y = Math.random() * canvas.height
        vx = speed; vy = (Math.random() - 0.5) * speed * 0.6
      }
      const diagonal = Math.hypot(canvas.width, canvas.height)
      const totalSpeed = Math.hypot(vx, vy)
      const maxLife = Math.ceil((diagonal + 80) / totalSpeed)
      shootingStars.push({ x, y, vx, vy, r: 2.4, alpha: 1, trail: [], life: 0, maxLife })
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const currentSlot = getGlobalSlot()
      if (currentSlot !== globalLastSpawnSlot) {
        globalLastSpawnSlot = currentSlot
        spawnShootingStar()
      }

      const { r: cr, g: cg, b: cb } = hexToRgb(getStarColor())

      stars.forEach(s => {
        s.pulse += 0.008
        s.x += s.vx; s.y += s.vy
        if (s.x < -10) s.x = canvas.width + 10
        if (s.x > canvas.width + 10) s.x = -10
        if (s.y < -10) s.y = canvas.height + 10
        if (s.y > canvas.height + 10) s.y = -10
        const a = s.alpha * (0.65 + 0.35 * Math.sin(s.pulse))
        const grd = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 4)
        grd.addColorStop(0, `rgba(${cr},${cg},${cb},${a * 0.4})`)
        grd.addColorStop(1, `rgba(${cr},${cg},${cb},0)`)
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r * 4, 0, Math.PI * 2)
        ctx.fillStyle = grd; ctx.fill()
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${cr},${cg},${cb},${a})`; ctx.fill()
      })

      shootingStars = shootingStars.filter(ss => {
        ss.trail.push({ x: ss.x, y: ss.y })
        if (ss.trail.length > 32) ss.trail.shift()
        ss.x += ss.vx; ss.y += ss.vy; ss.life++
        const progress = ss.life / ss.maxLife
        const fadeAlpha = progress < 0.08 ? progress / 0.08 : progress > 0.92 ? 1 - (progress - 0.92) / 0.08 : 1

        ss.trail.forEach((pt, ti) => {
          const t = ti / ss.trail.length
          const trailAlpha = t * fadeAlpha * 0.55
          const trailR = ss.r * t * 0.8
          if (trailR < 0.1) return
          const grd = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, trailR * 3)
          grd.addColorStop(0, `rgba(${cr},${cg},${cb},${trailAlpha * 0.5})`)
          grd.addColorStop(1, `rgba(${cr},${cg},${cb},0)`)
          ctx.beginPath(); ctx.arc(pt.x, pt.y, trailR * 3, 0, Math.PI * 2)
          ctx.fillStyle = grd; ctx.fill()
          ctx.beginPath(); ctx.arc(pt.x, pt.y, trailR, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${cr},${cg},${cb},${trailAlpha})`; ctx.fill()
        })

        const grd = ctx.createRadialGradient(ss.x, ss.y, 0, ss.x, ss.y, ss.r * 5)
        grd.addColorStop(0, `rgba(${cr},${cg},${cb},${fadeAlpha})`)
        grd.addColorStop(0.4, `rgba(${cr},${cg},${cb},${fadeAlpha * 0.5})`)
        grd.addColorStop(1, `rgba(${cr},${cg},${cb},0)`)
        ctx.beginPath(); ctx.arc(ss.x, ss.y, ss.r * 5, 0, Math.PI * 2)
        ctx.fillStyle = grd; ctx.fill()
        ctx.beginPath(); ctx.arc(ss.x, ss.y, ss.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${cr},${cg},${cb},${fadeAlpha})`; ctx.fill()

        return ss.life < ss.maxLife
      })

      animId = requestAnimationFrame(draw)
    }

    resize()
    draw()
    window.addEventListener('resize', resize)
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}
    />
  )
}