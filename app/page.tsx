'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, useReducedMotion } from 'motion/react'
import RevealWords from '@/components/RevealWords'
import Nav from '@/components/Nav'
import { useAuth } from '@/context/AuthContext'
import { useT } from '@/lib/useT'

const SOFT = { type: 'spring', stiffness: 130, damping: 22, mass: 0.9 } as const

export default function LandingPage() {
  const router = useRouter()
  const { user, profile } = useAuth()
  const { t } = useT()
  const [freeText, setFreeText] = useState('')
  const reduce = useReducedMotion()
  // The whole intro plays in about 1.5 seconds (it was 1.9 before the delays and springs were scaled down).
  const scale = 1.5 / 1.9
  // Everything rises in from slightly soft and small; with reduced motion it only fades.
  const rise = (delay: number) => reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.4 * scale, delay: delay * scale } }
    : { initial: { opacity: 0, y: 24, scale: 0.985, filter: 'blur(10px)' }, animate: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }, transition: { ...SOFT, stiffness: SOFT.stiffness / (scale * scale), damping: SOFT.damping / scale, delay: delay * scale } }

  function handleStart() {
    if (freeText.trim()) router.push(`/diverge/custom?q=${encodeURIComponent(freeText)}`)
  }

  return (
    <main style={{ minHeight: 'var(--vh-fit, 100vh)', background: 'transparent', color: 'var(--text)', position: 'relative', overflowX: 'hidden', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Nav active="home" />

      {/* Hero */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'var(--vh-fit, 100vh)', textAlign: 'center', padding: '0 24px', paddingTop: 80 }} className="home-hero">

        {user && profile?.username && (
          <motion.p
            {...rise(0)}
            style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-dim)', marginBottom: 16, letterSpacing: '-0.01em' }}
          >
            {t('Hey,')} <span style={{ color: 'var(--text)' }}>{profile.username}</span>
          </motion.p>
        )}

        <h1 style={{ fontSize: 'clamp(40px, 7vw, 88px)', fontWeight: 900, lineHeight: 1.08, margin: '0 0 4px', letterSpacing: '-0.02em' }}>
          <RevealWords text={t('History had a plan.')} delay={0.1} reduce={reduce} scale={scale} />
        </h1>

        <h1 style={{ fontSize: 'clamp(40px, 7vw, 88px)', fontWeight: 900, lineHeight: 1.08, color: 'var(--accent)', margin: '0 0 28px', letterSpacing: '-0.02em' }}>
          <RevealWords text={t('You don\'t have to follow it.')} delay={0.55} reduce={reduce} scale={scale} />
        </h1>

        <motion.p
          {...rise(1.05)}
          className="home-sub"
          style={{ fontSize: 19, color: 'var(--text-dim)', marginBottom: 52, lineHeight: 1.6, whiteSpace: 'nowrap' }}
        >
          {t('Pick any event in time. Ask to see a change. Watch it Diverge.')}
        </motion.p>

        <motion.div
          {...rise(1.2)}
          className="home-search"
          style={{ display: 'flex', gap: 10, width: '100%', maxWidth: 680, marginBottom: 18 }}
        >
          <input
            value={freeText}
            onChange={e => setFreeText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && freeText.trim() && handleStart()}
            placeholder={t('What if 9/11 never happened...')}
            style={{ flex: 1, padding: '15px 20px', borderRadius: 12, border: '1px solid var(--border-color)', background: 'var(--card-bg)', color: 'var(--text)', fontSize: 'var(--font-scale)', outline: 'none', fontFamily: 'inherit' }}
          />
          <button
            onClick={handleStart}
            disabled={!freeText.trim()}
            style={{
              padding: '15px 28px', borderRadius: 12, fontSize: 'var(--font-scale)', fontWeight: 700,
              border: 'none', whiteSpace: 'nowrap', transition: 'all 0.25s',
              cursor: freeText.trim() ? 'pointer' : 'not-allowed',
              background: freeText.trim() ? 'var(--accent)' : 'color-mix(in srgb, var(--accent) 15%, var(--card-bg))',
              color: freeText.trim() ? 'var(--on-accent, #fff)' : 'var(--text-dim)',
            }}
          >
            {t('Diverge')}
          </button>
        </motion.div>

        <motion.div {...rise(1.35)}>
          <button
            onClick={() => router.push('/explore')}
            style={{ padding: '12px 32px', borderRadius: 12, border: '1px solid var(--border-color)', background: 'var(--card-bg)', color: 'var(--text-dim)', fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit' }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLButtonElement; el.style.borderColor = 'var(--accent)'; el.style.color = 'var(--text)' }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.borderColor = 'var(--border-color)'; el.style.color = 'var(--text-dim)' }}
          >
            {t('Show more events')}
          </button>
        </motion.div>
      </div>

    </main>
  )
}
