import { useState, useCallback, useRef } from 'react'
import { sendChatMessage } from '@/services/gemini'
import type { ChatMessage } from '@/types'
import type { User } from 'firebase/auth'

const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export function useGemini(user: User | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const cacheRef = useRef<Map<string, { response: string; time: number }>>(new Map())

  const sendMessage = useCallback(async (content: string, footprintContext: string) => {
    if (!user) return

    const userMsg: ChatMessage = { role: 'user', content, timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)
    setError(null)

    // Check cache
    const cacheKey = `${content}:${footprintContext}`
    const cached = cacheRef.current.get(cacheKey)
    if (cached && Date.now() - cached.time < CACHE_TTL) {
      const assistantMsg: ChatMessage = {
        role: 'assistant', content: cached.response, timestamp: new Date()
      }
      setMessages(prev => [...prev, assistantMsg])
      setLoading(false)
      return
    }

    try {
      const token = await user.getIdToken()
      // Send the current list of messages along with the new user message
      const response = await sendChatMessage([...messages, userMsg], footprintContext, token)
      cacheRef.current.set(cacheKey, { response, time: Date.now() })
      setMessages(prev => [...prev, { role: 'assistant', content: response, timestamp: new Date() }])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to get response')
    } finally {
      setLoading(false)
    }
  }, [user, messages])

  const clearMessages = useCallback(() => setMessages([]), [])

  return { messages, loading, error, sendMessage, clearMessages }
}
