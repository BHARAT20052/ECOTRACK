import { initAnalytics } from './firebase'
import { logEvent as firebaseLogEvent } from 'firebase/analytics'

/** Log a custom event to Google Analytics */
export async function logAnalyticsEvent(eventName: string, params?: Record<string, unknown>) {
  try {
    const analytics = await initAnalytics()
    if (analytics) {
      firebaseLogEvent(analytics, eventName, params)
    }
  } catch (e) {
    console.warn('Analytics failed to log event:', e)
  }
}
