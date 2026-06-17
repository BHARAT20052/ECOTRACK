import { useState, useEffect, useCallback, useMemo } from 'react'
import { getActivitiesThisMonth, addActivity } from '@/services/firestore'
import { calculateCo2 } from '@/utils/emissionCalculator'
import { getLastNDays, toDateString } from '@/utils/dateHelpers'
import type { Activity, ActivityCategory, FootprintSummary } from '@/types'

export function useFootprint(uid: string | null) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchActivities = useCallback(async () => {
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
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchActivities()
    } else {
      setActivities([])
    }
  }, [uid, fetchActivities])

  const summary: FootprintSummary = useMemo(() => {
    const totalCo2 = activities.reduce((sum, a) => sum + a.co2, 0)
    const byCategory = activities.reduce<Record<ActivityCategory, number>>(
      (acc, a) => ({ ...acc, [a.category]: (acc[a.category] ?? 0) + a.co2 }),
      { transport: 0, food: 0, energy: 0, shopping: 0, flight: 0, action: 0 }
    )

    const last7Days = getLastNDays(7)
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
  ) => {
    if (!uid) return
    const co2 = calculateCo2(category, details)
    await addActivity(uid, { category, co2, timestamp: new Date(), details })
    await fetchActivities()
  }, [uid, fetchActivities])

  return { activities, summary, loading, error, logActivity, refetch: fetchActivities }
}
