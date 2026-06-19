import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { geminiRouter } from './routes/gemini'
import { footprintRouter } from './routes/footprint'

const app = express()
const PORT = process.env['PORT'] ?? 3001

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'", 'https://generativelanguage.googleapis.com'],
    },
  },
}))

const allowedOrigins = [
  'http://localhost:5173',
  process.env['ALLOWED_ORIGIN_PROD'] ?? 'https://carbon-footprint-platfor-5f521.web.app',
  process.env['ALLOWED_ORIGIN_ALT'] ?? 'https://carbon-footprint-platfor-5f521.firebaseapp.com',
].filter(Boolean)

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin === process.env['ALLOWED_ORIGIN']) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
}))

app.use(express.json({ limit: '10kb' }))

app.use('/api/gemini', geminiRouter)
app.use('/api/footprint', footprintRouter)

app.get('/', (_req, res) => res.json({ name: 'EcoBot Backend API', status: 'running', endpoints: ['/health', '/api/gemini/chat', '/api/gemini/tips', '/api/footprint/validate'] }))
app.get('/health', (_req, res) => res.json({ status: 'ok' }))

if (process.env['NODE_ENV'] !== 'test') {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
}

export { app }
