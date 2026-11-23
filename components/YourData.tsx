'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { useT } from '@/lib/useT'
import { useToast } from '@/components/useToast'

// Delete the signed-in person's account and everything stored with it.
export default function YourData() {
  const { user } = useAuth()
  const { t } = useT()
  const router = useRouter()
  const { toast, showToast } = useToast()
  const [busy, setBusy] = useState<'delete' | null>(null)
  const [confirming, setConfirming] = useState(false)
  const [typed, setTyped] = useState('')
  const typedOk = typed.trim().toUpperCase() === 'DELETE'

  async function deleteAccount() {
    if (!user || busy || !typedOk) return
    setBusy('delete')
    try {
      // Profile pictures live in storage; remove them first.
      const { data: files } = await supabase.storage.from('avatars').list(user.id)
      if (files && files.length > 0) await supabase.storage.from('avatars').remove(files.map(f => `${user.id}/${f.name}`))
      const { error } = await supabase.rpc('delete_my_account')
      if (error) {
        const missing = /function|does not exist|schema cache/i.test(error.message)
        showToast(missing ? t('Account deletion is not set up yet. Please contact the person who runs this site.') : t('Could not delete your account. Please try again.'))
        setBusy(null)
        return
      }
      await supabase.auth.signOut()
      try { Object.keys(localStorage).filter(k => k.startsWith('diverge')).forEach(k => localStorage.removeItem(k)) } catch { /* ignore */ }
      router.push('/')
    } catch (err) {
      console.error(err)
      showToast(t('Could not delete your account. Please try again.'))
      setBusy(null)
    }
  }

  const btn: React.CSSProperties = { flex: '1 1 150px', padding: '12px', borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--card-bg)', color: 'var(--text)', fontSize: 'var(--font-scale)', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }

  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button type="button" className="acct-danger" onClick={() => { setTyped(''); setConfirming(true) }} disabled={busy !== null} style={{ ...btn, flex: '1 1 100%', color: '#EF4444' }}>{t('Delete my account')}</button>
      </div>

      {confirming && (
        <div role="dialog" aria-modal="true" aria-label={t('Delete my account')} onClick={() => !busy && setConfirming(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 440, borderRadius: 18, border: '1px solid var(--border-color)', background: 'var(--surface)', padding: 28 }}>
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 10 }}>{t('Delete your account?')}</div>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--text-dim)', margin: '0 0 16px' }}>{t('This permanently deletes your account, your saved timelines and your share links. It cannot be undone. Type DELETE to confirm.')}</p>
            <input
              autoFocus
              value={typed}
              onChange={e => setTyped(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') deleteAccount() }}
              aria-label={t('Type DELETE to confirm')}
              placeholder="DELETE"
              style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--card-bg)', color: 'var(--text)', fontSize: 16, fontFamily: 'inherit', marginBottom: 16, boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" onClick={() => setConfirming(false)} disabled={busy !== null} style={{ ...btn, flex: 1 }}>{t('Back')}</button>
              <button type="button" onClick={deleteAccount} disabled={busy !== null || !typedOk} style={{ ...btn, flex: 1, color: '#EF4444', opacity: typedOk && busy === null ? 1 : 0.45, cursor: typedOk ? 'pointer' : 'not-allowed' }}>
                {busy === 'delete' ? t('Deleting…') : t('Delete forever')}
              </button>
            </div>
          </div>
        </div>
      )}
      {toast}
    </div>
  )
}
