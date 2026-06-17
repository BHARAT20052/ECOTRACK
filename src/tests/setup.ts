import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Firebase config & initialization
vi.mock('@/services/firebase', () => ({
  auth: {
    currentUser: null,
    onAuthStateChanged: vi.fn((cb) => {
      cb(null)
      return () => {}
    }),
    getIdToken: vi.fn().mockResolvedValue('mock-token'),
  },
  db: {},
  initAnalytics: vi.fn().mockResolvedValue(null),
}))

vi.mock('@/services/firestore', () => ({
  addActivity: vi.fn().mockResolvedValue('mock-id'),
  getActivitiesThisMonth: vi.fn().mockResolvedValue([]),
  getCategoryBreakdown: vi.fn().mockResolvedValue({}),
  getUserProfile: vi.fn().mockResolvedValue(null),
  createUserProfile: vi.fn().mockResolvedValue(undefined),
  getCurrentGoal: vi.fn().mockResolvedValue(null),
  setMonthlyGoal: vi.fn().mockResolvedValue(undefined),
  updateStreak: vi.fn().mockResolvedValue(undefined),
  awardBadge: vi.fn().mockResolvedValue(undefined),
}))
