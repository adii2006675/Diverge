'use client'
import { useState } from 'react'
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
        if (signInError) throw signInError
        router.push('/')
      }
    } catch (err: any) {
      console.error('Auth error:', err)
      setError(err?.message || err?.error_description || JSON.stringify(err) || 'Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  return (
    <main style={{ minHeight: '100vh', background: '#080810', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, system-ui, sans-serif', position: 'relative' }}>
      <StarBackground />
      <div style={{ width: '100%', maxWidth: 420, padding: 32, borderRadius: 20, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', position: 'relative', zIndex: 1 }}>

        <div
          onClick={() => router.push('/')}
          style={{ fontSize: 20, fontWeight: 900, letterSpacing: '0.15em', color: '#fff', marginBottom: 4, cursor: 'pointer' }}
        >
          DIVERGE
        </div>
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginBottom: 28 }}>
          {isSignUp ? 'Create an account to save your history' : 'Sign in to access your saved history'}
        </div>

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
          <input
            value={password}
            onChange={e => setPassword(e.target.value)}
            type="password"
            placeholder="Password"
            style={inp}
            onKeyDown={e => e.key === 'Enter' && handleAuth()}
          />
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