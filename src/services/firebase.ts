import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
} as const

// Prevent duplicate initialization in HMR (Hot Module Replacement) environment
export const firebaseApp: FirebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

export const auth: Auth = getAuth(firebaseApp)
export const db: Firestore = getFirestore(firebaseApp)

/**
 * Initializes and returns Firebase Analytics if supported in the current environment.
 * 
 * @returns A Promise resolving to the Analytics instance, or null if unsupported
 */
export const initAnalytics = async (): Promise<Analytics | null> => {
  if (typeof window !== 'undefined' && (await isSupported())) {
    return getAnalytics(firebaseApp)
  }
  return null
}
