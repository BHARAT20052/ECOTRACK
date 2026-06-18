import React from 'react'

import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import type { ActionDetails } from '@/types'

export interface QuickOffsetsGridProps {
  readonly onAction: (actionId: ActionDetails['actionId'], name: string) => Promise<void>
}

interface OffsetAction {
  readonly id: ActionDetails['actionId']
  readonly name: string
  readonly emoji: string
  readonly valueText: string
}

const OFFSET_ACTIONS: readonly OffsetAction[] = [
  { id: 'plant_tree', name: 'Plant a Tree', emoji: '🌳', valueText: '-21.77 kg' },
  { id: 'public_transport', name: 'Public Transport', emoji: '🚌', valueText: '-2.1 kg' },
  { id: 'vegan_day', name: 'Vegan Day', emoji: '🥗', valueText: '-3.0 kg' },
] as const

/**
 * Grid component of quick offset choices allowing rapid logging.
 */
export const QuickOffsetsGrid: React.FC<QuickOffsetsGridProps> = ({ onAction }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {OFFSET_ACTIONS.map((action) => (
        <Card key={action.id} glass className="p-4 flex flex-col items-center text-center">
          <div className="text-4xl mb-3">{action.emoji}</div>
          <h3 className="font-semibold mb-1">{action.name}</h3>
          <Badge variant="success" className="mb-4">
            {action.valueText}
          </Badge>
          <Button className="w-full mt-auto" onClick={() => void onAction(action.id, action.name)}>
            Complete
          </Button>
        </Card>
      ))}
    </div>
  )
}
