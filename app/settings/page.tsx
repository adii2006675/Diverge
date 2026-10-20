'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Settings now live on the profile page.
export default function SettingsRedirect() {
  const router = useRouter()
  useEffect(() => { router.replace('/profile') }, [router])
  return null
}
