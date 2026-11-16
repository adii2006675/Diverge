'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import Nav from '@/components/Nav'
import SettingsPanel from '@/components/SettingsPanel'
import { useT } from '@/lib/useT'

export default function ProfilePage() {
  const router = useRouter()
  const { user, profile, updateProfile, loading } = useAuth()
  const { t, locale } = useT()

  const [username, setUsername] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [avatarHover, setAvatarHover] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [nameError, setNameError] = useState('')

  useEffect(() => {
    if (profile?.username) setUsername(profile.username)
  }, [profile])

  if (loading) return (
    <main style={{ minHeight: 'var(--vh-fit, 100vh)', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid var(--border-color)', borderTopColor: 'var(--accent)', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </main>
  )

  if (!user) {
    router.push('/auth')
    return null
  }

  async function handleSaveProfile() {
    const next = username.trim()
    if (!next) { setUsername(profile?.username || ''); setEditingName(false); return }
    if (next === profile?.username) { setEditingName(false); return }
    setSaving(true)
    setNameError('')
    try {
      await updateProfile({ username: next })
      setEditingName(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      setNameError(t('Couldn’t save that name. Try again.'))
    }
    setSaving(false)
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    console.log('handleAvatarChange fired', e.target.files)
    const file = e.target.files?.[0]
    if (!file || !user) return
    console.log('uploading file:', file.name, 'for user:', user.id)

    setUploadingAvatar(true)
    try {
      const ext = file.name.split('.').pop()
      const filePath = `${user.id}/avatar.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      const cacheBustedUrl = `${publicUrl}?t=${Date.now()}`
      await updateProfile({ avatar_url: cacheBustedUrl })
    } catch (err) {
      console.error('Avatar upload failed:', err)
    }
    setUploadingAvatar(false)
  }

  async function handleAvatarReset() {
    if (!user) return
    setUploadingAvatar(true)
    try {
      await updateProfile({ avatar_url: null })
    } catch (err) {
      console.error('Avatar reset failed:', err)
    }
    setUploadingAvatar(false)
  }

  const initials = profile?.username?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || '?'

  return (
    <main style={{ minHeight: 'var(--vh-fit, 100vh)', background: 'transparent', color: 'var(--text)', fontFamily: 'Figtree, system-ui, sans-serif', position: 'relative' }}>
      <Nav active="profile" />

      <div className="page-wrap" style={{ position: 'relative', zIndex: 1, maxWidth: 640, margin: '0 auto', padding: '140px 24px 60px' }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8, letterSpacing: '-0.02em' }}>{t('Profile')}</h1>
        <p style={{ fontSize: 14, color: 'var(--text-dim)', marginBottom: 40 }}>{t('Changes save automatically to your account.')}</p>

        {/* Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32, padding: '10px 20px', borderRadius: 16, border: '1px solid var(--border-color)', background: 'var(--card-bg)' }}>
          <div
            onMouseEnter={() => setAvatarHover(true)}
            onMouseLeave={() => setAvatarHover(false)}
            style={{ position: 'relative', width: 64, height: 64, borderRadius: '50%', flexShrink: 0 }}
          >
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: profile?.avatar_url ? `url(${profile.avatar_url}) center/cover` : 'color-mix(in srgb, var(--accent) 25%, var(--card-bg))',
              border: '2px solid color-mix(in srgb, var(--accent) 40%, var(--card-bg))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 'var(--font-scale)', fontWeight: 800, color: 'var(--accent)',
            }}>
              {!profile?.avatar_url && initials}
            </div>
            {(avatarHover || uploadingAvatar) && (
              <div style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              }}>
                {uploadingAvatar ? (
                  <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.8s linear infinite' }} />
                ) : (
                  <>
                    <label style={{ cursor: 'pointer', display: 'flex', position: 'relative', zIndex: 5 }} title="Change photo">
                      <input type="file" accept="image/*" onChange={handleAvatarChange} disabled={uploadingAvatar} style={{ position: 'absolute', width: 1, height: 1, opacity: 0, overflow: 'hidden' }} />
                      <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" style={{ width: 16, height: 16, pointerEvents: 'none' }}>
                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                      </svg>
                    </label>
                    {profile?.avatar_url && (
                      <button
                        onClick={handleAvatarReset}
                        disabled={uploadingAvatar}
                        style={{ cursor: 'pointer', display: 'flex', background: 'none', border: 'none', padding: 0 }}
                        title="Reset to default"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" style={{ width: 16, height: 16 }}>
                          <path d="M3 12a9 9 0 1 0 3-6.7L3 8"></path>
                          <path d="M3 3v5h5"></path>
                        </svg>
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
          <div>
            {editingName ? (
              <input
                autoFocus
                value={username}
                maxLength={40}
                onChange={e => setUsername(e.target.value)}
                onBlur={handleSaveProfile}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleSaveProfile()
                  if (e.key === 'Escape') { setUsername(profile?.username || ''); setEditingName(false) }
                }}
                aria-label="Display name"
                style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', background: 'var(--card-bg)', border: '1px solid var(--accent)', borderRadius: 10, padding: '4px 10px', outline: 'none', fontFamily: 'inherit', width: 260 }}
              />
            ) : (
              <button
                type="button"
                onClick={() => setEditingName(true)}
                aria-label={t('Click to change your name')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', padding: 0, cursor: 'text', color: 'var(--text)', fontFamily: 'inherit', fontSize: 22, fontWeight: 800 }}
              >
                {profile?.username || t('User')}
                {saved && <span style={{ fontSize: 12, fontWeight: 600, color: '#10B981' }}>{t('Saved')}</span>}
              </button>
            )}
            {nameError && <div role="alert" style={{ fontSize: 12, color: '#EF4444', marginTop: 4 }}>{nameError}</div>}
          </div>
        </div>

        <SettingsPanel />

        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-dim)', margin: '8px 0 14px' }}>{t('Account')}</div>

        {/* Email and password: each change has its own page */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 12 }}>
            {t('Email')}
          </div>
          <input
            value={user.email || ''}
            disabled
            aria-label={t('Your email')}
            style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid var(--border-color)', background: 'color-mix(in srgb, var(--text) 5%, transparent)', color: 'var(--text-dim)', WebkitTextFillColor: 'var(--text-dim)', opacity: 0.6, fontSize: 'var(--font-scale)', outline: 'none', fontFamily: 'inherit', cursor: 'not-allowed' }}
          />
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
            {[{ label: 'Change email', href: '/profile/email' }, { label: 'Change password', href: '/profile/password' }].map(b => (
              <button
                key={b.href}
                type="button"
                onClick={() => router.push(b.href)}
                style={{ flex: '1 1 150px', padding: '12px', borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--card-bg)', color: 'var(--text)', fontSize: 'var(--font-scale)', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'border-color 0.18s' }}
                onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent)'}
                onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-color)'}
              >
                {t(b.label)}
              </button>
            ))}
          </div>
          <div style={{ fontSize: 'var(--font-scale)', color: 'var(--text-dim)', marginTop: 10, opacity: 0.7 }}>{t('Member since')} {new Date(user.created_at).toLocaleDateString(locale, { month: 'long', year: 'numeric' })}</div>
        </div>
      </div>
    </main>
  )
}