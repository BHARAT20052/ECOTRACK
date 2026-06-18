import {
  collection,
  doc,
  addDoc,
  getDoc,
  setDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  updateDoc,
  arrayUnion,
  type DocumentData,
} from 'firebase/firestore'

import { db } from './firebase'
import type { Activity, UserProfile, Goal, BadgeId, ActivityCategory } from '@/types'
import { toDateString, getCurrentMonthId } from '@/utils/dateHelpers'

const ONE_DAY_MS = 86400000 as const
const DEFAULT_LIMIT = 20 as const

// ── User Profile ──────────────────────────────────────────────────────────────

/**
 * Creates a new user profile document in Firestore.
 * 
 * @param uid - The unique identifier of the user
 * @param data - The partial user profile data to set
 */
export async function createUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
  await setDoc(
    doc(db, 'users', uid),
    {
      ...data,
      createdAt: Timestamp.now(),
      streakCurrent: 0,
      streakLongest: 0,
      lastActiveDate: '',
      badges: [],
    },
    { merge: true }
  )
}

/**
 * Fetches the user profile details from Firestore.
 * 
 * @param uid - The unique identifier of the user
 * @returns A Promise resolving to the UserProfile object or null if it doesn't exist
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid))
  if (!snap.exists()) return null
  const rawData = snap.data() as DocumentData
  return {
    uid,
    email: rawData['email'] as string || '',
    displayName: rawData['displayName'] as string || '',
    photoURL: rawData['photoURL'] as string || '',
    createdAt: (rawData['createdAt'] as Timestamp).toDate(),
    streakCurrent: rawData['streakCurrent'] as number || 0,
    streakLongest: rawData['streakLongest'] as number || 0,
    lastActiveDate: rawData['lastActiveDate'] as string || '',
    badges: (rawData['badges'] as BadgeId[]) || [],
  }
}

/**
 * Updates the user's daily activity logging streak.
 * 
 * @param uid - The unique identifier of the user
 */
export async function updateStreak(uid: string): Promise<void> {
  const profile = await getUserProfile(uid)
  if (!profile) return

  const today = toDateString(new Date())
  const yesterday = toDateString(new Date(Date.now() - ONE_DAY_MS))

  let streak = profile.streakCurrent
  if (profile.lastActiveDate === yesterday) {
    streak += 1
  } else if (profile.lastActiveDate !== today) {
    streak = 1
  }

  await updateDoc(doc(db, 'users', uid), {
    streakCurrent: streak,
    streakLongest: Math.max(streak, profile.streakLongest),
    lastActiveDate: today,
  })
}

/**
 * Adds an achievement badge to the user's profile.
 * 
 * @param uid - The unique identifier of the user
 * @param badge - The ID of the badge to award
 */
export async function awardBadge(uid: string, badge: BadgeId): Promise<void> {
  await updateDoc(doc(db, 'users', uid), { badges: arrayUnion(badge) })
}

// ── Activities ────────────────────────────────────────────────────────────────

/**
 * Logs a new carbon footprint activity for the user.
 * 
 * @param uid - The unique identifier of the user
 * @param activity - The activity details to log
 * @returns A Promise resolving to the newly created activity document ID
 */
export async function addActivity(uid: string, activity: Omit<Activity, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, 'users', uid, 'activities'), {
    category: activity.category,
    co2: activity.co2,
    timestamp: Timestamp.fromDate(activity.timestamp),
    details: activity.details,
  })
  await updateStreak(uid)
  return ref.id
}

/**
 * Fetches the most recent activities logged by the user.
 * 
 * @param uid - The unique identifier of the user
 * @param limitCount - The maximum number of activities to return
 * @returns A Promise resolving to a list of logged Activities
 */
export async function getActivities(uid: string, limitCount = DEFAULT_LIMIT): Promise<Activity[]> {
  const q = query(
    collection(db, 'users', uid, 'activities'),
    orderBy('timestamp', 'desc'),
    limit(limitCount)
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => {
    const rawData = d.data() as DocumentData
    return {
      id: d.id,
      category: rawData['category'] as ActivityCategory,
      co2: rawData['co2'] as number,
      timestamp: (rawData['timestamp'] as Timestamp).toDate(),
      details: rawData['details'] as Activity['details'],
    }
  })
}

/**
 * Fetches all user activities logged within the current calendar month.
 * 
 * @param uid - The unique identifier of the user
 * @returns A Promise resolving to a list of Activities logged this month
 */
export async function getActivitiesThisMonth(uid: string): Promise<Activity[]> {
  const start = new Date()
  start.setDate(1)
  start.setHours(0, 0, 0, 0)

  const q = query(
    collection(db, 'users', uid, 'activities'),
    where('timestamp', '>=', Timestamp.fromDate(start)),
    orderBy('timestamp', 'desc')
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => {
    const rawData = d.data() as DocumentData
    return {
      id: d.id,
      category: rawData['category'] as ActivityCategory,
      co2: rawData['co2'] as number,
      timestamp: (rawData['timestamp'] as Timestamp).toDate(),
      details: rawData['details'] as Activity['details'],
    }
  })
}

/**
 * Summarizes total emissions per activity category for the current month.
 * 
 * @param uid - The unique identifier of the user
 * @returns A Promise resolving to a category-to-co2 mapping
 */
export async function getCategoryBreakdown(uid: string): Promise<Record<ActivityCategory, number>> {
  const activities = await getActivitiesThisMonth(uid)
  const breakdown: Record<ActivityCategory, number> = {
    transport: 0,
    food: 0,
    energy: 0,
    shopping: 0,
    flight: 0,
    action: 0,
  }
  activities.forEach((a) => {
    breakdown[a.category] = (breakdown[a.category] ?? 0) + a.co2
  })
  return breakdown
}

// ── Goals ─────────────────────────────────────────────────────────────────────

/**
 * Creates or updates the carbon reduction goal for the current month.
 * 
 * @param uid - The unique identifier of the user
 * @param targetCo2 - The target monthly carbon emissions limit in kg CO₂
 */
export async function setMonthlyGoal(uid: string, targetCo2: number): Promise<void> {
  const id = getCurrentMonthId()
  await setDoc(doc(db, 'users', uid, 'goals', id), {
    id,
    targetCo2,
    completed: false,
    createdAt: Timestamp.now(),
  })
}

/**
 * Fetches the carbon reduction goal configured for the current month.
 * 
 * @param uid - The unique identifier of the user
 * @returns A Promise resolving to the monthly Goal or null if not set
 */
export async function getCurrentGoal(uid: string): Promise<Goal | null> {
  const id = getCurrentMonthId()
  const snap = await getDoc(doc(db, 'users', uid, 'goals', id))
  if (!snap.exists()) return null
  const rawData = snap.data() as DocumentData
  return {
    id,
    targetCo2: rawData['targetCo2'] as number || 0,
    completed: rawData['completed'] as boolean || false,
    createdAt: (rawData['createdAt'] as Timestamp).toDate(),
  }
}
