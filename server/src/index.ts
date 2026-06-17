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

app.use(cors({
  origin: process.env['ALLOWED_ORIGIN'] ?? 'http://localhost:5173',
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
