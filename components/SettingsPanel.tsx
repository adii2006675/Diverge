'use client'
import { useAuth } from '@/context/AuthContext'
import { useT } from '@/lib/useT'
import { LANGUAGES, NATIVE_NAMES } from '@/lib/i18n'

const THEMES = ['light', 'dark']
const ACCENT_COLORS = [
  { value: 'none', label: 'None', hex: 'var(--text)' },
  { value: 'red', label: 'Red', hex: '#F43F5E' },
  { value: 'orange', label: 'Orange', hex: '#F59E0B' },
  { value: 'blue', label: 'Blue', hex: '#3B82F6' },
  { value: 'green', label: 'Green', hex: '#10B981' },
  { value: 'purple', label: 'Purple', hex: '#8B5CF6' },
  { value: 'pink', label: 'Pink', hex: '#EC4899' },
  { value: 'teal', label: 'Brown', hex: '#B07D4F' },
]
const FONT_SIZES = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
]

export default function SettingsPanel() {
  const { settings, updateSettings } = useAuth()
  const { t } = useT()

  async function handleToggle(key: 'show_confidence_level') {
    if (!settings) return
    await updateSettings({ [key]: !settings[key] })
  }

  return (
    <>
        <Section title="Theme">
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {THEMES.map(theme => (
              <button
                key={theme}
                onClick={() => updateSettings({ theme })}
                style={{
                  flex: 1, padding: '10px', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit',
                  border: `1px solid ${settings?.theme === theme ? 'var(--accent)' : 'var(--border-color)'}`,
                  background: settings?.theme === theme ? 'color-mix(in srgb, var(--accent) 15%, var(--card-bg))' : 'var(--card-bg)',
                  color: settings?.theme === theme ? 'var(--accent)' : 'var(--text-dim)',
                  fontSize: 'var(--font-scale)', fontWeight: settings?.theme === theme ? 700 : 400,
                  transition: 'all 0.18s',
                  textTransform: 'capitalize',
                  minWidth: 100,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                {t(theme)}
              </button>
            ))}
          </div>
        </Section>

        <Section title="Accent Color">
          {/* A grid keeps every row on the same columns, so the dots line up down each column. */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 }}>
            {ACCENT_COLORS.map(c => (
              <button
                key={c.value}
                onClick={() => updateSettings({ accent_color: c.value })}
                style={{
                  // Dot first, label after it, both from the left edge, so the dots line up in each column.
                  display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 12, textAlign: 'left',
                  minWidth: 0,
                  padding: '9px 18px', borderRadius: 999, cursor: 'pointer', fontFamily: 'inherit',
                  border: `1px solid ${settings?.accent_color === c.value ? c.hex : 'var(--border-color)'}`,
                  background: settings?.accent_color === c.value ? `color-mix(in srgb, ${c.hex} 15%, transparent)` : 'transparent',
                  color: settings?.accent_color === c.value ? c.hex : 'var(--text-dim)',
                  fontSize: 'var(--font-scale)', fontWeight: settings?.accent_color === c.value ? 600 : 400,
                  transition: 'all 0.18s',
                }}
              >
                <span aria-hidden="true" style={{ width: 14, height: 14, borderRadius: '50%', background: c.hex, flexShrink: 0, boxShadow: 'inset 0 0 0 1px rgba(128,128,128,0.35)' }} />
                {t(c.label)}
              </button>
            ))}
          </div>
        </Section>

        <Section title="Font Size">
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {FONT_SIZES.map(f => (
              <button
                key={f.value}
                onClick={() => updateSettings({ font_size: f.value })}
                style={{
                  flex: 1, padding: '10px', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit',
                  border: `1px solid ${settings?.font_size === f.value ? 'var(--accent)' : 'var(--border-color)'}`,
                  background: settings?.font_size === f.value ? 'color-mix(in srgb, var(--accent) 15%, var(--card-bg))' : 'var(--card-bg)',
                  color: settings?.font_size === f.value ? 'var(--accent)' : 'var(--text-dim)',
                  fontSize: 'var(--font-scale)', fontWeight: settings?.font_size === f.value ? 700 : 400,
                  transition: 'all 0.18s',
                  minWidth: 100,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                {t(f.label)}
              </button>
            ))}
          </div>
        </Section>

        <Section title="Language">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {LANGUAGES.map(lang => (
              <button
                key={lang}
                onClick={() => updateSettings({ language: lang })}
                style={{
                  flex: '1 1 140px', minWidth: 140,
                  padding: '8px 16px', borderRadius: 999, cursor: 'pointer', fontFamily: 'inherit',
                  border: `1px solid ${settings?.language === lang ? 'var(--accent)' : 'var(--border-color)'}`,
                  background: settings?.language === lang ? 'color-mix(in srgb, var(--accent) 15%, var(--card-bg))' : 'transparent',
                  color: settings?.language === lang ? 'var(--accent)' : 'var(--text-dim)',
                  fontSize: 'var(--font-scale)', fontWeight: settings?.language === lang ? 600 : 400,
                  transition: 'all 0.18s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
                }}
              >
                {NATIVE_NAMES[lang]}
              </button>
            ))}
          </div>
        </Section>

        <Section title="Display Options">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Toggle
              label={t('Show answer tags')}
              desc={t('Show the year, world mood, confidence level and how much each answer changed (+10%) around your answers')}
              value={settings?.show_confidence_level ?? true}
              onChange={() => handleToggle('show_confidence_level')}
            />
          </div>
        </Section>
    </>
  )
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const { t } = useT()
  return (
    <div style={{ marginBottom: 36 }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 14 }}>
        {t(title)}
      </div>
      {children}
    </div>
  )
}

function Toggle({ label, desc, value, onChange }: { label: string; desc: string; value: boolean; onChange: () => void }) {
  return (
    <div
      onClick={onChange}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '12px 16px', borderRadius: 12, border: '1px solid var(--border-color)', background: 'var(--card-bg)', cursor: 'pointer', transition: 'all 0.18s' }}
      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--accent)'}
      onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-color)'}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 'var(--font-scale)', fontWeight: 500, color: 'var(--text)', marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 'var(--font-scale)', color: 'var(--text-dim)' }}>{desc}</div>
      </div>
      <div style={{
        width: 44, height: 24, borderRadius: 99, flexShrink: 0,
        background: value ? 'var(--accent)' : 'var(--border-color)',
        position: 'relative', transition: 'background 0.2s',
        alignSelf: 'center',
      }}>
        <div style={{
          position: 'absolute', top: 3, left: value ? 23 : 3,
          width: 18, height: 18, borderRadius: '50%', background: 'var(--on-accent, #fff)',
          transition: 'left 0.2s',
          boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
        }} />
      </div>
    </div>
  )
}