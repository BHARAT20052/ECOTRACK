import React, { useState, useCallback } from 'react'
import { toast } from 'react-hot-toast'
import { Car, Utensils, Zap, ShoppingBag, Leaf, type LucideIcon } from 'lucide-react'

import { useAuth } from '@/hooks/useAuth'
import { useFootprint } from '@/hooks/useFootprint'
import { Card } from '@/components/ui/Card'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { EcoActionsGrid } from '@/components/calculator/EcoActionsGrid'
import { StandardActivityForm } from '@/components/calculator/StandardActivityForm'
import type {
  ActivityCategory,
  TransportType,
  FoodType,
  EnergyType,
  ShoppingType,
  ActionDetails,
  Activity,
} from '@/types'

interface TabItem {
  readonly id: 'transport' | 'food' | 'energy' | 'shopping' | 'actions'
  readonly label: string
  readonly icon: LucideIcon
}

const TABS: readonly TabItem[] = [
  { id: 'transport', label: 'Transport', icon: Car },
  { id: 'food', label: 'Food', icon: Utensils },
  { id: 'energy', label: 'Energy', icon: Zap },
  { id: 'shopping', label: 'Shopping', icon: ShoppingBag },
  { id: 'actions', label: 'Eco Actions', icon: Leaf },
] as const

/**
 * CalculatorContent component containing the core logic and UI tabs.
 */
function CalculatorContent(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<TabItem['id']>('transport')
  const { user } = useAuth()
  const { logActivity } = useFootprint(user?.uid || null)

  const handleFormSubmit = useCallback(
    async (data: { value: number; type: string }): Promise<void> => {
      if (!user) {
        toast.error('Must be logged in')
        return
      }

      try {
        let details: Activity['details']
        if (activeTab === 'transport') {
          details = { distance: data.value, vehicleType: data.type as TransportType }
        } else if (activeTab === 'food') {
          details = { weight: data.value, foodType: data.type as FoodType }
        } else if (activeTab === 'energy') {
          details = { value: data.value, energyType: data.type as EnergyType }
        } else if (activeTab === 'shopping') {
          details = { quantity: data.value, itemType: data.type as ShoppingType }
        } else {
          return
        }

        await logActivity(activeTab as ActivityCategory, details)
        toast.success('Activity logged!')
      } catch {
        toast.error('Failed to log activity')
      }
    },
    [user, activeTab, logActivity]
  )

  const handleEcoAction = useCallback(
    async (actionId: ActionDetails['actionId'], name: string): Promise<void> => {
      if (!user) {
        toast.error('Must be logged in')
        return
      }

      try {
        await logActivity('action', { actionId, actionName: name })
        toast.success(`Awesome! Recorded: ${name}`)
      } catch {
        toast.error('Failed to log eco action')
      }
    },
    [user, logActivity]
  )

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Calculator</h1>
        <p className="text-gray-500 mt-1">Log your activities to track your footprint.</p>
      </header>

      <Card glass className="overflow-hidden">
        <div className="flex border-b border-gray-200 overflow-x-auto" role="tablist">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap
                ${
                  activeTab === tab.id
                    ? 'border-b-2 border-primary-500 text-primary-600 bg-primary-50/50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              <tab.icon className="w-5 h-5 mr-2" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6" role="tabpanel">
          {activeTab !== 'actions' ? (
            <StandardActivityForm activeTab={activeTab} onSubmit={handleFormSubmit} />
          ) : (
            <EcoActionsGrid onAction={handleEcoAction} />
          )}
        </div>
      </Card>
    </div>
  )
}

/**
 * Calculator component wrapped with an ErrorBoundary.
 */
export default function Calculator(): React.JSX.Element {
  return (
    <ErrorBoundary>
      <CalculatorContent />
    </ErrorBoundary>
  )
}
