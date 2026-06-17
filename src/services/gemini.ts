import type { ChatMessage } from '@/types'

const BACKEND_URL = import.meta.env.DEV ? '' : (import.meta.env.VITE_BACKEND_URL ?? '')

/** Send chat message to EcoBot via backend proxy */
export async function sendChatMessage(
  messages: ChatMessage[],
  footprintContext: string,
  authToken: string
): Promise<string> {
  const response = await fetch(`${BACKEND_URL}/api/gemini/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({ messages, footprintContext }),
  })

  if (!response.ok) {
    let errMsg = 'Failed to get response'
    try {
      const err = await response.json()
      errMsg = (err as { error?: string }).error ?? errMsg
    } catch {
      errMsg = `Server error ${response.status}: ${response.statusText || 'Server is offline or unreachable'}`
    }
    throw new Error(errMsg)
  }

  const data = (await response.json()) as { response: string }
  return data.response
}

/** Get weekly tips from EcoBot */
export async function getWeeklyTips(
  footprintContext: string,
  authToken: string
): Promise<string[]> {
  const response = await fetch(`${BACKEND_URL}/api/gemini/tips`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({ footprintContext }),
  })

  if (!response.ok) throw new Error('Failed to fetch tips')
  const data = (await response.json()) as { tips: string[] }
  return data.tips
}
