'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import Nav from '@/components/Nav'

export default function ProfilePage() {
  const router = useRouter()
  const { user, profile, updateProfile, loading } = useAuth()

  const [username, setUsername] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSaved, setPasswordSaved] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  useEffect(() => {
    if (profile?.username) setUsername(profile.username)
  }, [profile])

  if (loading) return (
    <main style={{ minHeight: '100vh', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid var(--border-color)', borderTopColor: 'var(--accent)', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </main>
  )

  if (!user) {
    router.push('/auth')
    return null
  }

  async function handleSaveProfile() {
    if (!username.trim()) return
    setSaving(true)
    await updateProfile({ username: username.trim() })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  async function handleChangePassword() {
    setPasswordError('')
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match')
      return
    }
    setSavingPassword(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setSavingPassword(false)
    if (error) {
      setPasswordError(error.message)
    } else {
      setPasswordSaved(true)
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setPasswordSaved(false), 2500)
    }
  }

  const initials = profile?.username?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || '?'

  return (
    <main style={{ minHeight: '100vh', background: 'transparent', color: 'var(--text)', fontFamily: 'Inter, system-ui, sans-serif', position: 'relative' }}>
      <Nav active="profile" />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 560, margin: '0 auto', padding: '140px 24px 60px' }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8, letterSpacing: '-0.02em' }}>Profile</h1>
        <p style={{ fontSize: 14, color: 'var(--text-dim)', marginBottom: 40 }}>Changes save automatically to your account.</p>

        {/* Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 40, padding: '20px 24px', borderRadius: 16, border: '1px solid var(--border-color)', background: 'var(--card-bg)' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'color-mix(in srgb, var(--accent) 25%, transparent)', border: '2px solid color-mix(in srgb, var(--accent) 40%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--font-scale)', fontWeight: 800, color: 'var(--accent)', flexShrink: 0 }}>
            {initials}
          </div>
          <div>
            <div style={{ fontSize: 'var(--font-scale)', fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{profile?.username || 'User'}</div>
            <div style={{ fontSize: 'var(--font-scale)', color: 'var(--text-dim)' }}>{user.email}</div>
            <div style={{ fontSize: 'var(--font-scale)', color: 'var(--text-dim)', marginTop: 4, opacity: 0.7 }}>
              Member since {new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </div>
          </div>
        </div>

        {/* Username */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 12 }}>
            Display Name
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              value={username}
              onChange={e => setUsername(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSaveProfile()}
              placeholder="Your display name"
              style={{ flex: 1, padding: '12px 16px', borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--card-bg)', color: 'var(--text)', fontSize: 'var(--font-scale)', outline: 'none', fontFamily: 'inherit' }}
            />
            <button
              onClick={handleSaveProfile}
              disabled={saving || !username.trim()}
              style={{ padding: '12px 20px', borderRadius: 10, border: 'none', background: saved ? '#10B981' : 'var(--accent)', color: '#fff', fontSize: 'var(--font-scale)', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s', minWidth: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {saving ? '...' : saved ? 'Saved ✓' : 'Save'}
            </button>
          </div>
        </div>

        {/* Email — read only */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 12 }}>
            Email
          </div>
          <input
            value={user.email || ''}
            disabled
            style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--card-bg)', color: 'var(--text-dim)', fontSize: 'var(--font-scale)', outline: 'none', fontFamily: 'inherit', cursor: 'not-allowed' }}
          />
          <div style={{ fontSize: 'var(--font-scale)', color: 'var(--text-dim)', marginTop: 6, opacity: 0.7 }}>Email cannot be changed</div>
        </div>

        {/* Change password */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 12 }}>
            Change Password
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              type="password"
              placeholder="New password"
              style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--card-bg)', color: 'var(--text)', fontSize: 'var(--font-scale)', outline: 'none', fontFamily: 'inherit' }}
            />
            <input
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              type="password"
              placeholder="Confirm new password"
              onKeyDown={e => e.key === 'Enter' && handleChangePassword()}
              style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: `1px solid ${passwordError ? 'rgba(239,68,68,0.5)' : 'var(--border-color)'}`, background: 'var(--card-bg)', color: 'var(--text)', fontSize: 'var(--font-scale)', outline: 'none', fontFamily: 'inherit' }}
            />
            {passwordError && (
              <div style={{ fontSize: 'var(--font-scale)', color: '#EF4444' }}>{passwordError}</div>
            )}
            <button
              onClick={handleChangePassword}
              disabled={savingPassword || !newPassword || !confirmPassword}
              style={{ padding: '12px', borderRadius: 10, border: 'none', background: passwordSaved ? '#10B981' : 'var(--card-bg)', color: passwordSaved ? '#fff' : 'var(--text-dim)', fontSize: 'var(--font-scale)', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {savingPassword ? 'Updating...' : passwordSaved ? 'Password Updated ✓' : 'Update Password'}
            </button>
          </div>
        </div>

        {/* Back */}
        <button
          onClick={() => router.push('/')}
          style={{ width: '100%', padding: '12px', borderRadius: 10, border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-dim)', fontSize: 'var(--font-scale)', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent)'}
          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-color)'}
        >
          Home
        </button>
      </div>
    </main>
  )
}