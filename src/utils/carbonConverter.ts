import { TREE_CO2_PER_YEAR, GLOBAL_AVERAGES } from '@/constants/emissionFactors'

/** Convert kg CO2 to equivalent number of trees needed for 1 year */
export function co2ToTrees(co2Kg: number): number {
  return Math.round((co2Kg / TREE_CO2_PER_YEAR) * 100) / 100
}

/** Convert kg CO2 to km driven in average petrol car */
export function co2ToCarKm(co2Kg: number): number {
  return Math.round((co2Kg / 0.192) * 100) / 100
}

/** Convert kg CO2 to number of smartphone charges */
export function co2ToPhoneCharges(co2Kg: number): number {
  return Math.round((co2Kg / 0.005) * 100) / 100
}

/** Get percentage vs India monthly average */
export function vsIndiaAverage(co2Kg: number): number {
  return Math.round((co2Kg / GLOBAL_AVERAGES.indiaMonthly) * 100)
}

/** Get percentage vs world monthly average */
export function vsWorldAverage(co2Kg: number): number {
  return Math.round((co2Kg / GLOBAL_AVERAGES.worldMonthly) * 100)
}

/** Format CO2 value with unit (kg or tonnes) */
export function formatCo2(co2Kg: number): string {
  const absCo2 = Math.abs(co2Kg)
  const prefix = co2Kg < 0 ? '-' : ''
  if (absCo2 >= 1000) return `${prefix}${(absCo2 / 1000).toFixed(2)} tonnes CO₂`
  return `${prefix}${absCo2.toFixed(2)} kg CO₂`
}
