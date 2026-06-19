import React, { useCallback } from 'react'
import { toast } from 'react-hot-toast'
import { Trophy } from 'lucide-react'

import { useAuth } from '@/hooks/useAuth'
import { useFootprint } from '@/hooks/useFootprint'
import { useGoals } from '@/hooks/useGoals'
import { useProfile } from '@/hooks/useProfile'
import { Card } from '@/components/ui/Card'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { GoalProgressCard } from '@/components/goals/GoalProgressCard'
import { QuickOffsetsGrid } from '@/components/goals/QuickOffsetsGrid'
import { BadgesGrid } from '@/components/goals/BadgesGrid'
import type { ActionDetails } from '@/types'

/**
 * Renders the Goals page content containing streaking dashboard, monthly goals, and achievement badges.
 */
function GoalsContent(): React.JSX.Element {
  const { user } = useAuth()
  const { summary, logActivity } = useFootprint(user?.uid || null)
  const { goal, updateGoal, loading: goalLoading } = useGoals(user?.uid || null)
  const { profile, loading: profileLoading } = useProfile(user?.uid || null)

  const earnedBadges = profile?.badges || []
  const badgesLoading = profileLoading

  const handleEcoAction = useCallback(
    async (actionId: ActionDetails['actionId'], name: string): Promise<void> => {
      if (!user) return
      try {
        await logActivity('action', { actionId, actionName: name })
        toast.success(`Completed: ${name}`)
      } catch {
        toast.error('Failed to log action')
      }
    },
    [user, logActivity]
  )

  const handleUpdateGoal = useCallback(
    async (target: number): Promise<void> => {
      await updateGoal(target)
    },
    [updateGoal]
  )

  const monthlyGoal = goal?.targetCo2 || 0
  const currentCo2 = summary?.totalCo2 || 0

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Goals & Achievements</h1>
        <p className="text-gray-500 mt-1">Track your progress and earn badges.</p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GoalProgressCard
          monthlyGoal={monthlyGoal}
          currentCo2={currentCo2}
          onUpdateGoal={handleUpdateGoal}
          loading={goalLoading}
        />

        <Card glass className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-amber-100 p-2 rounded-lg">
                <Trophy className="w-6 h-6 text-amber-600" />
              </div>
              <h2 className="text-xl font-semibold">Streak</h2>
            </div>
            <div className="text-3xl">🔥</div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <p className="text-sm text-gray-500 mb-1">Current Streak</p>
              <p className="text-3xl font-bold text-gray-900">{profile?.streakCurrent || 0}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <p className="text-sm text-gray-500 mb-1">Longest Streak</p>
              <p className="text-3xl font-bold text-gray-900">{profile?.streakLongest || 0}</p>
            </div>
          </div>
        </Card>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Quick Offsets</h2>
        <QuickOffsetsGrid onAction={handleEcoAction} />
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Badges</h2>
        <BadgesGrid earnedBadges={earnedBadges} loading={badgesLoading} />
      </section>
    </div>
  )
}

/**
 * Default exported Goals page wrapped with an ErrorBoundary.
 */
export default function Goals(): React.JSX.Element {
  return (
    <ErrorBoundary>
      <GoalsContent />
    </ErrorBoundary>
  )
}
