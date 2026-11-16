'use client'
import { useT } from '@/lib/useT'

const MIN = 8
const MAX = 16

type Rule = { ok: boolean; text: string; bad?: boolean }

function rules(pw: string, t: (s: string) => string, tn: (s: string, n: number) => string): Rule[] {
  const n = pw.length
  let length = t('8-16 characters')
  if (n > 0 && n < MIN) length = tn('8-16 characters, needs {n} more', MIN - n)
  else if (n > MAX) length = tn('8-16 characters, {n} too many', n - MAX)
  return [
    { ok: n >= MIN && n <= MAX, text: length, bad: n > MAX },
    { ok: /[A-Z]/.test(pw), text: t('An uppercase letter') },
    { ok: /[a-z]/.test(pw), text: t('A lowercase letter') },
    { ok: /[0-9]/.test(pw), text: t('A number') },
    { ok: /[^A-Za-z0-9]/.test(pw), text: t('A special character, like ! or $') },
  ]
}

export function isPasswordValid(pw: string) {
  return rules(pw, s => s, (s, n) => s.replace('{n}', String(n))).every(r => r.ok)
}

/** Checks the password against every rule on each keystroke and says what is still missing. */
export function PasswordChecklist({ password }: { password: string }) {
  const { t, tn } = useT()
  const list = rules(password, t, tn)
  const started = password.length > 0
  const allGood = list.every(r => r.ok)
  return (
    <div className="pw-rules" aria-live="polite">
      <div className="pw-rules-title">{allGood ? t('Password looks good') : started ? t('Still needed') : t('Password must have')}</div>
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
  const { t, tn } = useT()
  if (!confirm) return <div className="pw-match" aria-live="polite" />
  const matches = confirm === password
  const stillTyping = !matches && confirm.length < password.length && password.startsWith(confirm)
  const left = password.length - confirm.length
  const text = matches ? t('Passwords match') : stillTyping ? (left === 1 ? t('Keep going, 1 more character') : tn('Keep going, {n} more characters', left)) : t('Doesn’t match the password above yet')
  return (
    <div className={`pw-match ${matches ? 'ok' : stillTyping ? '' : 'bad'}`} aria-live="polite">
      <i aria-hidden="true"></i>
      <span>{text}</span>
    </div>
  )
}
