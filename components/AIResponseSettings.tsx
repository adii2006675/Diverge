'use client'
import { useAuth } from '@/context/AuthContext'
import { useT } from '@/lib/useT'
import { AI_OPTION_GROUPS, normalizeLength, normalizeDepth, normalizeTone, normalizePlausibility } from '@/lib/aiSettings'

type GroupKey = keyof typeof AI_OPTION_GROUPS

// One control for the four response settings, used by the Settings page and the AI modal on /diverge.
// Values are saved through AuthContext: to Supabase when signed in, to this browser when signed out.
export default function AIResponseSettings({ showDescriptions = false }: { showDescriptions?: boolean }) {
  const { settings, updateSettings } = useAuth()
  const { t } = useT()

  const current: Record<GroupKey, string> = {
    length: normalizeLength(settings?.ai_response_style),
    depth: normalizeDepth(settings?.ai_depth),
    plausibility: normalizePlausibility(settings?.ai_plausibility),
    tone: normalizeTone(settings?.ai_tone),
  }
  const field: Record<GroupKey, 'ai_response_style' | 'ai_depth' | 'ai_plausibility' | 'ai_tone'> = {
    length: 'ai_response_style', depth: 'ai_depth', plausibility: 'ai_plausibility', tone: 'ai_tone',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      {(Object.keys(AI_OPTION_GROUPS) as GroupKey[]).map(key => {
        const group = AI_OPTION_GROUPS[key]
        const stacked = showDescriptions && group.options.length > 2
        return (
          <div key={key} role="radiogroup" aria-label={t(group.title)}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 10 }}>{t(group.title)}</div>
            <div style={{ display: 'flex', flexDirection: stacked ? 'column' : 'row', gap: 8 }}>
              {group.options.map(opt => {
                const on = current[key] === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => updateSettings({ [field[key]]: opt.value })}
                    style={{
                      flex: stacked ? undefined : 1, padding: showDescriptions ? '10px 12px' : '9px', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', textAlign: showDescriptions ? 'left' : 'center',
                      border: `1px solid ${on ? 'var(--accent)' : 'var(--border-color)'}`,
                      background: on ? 'color-mix(in srgb, var(--accent) 14%, var(--card-bg))' : 'var(--card-bg)',
                      transition: 'transform 0.16s cubic-bezier(0.23, 1, 0.32, 1), border-color 0.16s, background 0.16s',
                    }}
                    onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.98)')}
                    onMouseUp={e => (e.currentTarget.style.transform = '')}
                    onMouseLeave={e => (e.currentTarget.style.transform = '')}
                  >
                    <div style={{ fontSize: 13, fontWeight: on ? 700 : 600, color: on ? 'var(--accent)' : 'var(--text)' }}>{t(opt.label)}</div>
                    {showDescriptions && <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2, lineHeight: 1.45 }}>{t(opt.desc)}</div>}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
