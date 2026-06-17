/// <reference types="jest" />
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
    runTransaction: jest.fn(async (cb: (transaction: { get: unknown; set: unknown }) => unknown) => {
      const mockGet = jest.fn().mockResolvedValue({ exists: true, data: () => ({ requests: [] }) })
      const mockSet = jest.fn()
      return cb({ get: mockGet, set: mockSet })
    }),
  })),
}))

jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn(() => ({
      startChat: jest.fn(() => ({
        sendMessage: jest.fn().mockResolvedValue({
          response: { text: () => 'Great job! Here are some tips to reduce your footprint.' },
        }),
      })),
      generateContent: jest.fn().mockResolvedValue({
        response: { text: () => '["Tip 1", "Tip 2", "Tip 3"]' },
      }),
    })),
  })),
}))

import request from 'supertest'
import { app } from '../../src/index'

describe('POST /api/gemini/chat', () => {
  it('should return 401 without auth', async () => {
    const res = await request(app).post('/api/gemini/chat').send({})
    expect(res.status).toBe(401)
  })

  it('should return 400 for invalid body', async () => {
    const res = await request(app)
      .post('/api/gemini/chat')
      .set('Authorization', 'Bearer valid-token')
      .send({})
    expect(res.status).toBe(400)
  })

  it('should return AI response for valid request', async () => {
    const res = await request(app)
      .post('/api/gemini/chat')
      .set('Authorization', 'Bearer valid-token')
      .send({
        messages: [{ role: 'user', content: 'How can I reduce my footprint?', timestamp: new Date().toISOString() }],
        footprintContext: 'Total: 150kg CO2 this month. Transport: 80kg, Food: 70kg.',
      })
    expect(res.status).toBe(200)
    expect(res.body.response).toBeDefined()
  })
})

describe('POST /api/gemini/tips', () => {
  it('should return tips for valid request', async () => {
    const res = await request(app)
      .post('/api/gemini/tips')
      .set('Authorization', 'Bearer valid-token')
      .send({ footprintContext: 'Total: 150kg CO2. Transport: 80kg.' })
    expect(res.status).toBe(200)
    expect(res.body.tips).toHaveLength(3)
  })
})
