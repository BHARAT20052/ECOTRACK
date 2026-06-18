import React from 'react'
import type { ActionDetails } from '@/types'

export interface EcoActionsGridProps {
  readonly onAction: (actionId: ActionDetails['actionId'], name: string) => Promise<void>
}

interface ActionItem {
  readonly id: ActionDetails['actionId']
  readonly name: string
  readonly emoji: string
  readonly reduction: string
}

const ACTION_ITEMS: readonly ActionItem[] = [
  { id: 'plant_tree', name: 'Plant a Tree', emoji: '🌳', reduction: '-21.77 kg CO₂' },
  { id: 'public_transport', name: 'Use Public Transport', emoji: '🚌', reduction: '-2.1 kg CO₂' },
  { id: 'vegan_day', name: 'Vegan Day', emoji: '🥗', reduction: '-3.0 kg CO₂' },
] as const

/**
 * Grid of reusable Eco Actions that users can record to offset their footprint.
 */
export const EcoActionsGrid: React.FC<EcoActionsGridProps> = ({ onAction }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {ACTION_ITEMS.map((action) => (
        <button
          key={action.id}
          onClick={() => void onAction(action.id, action.name)}
          className="p-6 rounded-xl border border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-all text-center group focus-visible:outline-primary-500"
        >
          <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">
            {action.emoji}
          </div>
          <h3 className="font-semibold text-gray-900">{action.name}</h3>
          <p className="text-sm text-primary-600 font-medium mt-1">{action.reduction}</p>
        </button>
      ))}
    </div>
  )
}
