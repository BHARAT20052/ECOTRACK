import { Router, type RequestHandler } from 'express'
import { z } from 'zod'
import { requireAuth } from '../middleware/auth'
import type { AuthRequest } from '../middleware/auth'

export const footprintRouter = Router()

const ActivitySchema = z.object({
  category: z.enum(['transport', 'food', 'energy', 'shopping', 'flight', 'action']),
  details: z.record(z.string(), z.unknown()),
})

footprintRouter.post('/validate', requireAuth as RequestHandler, async (req: AuthRequest, res) => {
  const parsed = ActivitySchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid activity data', details: parsed.error.issues })
    return
  }
  res.json({ valid: true, data: parsed.data })
})
