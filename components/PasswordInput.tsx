'use client'
import { useState, type InputHTMLAttributes } from 'react'

/** A password field with an eye button that shows or hides what was typed. Takes the same props and style as an <input>. */
export default function PasswordInput({ style, showLabel = 'Show password', hideLabel = 'Hide password', ...rest }: Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & { showLabel?: string; hideLabel?: string }) {
  const [visible, setVisible] = useState(false)
  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <input {...rest} type={visible ? 'text' : 'password'} style={{ ...style, width: '100%', paddingRight: 46 }} />
      <button
        type="button"
        onClick={() => setVisible(v => !v)}
        aria-label={visible ? hideLabel : showLabel}
        aria-pressed={visible}
        title={visible ? hideLabel : showLabel}
        className="pw-eye"
      >
        {visible ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><path d="M1 1l22 22" /></svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
        )}
      </button>
    </div>
  )
}
