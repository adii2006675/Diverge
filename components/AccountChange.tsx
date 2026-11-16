'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import Nav from '@/components/Nav'
import PasswordInput from '@/components/PasswordInput'
import { PasswordChecklist, MatchHint, isPasswordValid } from '@/components/PasswordChecklist'
import { useT } from '@/lib/useT'

// One page for changing the password and one for changing the email. Both look like the sign-in card and both start by
// asking for the current password, so someone who walks up to an open session can't take over the account.
const inp: React.CSSProperties = {
  padding: '13px 16px', borderRadius: 10,
  border: '1px solid rgba(255,255,255,0.1)',
  background: 'rgba(255,255,255,0.05)',
  color: '#fff', fontSize: 14, outline: 'none',
  width: '100%', fontFamily: 'inherit',
  transition: 'border-color 0.2s',
}
const label: React.CSSProperties = { fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }

export default function AccountChange({ mode }: { mode: 'password' | 'email' }) {
  const router = useRouter()
  const { user, loading } = useAuth()
  const { t } = useT()

  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('') // the new password, or the new email
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [doneMessage, setDoneMessage] = useState('')

  useEffect(() => { if (!loading && !user) router.push('/auth') }, [loading, user, router])

  if (loading || !user) return (
    <main style={{ minHeight: 'var(--vh-fit, 100vh)', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid var(--border-color)', borderTopColor: 'var(--accent)', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </main>
  )

  const isEmail = mode === 'email'
  // The button stays greyed out until the form could be accepted.
  const ready = !!current && (isEmail
    ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(next.trim()) && next.trim().toLowerCase() !== (user?.email || '').toLowerCase() && confirm.trim().toLowerCase() === next.trim().toLowerCase()
    : isPasswordValid(next) && next !== current && confirm === next)

  async function submit() {
    setError('')
    if (!current) { setError(t('Enter your current password.')); return }
    if (isEmail) {
      const wanted = next.trim().toLowerCase()
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(wanted)) { setError(t('Enter a valid email address.')); return }
      if (wanted === (user?.email || '').toLowerCase()) { setError(t('That is already your email.')); return }
      if (confirm.trim().toLowerCase() !== wanted) { setError(t('The two email addresses don’t match.')); return }
    } else {
      if (!isPasswordValid(next)) { setError(t('Your new password doesn’t meet every requirement yet.')); return }
      if (next === current) { setError(t('Choose a password that is different from your current one.')); return }
      if (confirm !== next) { setError(t('The two new passwords don’t match.')); return }
    }

    setBusy(true)
    // Check the current password by signing in again with it.
    const { error: checkError } = await supabase.auth.signInWithPassword({ email: user?.email || '', password: current })
    if (checkError) { setBusy(false); setError(t('Your current password is wrong.')); return }

    if (isEmail) {
      const wanted = next.trim().toLowerCase()
      const { error: updateError } = await supabase.auth.updateUser({ email: wanted })
      setBusy(false)
      if (updateError) { setError(updateError.message); return }
      setDoneMessage(`${t('We sent a confirmation link to')} ${wanted}. ${t('Your email changes after you open it. You may also get a link at your current address.')}`)
    } else {
      const { error: updateError } = await supabase.auth.updateUser({ password: next })
      setBusy(false)
      if (updateError) { setError(updateError.message); return }
      setDoneMessage(t('Your password was updated.'))
    }
    setCurrent(''); setNext(''); setConfirm('')
  }

  return (
    <main style={{ minHeight: 'var(--vh-fit, 100vh)', background: 'transparent', color: 'var(--text)', fontFamily: 'Figtree, system-ui, sans-serif', position: 'relative' }}>
      <Nav active="profile" />
      <div className="acct-main" style={{ minHeight: 'var(--vh-fit, 100vh)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 16px 40px', position: 'relative', zIndex: 1 }}>
        <div className="auth-card" style={{ width: '100%', maxWidth: 420, padding: 32, borderRadius: 20, border: '1px solid rgba(255,255,255,0.08)', background: '#0d0d16', position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: '0.15em', color: '#fff', marginBottom: 4 }}>{isEmail ? t('CHANGE EMAIL') : t('CHANGE PASSWORD')}</div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginBottom: 28 }}>
            {isEmail ? t('Enter your current password, then your new email address') : t('Enter your current password, then choose a new one')}
          </div>

          {doneMessage ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div role="status" style={{ fontSize: 14, color: '#10B981', lineHeight: 1.6, padding: '12px 14px', borderRadius: 10, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)' }}>{doneMessage}</div>
              <button type="button" onClick={() => router.push('/profile')} style={primaryBtn(false)}>{t('Back to profile')}</button>
            </div>
          ) : (
            <form noValidate onSubmit={e => { e.preventDefault(); submit() }} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={label}>{t('Current password')}</div>
              <PasswordInput value={current} onChange={e => setCurrent(e.target.value)} placeholder={t('Current password')} style={inp} autoFocus autoComplete="current-password" />

              {isEmail ? (
                <>
                  <div style={{ ...label, marginTop: 6 }}>{t('New email address')}</div>
                  <input type="email" value={next} onChange={e => setNext(e.target.value)} placeholder={t('New email address')} style={inp} autoComplete="email" />
                  <input type="email" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder={t('Confirm new email address')} aria-label={t('Confirm new email address')} style={inp} autoComplete="email" />
                </>
              ) : (
                <>
                  <div style={{ ...label, marginTop: 6 }}>{t('New password')}</div>
                  <PasswordInput value={next} onChange={e => setNext(e.target.value)} placeholder={t('New password')} style={inp} autoComplete="new-password" />
                  <PasswordChecklist password={next} />
                  <PasswordInput value={confirm} onChange={e => setConfirm(e.target.value)} placeholder={t('Confirm new password')} style={inp} autoComplete="new-password" />
                  <MatchHint password={next} confirm={confirm} />
                </>
              )}

              {error && (
                <div role="alert" style={{ fontSize: 13, color: '#EF4444', padding: '8px 12px', borderRadius: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>{error}</div>
              )}

              <button type="submit" disabled={busy || !ready} style={primaryBtn(busy || !ready)}>
                {busy ? t('Checking…') : isEmail ? t('Change email') : t('Update password')}
              </button>
              <button type="button" className="acct-link" style={{ marginTop: -4 }} onClick={() => router.push('/auth?forgot=1')}>{t('Forgot password?')}</button>
            </form>
          )}
        </div>
      </div>
    </main>
  )
}

function primaryBtn(busy: boolean): React.CSSProperties {
  return { width: '100%', marginTop: 8, padding: '13px', borderRadius: 10, border: 'none', background: '#3B82F6', color: '#fff', fontSize: 15, fontWeight: 700, cursor: busy ? 'not-allowed' : 'pointer', opacity: busy ? 0.45 : 1, fontFamily: 'inherit', transition: 'opacity 0.16s' }
}
