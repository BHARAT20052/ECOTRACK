import { logEvent as firebaseLogEvent } from 'firebase/analytics'

import { initAnalytics } from './firebase'

/**
 * Logs a custom event to Google Analytics.
 * Handles failures gracefully without breaking application flow.
 * 
 * @param eventName - The name of the event to log
 * @param params - Optional additional parameters to attach to the event
 * @returns A Promise resolving when the event has been logged
 */
export async function logAnalyticsEvent(
  eventName: string,
  params?: Record<string, unknown>
): Promise<void> {
  try {
    const analytics = await initAnalytics()
    if (analytics) {
      firebaseLogEvent(analytics, eventName, params)
    }
  } catch (e) {
    console.warn('Analytics failed to log event:', e)
  }
}
