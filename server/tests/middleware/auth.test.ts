/// <reference types="jest" />
import type { Response, NextFunction } from 'express'
import type { AuthRequest } from '../../src/middleware/auth'

jest.mock('firebase-admin/app', () => ({
  getApps: jest.fn(() => []),
  initializeApp: jest.fn(),
  cert: jest.fn(),
}))

jest.mock('firebase-admin/auth', () => ({
  getAuth: jest.fn(() => ({
    verifyIdToken: jest.fn().mockResolvedValue({ uid: 'test-user-123' }),
  })),
}))

import { requireAuth } from '../../src/middleware/auth'

describe('requireAuth middleware', () => {
  let mockReq: Partial<AuthRequest>
  let mockRes: Partial<Response>
  let mockNext: NextFunction

  beforeEach(() => {
    mockReq = { headers: {} }
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    }
    mockNext = jest.fn()
  })

  it('should return 401 if no authorization header', async () => {
    await requireAuth(mockReq as AuthRequest, mockRes as Response, mockNext)
    expect(mockRes.status).toHaveBeenCalledWith(401)
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Missing authorization header' })
  })

  it('should return 401 if authorization header does not start with Bearer', async () => {
    mockReq.headers = { authorization: 'Basic token123' }
    await requireAuth(mockReq as AuthRequest, mockRes as Response, mockNext)
    expect(mockRes.status).toHaveBeenCalledWith(401)
  })

  it('should set uid and call next for valid token', async () => {
    mockReq.headers = { authorization: 'Bearer valid-token' }
    await requireAuth(mockReq as AuthRequest, mockRes as Response, mockNext)
    expect(mockReq.uid).toBe('test-user-123')
    expect(mockNext).toHaveBeenCalled()
  })
})
