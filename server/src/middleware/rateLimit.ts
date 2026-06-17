import { type Response, type NextFunction } from 'express'
import type { AuthRequest } from './auth'
import { getFirestore, Transaction } from 'firebase-admin/firestore'
import path from 'path'
import fs from 'fs'

const MAX_REQUESTS = 10
const WINDOW_MS = 60 * 1000

// ── In-memory rate limiter (local dev fallback) ───────────────────────────────
const memoryStore = new Map<string, number[]>()

function inMemoryRateLimit(uid: string): boolean {
  const now = Date.now()
  const windowStart = now - WINDOW_MS
  const requests = (memoryStore.get(uid) ?? []).filter(t => t > windowStart)
  
  if (requests.length >= MAX_REQUESTS) {
    memoryStore.set(uid, requests) // Prune expired timestamps even when blocked
    return false
  }
  
  requests.push(now)
  memoryStore.set(uid, requests)
  return true
}

// ── Firestore rate limiter (production) ───────────────────────────────────────
async function firestoreRateLimit(uid: string): Promise<boolean> {
  const db = getFirestore()
  const ref = db.collection('rate_limits').doc(uid)

  return db.runTransaction(async (tx: Transaction) => {
    const doc = await tx.get(ref)
    const now = Date.now()
    const windowStart = now - WINDOW_MS
    let requests: number[] = doc.exists ? (doc.data()?.['requests'] as number[] ?? []) : []
    requests = requests.filter((t: number) => t > windowStart)
    
    if (requests.length >= MAX_REQUESTS) {
      tx.set(ref, { userId: uid, requests }, { merge: true }) // Prune expired timestamps in Firestore even when blocked
      return false
    }
    
    requests.push(now)
    tx.set(ref, { userId: uid, requests }, { merge: true })
    return true
  })
}

const IS_LOCAL_DEV = process.env['NODE_ENV'] !== 'production' &&
  process.env['NODE_ENV'] !== 'test' &&
  !process.env['FIREBASE_PRIVATE_KEY'] &&
  (() => {
    try {
      const keyPath = path.resolve(__dirname, '../../key.json')
      return !fs.existsSync(keyPath) || fs.statSync(keyPath).size <= 10
    } catch {
      return true
    }
  })()

export async function geminiRateLimit(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  const uid = req.uid
  if (!uid) { res.status(401).json({ error: 'Unauthorized' }); return }

  try {
    const allowed = IS_LOCAL_DEV
      ? inMemoryRateLimit(uid)
      : await firestoreRateLimit(uid)

    if (!allowed) {
      res.status(429).json({ error: 'Rate limit exceeded. Max 10 requests per minute.' })
      return
    }
    next()
  } catch (e) {
    console.error('Rate limit error, falling back to allow:', e)
    // On rate limit error, allow the request rather than blocking the user
    next()
  }
}

