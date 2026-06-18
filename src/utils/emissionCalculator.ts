import { EMISSION_FACTORS } from '@/constants/emissionFactors'
import type {
  TransportDetails,
  FoodDetails,
  EnergyDetails,
  ShoppingDetails,
  ActionDetails,
  ActivityCategory,
} from '@/types'

const EMISSIONS_ROUND_MULTIPLIER = 100 as const
const ZERO_EMISSIONS = 0 as const

/**
 * Calculates carbon emissions in kg for a transportation activity.
 * 
 * @param details - Transport details including distance and vehicle type
 * @returns Carbon footprint in kg rounded to two decimal places
 */
export function calculateTransportCo2(details: TransportDetails): number {
  const factor = EMISSION_FACTORS.transport[details.vehicleType]
  return Math.round(details.distance * factor * EMISSIONS_ROUND_MULTIPLIER) / EMISSIONS_ROUND_MULTIPLIER
}

/**
 * Calculates carbon footprint in kg for food consumed.
 * 
 * @param details - Food consumption details including weight and food category
 * @returns Carbon footprint in kg rounded to two decimal places
 */
export function calculateFoodCo2(details: FoodDetails): number {
  const factor = EMISSION_FACTORS.food[details.foodType]
  return Math.round(details.weight * factor * EMISSIONS_ROUND_MULTIPLIER) / EMISSIONS_ROUND_MULTIPLIER
}

/**
 * Calculates carbon emissions in kg for energy utility consumption.
 * 
 * @param details - Energy utility details including consumption value and energy type
 * @returns Carbon footprint in kg rounded to two decimal places
 */
export function calculateEnergyCo2(details: EnergyDetails): number {
  const factor = EMISSION_FACTORS.energy[details.energyType]
  return Math.round(details.value * factor * EMISSIONS_ROUND_MULTIPLIER) / EMISSIONS_ROUND_MULTIPLIER
}

/**
 * Calculates carbon footprint in kg for shopping items purchased.
 * 
 * @param details - Shopping details including quantity and item category
 * @returns Carbon footprint in kg rounded to two decimal places
 */
export function calculateShoppingCo2(details: ShoppingDetails): number {
  const factor = EMISSION_FACTORS.shopping[details.itemType]
  return Math.round(details.quantity * factor * EMISSIONS_ROUND_MULTIPLIER) / EMISSIONS_ROUND_MULTIPLIER
}

/**
 * Calculates carbon footprint reduction offset in kg for completed eco action.
 * 
 * @param details - Action details including action type
 * @returns Negative carbon offset value in kg
 */
export function calculateActionCo2(details: ActionDetails): number {
  return EMISSION_FACTORS.actions[details.actionId]
}

/**
 * Dispatches carbon footprint calculations based on the activity category.
 * 
 * @param category - The category of the activity
 * @param details - Detail payload corresponding to the category
 * @returns Estimated emissions value in kg (or offset value)
 */
export function calculateCo2(
  category: ActivityCategory,
  details: TransportDetails | FoodDetails | EnergyDetails | ShoppingDetails | ActionDetails
): number {
  switch (category) {
    case 'transport':
    case 'flight':
      return calculateTransportCo2(details as TransportDetails)
    case 'food':
      return calculateFoodCo2(details as FoodDetails)
    case 'energy':
      return calculateEnergyCo2(details as EnergyDetails)
    case 'shopping':
      return calculateShoppingCo2(details as ShoppingDetails)
    case 'action':
      return calculateActionCo2(details as ActionDetails)
    default:
      return ZERO_EMISSIONS
  }
}
