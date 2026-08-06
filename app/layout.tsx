import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'
import StarBackground from '@/components/StarBackground'

export const metadata: Metadata = {
  title: 'Diverge',
  description: 'Pick a moment in history. Ask what if. Watch the world change.',
  icons: {
    icon: '/icon.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Playfair+Display:ital@0;1&display=swap" rel="stylesheet" />
      </head>
      <body style={{ margin: 0, position: 'relative' }}>
        <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
          <StarBackground />
        </div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <AuthProvider>{children}</AuthProvider>
        </div>
      </body>
    </html>
  )
}