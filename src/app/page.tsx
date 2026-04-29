'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import SplashScreen from '@/components/shared/SplashScreen'
import { getSession } from '@/lib/storage'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    const session = getSession()
    const delay = 1000 // between 800ms and 2000ms as required
    const timer = setTimeout(() => {
      if (session) {
        router.replace('/dashboard')
      } else {
        router.replace('/login')
      }
    }, delay)
    return () => clearTimeout(timer)
  }, [router])

  return <SplashScreen />
}
