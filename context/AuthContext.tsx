'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

type UserSettings = {
  theme: string
  language: string
  ai_response_style: string
  show_confidence_level: boolean
  show_historians_note: boolean
  default_era: string
  accent_color: string
  font_size: string
}

type Profile = {
  id: string
  username: string
  email: string
  avatar_url: string | null
}

type AuthContextType = {
  user: User | null
  profile: Profile | null
  settings: UserSettings | null
  loading: boolean
  signOut: () => Promise<void>
  updateSettings: (updates: Partial<UserSettings>) => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  settings: null,
  loading: true,
  signOut: async () => {},
  updateSettings: async () => {},
  updateProfile: async () => {},
  refreshProfile: async () => {},
})

const ACCENT_COLORS: Record<string, string> = {
  none: 'var(--text)',
  red: '#F43F5E',
  orange: '#F59E0B',
  blue: '#3B82F6',
  green: '#10B981',
  purple: '#8B5CF6',
  pink: '#EC4899',
  teal: '#14B8A6',
}

const FONT_SCALES: Record<string, string> = {
  small: '8px',
  medium: '12px',
  large: '16px',
}

const THEME_VARS: Record<string, { bg: string; star: string; text: string; textDim: string; navBg: string; cardBg: string; borderColor: string }> = {
  light: {
    bg: '#FAFAFA',
    star: '#000000',
    text: '#0A0A0A',
    textDim: 'rgba(10,10,10,0.55)',
    navBg: 'rgba(255,255,255,0.85)',
    cardBg: 'rgba(0,0,0,0.03)',
    borderColor: 'rgba(0,0,0,0.1)',
  },
  dark: {
    bg: '#080810',
    star: '#FFFFFF',
    text: '#FFFFFF',
    textDim: 'rgba(255,255,255,0.55)',
    navBg: 'rgba(8,8,16,0.85)',
    cardBg: 'rgba(255,255,255,0.03)',
    borderColor: 'rgba(255,255,255,0.1)',
  },
}

function applyThemeToDOM(theme: string, accentKey: string, fontSize: string) {
  const root = document.documentElement
  const themeVars = THEME_VARS[theme] || THEME_VARS.dark
  const accent = accentKey === 'none' ? themeVars.text : (ACCENT_COLORS[accentKey] || ACCENT_COLORS.orange)
  const scale = FONT_SCALES[fontSize] || FONT_SCALES.medium

  root.style.setProperty('--bg', themeVars.bg)
  root.style.setProperty('--star-color', themeVars.star)
  root.style.setProperty('--text', themeVars.text)
  root.style.setProperty('--text-dim', themeVars.textDim)
  root.style.setProperty('--nav-bg', themeVars.navBg)
  root.style.setProperty('--card-bg', themeVars.cardBg)
  root.style.setProperty('--border-color', themeVars.borderColor)
  root.style.setProperty('--accent', accent)
  root.style.setProperty('--font-scale', scale)
  root.setAttribute('data-theme', theme)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [loading, setLoading] = useState(true)

  async function fetchProfile(userId: string) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (data) setProfile(data)
  }

  async function fetchSettings(userId: string) {
    const { data } = await supabase
      .from('user_settings')
      .select('*')
      .eq('id', userId)
      .single()

    if (data) {
      const merged = {
        theme: data.theme === 'dim' ? 'dark' : (data.theme || 'dark'),
        language: data.language || 'English',
        ai_response_style: data.ai_response_style || 'detailed',
        show_confidence_level: data.show_confidence_level ?? true,
        show_historians_note: data.show_historians_note ?? true,
        default_era: data.default_era || 'All',
        accent_color: data.accent_color || 'orange',
        font_size: data.font_size || 'medium',
      }
      setSettings(merged)
      applyThemeToDOM(merged.theme, merged.accent_color, merged.font_size)
    } else {
      const defaults = {
        id: userId,
        theme: 'dark',
        language: 'English',
        ai_response_style: 'detailed',
        show_confidence_level: true,
        show_historians_note: true,
        default_era: 'All',
        accent_color: 'orange',
        font_size: 'medium',
      }
      await supabase.from('user_settings').insert(defaults)
      setSettings(defaults)
      applyThemeToDOM(defaults.theme, defaults.accent_color, defaults.font_size)
    }
  }

  async function refreshProfile() {
    if (user) await fetchProfile(user.id)
  }

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setSettings(null)
    applyThemeToDOM('dark', 'orange', 'medium')
  }

  async function updateSettings(updates: Partial<UserSettings>) {
    if (!user) return
    const newSettings = { ...settings, ...updates } as UserSettings
    setSettings(newSettings)
    applyThemeToDOM(newSettings.theme, newSettings.accent_color, newSettings.font_size)
    await supabase
      .from('user_settings')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', user.id)
  }

  async function updateProfile(updates: Partial<Profile>) {
    if (!user) return
    const newProfile = { ...profile, ...updates } as Profile
    setProfile(newProfile)
    await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
  }

  useEffect(() => {
    applyThemeToDOM('dark', 'orange', 'medium')

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
        fetchSettings(session.user.id)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
        fetchSettings(session.user.id)
      } else {
        setProfile(null)
        setSettings(null)
        applyThemeToDOM('dark', 'orange', 'medium')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, profile, settings, loading, signOut, updateSettings, updateProfile, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}