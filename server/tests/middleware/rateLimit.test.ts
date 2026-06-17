/// <reference types="jest" />
import type { Response, NextFunction } from 'express'
import type { AuthRequest } from '../../src/middleware/auth'

const mockGet = jest.fn()
const mockSet = jest.fn()
const mockRunTransaction = jest.fn((cb: (transaction: { get: typeof mockGet; set: typeof mockSet }) => unknown) => cb({ get: mockGet, set: mockSet }))

jest.mock('firebase-admin/app', () => ({
  getApps: jest.fn(() => [{}]),
  initializeApp: jest.fn(),
  cert: jest.fn(),
}))

jest.mock('firebase-admin/auth', () => ({
  getAuth: jest.fn(() => ({
    verifyIdToken: jest.fn().mockResolvedValue({ uid: 'test-user' }),
  })),
}))

jest.mock('firebase-admin/firestore', () => ({
  getFirestore: jest.fn(() => ({
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({ id: 'test-doc' })),
    })),
    runTransaction: mockRunTransaction,
  })),
}))

import { geminiRateLimit } from '../../src/middleware/rateLimit'

describe('geminiRateLimit middleware', () => {
  let mockReq: Partial<AuthRequest>
  let mockRes: Partial<Response>
  let mockNext: NextFunction

  beforeEach(() => {
    jest.clearAllMocks()
    mockReq = { uid: 'test-user' }
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    }
    mockNext = jest.fn()
  })

  it('should return 401 if no uid', async () => {
    mockReq.uid = undefined
    await geminiRateLimit(mockReq as AuthRequest, mockRes as Response, mockNext)
    expect(mockRes.status).toHaveBeenCalledWith(401)
  })

  it('should call next when under rate limit', async () => {
    mockGet.mockResolvedValue({ exists: true, data: () => ({ requests: [] }) })
    await geminiRateLimit(mockReq as AuthRequest, mockRes as Response, mockNext)
    expect(mockNext).toHaveBeenCalled()
  })

  it('should return 429 when rate limit exceeded', async () => {
    const now = Date.now()
    const requests = Array(10).fill(now)
    mockGet.mockResolvedValue({ exists: true, data: () => ({ requests }) })
    mockRunTransaction.mockImplementation(async (cb: (transaction: { get: typeof mockGet; set: typeof mockSet }) => unknown) => {
      const result = cb({ get: mockGet, set: mockSet })
      return result
    })
    await geminiRateLimit(mockReq as AuthRequest, mockRes as Response, mockNext)
    expect(mockRes.status).toHaveBeenCalledWith(429)
  })
})
