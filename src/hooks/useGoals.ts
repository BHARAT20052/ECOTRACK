import { useState, useEffect, useCallback } from 'react'
import { getCurrentGoal, setMonthlyGoal } from '@/services/firestore'
import type { Goal } from '@/types'

export function useGoals(uid: string | null) {
  const [goal, setGoal] = useState<Goal | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchGoal = useCallback(async () => {
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
      fetchGoal()
    } else {
      setGoal(null)
    }
  }, [uid, fetchGoal])

  const updateGoal = useCallback(async (targetCo2: number) => {
    if (!uid) return
    await setMonthlyGoal(uid, targetCo2)
    await fetchGoal()
  }, [uid, fetchGoal])

  const getProgress = useCallback((currentCo2: number): number => {
    if (!goal || goal.targetCo2 <= 0) return 0
    // If current emissions is lower than the target, return completion progress
    // Target CO2 represents monthly reduction target (e.g. want to reduce by 100kg)
    // Actually, progress could be: how much CO2 reduced / target reduction.
    // Or target limit: e.g. keep emissions below target limit.
    // Wait, the formula in the prompt: Math.min(100, Math.round(((goal.targetCo2 - currentCo2) / goal.targetCo2) * 100))
    // Let's use the exact formula from the prompt.
    return Math.max(0, Math.min(100, Math.round(((goal.targetCo2 - currentCo2) / goal.targetCo2) * 100)))
  }, [goal])

  return { goal, loading, updateGoal, getProgress }
}
