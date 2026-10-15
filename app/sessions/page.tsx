'use client'
import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import Nav from '@/components/Nav'
import CardBorderTrace from '@/components/CardBorderTrace'
import EventImage from '@/components/EventImage'
import { ALL_EVENTS } from '@/lib/events'
import { motion, AnimatePresence } from 'motion/react'

type Session = {
  id: string
  event_id: string
  event_title: string
  divergence_score: number
  created_at: string
  what_ifs: any[]
}

type SortMode = 'newest' | 'oldest' | 'most_diverged' | 'least_diverged'

export default function SessionsPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [sessions, setSessions] = useState<Session[]>([])
  const [loadingSessions, setLoadingSessions] = useState(true)
  const [expandedSession, setExpandedSession] = useState<string | null>(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortMode, setSortMode] = useState<SortMode>('newest')

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
      .limit(100)
    setSessions(data || [])
    setLoadingSessions(false)
  }

  async function handleRename(id: string) {
    if (!renameValue.trim()) { setRenamingId(null); return }
    await supabase.from('sessions').update({ event_title: renameValue.trim() }).eq('id', id)
    setSessions(prev => prev.map(s => s.id === id ? { ...s, event_title: renameValue.trim() } : s))
    setRenamingId(null)
  }

  async function handleDuplicate(session: Session) {
    const { data } = await supabase
      .from('sessions')
      .insert({
        user_id: user!.id,
        event_id: session.event_id,
        event_title: `${session.event_title} (copy)`,
        what_ifs: session.what_ifs,
        divergence_score: session.divergence_score,
      })
      .select()
      .single()
    if (data) setSessions(prev => [data, ...prev])
    setOpenMenuId(null)
  }

  async function handleDelete(id: string) {
    console.log('handleDelete called with id:', id)
    const { error, data, count } = await supabase.from('sessions').delete().eq('id', id).select()
    console.log('delete result:', { error, data, count })
    if (error) {
      console.error('Failed to delete session:', error)
      return
    }
    if (!data || data.length === 0) {
      console.warn('Delete returned no rows — likely blocked by RLS or id mismatch')
    }
    setSessions(prev => prev.filter(s => s.id !== id))
    setDeleteTargetId(null)
    await loadSessions()
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    })
  }

  const filteredSorted = useMemo(() => {
    let result = sessions.filter(s =>
      (s.event_title || '').toLowerCase().includes(searchQuery.toLowerCase())
    )
    switch (sortMode) {
      case 'newest':
        result = result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
      case 'oldest':
        result = result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        break
      case 'most_diverged':
        result = result.sort((a, b) => (b.divergence_score || 0) - (a.divergence_score || 0))
        break
      case 'least_diverged':
        result = result.sort((a, b) => (a.divergence_score || 0) - (b.divergence_score || 0))
        break
    }
    return result
  }, [sessions, searchQuery, sortMode])

  const deleteTarget = sessions.find(s => s.id === deleteTargetId)

  if (loading) return (
    <main style={{ minHeight: 'var(--vh-fit, 100vh)', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid var(--border-color)', borderTopColor: 'var(--accent)', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </main>
  )

  if (!user) {
    return (
      <main style={{ minHeight: 'var(--vh-fit, 100vh)', background: 'transparent', color: 'var(--text)', fontFamily: 'Inter, system-ui, sans-serif', position: 'relative' }}>
        <Nav active="sessions" />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 720, margin: '0 auto', padding: '140px 24px 60px' }}>
          <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8, letterSpacing: '-0.02em' }}>Sessions</h1>
          <p style={{ fontSize: 14, color: 'var(--text-dim)', marginBottom: 24 }}>Sign in to access your saved history.</p>
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <button
              onClick={() => router.push('/auth')}
              style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid var(--accent)', background: 'transparent', color: 'var(--accent)', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Sign In
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main style={{ minHeight: 'var(--vh-fit, 100vh)', background: 'transparent', color: 'var(--text)', fontFamily: 'Inter, system-ui, sans-serif', position: 'relative' }}>
      <Nav active="sessions" />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 720, margin: '0 auto', padding: '140px 24px 60px' }}>
        <h1 style={{ fontSize: 'calc(var(--font-scale) * 2.67)', fontWeight: 900, marginBottom: 8, letterSpacing: '-0.02em' }}>Sessions</h1>
        <p style={{ fontSize: 'var(--font-scale)', color: 'var(--text-dim)', marginBottom: 24 }}>Your saved alternate timelines.</p>

        {/* Filter bar removed for now */}

        {loadingSessions ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid var(--border-color)', borderTopColor: 'var(--accent)', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
          </div>
        ) : filteredSorted.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: 20, color: 'var(--text-dim)' }}>
              {sessions.length === 0 ? 'No saved sessions yet' : 'No sessions match your search'}
            </div>
            {sessions.length === 0 && (
              <>
                <div style={{ fontSize: 16, color: 'var(--text-dim)', marginTop: 8, opacity: 0.7 }}>Start exploring history to save your timelines</div>
                <button
                  onClick={() => router.push('/explore')}
                  style={{ marginTop: 20, padding: '10px 20px', borderRadius: 10, border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)', background: 'color-mix(in srgb, var(--accent) 8%, transparent)', color: 'var(--accent)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLButtonElement; el.style.fontSize = '15px'; el.style.color = 'var(--text)' }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.fontSize = '13px'; el.style.color = 'var(--accent)' }}
                >
                  Explore events
                </button>
              </>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filteredSorted.map(session => {
              const isExpanded = expandedSession === session.id
              const isRenaming = renamingId === session.id
              return (
                <motion.div
                  key={session.id}
                  className="event-card"
                  whileHover={{ scale: 1.015 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  onClick={() => !isRenaming && setExpandedSession(isExpanded ? null : session.id)}
                  style={{
                    borderRadius: 14, cursor: 'pointer', position: 'relative', isolation: 'isolate',
                    border: `1px solid ${isExpanded ? 'color-mix(in srgb, var(--accent) 35%, transparent)' : 'var(--border-color)'}`,
                    background: isExpanded ? 'color-mix(in srgb, var(--accent) 6%, transparent)' : 'var(--card-bg)',
                    overflow: 'visible',
                  }}
                >
                  <CardBorderTrace radius={14} />
                  <div style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: '44px 1fr auto auto auto', gap: 14, alignItems: 'center', padding: '14px 18px' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 10, overflow: 'hidden', position: 'relative', background: 'color-mix(in srgb, var(--accent) 8%, var(--card-bg))' }}>
                      <EventImage
                        key={session.event_id}
                        id={session.event_id}
                        title={session.event_title || ''}
                        year={ALL_EVENTS.find(e => e.id === session.event_id)?.year}
                        compact
                        loading="lazy"
                      />
                    </div>
                    {isRenaming ? (
                      <input
                        autoFocus
                        value={renameValue}
                        onChange={e => setRenameValue(e.target.value)}
                        onClick={e => e.stopPropagation()}
                        onKeyDown={e => { if (e.key === 'Enter') handleRename(session.id); if (e.key === 'Escape') setRenamingId(null) }}
                        onBlur={() => handleRename(session.id)}
                        style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', background: 'transparent', border: '1px solid var(--accent)', borderRadius: 6, padding: '4px 8px', outline: 'none', fontFamily: 'inherit', width: '100%' }}
                      />
                    ) : (
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {session.event_title || 'Untitled Session'}
                      </div>
                    )}
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
                    <div style={{ position: 'relative' }}>
                      <button
                        onClick={e => { e.stopPropagation(); setOpenMenuId(openMenuId === session.id ? null : session.id) }}
                        style={{ width: 28, height: 28, borderRadius: 8, border: 'none', background: 'transparent', color: 'var(--text-dim)', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--border-color)' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
                      >
                        ⋯
                      </button>
                      {openMenuId === session.id && (
                        <div
                          onClick={e => e.stopPropagation()}
                          style={{ position: 'absolute', left: '100%', marginLeft: 25, top: -16, background: 'var(--nav-bg)', border: '1px solid var(--border-color)', borderRadius: 10, padding: 6, minWidth: 140, zIndex: 50 }}
                        >
                          <button
                            onClick={() => { setRenamingId(session.id); setRenameValue(session.event_title || ''); setOpenMenuId(null) }}
                            style={{ display: 'block', width: '100%', padding: '8px 10px', borderRadius: 7, border: 'none', background: 'transparent', color: 'var(--text-dim)', fontSize: 13, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}
                            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'var(--card-bg)'}
                            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'transparent'}
                          >
                            Rename
                          </button>
                          <button
                            onClick={() => handleDuplicate(session)}
                            style={{ display: 'block', width: '100%', padding: '8px 10px', borderRadius: 7, border: 'none', background: 'transparent', color: 'var(--text-dim)', fontSize: 13, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}
                            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'var(--card-bg)'}
                            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'transparent'}
                          >
                            Duplicate
                          </button>
                          <button
                              onClick={() => { setDeleteTargetId(session.id); setOpenMenuId(null) }}
                              style={{ display: 'block', width: '100%', padding: '8px 10px', borderRadius: 7, border: 'none', background: 'transparent', color: '#EF4444', fontSize: 13, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', marginTop: 4 }}
                              onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.12)'}
                              onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'transparent'}
                            >
                              Delete
                            </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div style={{ position: 'relative', zIndex: 1, padding: '0 18px 16px', borderTop: '1px solid var(--border-color)', paddingTop: 14 }}>
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
                        style={{ marginTop: 12, width: '100%', padding: '9px', borderRadius: 8, border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)', background: 'transparent', color: 'var(--accent)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}
                        onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(16,185,129,0.12)'}
                        onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'transparent'}
                      >
                        Continue exploring
                      </button>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {deleteTargetId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
            onClick={() => setDeleteTargetId(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ type: 'spring', stiffness: 320, damping: 30 }}
              style={{ background: 'var(--nav-bg)', border: '1px solid var(--border-color)', borderRadius: 18, padding: '36px', maxWidth: 560, width: '100%' }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--text)', marginBottom: 10 }}>Delete this session?</div>
              <div style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.6, marginBottom: 24 }}>
                Are you sure you want to delete <span style={{ fontWeight: 700, color: 'var(--text)' }}>{deleteTarget?.event_title || 'Untitled Session'}</span>. This action cannot be undone.
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => setDeleteTargetId(null)}
                  style={{ flex: 1, padding: '11px', borderRadius: 9, border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text)', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent)'}
                  onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-color)'}
                >
                  Back
                </button>
                <button
                  onClick={() => { console.log('Delete clicked, target:', deleteTargetId); if (deleteTargetId) handleDelete(deleteTargetId) }}
                  style={{ flex: 1, padding: '11px', borderRadius: 9, border: '1px solid var(--border-color)', background: 'transparent', color: '#EF4444', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.12)'}
                  onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'transparent'}
                >
                  Continue
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}