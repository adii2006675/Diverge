'use client'
import { useState } from 'react'
import { getUserApiKey, setUserApiKey } from '@/lib/aiClient'

// Lets a visitor use their own Anthropic key once the free questions are used up. Stored only in this browser.
export default function ApiKeyField() {
  const [saved, setSaved] = useState(() => (typeof window === 'undefined' ? false : !!getUserApiKey()))
  const [draft, setDraft] = useState('')
  const [msg, setMsg] = useState('')

  function save() {
    const k = draft.trim()
    if (!/^sk-ant-[A-Za-z0-9_\-]{20,}$/.test(k)) { setMsg('That doesn’t look like an Anthropic key (it starts with sk-ant-).'); return }
    setUserApiKey(k); setDraft(''); setSaved(true); setMsg('Saved in this browser.')
  }
  function remove() { setUserApiKey(''); setSaved(false); setMsg('Removed.') }

  return (
    <div>
      <p style={{ fontSize: 13, color: 'var(--text2)', margin: '0 0 10px' }}>
        Each account gets 2 free questions. After that, add your own Anthropic API key to keep going. It is kept only in this browser, sent with your own requests, and never stored on the server. Answers still use Diverge’s own instructions.
      </p>
      {saved ? (
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ fontSize: 13 }}>Your key is saved.</span>
          <button type="button" onClick={remove} style={{ padding: '7px 14px', borderRadius: 9, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)', cursor: 'pointer', fontFamily: 'inherit' }}>Remove</button>
        </div>
      ) : (
        <form onSubmit={e => { e.preventDefault(); save() }} style={{ display: 'flex', gap: 10 }}>
          <input type="password" autoComplete="off" spellCheck={false} value={draft} onChange={e => setDraft(e.target.value)} placeholder="sk-ant-…" aria-label="Anthropic API key"
            style={{ flex: 1, minWidth: 0, padding: '9px 12px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text)', fontSize: 13 }} />
          <button type="submit" disabled={!draft.trim()} style={{ padding: '9px 16px', borderRadius: 10, border: 'none', background: 'var(--accent)', color: '#fff', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Save key</button>
        </form>
      )}
      {msg && <p role="status" style={{ fontSize: 12, color: 'var(--text2)', margin: '8px 0 0' }}>{msg}</p>}
    </div>
  )
}
