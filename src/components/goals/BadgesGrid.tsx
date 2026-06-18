import React from 'react'

import { Card } from '@/components/ui/Card'
import { BADGES } from '@/constants/emissionFactors'

export interface BadgesGridProps {
  readonly earnedBadges: readonly string[]
  readonly loading: boolean
}

const SKELETON_ITEMS_COUNT = 5 as const

/**
 * Grid component that lists eco achievement badges.
 * Unearned badges are shown as faded/grayscale.
 */
export const BadgesGrid: React.FC<BadgesGridProps> = ({ earnedBadges, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: SKELETON_ITEMS_COUNT }).map((_, i) => (
          <div key={i} className="h-32 skeleton" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {Object.values(BADGES).map((badge) => {
        const isEarned = earnedBadges.includes(badge.id)
        return (
          <Card
            key={badge.id}
            className={`p-4 text-center transition-all ${
              isEarned ? 'border-amber-200 bg-amber-50/30' : 'opacity-60 grayscale'
            }`}
          >
            <div className="text-4xl mb-2">{badge.icon}</div>
            <h3 className={`font-semibold text-sm ${isEarned ? 'text-gray-900' : 'text-gray-500'}`}>
              {badge.label}
            </h3>
            <p className="text-xs text-gray-500 mt-1">{badge.description}</p>
          </Card>
        )
      })}
    </div>
  )
}
