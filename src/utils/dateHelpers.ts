const PAD_LENGTH = 2 as const
const ONE_OFFSET = 1 as const

/**
 * Returns a date formatted as a YYYY-MM-DD string.
 * 
 * @param date - The Date object to format
 * @returns Date string in YYYY-MM-DD format
 */
export function toDateString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + ONE_OFFSET).padStart(PAD_LENGTH, '0')
  const day = String(date.getDate()).padStart(PAD_LENGTH, '0')
  return `${year}-${month}-${day}`
}

/**
 * Returns the identifier representing the current calendar month (e.g., "2026-06").
 * 
 * @returns Month identifier string
 */
export function getCurrentMonthId(): string {
  const now = new Date()
  const monthStr = String(now.getMonth() + ONE_OFFSET).padStart(PAD_LENGTH, '0')
  return `${now.getFullYear()}-${monthStr}`
}

/**
 * Normalizes a Date to the start of its local day (00:00:00.000).
 * 
 * @param date - The Date object to normalize
 * @returns A new Date object set to midnight of that day
 */
export function startOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

/**
 * Returns a sequence of the last N calendar days as formatted date strings.
 * 
 * @param n - The number of past days to generate
 * @returns Array of date strings in YYYY-MM-DD format sorted oldest to newest
 */
export function getLastNDays(n: number): string[] {
  const ONE_DAY_OFFSET = 1 as const
  return Array.from({ length: n }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (n - ONE_DAY_OFFSET - i))
    return toDateString(d)
  })
}
