import type { Metadata, Viewport } from 'next'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'
import StarBackground from '@/components/StarBackground'
import ViewportScale from '@/components/ViewportScale'
import PrefsSync from '@/components/PrefsSync'
import { themeVarsFor } from '@/lib/themeVars'
import CommandPalette from '@/components/CommandPalette'

export const metadata: Metadata = {
  title: 'Diverge',
  description: 'Pick a moment in history. Ask what if. Watch the world change.',
  icons: {
    icon: '/icon.svg',
  },
}

// viewportFit "cover" lets fixed bars use the phone's safe-area insets (notch, home indicator).
export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#080810' }

// Runs before the first paint: puts the remembered colours on the page and marks that someone was signed in, so a refresh does not flash
// the default colours or the Sign In button.
const BOOT_SCRIPT = "(function(){try{var d=document.documentElement;var c=JSON.parse(localStorage.getItem('diverge_theme_cache')||'null');if(c&&c.theme){var v=(" + themeVarsFor.toString() + ")(c.theme,String(c.accent),String(c.fontSize));for(var k in v)d.style.setProperty(k,v[k]);d.setAttribute('data-theme',c.theme)}var h=JSON.parse(localStorage.getItem('diverge_session_hint')||'null');if(h){d.classList.add('has-session');d.style.setProperty('--user-initial',JSON.stringify(h.a?'':String(h.i||'')));if(h.a)d.style.setProperty('--user-avatar','url('+JSON.stringify(String(h.a))+')')}}catch(e){}})();"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: "(function(){try{if(!CSS.supports('zoom','1.2'))return;var s=Math.min(1.5,Math.max(1,innerWidth/1760));document.documentElement.style.setProperty('--ui-scale',s.toFixed(3))}catch(e){}})()" }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700;800;900&family=Playfair+Display:ital@0;1&display=swap" rel="stylesheet" />
      </head>
      <body style={{ margin: 0, position: 'relative' }}>
        <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
          <StarBackground />
        </div>
        <div className="app-shell" style={{ position: 'relative', zIndex: 1 }}>
          <ViewportScale />
          <AuthProvider>{children}<CommandPalette /><PrefsSync /></AuthProvider>
        </div>
      </body>
    </html>
  )
}