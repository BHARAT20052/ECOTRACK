import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-hot-toast'
import { Car, Utensils, Zap, ShoppingBag, Leaf } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useFootprint } from '@/hooks/useFootprint'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { calculateCo2 } from '@/utils/emissionCalculator'
import { EMISSION_FACTORS } from '@/constants/emissionFactors'
import type { TransportType, FoodType, EnergyType, ShoppingType } from '@/types'

const baseSchema = z.object({ value: z.number().positive('Must be greater than 0') })

const TABS = [
  { id: 'transport', label: 'Transport', icon: Car },
  { id: 'food', label: 'Food', icon: Utensils },
  { id: 'energy', label: 'Energy', icon: Zap },
  { id: 'shopping', label: 'Shopping', icon: ShoppingBag },
  { id: 'actions', label: 'Eco Actions', icon: Leaf },
] as const

/**
 * Carbon footprint calculator with category tabs.
 */
export default function Calculator() {
  const [activeTab, setActiveTab] = useState<typeof TABS[number]['id']>('transport')
  const { user } = useAuth()
  const { logActivity } = useFootprint(user?.uid || null)

  const { register, handleSubmit, formState: { errors, isSubmitting }, watch, reset } = useForm({
    resolver: zodResolver(baseSchema.extend({
      type: z.string().min(1, 'Please select an option'),
    })),
    defaultValues: { value: 0, type: '' }
  })

  const formValues = watch()
  const previewCo2 = React.useMemo(() => {
    if (!formValues.type || !formValues.value) return 0
    let co2 = 0
    switch (activeTab) {
      case 'transport': co2 = calculateCo2('transport', { distance: formValues.value, vehicleType: formValues.type as TransportType }); break;
      case 'food': co2 = calculateCo2('food', { weight: formValues.value, foodType: formValues.type as FoodType }); break;
      case 'energy': co2 = calculateCo2('energy', { value: formValues.value, energyType: formValues.type as EnergyType }); break;
      case 'shopping': co2 = calculateCo2('shopping', { quantity: formValues.value, itemType: formValues.type as ShoppingType }); break;
    }
    return co2
  }, [activeTab, formValues])

  const onSubmit = async (data: any) => {
    if (!user) return toast.error('Must be logged in')
    try {
      let details: any = {}
      if (activeTab === 'transport') details = { distance: data.value, vehicleType: data.type }
      if (activeTab === 'food') details = { weight: data.value, foodType: data.type }
      if (activeTab === 'energy') details = { value: data.value, energyType: data.type }
      if (activeTab === 'shopping') details = { quantity: data.value, itemType: data.type }
      
      await logActivity(activeTab as any, details)
      toast.success(`Activity logged!`)
      reset()
    } catch (e) {
      toast.error('Failed to log activity')
    }
  }

  const handleEcoAction = async (actionId: any, name: string) => {
    if (!user) return toast.error('Must be logged in')
    try {
      await logActivity('action', { actionId, actionName: name })
      toast.success(`Awesome! Recorded: ${name}`)
    } catch (e) {
      toast.error('Failed to log eco action')
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Calculator</h1>
        <p className="text-gray-500 mt-1">Log your activities to track your footprint.</p>
      </header>

      <Card glass className="overflow-hidden">
        <div className="flex border-b border-gray-200 overflow-x-auto" role="tablist">
          {TABS.map(tab => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => { setActiveTab(tab.id); reset() }}
              className={`flex items-center px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap
                ${activeTab === tab.id ? 'border-b-2 border-primary-500 text-primary-600 bg-primary-50/50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}
              `}
            >
              <tab.icon className="w-5 h-5 mr-2" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6" role="tabpanel">
          {activeTab !== 'actions' ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {activeTab === 'transport' ? 'Vehicle Type' : activeTab === 'food' ? 'Food Type' : activeTab === 'energy' ? 'Energy Source' : 'Item Type'}
                  </label>
                  <select
                    {...register('type')}
                    className="w-full px-4 py-2 bg-white/50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                    aria-label="Select Type"
                  >
                    <option value="">Select...</option>
                    {activeTab === 'transport' && Object.keys(EMISSION_FACTORS.transport).map(k => <option key={k} value={k}>{k.replace('_', ' ')}</option>)}
                    {activeTab === 'food' && Object.keys(EMISSION_FACTORS.food).map(k => <option key={k} value={k}>{k.replace('_', ' ')}</option>)}
                    {activeTab === 'energy' && Object.keys(EMISSION_FACTORS.energy).map(k => <option key={k} value={k}>{k.replace('_', ' ')}</option>)}
                    {activeTab === 'shopping' && Object.keys(EMISSION_FACTORS.shopping).map(k => <option key={k} value={k}>{k.replace('_', ' ')}</option>)}
                  </select>
                  {errors.type?.message && <p className="text-red-500 text-xs mt-1">{String(errors.type.message)}</p>}
                </div>
                
                <Input
                  label={activeTab === 'transport' ? 'Distance (km)' : activeTab === 'food' ? 'Weight (kg)' : activeTab === 'energy' ? 'Value (kWh/m³/kg)' : 'Quantity'}
                  type="number"
                  step="0.01"
                  {...register('value', { valueAsNumber: true })}
                  error={errors.value?.message as string}
                />
              </div>

              <div className="bg-primary-50 p-4 rounded-xl flex items-center justify-between border border-primary-100">
                <div>
                  <h3 className="text-sm font-medium text-primary-900">Estimated Emissions</h3>
                  <p className="text-xs text-primary-700">Based on standard factors</p>
                </div>
                <div className="text-2xl font-bold text-primary-700" aria-live="polite">
                  {previewCo2 > 0 ? `+${previewCo2.toFixed(2)}` : '0.00'} kg
                </div>
              </div>

              <Button type="submit" loading={isSubmitting} className="w-full md:w-auto">
                Log Activity
              </Button>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button onClick={() => handleEcoAction('plant_tree', 'Plant a Tree')} className="p-6 rounded-xl border border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-all text-center group focus-visible:outline-primary-500">
                <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">🌳</div>
                <h3 className="font-semibold text-gray-900">Plant a Tree</h3>
                <p className="text-sm text-primary-600 font-medium mt-1">-21.77 kg CO₂</p>
              </button>
              <button onClick={() => handleEcoAction('public_transport', 'Use Public Transport')} className="p-6 rounded-xl border border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-all text-center group focus-visible:outline-primary-500">
                <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">🚌</div>
                <h3 className="font-semibold text-gray-900">Public Transport</h3>
                <p className="text-sm text-primary-600 font-medium mt-1">-2.1 kg CO₂</p>
              </button>
              <button onClick={() => handleEcoAction('vegan_day', 'Vegan Day')} className="p-6 rounded-xl border border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-all text-center group focus-visible:outline-primary-500">
                <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">🥗</div>
                <h3 className="font-semibold text-gray-900">Vegan Day</h3>
                <p className="text-sm text-primary-600 font-medium mt-1">-3.0 kg CO₂</p>
              </button>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

