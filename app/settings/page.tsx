'use client'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import Nav from '@/components/Nav'
import AIResponseSettings from '@/components/AIResponseSettings'
import ApiKeyField from '@/components/ApiKeyField'
import { Section, DisplayOptions } from '@/components/SettingsPanel'
import { useT } from '@/lib/useT'

export default function SettingsPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const { t } = useT()

  if (loading) return (
    <main style={{ minHeight: 'var(--vh-fit, 100vh)', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid var(--border-color)', borderTopColor: 'var(--accent)', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </main>
  )

  if (!user) {
    router.push('/auth')
    return null
  }

  return (
    <main style={{ minHeight: 'var(--vh-fit, 100vh)', background: 'transparent', color: 'var(--text)', fontFamily: 'Figtree, system-ui, sans-serif', position: 'relative' }}>
      <Nav active="settings" />
      <div className="page-wrap" style={{ position: 'relative', zIndex: 1, maxWidth: 640, margin: '0 auto', padding: '140px 24px 60px' }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 40, letterSpacing: '-0.02em' }}>{t('Settings')}</h1>

        <Section title="AI Responses">
          <AIResponseSettings showDescriptions />
        </Section>

        <DisplayOptions />

        <Section title="API key">
          <ApiKeyField />
        </Section>
      </div>
    </main>
  )
}
