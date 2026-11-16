'use client'

const MIN = 8
const MAX = 16

type Rule = { ok: boolean; text: string; bad?: boolean }

function rules(pw: string): Rule[] {
  const n = pw.length
  let length = '8-16 characters'
  if (n > 0 && n < MIN) length = `8-16 characters, needs ${MIN - n} more`
  else if (n > MAX) length = `8-16 characters, ${n - MAX} too many`
  return [
    { ok: n >= MIN && n <= MAX, text: length, bad: n > MAX },
    { ok: /[A-Z]/.test(pw), text: 'An uppercase letter' },
    { ok: /[a-z]/.test(pw), text: 'A lowercase letter' },
    { ok: /[0-9]/.test(pw), text: 'A number' },
    { ok: /[^A-Za-z0-9]/.test(pw), text: 'A special character, like ! or $' },
  ]
}

export function isPasswordValid(pw: string) {
  return rules(pw).every(r => r.ok)
}

/** Checks the password against every rule on each keystroke and says what is still missing. */
export function PasswordChecklist({ password }: { password: string }) {
  const list = rules(password)
  const started = password.length > 0
  const allGood = list.every(r => r.ok)
  return (
    <div className="pw-rules" aria-live="polite">
      <div className="pw-rules-title">{allGood ? 'Password looks good' : started ? 'Still needed' : 'Password must have'}</div>
      <ul>
        {list.map(r => (
          <li key={r.text} className={r.ok ? 'ok' : r.bad ? 'bad' : ''}>
            <i aria-hidden="true"></i>
            <span>{r.text}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Compares the second entry with the first as it is typed. */
export function MatchHint({ password, confirm }: { password: string; confirm: string }) {
  if (!confirm) return <div className="pw-match" aria-live="polite" />
  const matches = confirm === password
  const stillTyping = !matches && confirm.length < password.length && password.startsWith(confirm)
  const text = matches ? 'Passwords match' : stillTyping ? `Keep going, ${password.length - confirm.length} more character${password.length - confirm.length === 1 ? '' : 's'}` : 'Doesn’t match the password above yet'
  return (
    <div className={`pw-match ${matches ? 'ok' : stillTyping ? '' : 'bad'}`} aria-live="polite">
      <i aria-hidden="true"></i>
      <span>{text}</span>
    </div>
  )
}
