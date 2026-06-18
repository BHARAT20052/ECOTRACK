import { useState, useEffect, useCallback } from 'react'

import type { Goal } from '@/types'
import { getCurrentGoal, setMonthlyGoal } from '@/services/firestore'

const PROGRESS_MAX = 100 as const
const PROGRESS_MIN = 0 as const

interface UseGoalsResult {
  readonly goal: Goal | null
  readonly loading: boolean
  readonly updateGoal: (targetCo2: number) => Promise<void>
  readonly getProgress: (currentCo2: number) => number
}

/**
 * Custom hook to manage monthly carbon footprint reduction goals and progress tracking.
 * 
 * @param uid - The unique identifier of the authenticated user
 * @returns State and functions to get/update goals and calculate progress percentages
 */
export function useGoals(uid: string | null): UseGoalsResult {
  const [goal, setGoal] = useState<Goal | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  const fetchGoal = useCallback(async (): Promise<void> => {
    if (!uid) return
    setLoading(true)
    try {
      const g = await getCurrentGoal(uid)
      setGoal(g)
    } catch {
      setGoal(null)
    } finally {
      setLoading(false)
    }
  }, [uid])

  useEffect(() => {
    if (uid) {
      void fetchGoal()
    } else {
      setGoal(null)
    }
  }, [uid, fetchGoal])

  const updateGoal = useCallback(async (targetCo2: number): Promise<void> => {
    if (!uid) return
    await setMonthlyGoal(uid, targetCo2)
    await fetchGoal()
  }, [uid, fetchGoal])

  const getProgress = useCallback((currentCo2: number): number => {
    if (!goal || goal.targetCo2 <= 0) return PROGRESS_MIN
    // Calculate progress as: (targetLimit - currentEmissions) / targetLimit
    const ratio = (goal.targetCo2 - currentCo2) / goal.targetCo2
    return Math.max(PROGRESS_MIN, Math.min(PROGRESS_MAX, Math.round(ratio * PROGRESS_MAX)))
  }, [goal])

  return { goal, loading, updateGoal, getProgress }
}
