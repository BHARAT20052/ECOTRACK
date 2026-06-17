import { type Request, type Response, type NextFunction } from 'express'
import { getApps, initializeApp, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import * as fs from 'fs'
import * as path from 'path'

// Track whether Firebase Admin is fully configured (has real credentials)
let firebaseConfigured = false

if (!getApps().length) {
  const keyPath = path.resolve(__dirname, '../../key.json')
  const keyExists = fs.existsSync(keyPath) && fs.statSync(keyPath).size > 10

  if (keyExists) {
    const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'))
    initializeApp({ credential: cert(serviceAccount) })
    firebaseConfigured = true
    console.log('Firebase Admin: using key.json credentials')
  } else if (process.env['FIREBASE_PRIVATE_KEY']) {
    initializeApp({
      credential: cert({
        projectId: process.env['FIREBASE_PROJECT_ID'],
        clientEmail: process.env['FIREBASE_CLIENT_EMAIL'],
        privateKey: process.env['FIREBASE_PRIVATE_KEY']?.replace(/\\n/g, '\n'),
      }),
    })
    firebaseConfigured = true
    console.log('Firebase Admin: using env var credentials')
  } else {
    // No credentials — local dev mode
    // We still call initializeApp() so firebase-admin doesn't crash on import
    try {
      initializeApp({ projectId: process.env['FIREBASE_PROJECT_ID'] ?? 'local-dev' })
    } catch {
      // already initialized
    }
    console.warn('⚠️  Firebase Admin: no credentials found — running in LOCAL DEV mode (token verification skipped)')
  }
}

export interface AuthRequest extends Request {
  uid?: string
}

const IS_LOCAL_DEV = !firebaseConfigured && process.env['NODE_ENV'] !== 'production' && process.env['NODE_ENV'] !== 'test'

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  // ── Local dev bypass ──────────────────────────────────────────────────────
  // When no Firebase credentials are configured, decode the UID from the
  // Bearer token itself (Firebase ID tokens are JWTs — we just parse the
  // payload without verifying the signature).
  if (IS_LOCAL_DEV) {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Missing authorization header' })
      return
    }
    try {
      // JWT payload is base64url in the second segment
      const payload = JSON.parse(
        Buffer.from(authHeader.split('.')[1], 'base64url').toString('utf8')
      )
      req.uid = payload.user_id ?? payload.sub ?? 'local-user'
      next()
    } catch {
      res.status(401).json({ error: 'Could not parse token (local dev mode)' })
    }
    return
  }

  // ── Production: full Firebase token verification ──────────────────────────
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing authorization header' })
    return
  }

  const token = authHeader.split('Bearer ')[1]
  try {
    const decoded = await getAuth().verifyIdToken(token)
    req.uid = decoded.uid
    next()
  } catch (error) {
    console.error('requireAuth token verification failed:', error)
    res.status(401).json({ error: 'Invalid or expired token' })
  }
}
