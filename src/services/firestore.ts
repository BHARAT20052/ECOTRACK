import {
  collection, doc, addDoc, getDoc, setDoc, getDocs,
  query, where, orderBy, limit, Timestamp, updateDoc, arrayUnion
} from 'firebase/firestore'
import { db } from './firebase'
import type { Activity, UserProfile, Goal, BadgeId, ActivityCategory } from '@/types'
import { toDateString, getCurrentMonthId } from '@/utils/dateHelpers'

// ── User Profile ──────────────────────────────────────────────────────────────

export async function createUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
  await setDoc(doc(db, 'users', uid), {
    ...data,
    createdAt: Timestamp.now(),
    streakCurrent: 0,
    streakLongest: 0,
    lastActiveDate: '',
    badges: [],
  }, { merge: true })
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid))
  if (!snap.exists()) return null
  const data = snap.data()
  return { ...data, uid, createdAt: data['createdAt'].toDate() } as UserProfile
}

export async function updateStreak(uid: string): Promise<void> {
  const profile = await getUserProfile(uid)
  if (!profile) return

  const today = toDateString(new Date())
  const yesterday = toDateString(new Date(Date.now() - 86400000))

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

export async function awardBadge(uid: string, badge: BadgeId): Promise<void> {
  await updateDoc(doc(db, 'users', uid), { badges: arrayUnion(badge) })
}

// ── Activities ────────────────────────────────────────────────────────────────

export async function addActivity(uid: string, activity: Omit<Activity, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, 'users', uid, 'activities'), {
    ...activity,
    timestamp: Timestamp.fromDate(activity.timestamp),
  })
  await updateStreak(uid)
  return ref.id
}

export async function getActivities(uid: string, limitCount = 20): Promise<Activity[]> {
  const q = query(
    collection(db, 'users', uid, 'activities'),
    orderBy('timestamp', 'desc'),
    limit(limitCount)
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({
    id: d.id,
    ...d.data(),
    timestamp: d.data()['timestamp'].toDate(),
  })) as Activity[]
}

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
  return snap.docs.map(d => ({
    id: d.id,
    ...d.data(),
    timestamp: d.data()['timestamp'].toDate(),
  })) as Activity[]
}

export async function getCategoryBreakdown(uid: string): Promise<Record<ActivityCategory, number>> {
  const activities = await getActivitiesThisMonth(uid)
  const breakdown: Record<ActivityCategory, number> = {
    transport: 0, food: 0, energy: 0, shopping: 0, flight: 0, action: 0,
  }
  activities.forEach(a => {
    breakdown[a.category] = (breakdown[a.category] ?? 0) + a.co2
  })
  return breakdown
}

// ── Goals ─────────────────────────────────────────────────────────────────────

export async function setMonthlyGoal(uid: string, targetCo2: number): Promise<void> {
  const id = getCurrentMonthId()
  await setDoc(doc(db, 'users', uid, 'goals', id), {
    id,
    targetCo2,
    completed: false,
    createdAt: Timestamp.now(),
  })
}

export async function getCurrentGoal(uid: string): Promise<Goal | null> {
  const id = getCurrentMonthId()
  const snap = await getDoc(doc(db, 'users', uid, 'goals', id))
  if (!snap.exists()) return null
  const data = snap.data()
  return { ...data, createdAt: data['createdAt'].toDate() } as Goal
}
