'use client'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useState } from 'react'
import { useT } from '@/lib/useT'

export default function Nav({ active }: { active?: string }) {
  const router = useRouter()
  const { user, profile, signOut } = useAuth()
  const { t } = useT()
  const [showUserMenu, setShowUserMenu] = useState(false)

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
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 40px',
        background: 'var(--nav-bg)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-color)',
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        fontFamily: 'Inter, system-ui, sans-serif',
      }}>
        {/* Left — logo mark and wordmark */}
        <div
          onClick={() => router.push('/')}
          style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', minWidth: 100 }}
        >
        <svg viewBox="0 0 64 40" width="40" height="25" aria-hidden="true" style={{ flexShrink: 0 }}>
          <path d="M4 23 H18 Q25 23 29 16 Q33 9 41 9 H60" fill="none" stroke="var(--accent)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4 17 H18 Q25 17 29 24 Q33 31 41 31 H60" fill="none" stroke="var(--text)" strokeOpacity="0.7" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div
          style={{
            fontSize: 17, fontWeight: 900, letterSpacing: '0.18em', textTransform: 'uppercase',
            backgroundImage: 'linear-gradient(to right, var(--accent) 50%, var(--text) 50%)',
            backgroundSize: '200% 100%',
            backgroundPosition: 'right bottom',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            display: 'inline-block',
            transition: 'background-position 0.4s ease, transform 0.25s ease',
          }}
          onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.backgroundPosition = 'left bottom'; el.style.transform = 'scale(1.08)' }}
          onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.backgroundPosition = 'right bottom'; el.style.transform = 'scale(1)' }}
        >
          DIVERGE
        </div>
        </div>

        {/* Center — nav links */}
        <div style={{ display: 'flex', gap: 4, alignItems: 'center', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
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
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', minWidth: 100, justifyContent: 'flex-end' }}>
          {!user ? (
            <button
              onClick={() => router.push('/auth')}
              style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid var(--accent)', background: 'transparent', color: 'var(--accent)', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              {t('Sign In')}
            </button>
          ) : (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {/* Profile icon */}
              <div style={{ position: 'relative' }}>
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
                  <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', background: 'var(--nav-bg)', border: '1px solid var(--border-color)', borderRadius: 12, padding: '8px', minWidth: 200, zIndex: 100, animation: 'fadeIn 0.15s ease' }}>
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