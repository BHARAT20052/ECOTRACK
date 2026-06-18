import { TREE_CO2_PER_YEAR, GLOBAL_AVERAGES } from '@/constants/emissionFactors'

const PETROL_CAR_EMISSION_FACTOR = 0.192 as const // per km
const PHONE_CHARGE_EMISSION_FACTOR = 0.005 as const // per charge
const ROUND_MULTIPLIER = 100 as const
const KG_IN_TONNE = 1000 as const

/**
 * Converts kg CO2 to the equivalent number of trees needed to absorb it in one year.
 * 
 * @param co2Kg - The carbon emissions in kilograms
 * @returns Equivalent number of trees rounded to two decimal places
 */
export function co2ToTrees(co2Kg: number): number {
  return Math.round((co2Kg / TREE_CO2_PER_YEAR) * ROUND_MULTIPLIER) / ROUND_MULTIPLIER
}

/**
 * Converts kg CO2 to equivalent kilometers driven in an average petrol car.
 * 
 * @param co2Kg - The carbon emissions in kilograms
 * @returns Equivalent distance in kilometers rounded to two decimal places
 */
export function co2ToCarKm(co2Kg: number): number {
  return Math.round((co2Kg / PETROL_CAR_EMISSION_FACTOR) * ROUND_MULTIPLIER) / ROUND_MULTIPLIER
}

/**
 * Converts kg CO2 to equivalent number of smartphone charges.
 * 
 * @param co2Kg - The carbon emissions in kilograms
 * @returns Equivalent number of charges rounded to two decimal places
 */
export function co2ToPhoneCharges(co2Kg: number): number {
  return Math.round((co2Kg / PHONE_CHARGE_EMISSION_FACTOR) * ROUND_MULTIPLIER) / ROUND_MULTIPLIER
}

/**
 * Calculates percentage difference versus India's monthly average emissions.
 * 
 * @param co2Kg - The carbon emissions in kilograms
 * @returns Percentage difference
 */
export function vsIndiaAverage(co2Kg: number): number {
  return Math.round((co2Kg / GLOBAL_AVERAGES.indiaMonthly) * ROUND_MULTIPLIER)
}

/**
 * Calculates percentage difference versus the global monthly average emissions.
 * 
 * @param co2Kg - The carbon emissions in kilograms
 * @returns Percentage difference
 */
export function vsWorldAverage(co2Kg: number): number {
  return Math.round((co2Kg / GLOBAL_AVERAGES.worldMonthly) * ROUND_MULTIPLIER)
}

/**
 * Formats a CO2 value with the appropriate unit (kg or tonnes).
 * 
 * @param co2Kg - The carbon emissions in kilograms
 * @returns Formatted string with unit
 */
export function formatCo2(co2Kg: number): string {
  const absCo2 = Math.abs(co2Kg)
  const prefix = co2Kg < 0 ? '-' : ''
  if (absCo2 >= KG_IN_TONNE) {
    return `${prefix}${(absCo2 / KG_IN_TONNE).toFixed(2)} tonnes CO₂`
  }
  return `${prefix}${absCo2.toFixed(2)} kg CO₂`
}
