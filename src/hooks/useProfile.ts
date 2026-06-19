import { useState, useEffect } from 'react'
import { getUserProfile } from '@/services/firestore'
import type { UserProfile } from '@/types'

interface UseProfileResult {
  readonly profile: UserProfile | null
  readonly loading: boolean
  readonly error: string | null
}

/** Fetches and returns the Firestore user profile for the given uid. */
export function useProfile(uid: string | null): UseProfileResult {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!uid) {
      setProfile(null)
      return
    }
    setLoading(true)
    getUserProfile(uid)
      .then(setProfile)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load profile'))
      .finally(() => setLoading(false))
  }, [uid])

  return { profile, loading, error }
}
