'use client'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import StarBackground from '@/components/StarBackground'
import Nav from '@/components/Nav'

const THEMES = ['light', 'dark']
const LANGUAGES = ['English', 'Spanish', 'French', 'German', 'Japanese', 'Portuguese', 'Hindi', 'Chinese']
const ACCENT_COLORS = [
  { value: 'none', label: 'None', hex: 'var(--text)' },
  { value: 'red', label: 'Red', hex: '#F43F5E' },
  { value: 'orange', label: 'Orange', hex: '#F59E0B' },
  { value: 'blue', label: 'Blue', hex: '#3B82F6' },
  { value: 'green', label: 'Green', hex: '#10B981' },
  { value: 'purple', label: 'Purple', hex: '#8B5CF6' },
  { value: 'pink', label: 'Pink', hex: '#EC4899' },
  { value: 'teal', label: 'Teal', hex: '#14B8A6' },
]
const FONT_SIZES = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
]
const AI_STYLES = [
  { value: 'detailed', label: 'Detailed', desc: 'Full historical analysis with deep context' },
  { value: 'concise', label: 'Concise', desc: 'Short punchy responses, key facts only' },
  { value: 'academic', label: 'Academic', desc: 'Formal tone with citations and hedging' },
  { value: 'storytelling', label: 'Storytelling', desc: 'Narrative driven, cinematic and vivid' },
]

export default function SettingsPage() {
  const router = useRouter()
  const { user, settings, updateSettings, loading } = useAuth()

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

  async function handleToggle(key: 'show_confidence_level' | 'show_historians_note') {
    if (!settings) return
    await updateSettings({ [key]: !settings[key] })
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', fontFamily: 'Inter, system-ui, sans-serif', position: 'relative' }}>
      <StarBackground />
      <Nav active="settings" />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 640, margin: '0 auto', padding: '140px 24px 60px' }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8, letterSpacing: '-0.02em' }}>Settings</h1>
        <p style={{ fontSize: 14, color: 'var(--text-dim)', marginBottom: 40 }}>Changes save automatically to your account.</p>

        <Section title="Theme">
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {THEMES.map(t => (
              <button
                key={t}
                onClick={() => updateSettings({ theme: t })}
                style={{
                  flex: 1, padding: '10px', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit',
                  border: `1px solid ${settings?.theme === t ? 'var(--accent)' : 'var(--border-color)'}`,
                  background: settings?.theme === t ? 'color-mix(in srgb, var(--accent) 15%, transparent)' : 'var(--card-bg)',
                  color: settings?.theme === t ? 'var(--accent)' : 'var(--text-dim)',
                  fontSize: 'var(--font-scale)', fontWeight: settings?.theme === t ? 700 : 400,
                  transition: 'all 0.18s',
                  textTransform: 'capitalize',
                  minWidth: 100,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </Section>

        <Section title="Accent Color">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {ACCENT_COLORS.map(c => (
              <button
                key={c.value}
                onClick={() => updateSettings({ accent_color: c.value })}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  flex: '1 1 140px', minWidth: 140,
                  padding: '8px 16px', borderRadius: 999, cursor: 'pointer', fontFamily: 'inherit',
                  border: `1px solid ${settings?.accent_color === c.value ? c.hex : 'var(--border-color)'}`,
                  background: settings?.accent_color === c.value ? `${c.hex}26` : 'transparent',
                  color: settings?.accent_color === c.value ? c.hex : 'var(--text-dim)',
                  fontSize: 'var(--font-scale)', fontWeight: settings?.accent_color === c.value ? 600 : 400,
                  transition: 'all 0.18s',
                }}
              >
                <span style={{ width: 12, height: 12, borderRadius: '50%', background: c.hex, flexShrink: 0 }} />
                {c.label}
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
                  background: settings?.font_size === f.value ? 'color-mix(in srgb, var(--accent) 15%, transparent)' : 'var(--card-bg)',
                  color: settings?.font_size === f.value ? 'var(--accent)' : 'var(--text-dim)',
                  fontSize: 'var(--font-scale)', fontWeight: settings?.font_size === f.value ? 700 : 400,
                  transition: 'all 0.18s',
                  minWidth: 100,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                {f.label}
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
                  background: settings?.language === lang ? 'color-mix(in srgb, var(--accent) 15%, transparent)' : 'transparent',
                  color: settings?.language === lang ? 'var(--accent)' : 'var(--text-dim)',
                  fontSize: 'var(--font-scale)', fontWeight: settings?.language === lang ? 600 : 400,
                  transition: 'all 0.18s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
                }}
              >
                {lang}
              </button>
            ))}
          </div>
        </Section>

        <Section title="AI Response Style">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {AI_STYLES.map(style => (
              <button
                key={style.value}
                onClick={() => updateSettings({ ai_response_style: style.value })}
                style={{
                  padding: '12px 16px', borderRadius: 12, cursor: 'pointer', fontFamily: 'inherit',
                  border: `1px solid ${settings?.ai_response_style === style.value ? 'var(--accent)' : 'var(--border-color)'}`,
                  background: settings?.ai_response_style === style.value ? 'color-mix(in srgb, var(--accent) 12%, transparent)' : 'var(--card-bg)',
                  textAlign: 'left', transition: 'all 0.18s',
                }}
              >
                <div style={{ fontSize: 'var(--font-scale)', fontWeight: 600, color: settings?.ai_response_style === style.value ? 'var(--accent)' : 'var(--text)', marginBottom: 2 }}>
                  {style.label}
                </div>
                <div style={{ fontSize: 'var(--font-scale)', color: 'var(--text-dim)' }}>{style.desc}</div>
              </button>
            ))}
          </div>
        </Section>

        <Section title="Display Options">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Toggle
              label="Show confidence level"
              desc="Display LOW / MEDIUM / HIGH confidence badge on AI responses"
              value={settings?.show_confidence_level ?? true}
              onChange={() => handleToggle('show_confidence_level')}
            />
            <Toggle
              label="Show historian's note"
              desc="Display the reliability note at the bottom of each response"
              value={settings?.show_historians_note ?? true}
              onChange={() => handleToggle('show_historians_note')}
            />
          </div>
        </Section>

        <button
          onClick={() => router.push('/')}
          style={{ width: '100%', padding: '12px', borderRadius: 10, border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-dim)', fontSize: 'var(--font-scale)', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent)'}
          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-color)'}
        >
          Home
        </button>
      </div>
    </main>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 36 }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 14 }}>
        {title}
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
          width: 18, height: 18, borderRadius: '50%', background: '#fff',
          transition: 'left 0.2s',
          boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
        }} />
      </div>
    </div>
  )
}