import React, { useState, type FormEvent } from 'react'
import { Target, Info } from 'lucide-react'
import { toast } from 'react-hot-toast'

import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export interface GoalProgressCardProps {
  readonly monthlyGoal: number
  readonly currentCo2: number
  readonly onUpdateGoal: (target: number) => Promise<void>
  readonly loading: boolean
}

const HUNDRED_PERCENT = 100 as const
const ZERO_PERCENT = 0 as const

/**
 * Renders a card displaying the user's progress toward their monthly carbon limit.
 * Allows the user to set a new limit if one is not configured.
 */
export const GoalProgressCard: React.FC<GoalProgressCardProps> = ({
  monthlyGoal,
  currentCo2,
  onUpdateGoal,
  loading,
}) => {
  const [goalInput, setGoalInput] = useState<string>('')

  const handleSetGoal = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    const target = Number(goalInput)
    if (isNaN(target) || target <= 0) {
      toast.error('Enter a valid target')
      return
    }

    try {
      await onUpdateGoal(target)
      toast.success('Monthly goal updated!')
      setGoalInput('')
    } catch {
      toast.error('Failed to update goal')
    }
  }

  const progress = monthlyGoal
    ? Math.min(HUNDRED_PERCENT, Math.round((currentCo2 / monthlyGoal) * HUNDRED_PERCENT))
    : ZERO_PERCENT
  const isOverLimit = progress >= HUNDRED_PERCENT

  return (
    <Card glass className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-primary-100 p-2 rounded-lg">
          <Target className="w-6 h-6 text-primary-600" />
        </div>
        <h2 className="text-xl font-semibold">Monthly Goal</h2>
      </div>

      {!monthlyGoal ? (
        <form onSubmit={handleSetGoal} className="space-y-4">
          <p className="text-sm text-gray-600 font-medium">
            Set a target limit for your total CO₂ emissions this month.
          </p>
          <div className="flex gap-2">
            <Input
              label="Monthly Target"
              type="number"
              placeholder="Target in kg CO₂"
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              className="flex-1"
              required
            />
            <Button type="submit" loading={loading}>
              Set
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-sm text-gray-500">Current Progress</p>
              <p className="text-2xl font-bold text-gray-900">
                {currentCo2.toFixed(1)}{' '}
                <span className="text-sm font-normal text-gray-500">/ {monthlyGoal} kg CO₂</span>
              </p>
            </div>
            <Button variant="secondary" size="sm" onClick={() => void onUpdateGoal(0)}>
              Reset
            </Button>
          </div>

          <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`absolute top-0 left-0 h-full transition-all duration-1000 ${
                isOverLimit ? 'bg-red-500' : 'bg-primary-500'
              }`}
              style={{ width: `${progress}%` }}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>

          <div className="flex justify-between text-xs text-gray-500">
            <span>0%</span>
            <span>{progress}%</span>
          </div>

          {isOverLimit && (
            <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg mt-4">
              <Info className="w-5 h-5 shrink-0" />
              <p>
                You've exceeded your monthly goal. Try completing some Eco Actions to offset your
                emissions!
              </p>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}
