'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import StarBackground from '@/components/StarBackground'
import Nav from '@/components/Nav'

type Session = {
  id: string
  event_id: string
  event_title: string
  divergence_score: number
  created_at: string
  what_ifs: any[]
}

export default function SessionsPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [sessions, setSessions] = useState<Session[]>([])
  const [loadingSessions, setLoadingSessions] = useState(true)
  const [expandedSession, setExpandedSession] = useState<string | null>(null)

  useEffect(() => {
    if (user) loadSessions()
  }, [user])

  async function loadSessions() {
    if (!user) return
    setLoadingSessions(true)
    const { data } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)
    setSessions(data || [])
    setLoadingSessions(false)
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    })
  }

  if (loading) return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid var(--border-color)', borderTopColor: 'var(--accent)', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </main>
  )

  if (!user) {
    router.push('/auth')
    return null
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', fontFamily: 'Inter, system-ui, sans-serif', position: 'relative' }}>
      <StarBackground />
      <Nav active="sessions" />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 720, margin: '0 auto', padding: '140px 24px 60px' }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8, letterSpacing: '-0.02em' }}>Sessions</h1>
        <p style={{ fontSize: 14, color: 'var(--text-dim)', marginBottom: 40 }}>Your saved alternate timelines.</p>

        {loadingSessions ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid var(--border-color)', borderTopColor: 'var(--accent)', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
          </div>
        ) : sessions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🌍</div>
            <div style={{ fontSize: 15, color: 'var(--text-dim)' }}>No saved sessions yet</div>
            <div style={{ fontSize: 13, color: 'var(--text-dim)', marginTop: 6, opacity: 0.7 }}>Start exploring history to save your timelines</div>
            <button
              onClick={() => router.push('/explore')}
              style={{ marginTop: 20, padding: '10px 20px', borderRadius: 10, border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)', background: 'color-mix(in srgb, var(--accent) 8%, transparent)', color: 'var(--accent)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Explore scenarios →
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {sessions.map(session => {
              const isExpanded = expandedSession === session.id
              return (
                <div
                  key={session.id}
                  onClick={() => setExpandedSession(isExpanded ? null : session.id)}
                  style={{
                    borderRadius: 14, cursor: 'pointer',
                    border: `1px solid ${isExpanded ? 'color-mix(in srgb, var(--accent) 35%, transparent)' : 'var(--border-color)'}`,
                    background: isExpanded ? 'color-mix(in srgb, var(--accent) 6%, transparent)' : 'var(--card-bg)',
                    transition: 'all 0.2s',
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 10, alignItems: 'center', padding: '16px 18px' }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {session.event_title || 'Untitled Session'}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
                      {formatDate(session.created_at)}
                    </div>
                    <div style={{
                      fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 999,
                      background: session.divergence_score > 70 ? 'rgba(239,68,68,0.15)' : session.divergence_score > 40 ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)',
                      color: session.divergence_score > 70 ? '#EF4444' : session.divergence_score > 40 ? '#F59E0B' : '#10B981',
                      whiteSpace: 'nowrap',
                    }}>
                      {session.divergence_score}% diverged
                    </div>
                  </div>

                  {isExpanded && (
                    <div style={{ padding: '0 18px 16px', borderTop: '1px solid var(--border-color)', paddingTop: 14 }}>
                      <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 10 }}>
                        {session.what_ifs?.length || 0} what-if{session.what_ifs?.length !== 1 ? 's' : ''} explored
                      </div>
                      {session.what_ifs?.slice(0, 5).map((w: any, i: number) => (
                        <div key={i} style={{ fontSize: 12, color: 'var(--text-dim)', padding: '5px 0', borderBottom: i < Math.min(session.what_ifs.length, 5) - 1 ? '1px solid var(--border-color)' : 'none' }}>
                          {i + 1}. {w.question || w}
                        </div>
                      ))}
                      <button
                        onClick={e => { e.stopPropagation(); router.push(`/diverge/${session.event_id}`) }}
                        style={{ marginTop: 12, width: '100%', padding: '9px', borderRadius: 8, border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)', background: 'color-mix(in srgb, var(--accent) 8%, transparent)', color: 'var(--accent)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
                      >
                        Continue exploring →
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}