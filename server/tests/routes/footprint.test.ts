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

import request from 'supertest'
import { app } from '../../src/index'

describe('POST /api/footprint/validate', () => {
  it('should return 401 without auth', async () => {
    const res = await request(app).post('/api/footprint/validate').send({})
    expect(res.status).toBe(401)
  })

  it('should validate correct activity data', async () => {
    const res = await request(app)
      .post('/api/footprint/validate')
      .set('Authorization', 'Bearer valid-token')
      .send({ category: 'transport', details: { distance: 10, vehicleType: 'car_petrol' } })
    expect(res.status).toBe(200)
    expect(res.body.valid).toBe(true)
  })

  it('should reject invalid category', async () => {
    const res = await request(app)
      .post('/api/footprint/validate')
      .set('Authorization', 'Bearer valid-token')
      .send({ category: 'invalid', details: {} })
    expect(res.status).toBe(400)
  })
})
