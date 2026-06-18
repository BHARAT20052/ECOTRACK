import React from 'react'
import { Activity, TrendingDown, TrendingUp, Calendar } from 'lucide-react'

import { Card } from '@/components/ui/Card'
import { formatCo2, vsIndiaAverage, vsWorldAverage } from '@/utils/carbonConverter'

export interface DashboardStatsProps {
  readonly totalCo2: number
  readonly streakCurrent: number
}

const COMPARISON_THRESHOLD = 0 as const

/**
 * Renders statistical cards comparing user footprint to global and regional averages.
 */
export const DashboardStats: React.FC<DashboardStatsProps> = ({ totalCo2, streakCurrent }) => {
  const indiaDiff = vsIndiaAverage(totalCo2)
  const worldDiff = vsWorldAverage(totalCo2)

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" aria-label="Key Statistics">
      <Card glass className="p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-gray-500">Monthly Total</h2>
          <Activity className="w-5 h-5 text-primary-500" />
        </div>
        <p className="text-4xl font-mono font-bold mt-2 text-gray-900" aria-live="polite">
          {formatCo2(totalCo2)}
        </p>
      </Card>

      <Card glass className="p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-gray-500">vs India Average</h2>
          {indiaDiff <= COMPARISON_THRESHOLD ? (
            <TrendingDown className="w-5 h-5 text-primary-500" />
          ) : (
            <TrendingUp className="w-5 h-5 text-red-500" />
          )}
        </div>
        <p className={`text-2xl font-bold mt-2 ${indiaDiff <= COMPARISON_THRESHOLD ? 'text-primary-600' : 'text-red-600'}`}>
          {indiaDiff <= COMPARISON_THRESHOLD ? '' : '+'}{indiaDiff.toFixed(1)}%
        </p>
      </Card>

      <Card glass className="p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-gray-500">vs World Average</h2>
          {worldDiff <= COMPARISON_THRESHOLD ? (
            <TrendingDown className="w-5 h-5 text-primary-500" />
          ) : (
            <TrendingUp className="w-5 h-5 text-red-500" />
          )}
        </div>
        <p className={`text-2xl font-bold mt-2 ${worldDiff <= COMPARISON_THRESHOLD ? 'text-primary-600' : 'text-red-600'}`}>
          {worldDiff <= COMPARISON_THRESHOLD ? '' : '+'}{worldDiff.toFixed(1)}%
        </p>
      </Card>

      <Card glass className="p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-gray-500">Current Streak</h2>
          <Calendar className="w-5 h-5 text-amber-500" />
        </div>
        <p className="text-2xl font-bold mt-2 text-gray-900">
          {streakCurrent} {streakCurrent === 1 ? 'Day' : 'Days'} 🔥
        </p>
      </Card>
    </section>
  )
}
