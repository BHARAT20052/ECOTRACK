import React, { useMemo, useEffect } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { calculateCo2 } from '@/utils/emissionCalculator'
import { EMISSION_FACTORS } from '@/constants/emissionFactors'
import type { TransportType, FoodType, EnergyType, ShoppingType } from '@/types'

export interface StandardActivityFormProps {
  readonly activeTab: 'transport' | 'food' | 'energy' | 'shopping'
  readonly onSubmit: (data: { value: number; type: string }) => Promise<void>
}

interface FormValues {
  value: number
  type: string
}

const baseSchema = z.object({
  value: z.number().positive('Must be greater than 0'),
  type: z.string().min(1, 'Please select an option'),
})

/**
 * Form component for entering details of transport, food, energy, or shopping activities.
 */
export const StandardActivityForm: React.FC<StandardActivityFormProps> = ({
  activeTab,
  onSubmit,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(baseSchema),
    defaultValues: { value: 0, type: '' },
  })

  // Watch fields for live CO2 calculation preview
  const formValues = watch()

  // Reset form state when tab changes
  useEffect(() => {
    reset({ value: 0, type: '' })
  }, [activeTab, reset])

  const previewCo2 = useMemo((): number => {
    if (!formValues.type || !formValues.value) return 0
    let co2 = 0
    switch (activeTab) {
      case 'transport':
        co2 = calculateCo2('transport', {
          distance: formValues.value,
          vehicleType: formValues.type as TransportType,
        })
        break
      case 'food':
        co2 = calculateCo2('food', {
          weight: formValues.value,
          foodType: formValues.type as FoodType,
        })
        break
      case 'energy':
        co2 = calculateCo2('energy', {
          value: formValues.value,
          energyType: formValues.type as EnergyType,
        })
        break
      case 'shopping':
        co2 = calculateCo2('shopping', {
          quantity: formValues.value,
          itemType: formValues.type as ShoppingType,
        })
        break
    }
    return co2
  }, [activeTab, formValues])

  const handleFormSubmit: SubmitHandler<FormValues> = async (data) => {
    await onSubmit(data)
    reset({ value: 0, type: '' })
  }

  const selectLabel = useMemo((): string => {
    switch (activeTab) {
      case 'transport':
        return 'Vehicle Type'
      case 'food':
        return 'Food Type'
      case 'energy':
        return 'Energy Source'
      case 'shopping':
        return 'Item Type'
    }
  }, [activeTab])

  const inputLabel = useMemo((): string => {
    switch (activeTab) {
      case 'transport':
        return 'Distance (km)'
      case 'food':
        return 'Weight (kg)'
      case 'energy':
        return 'Value (kWh/m³/kg)'
      case 'shopping':
        return 'Quantity'
    }
  }, [activeTab])

  const options = useMemo((): string[] => {
    return Object.keys(EMISSION_FACTORS[activeTab])
  }, [activeTab])

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {selectLabel}
          </label>
          <select
            {...register('type')}
            className="w-full px-4 py-2 bg-white/50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
            aria-label="Select Type"
          >
            <option value="">Select...</option>
            {options.map((key) => (
              <option key={key} value={key}>
                {key.replace('_', ' ')}
              </option>
            ))}
          </select>
          {errors.type?.message && (
            <p className="text-red-500 text-xs mt-1">{errors.type.message}</p>
          )}
        </div>

        <Input
          label={inputLabel}
          type="number"
          step="0.01"
          {...register('value', { valueAsNumber: true })}
          error={errors.value?.message}
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
  )
}
