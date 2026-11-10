'use client'
import PasswordInput from '@/components/PasswordInput'
import { PasswordChecklist, MatchHint } from '@/components/PasswordChecklist'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import StarBackground from '@/components/StarBackground'

export default function AuthPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  // Forgot password: 'email' asks for the address, 'code' takes the emailed code and a new password.
  const [reset, setReset] = useState<null | 'email' | 'code' | 'newpass'>(null)
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const boxRefs = useRef<(HTMLInputElement | null)[]>([])
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (cooldown <= 0) return
    const id = window.setTimeout(() => setCooldown(c => c - 1), 1000)
    return () => window.clearTimeout(id)
  }, [cooldown])

  function startReset() {
    setReset('email'); setError(''); setCode(''); setNewPassword(''); setConfirmPassword('')
  }

  function stopReset() {
    setReset(null); setError('')
  }

  // Sends the email with a code. The answer is the same whether or not the address has an account.
  async function sendCode() {
    if (!email.trim()) { setError('Enter your email first'); return }
    if (cooldown > 0) return
    setLoading(true); setError('')
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim())
    setLoading(false)
    if (resetError) {
      setError(/rate|too many|seconds/i.test(resetError.message) ? 'Too many requests. Wait a minute and try again.' : resetError.message)
      return
    }
    setCooldown(45)
    setCode('')
    setReset('code')
    window.setTimeout(() => boxRefs.current[0]?.focus(), 50)
  }

  // Runs by itself as soon as the sixth digit is in.
  async function verifyCode(token: string) {
    setLoading(true); setError('')
    const { error: verifyError } = await supabase.auth.verifyOtp({ email: email.trim(), token, type: 'recovery' })
    setLoading(false)
    if (verifyError) {
      setError(/expired|invalid/i.test(verifyError.message) ? 'That code is wrong or has expired. Try again or send a new one.' : verifyError.message)
      setCode('')
      window.setTimeout(() => boxRefs.current[0]?.focus(), 30)
      return
    }
    setReset('newpass')
  }

  function setDigits(next: string) {
    const clean = next.replace(/\D/g, '').slice(0, 6)
    setCode(clean)
    setError('')
    if (clean.length === 6) verifyCode(clean)
    else boxRefs.current[Math.min(clean.length, 5)]?.focus()
  }

  async function savePassword() {
    setError('')
    const okLength = newPassword.length >= 8 && newPassword.length <= 16
    if (!okLength || !/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword) || !/[^A-Za-z0-9]/.test(newPassword)) {
      setError('Password must be 8-16 characters with 1 uppercase, 1 lowercase, 1 number, and 1 special character')
      return
    }
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return }
    setLoading(true)
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })
    setLoading(false)
    if (updateError) { setError(updateError.message); return }
    router.push('/')
  }

  async function handleAuth() {
    setLoading(true)
    setError('')

    try {
      if (isSignUp) {
        if (!name.trim()) { setError('Please enter your name'); setLoading(false); return }
        if (!age || parseInt(age) < 8 || parseInt(age) > 120) { setError('Please enter a valid age'); setLoading(false); return }

        console.log('Attempting signup with:', email)
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name: name.trim(), age })
        })

        const result = await res.json()
        if (!res.ok) throw new Error(result.error || 'Signup failed')
        
        // Now sign in with the created credentials
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
        if (signInError) throw signInError
        
        router.push('/')
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
        if (signInError) {
          if (/invalid login credentials/i.test(signInError.message)) throw new Error('Incorrect email or password. Forgot your password? Use the link below.')
          throw signInError
        }
        router.push('/')
      }
    } catch (err: any) {
      console.error('Auth error:', err)
      setError(err?.message || err?.error_description || JSON.stringify(err) || 'Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  return (
    <main style={{ minHeight: 'var(--vh-fit, 100vh)', background: '#080810', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, system-ui, sans-serif', position: 'relative' }}>
      <StarBackground />
      <div style={{ width: '100%', maxWidth: 420, padding: 32, borderRadius: 20, border: '1px solid rgba(255,255,255,0.08)', background: '#0d0d16', position: 'relative', zIndex: 1 }}>

        <div
          onClick={() => router.push('/')}
          style={{ fontSize: 20, fontWeight: 900, letterSpacing: '0.15em', color: '#fff', marginBottom: 4, cursor: 'pointer' }}
        >
          DIVERGE
        </div>
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginBottom: 28 }}>
          {reset === 'email' ? 'Enter your email and we will send you a code' : reset === 'code' ? `We sent a code to ${email.trim()}` : reset === 'newpass' ? 'Code confirmed. Choose a new password' : isSignUp ? 'Create an account to save your history' : 'Sign in to access your saved history'}
        </div>

        {reset ? (
          <>
            {reset === 'email' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <input
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  type="email"
                  placeholder="Email"
                  style={inp}
                  onKeyDown={e => e.key === 'Enter' && sendCode()}
                />
              </div>
            )}

            {reset === 'code' && (
              <div role="group" aria-label="6-digit code" style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <input
                    key={i}
                    ref={el => { boxRefs.current[i] = el }}
                    value={code[i] || ''}
                    inputMode="numeric"
                    autoComplete={i === 0 ? 'one-time-code' : 'off'}
                    maxLength={6}
                    disabled={loading}
                    aria-label={`Digit ${i + 1}`}
                    onChange={e => {
                      const v = e.target.value.replace(/\D/g, '')
                      if (!v) return
                      // A pasted code fills every box; a single digit fills this one.
                      if (v.length > 1) return setDigits(v)
                      const arr = code.split('')
                      arr[i] = v
                      setDigits(arr.join('').slice(0, 6))
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Backspace') {
                        e.preventDefault()
                        const arr = code.split('')
                        if (arr[i]) { arr[i] = ''; setCode(arr.join('')) }
                        else if (i > 0) { arr[i - 1] = ''; setCode(arr.join('')); boxRefs.current[i - 1]?.focus() }
                        setError('')
                      }
                      if (e.key === 'ArrowLeft' && i > 0) boxRefs.current[i - 1]?.focus()
                      if (e.key === 'ArrowRight' && i < 5) boxRefs.current[i + 1]?.focus()
                    }}
                    onFocus={e => e.currentTarget.select()}
                    style={{ ...inp, padding: '14px 0', width: 'calc((100% - 40px) / 6)', textAlign: 'center', fontSize: 22, fontWeight: 700, borderColor: error ? 'rgba(239,68,68,0.5)' : code[i] ? 'rgba(59,130,246,0.7)' : undefined }}
                  />
                ))}
              </div>
            )}

            {reset === 'newpass' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>New password</div>
                </div>
                <PasswordInput value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New password" style={inp} autoFocus autoComplete="new-password" />
                <PasswordChecklist password={newPassword} />
                <PasswordInput
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                  style={inp}
                  onKeyDown={e => e.key === 'Enter' && savePassword()}
                />
                <MatchHint password={newPassword} confirm={confirmPassword} />
              </div>
            )}

            {error && (
              <div role="alert" style={{ fontSize: 13, color: '#EF4444', marginTop: 12, padding: '8px 12px', borderRadius: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                {error}
              </div>
            )}

            {reset === 'email' && (
              <button
                onClick={sendCode}
                disabled={loading}
                style={{ width: '100%', marginTop: 20, padding: '13px', borderRadius: 10, border: 'none', background: '#3B82F6', color: '#fff', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, fontFamily: 'inherit' }}
              >
                {loading ? 'Loading...' : 'Send code'}
              </button>
            )}

            {reset === 'newpass' && (
              <button
                onClick={savePassword}
                disabled={loading}
                style={{ width: '100%', marginTop: 20, padding: '13px', borderRadius: 10, border: 'none', background: '#3B82F6', color: '#fff', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, fontFamily: 'inherit' }}
              >
                {loading ? 'Loading...' : 'Change password'}
              </button>
            )}

            {reset === 'code' && (
              <div style={{ marginTop: 18, textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>
                {loading ? 'Checking...' : cooldown > 0 ? `Send a new code in ${cooldown}s` : (
                  <span onClick={sendCode} style={{ color: '#3B82F6', cursor: 'pointer', fontWeight: 600 }}>Send a new code</span>
                )}
              </div>
            )}

            <div style={{ marginTop: 14, textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>
              <span onClick={stopReset} style={{ color: '#3B82F6', cursor: 'pointer', fontWeight: 600 }}>Back to sign in</span>
            </div>
          </>
        ) : (
          <>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {isSignUp && (
                <>
                  <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    type="text"
                    placeholder="Your name"
                    style={inp}
                  />
                  <input
                    value={age}
                    onChange={e => setAge(e.target.value)}
                    type="number"
                    placeholder="Your age"
                    min={8}
                    max={120}
                    style={inp}
                  />
                </>
              )}
              <input
                value={email}
                onChange={e => setEmail(e.target.value)}
                type="email"
                placeholder="Email"
                style={inp}
              />
              <PasswordInput
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                style={inp}
                onKeyDown={e => e.key === 'Enter' && handleAuth()}
              />
              {isSignUp && <PasswordChecklist password={password} />}
            </div>
    
            {error && (
              <div style={{ fontSize: 13, color: '#EF4444', marginTop: 12, padding: '8px 12px', borderRadius: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                {error}
              </div>
            )}
    
            <button
              onClick={handleAuth}
              disabled={loading}
              style={{ width: '100%', marginTop: 20, padding: '13px', borderRadius: 10, border: 'none', background: '#3B82F6', color: '#fff', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, fontFamily: 'inherit', transition: 'all 0.2s' }}
            >
              {loading ? 'Loading...' : isSignUp ? 'Create Account' : 'Sign In'}
            </button>
    
            <button
              onClick={() => router.push('/')}
              style={{ width: '100%', marginTop: 10, padding: '13px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: 'rgba(255,255,255,0.5)', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Continue without account
            </button>
    
            <div style={{ marginTop: 16, textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>
              {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
              <span
                onClick={() => { setIsSignUp(!isSignUp); setError('') }}
                style={{ color: '#3B82F6', cursor: 'pointer', fontWeight: 600 }}
              >
                {isSignUp ? 'Sign in' : 'Sign up'}
              </span>
            </div>

            {!isSignUp && (
              <div style={{ marginTop: 10, textAlign: 'center', fontSize: 13 }}>
                <span onClick={startReset} style={{ color: '#3B82F6', cursor: 'pointer', fontWeight: 600 }}>Forgot password?</span>
              </div>
            )}
          </>
        )}
      </div>
      <div style={{ position: 'absolute', bottom: 20, left: 0, right: 0, textAlign: 'center', fontSize: 12 }}>
        <Link href="/privacy" style={{ color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>Privacy</Link>
      </div>
    </main>
  )
}

const inp: React.CSSProperties = {
  padding: '13px 16px', borderRadius: 10,
  border: '1px solid rgba(255,255,255,0.1)',
  background: 'rgba(255,255,255,0.05)',
  color: '#fff', fontSize: 14, outline: 'none',
  width: '100%', fontFamily: 'inherit',
  transition: 'border-color 0.2s',
}