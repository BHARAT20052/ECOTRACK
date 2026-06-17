export type TransportType =
  | 'car_petrol' | 'car_diesel' | 'bus' | 'train'
  | 'motorcycle' | 'bicycle' | 'walking' | 'flight_short' | 'flight_long'

export type FoodType =
  | 'beef' | 'lamb' | 'pork' | 'chicken' | 'fish'
  | 'dairy' | 'vegetables' | 'vegan_meal'

export type EnergyType =
  | 'electricity_india' | 'natural_gas' | 'lpg' | 'solar' | 'wind'

export type ShoppingType = 'clothing' | 'electronics' | 'furniture'

export type ActivityCategory =
  | 'transport' | 'food' | 'energy' | 'shopping' | 'flight' | 'action'

export interface TransportDetails {
  distance: number
  vehicleType: TransportType
}

export interface FoodDetails {
  weight: number
  foodType: FoodType
}

export interface EnergyDetails {
  value: number
  energyType: EnergyType
}

export interface ShoppingDetails {
  quantity: number
  itemType: ShoppingType
}

export interface ActionDetails {
  actionId: 'plant_tree' | 'public_transport' | 'vegan_day'
  actionName: string
}

export interface Activity {
  id: string
  category: ActivityCategory
  co2: number
  timestamp: Date
  details: TransportDetails | FoodDetails | EnergyDetails | ShoppingDetails | ActionDetails
}

export interface UserProfile {
  uid: string
  email: string
  displayName: string
  photoURL: string
  createdAt: Date
  streakCurrent: number
  streakLongest: number
  lastActiveDate: string
  badges: BadgeId[]
}

export type BadgeId = 'first_log' | 'streak_7' | 'streak_30' | 'reduced_50' | 'eco_champion'

export interface Badge {
  id: BadgeId
  label: string
  description: string
  icon: string
}

export interface Goal {
  id: string
  targetCo2: number
  completed: boolean
  createdAt: Date
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface FootprintSummary {
  totalCo2: number
  byCategory: Record<ActivityCategory, number>
  weeklyTrend: { date: string; co2: number }[]
  monthlyTotal: number
}
