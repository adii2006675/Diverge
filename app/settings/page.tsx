'use client'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import Nav from '@/components/Nav'
import AIResponseSettings from '@/components/AIResponseSettings'
import ApiKeyField from '@/components/ApiKeyField'
import { Section } from '@/components/SettingsPanel'

export default function SettingsPage() {
  const router = useRouter()
  const { user, loading } = useAuth()

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
    <main style={{ minHeight: 'var(--vh-fit, 100vh)', background: 'transparent', color: 'var(--text)', fontFamily: 'Inter, system-ui, sans-serif', position: 'relative' }}>
      <Nav active="settings" />
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 640, margin: '0 auto', padding: '140px 24px 60px' }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8, letterSpacing: '-0.02em' }}>Settings</h1>
        <p style={{ fontSize: 14, color: 'var(--text-dim)', marginBottom: 40 }}>Changes save automatically to your account.</p>

        <Section title="AI Responses">
          <AIResponseSettings showDescriptions />
        </Section>

        <Section title="Your API key">
          <ApiKeyField />
        </Section>

        <button
          onClick={() => router.push('/')}
          style={{ width: '100%', padding: '12px', borderRadius: 10, border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-dim)', fontSize: 'var(--font-scale)', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          Home
        </button>
      </div>
    </main>
  )
}
