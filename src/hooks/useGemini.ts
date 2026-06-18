import { useState, useCallback, useRef } from 'react'
import type { User } from 'firebase/auth'

import type { ChatMessage } from '@/types'
import { sendChatMessage } from '@/services/gemini'

const CACHE_TTL = 300000 as const // 5 minutes in milliseconds

interface CacheValue {
  readonly response: string
  readonly time: number
}

interface UseGeminiResult {
  readonly messages: readonly ChatMessage[]
  readonly loading: boolean
  readonly error: string | null
  readonly sendMessage: (content: string, footprintContext: string) => Promise<void>
  readonly clearMessages: () => void
}

/**
 * Custom hook to interact with the EcoBot chat completions endpoint.
 * Features in-memory caching for repeated queries.
 * 
 * @param user - The authenticated Firebase user
 * @returns State and operations for managing EcoBot conversation history
 */
export function useGemini(user: User | null): UseGeminiResult {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const cacheRef = useRef<Map<string, CacheValue>>(new Map())

  const sendMessage = useCallback(async (content: string, footprintContext: string): Promise<void> => {
    if (!user) return

    const userMsg: ChatMessage = { role: 'user', content, timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)
    setError(null)

    // Check cache to prevent unnecessary network requests
    const cacheKey = `${content}:${footprintContext}`
    const cached = cacheRef.current.get(cacheKey)
    if (cached && Date.now() - cached.time < CACHE_TTL) {
      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: cached.response,
        timestamp: new Date(),
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

  const clearMessages = useCallback((): void => {
    setMessages([])
  }, [])

  return { messages, loading, error, sendMessage, clearMessages }
}
