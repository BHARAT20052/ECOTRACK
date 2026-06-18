import { useState, useEffect, useCallback, useMemo } from 'react'

import type { Activity, ActivityCategory, FootprintSummary } from '@/types'
import { getActivitiesThisMonth, addActivity } from '@/services/firestore'
import { calculateCo2 } from '@/utils/emissionCalculator'
import { getLastNDays, toDateString } from '@/utils/dateHelpers'

interface UseFootprintResult {
  readonly activities: readonly Activity[]
  readonly summary: FootprintSummary
  readonly loading: boolean
  readonly error: string | null
  readonly logActivity: (category: ActivityCategory, details: Activity['details']) => Promise<void>
  readonly refetch: () => Promise<void>
}

const DEFAULT_CATEGORY_TOTALS = {
  transport: 0,
  food: 0,
  energy: 0,
  shopping: 0,
  flight: 0,
  action: 0,
} as const

const TREND_DAYS_COUNT = 7 as const

/**
 * Custom hook for managing user footprint data, log history, and carbon calculators.
 * 
 * @param uid - The current user's unique identifier
 * @returns State and functions for footprint logging and calculations
 */
export function useFootprint(uid: string | null): UseFootprintResult {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const fetchActivities = useCallback(async (): Promise<void> => {
    if (!uid) return
    setLoading(true)
    try {
      const data = await getActivitiesThisMonth(uid)
      setActivities(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch activities')
    } finally {
      setLoading(false)
    }
  }, [uid])

  useEffect(() => {
    if (uid) {
      void fetchActivities()
    } else {
      setActivities([])
    }
  }, [uid, fetchActivities])

  const summary: FootprintSummary = useMemo(() => {
    const totalCo2 = activities.reduce((sum, a) => sum + a.co2, 0)
    const byCategory = activities.reduce<Record<ActivityCategory, number>>(
      (acc, a) => ({ ...acc, [a.category]: (acc[a.category] ?? 0) + a.co2 }),
      { ...DEFAULT_CATEGORY_TOTALS }
    )

    const last7Days = getLastNDays(TREND_DAYS_COUNT)
    const weeklyTrend = last7Days.map(date => ({
      date,
      co2: activities
        .filter(a => toDateString(a.timestamp) === date)
        .reduce((sum, a) => sum + a.co2, 0),
    }))

    return { totalCo2, byCategory, weeklyTrend, monthlyTotal: totalCo2 }
  }, [activities])

  const logActivity = useCallback(async (
    category: ActivityCategory,
    details: Activity['details']
  ): Promise<void> => {
    if (!uid) return
    const co2 = calculateCo2(category, details)
    await addActivity(uid, { category, co2, timestamp: new Date(), details })
    await fetchActivities()
  }, [uid, fetchActivities])

  return { activities, summary, loading, error, logActivity, refetch: fetchActivities }
}
