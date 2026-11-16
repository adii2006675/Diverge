'use client'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useState, useEffect, useRef } from 'react'
import { trackPointer } from '@/lib/pointerTrack'
import { useT } from '@/lib/useT'
import { openPalette } from '@/components/CommandPalette'

export default function Nav({ active }: { active?: string }) {
  const router = useRouter()
  const { user, profile, signOut } = useAuth()
  const { t } = useT()
  const [showUserMenu, setShowUserMenu] = useState(false)
  useEffect(() => { trackPointer() }, [])
  // The profile menu closes when you tap anywhere outside it, or press Escape.
  const userMenuRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!showUserMenu) return
    function onDown(e: PointerEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setShowUserMenu(false)
    }
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setShowUserMenu(false) }
    document.addEventListener('pointerdown', onDown)
    window.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('pointerdown', onDown); window.removeEventListener('keydown', onKey) }
  }, [showUserMenu])

  async function handleSignOut() {
    await signOut()
    router.push('/')
    setShowUserMenu(false)
  }

  const navLinks = [
    { label: 'Explore', href: '/explore' },
    { label: 'About', href: '/about' },
  ]

  return (
    <>
      <nav className="app-nav" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 40px',
        background: 'var(--nav-bg)',
        borderBottom: '1px solid var(--border-color)',
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        fontFamily: 'Figtree, system-ui, sans-serif',
      }}>
        {/* Left — logo mark; hover spells out the name */}
        <button
          type="button"
          className="dv-logo"
          aria-label="Diverge home"
          onClick={() => router.push('/')}
        >
          <svg className="dv-logo-mark" viewBox="0 0 64 40" width="40" height="25" aria-hidden="true">
            <path className="dv-l1" pathLength={100} d="M4 23 H18 Q25 23 29 16 Q33 9 41 9 H60" fill="none" stroke="var(--accent-strand)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            <path className="dv-l2" pathLength={100} d="M4 17 H18 Q25 17 29 24 Q33 31 41 31 H60" fill="none" stroke="var(--text)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            <path className="dv-run" pathLength={100} d="M4 23 H18 Q25 23 29 16 Q33 9 41 9 H60" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            <path className="dv-run b" pathLength={100} d="M4 17 H18 Q25 17 29 24 Q33 31 41 31 H60" fill="none" stroke="var(--accent-strand)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="dv-word" aria-hidden="true">
            {'DIVERGE'.split('').map((ch, i) => (
              <span key={i} style={{ ['--i' as string]: i }}>{ch}</span>
            ))}
          </span>
        </button>

        {/* Center — nav links */}
        <div className="app-nav-links" style={{ display: 'flex', gap: 4, alignItems: 'center', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
          {navLinks.map(({ label, href }) => (
            <button
              key={label}
              onClick={() => router.push(href)}
              style={{
                padding: '8px 16px', borderRadius: 8, border: 'none',
                background: active === label.toLowerCase() ? 'color-mix(in srgb, var(--accent) 20%, transparent)' : 'transparent',
                color: active === label.toLowerCase() ? 'var(--accent)' : 'var(--text-dim)',
                fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = 'var(--text)'}
              onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = active === label.toLowerCase() ? 'var(--text)' : 'var(--text-dim)'}
            >
              {t(label)}
            </button>
          ))}
          <button
            onClick={() => router.push('/sessions')}
            style={{
              padding: '8px 16px', borderRadius: 8, border: 'none',
              background: active === 'sessions' ? 'color-mix(in srgb, var(--accent) 20%, transparent)' : 'transparent',
              color: active === 'sessions' ? 'var(--accent)' : 'var(--text-dim)',
              fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = 'var(--text)'}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = active === 'sessions' ? 'var(--text)' : 'var(--text-dim)'}
          >
            {t('Sessions')}
          </button>
        </div>

        {/* Right — auth */}
        <div className="app-nav-right" style={{ display: 'flex', gap: 10, alignItems: 'center', minWidth: 100, justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={openPalette}
            aria-label={t('Search Diverge…')}
            title={t('Search Diverge…') + ' (Ctrl/⌘ K)'}
            style={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-dim)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'color .16s, border-color .16s' }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLButtonElement; el.style.color = 'var(--text)'; el.style.borderColor = 'var(--accent)' }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.color = 'var(--text-dim)'; el.style.borderColor = 'var(--border-color)' }}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
          </button>
          {!user ? (
            <button
              onClick={() => router.push('/auth')}
              className="app-nav-signin"
              style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid var(--accent)', background: 'transparent', color: 'var(--accent)', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              {t('Sign In')}
            </button>
          ) : (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {/* Profile icon */}
              <div ref={userMenuRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  style={{
                    width: 36, height: 36, borderRadius: '50%', border: '1px solid var(--border-color)',
                    background: profile?.avatar_url ? `url(${profile.avatar_url}) center/cover` : 'color-mix(in srgb, var(--accent) 20%, transparent)',
                    color: 'var(--text)', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent)'}
                  onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-color)'}
                  title={t('Profile')}
                >
                  {!profile?.avatar_url && (profile?.username?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || '?')}
                </button>

                {showUserMenu && (
                  <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', background: 'var(--surface)', border: '1px solid var(--border-color)', borderRadius: 12, padding: '8px', minWidth: 200, zIndex: 100, animation: 'fadeIn 0.15s ease' }}>
                    <div style={{ padding: '8px 12px 12px', borderBottom: '1px solid var(--border-color)', marginBottom: 6 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{profile?.username || t('User')}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2 }}>{user.email}</div>
                    </div>

                    {[
                      { label: 'Profile', action: () => { router.push('/profile'); setShowUserMenu(false) } },
                      { label: 'Settings', action: () => { router.push('/settings'); setShowUserMenu(false) } },
                    ].map(item => (
                      <button
                        key={item.label}
                        onClick={item.action}
                        style={{ display: 'block', width: '100%', padding: '8px 12px', borderRadius: 8, border: 'none', background: 'transparent', color: 'var(--text-dim)', fontSize: 13, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', transition: 'background 0.15s' }}
                        onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'var(--card-bg)'}
                        onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'transparent'}
                      >
                        {t(item.label)}
                      </button>
                    ))}

                    <div style={{ borderTop: '1px solid var(--border-color)', marginTop: 6, paddingTop: 6 }}>
                      <button
                        onClick={handleSignOut}
                        style={{ display: 'block', width: '100%', padding: '8px 12px', borderRadius: 8, border: 'none', background: 'transparent', color: '#EF4444', fontSize: 13, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', transition: 'background 0.15s' }}
                        onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.08)'}
                        onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'transparent'}
                      >
                        {t('Sign Out')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform:rotate(360deg); } }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 99px; }
      `}</style>
    </>
  )
}