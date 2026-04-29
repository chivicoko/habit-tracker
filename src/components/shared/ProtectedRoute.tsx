'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSession } from '@/lib/storage'
import type { Session } from '@/types/auth'

interface Props {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: Props) {
  const router = useRouter()
  const [session, setSession] = useState<Session | null>(
    typeof window !== 'undefined' ? getSession() : null
  )

  useEffect(() => {
    const s = getSession()
    if (!s) {
      router.replace('/login')
    } else {
      setSession(s)
    }
  }, [router])

  if (!session) return null

  return <>{children}</>
}