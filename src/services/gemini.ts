import type { ChatMessage } from '@/types'

const BACKEND_URL = (
  import.meta.env.DEV ? '' : (import.meta.env.VITE_BACKEND_URL ?? '')
) as string

/**
 * Sends conversation message list and footprint context to the EcoBot backend proxy.
 * 
 * @param messages - Array of prior and current messages in the chat history
 * @param footprintContext - String representation of the user's monthly emissions breakdown
 * @param authToken - Firebase Auth ID token for verification
 * @returns A Promise resolving to the assistant's reply string
 */
export async function sendChatMessage(
  messages: readonly ChatMessage[],
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
      const err = (await response.json()) as { error?: string }
      errMsg = err.error ?? errMsg
    } catch {
      errMsg = `Server error ${response.status}: ${response.statusText || 'Server is offline or unreachable'}`
    }
    throw new Error(errMsg)
  }

  const data = (await response.json()) as { response: string }
  return data.response
}

/**
 * Requests weekly carbon footprint reduction tips from the EcoBot backend.
 * 
 * @param footprintContext - String representation of the user's monthly emissions breakdown
 * @param authToken - Firebase Auth ID token for verification
 * @returns A Promise resolving to an array of tip strings
 */
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

  if (!response.ok) {
    throw new Error('Failed to fetch tips')
  }
  const data = (await response.json()) as { tips: string[] }
  return data.tips
}
