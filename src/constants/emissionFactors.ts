/** All emission factors in kg CO2 per unit */
export const EMISSION_FACTORS = {
  transport: {
    car_petrol: 0.192,    // per km
    car_diesel: 0.171,    // per km
    bus: 0.089,           // per km
    train: 0.041,         // per km
    flight_short: 0.255,  // per km per passenger
    flight_long: 0.195,   // per km per passenger
    bicycle: 0,
    walking: 0,
    motorcycle: 0.114,    // per km
  },
  food: {
    beef: 27.0,           // per kg
    lamb: 39.2,
    pork: 12.1,
    chicken: 6.9,
    fish: 6.1,
    dairy: 3.2,
    vegetables: 2.0,
    vegan_meal: 1.5,
  },
  energy: {
    electricity_india: 0.82, // per kWh
    natural_gas: 2.04,       // per m³
    lpg: 1.51,               // per kg
    solar: 0.041,            // per kWh
    wind: 0.011,             // per kWh
  },
  shopping: {
    clothing: 10.0,          // per item
    electronics: 70.0,
    furniture: 30.0,
  },
  actions: {
    plant_tree: -21.77,      // kg CO2 absorbed per year / 12 months
    public_transport: -2.1,  // avg daily saving vs car
    vegan_day: -3.0,         // avg daily saving vs meat diet
  },
} as const

export const GLOBAL_AVERAGES = {
  world: 4000,   // kg CO2 per year
  india: 1900,   // kg CO2 per year
  worldMonthly: 333,
  indiaMonthly: 158,
} as const

export const TREE_CO2_PER_YEAR = 21.77 // kg absorbed per tree per year

export const BADGES = {
  first_log: { id: 'first_log', label: 'First Step', description: 'Logged first activity', icon: '🌱' },
  streak_7: { id: 'streak_7', label: '7-Day Streak', description: '7 consecutive days logged', icon: '🔥' },
  streak_30: { id: 'streak_30', label: 'Month Warrior', description: '30 consecutive days logged', icon: '⚡' },
  reduced_50: { id: 'reduced_50', label: 'Half the Impact', description: 'Reduced footprint by 50%', icon: '🌍' },
  eco_champion: { id: 'eco_champion', label: 'Eco Champion', description: 'Below India average for 3 months', icon: '🏆' },
} as const
