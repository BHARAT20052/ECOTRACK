import { Router, type RequestHandler } from 'express'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { z } from 'zod'
import { requireAuth } from '../middleware/auth'
import { geminiRateLimit } from '../middleware/rateLimit'
import type { AuthRequest } from '../middleware/auth'

export const geminiRouter = Router()

const ECOBOT_SYSTEM = `You are EcoBot, a friendly carbon footprint reduction expert.
Analyze the user's actual footprint data provided in context and give specific, actionable advice.
Be encouraging, concise, and personalized. Use bullet points for lists.
Always reference the user's actual numbers when giving advice.
Context about the user's carbon footprint will be prefixed with "[USER DATA]:".`

const ChatSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string().max(2000),
    timestamp: z.any(),
  })).max(50),
  footprintContext: z.string().max(1000),
})

function getApiKey(): string {
  return process.env['GROQ_API_KEY'] || process.env['GEMINI_API_KEY'] || ''
}

function isGroq(): boolean {
  return getApiKey().startsWith('gsk_')
}

let genAI: GoogleGenerativeAI | null = null
function getGenAI(): GoogleGenerativeAI {
  if (!genAI) {
    const key = getApiKey()
    genAI = new GoogleGenerativeAI(key)
  }
  return genAI
}

async function callGroqChat(
  messages: { role: 'user' | 'assistant'; content: string }[],
  footprintContext: string
): Promise<string> {
  const key = getApiKey()
  if (!key) throw new Error('No Groq API key configured')

  const history = messages.slice(0, -1).map(m => ({
    role: m.role,
    content: m.content,
  }))

  const lastMessage = messages[messages.length - 1]
  const userMessage = `[USER DATA]: ${footprintContext}\n\nUser: ${lastMessage?.content ?? ''}`

  const payload = {
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: ECOBOT_SYSTEM },
      ...history,
      { role: 'user', content: userMessage }
    ],
    temperature: 0.7,
    max_tokens: 1024,
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`Groq API error (${response.status}): ${errText}`)
  }

  const data = await response.json() as any
  const content = data.choices?.[0]?.message?.content
  if (!content) {
    throw new Error('Groq returned an empty response')
  }

  return content
}

async function callGroqTips(footprintContext: string): Promise<string[]> {
  const key = getApiKey()
  if (!key) throw new Error('No Groq API key configured')

  const prompt = `[USER DATA]: ${footprintContext}\n\nGenerate exactly 3 personalized weekly eco tips as a JSON array of strings. Respond ONLY with valid JSON, no markdown. Example: ["tip1", "tip2", "tip3"]`

  const payload = {
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: ECOBOT_SYSTEM },
      { role: 'user', content: prompt }
    ],
    temperature: 0.7,
    response_format: { type: 'json_object' },
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`Groq API error (${response.status}): ${errText}`)
  }

  const data = await response.json() as any
  const content = data.choices?.[0]?.message?.content
  if (!content) {
    throw new Error('Groq returned an empty response')
  }

  return JSON.parse(content.trim()) as string[]
}

geminiRouter.post('/chat', requireAuth as RequestHandler, geminiRateLimit as RequestHandler, async (req: AuthRequest, res) => {
  const parsed = ChatSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid request', details: parsed.error.issues })
    return
  }

  const { messages, footprintContext } = parsed.data

  try {
    if (isGroq()) {
      const responseText = await callGroqChat(messages, footprintContext)
      res.json({ response: responseText })
    } else {
      const model = getGenAI().getGenerativeModel({ 
        model: 'gemini-2.0-flash',
        systemInstruction: ECOBOT_SYSTEM
      })

      const history = messages.slice(0, -1).map(m => ({
        role: m.role === 'assistant' ? 'model' as const : 'user' as const,
        parts: [{ text: m.content }],
      }))

      const lastMessage = messages[messages.length - 1]
      const userMessage = `[USER DATA]: ${footprintContext}\n\nUser: ${lastMessage?.content ?? ''}`

      const chat = model.startChat({
        history,
      })

      const result = await chat.sendMessage(userMessage)
      res.json({ response: result.response.text() })
    }
  } catch (e) {
    console.error(`${isGroq() ? 'Groq' : 'Gemini'} error:`, e)
    
    // Smart fallback responses based on user query
    const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() ?? ''
    let responseText = "I see you're working on reducing your footprint! Try turning off unused appliances, using public transport to save energy, and incorporating more plant-based meals."
    
    if (lastMessage.includes('hello') || lastMessage.includes('hi') || lastMessage.includes('hey')) {
      responseText = "Hello! I'm EcoBot, your sustainability assistant. How can I help you reduce your carbon footprint today?"
    } else if (lastMessage.includes('food') || lastMessage.includes('eat') || lastMessage.includes('diet') || lastMessage.includes('meat') || lastMessage.includes('vegan')) {
      responseText = "Reducing beef and dairy consumption has a huge impact. Switching to plant-based meals even once or twice a week can reduce your food-related emissions significantly!"
    } else if (lastMessage.includes('car') || lastMessage.includes('transport') || lastMessage.includes('travel') || lastMessage.includes('drive') || lastMessage.includes('flight')) {
      responseText = "To lower travel emissions, try walking or cycling for short trips, carpooling, or using public transit. For longer journeys, choose trains over flights whenever possible!"
    } else if (lastMessage.includes('energy') || lastMessage.includes('electricity') || lastMessage.includes('power') || lastMessage.includes('solar')) {
      responseText = "You can reduce home energy by switching to LED lighting, washing clothes in cold water, unplugging standby electronics, and upgrading to energy-efficient appliances."
    }
    
    const provider = isGroq() ? 'Groq' : 'Gemini'
    res.json({ 
      response: `${responseText}\n\n*(Note: Your ${provider} API key is currently returning a rate-limit/quota error, so I'm running in local fallback mode.)*` 
    })
  }
})

const TipsSchema = z.object({
  footprintContext: z.string().max(1000),
})

geminiRouter.post('/tips', requireAuth as RequestHandler, geminiRateLimit as RequestHandler, async (req: AuthRequest, res) => {
  const parsed = TipsSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid request' })
    return
  }

  try {
    if (isGroq()) {
      const tips = await callGroqTips(parsed.data.footprintContext)
      res.json({ tips })
    } else {
      const model = getGenAI().getGenerativeModel({ model: 'gemini-2.0-flash' })
      const prompt = `${ECOBOT_SYSTEM}\n\n[USER DATA]: ${parsed.data.footprintContext}\n\nGenerate exactly 3 personalized weekly eco tips as a JSON array of strings. Respond ONLY with valid JSON, no markdown. Example: ["tip1", "tip2", "tip3"]`

      const result = await model.generateContent(prompt)
      const text = result.response.text().trim()
      const tips = JSON.parse(text) as string[]
      res.json({ tips })
    }
  } catch (e) {
    console.error(`${isGroq() ? 'Groq' : 'Gemini'} tips error:`, e)
    const defaultTips = [
      "Switch to LED bulbs and turn off appliances at the socket to eliminate standby power draw.",
      "Swap at least two car trips a week for walking, cycling, or public transport.",
      "Incorporate a few meat-free days into your week to lower food emissions."
    ]
    res.json({ tips: defaultTips })
  }
})
