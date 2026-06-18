import React, { useState, useEffect } from 'react'

import { useAuth } from '@/hooks/useAuth'
import { useFootprint } from '@/hooks/useFootprint'
import { Card } from '@/components/ui/Card'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { DashboardStats } from '@/components/dashboard/DashboardStats'
import { WeeklyTrendChart } from '@/components/dashboard/WeeklyTrendChart'
import { CategoryDistributionChart } from '@/components/dashboard/CategoryDistributionChart'
import { getUserProfile } from '@/services/firestore'
import type { UserProfile } from '@/types'

const SKELETON_ITEMS_COUNT = 4 as const

/**
 * Main dashboard content component holding statistics, trends, and recent history.
 */
function DashboardContent(): React.JSX.Element {
  const { user } = useAuth()
  const { summary, loading } = useFootprint(user?.uid || null)
  const [profile, setProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    if (user) {
      getUserProfile(user.uid)
        .then(setProfile)
        .catch((error) => {
          console.error('Failed to load user profile in dashboard:', error)
        })
    } else {
      setProfile(null)
    }
  }, [user])

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: SKELETON_ITEMS_COUNT }).map((_, i) => (
            <div key={i} className="h-32 skeleton" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 skeleton" />
          <div className="h-80 skeleton" />
        </div>
      </div>
    )
  }

  if (!summary) {
    return (
      <div className="p-6 bg-red-50 text-red-700 border border-red-200 rounded-xl">
        Failed to load carbon footprint summary.
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back, {user?.displayName || 'Eco Warrior'}</p>
      </header>

      <DashboardStats
        totalCo2={summary.totalCo2}
        streakCurrent={profile?.streakCurrent || 0}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WeeklyTrendChart weeklyTrend={summary.weeklyTrend} />
        <CategoryDistributionChart byCategory={summary.byCategory} />
      </div>

      <Card glass className="p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Activities</h2>
        <div className="space-y-4">
          <p className="text-gray-500">Check your calculator to log new activities!</p>
        </div>
      </Card>
    </div>
  )
}

/**
 * Main dashboard page component wrapped with an ErrorBoundary.
 */
export default function Dashboard(): React.JSX.Element {
  return (
    <ErrorBoundary>
      <DashboardContent />
    </ErrorBoundary>
  )
}
