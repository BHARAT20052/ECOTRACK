import { EMISSION_FACTORS } from '@/constants/emissionFactors'
import type {
  TransportDetails, FoodDetails, EnergyDetails,
  ShoppingDetails, ActionDetails, ActivityCategory
} from '@/types'

/** Calculate CO2 (kg) for transport activity */
export function calculateTransportCo2(details: TransportDetails): number {
  const factor = EMISSION_FACTORS.transport[details.vehicleType]
  return Math.round(details.distance * factor * 100) / 100
}

/** Calculate CO2 (kg) for food activity */
export function calculateFoodCo2(details: FoodDetails): number {
  const factor = EMISSION_FACTORS.food[details.foodType]
  return Math.round(details.weight * factor * 100) / 100
}

/** Calculate CO2 (kg) for energy activity */
export function calculateEnergyCo2(details: EnergyDetails): number {
  const factor = EMISSION_FACTORS.energy[details.energyType]
  return Math.round(details.value * factor * 100) / 100
}

/** Calculate CO2 (kg) for shopping activity */
export function calculateShoppingCo2(details: ShoppingDetails): number {
  const factor = EMISSION_FACTORS.shopping[details.itemType]
  return Math.round(details.quantity * factor * 100) / 100
}

/** Calculate CO2 reduction (negative kg) for eco action */
export function calculateActionCo2(details: ActionDetails): number {
  return EMISSION_FACTORS.actions[details.actionId]
}

/** Dispatcher: calculate CO2 by category */
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
      return 0;
  }
}
