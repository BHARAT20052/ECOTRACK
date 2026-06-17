import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User as UserIcon, Trash2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useFootprint } from '@/hooks/useFootprint'
import { useGemini } from '@/hooks/useGemini'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

/**
 * AI Assistant chat interface using Gemini.
 */
export default function Assistant() {
  const { user } = useAuth()
  const { summary } = useFootprint(user?.uid || null)
  const { messages, loading, error, sendMessage, clearMessages } = useGemini(user)
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const context = summary
      ? `User CO2 footprint: ${summary.totalCo2.toFixed(2)} kg this month. Top categories: ${
          Object.entries(summary.byCategory)
            .filter(([, v]) => v > 0)
            .sort((a, b) => b[1] - a[1])
            .map(([k]) => k)
            .join(', ') || 'none logged yet'
        }`
      : 'User has not logged any carbon footprint data yet.'

    const msg = input
    setInput('')
    await sendMessage(msg, context)
  }

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      <header className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">EcoBot Assistant</h1>
          <p className="text-gray-500 mt-1">Get personalized advice on reducing your footprint.</p>
        </div>
        <Button variant="secondary" size="sm" onClick={clearMessages} className="text-gray-500">
          <Trash2 className="w-4 h-4 mr-2" />
          Clear Chat
        </Button>
      </header>

      <Card glass className="flex-1 flex flex-col overflow-hidden">
        <div 
          className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar" 
          aria-live="polite"
        >
          {messages.length === 0 && (
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5 text-primary-600" />
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm max-w-[80%]">
                <p className="text-gray-800">
                  Hi {user?.displayName || 'there'}! I'm EcoBot. I can analyze your carbon footprint and give you personalized tips to reduce it. What would you like to know?
                </p>
              </div>
            </div>
          )}

          {messages.map((msg: any, idx: number) => (
            <div key={idx} className={`flex items-start gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === 'user' ? 'bg-primary-600 text-white' : 'bg-primary-100 text-primary-600'
              }`}>
                {msg.role === 'user' ? <UserIcon className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>
              <div className={`rounded-2xl px-4 py-3 shadow-sm max-w-[80%] ${
                msg.role === 'user' 
                  ? 'bg-primary-600 text-white rounded-tr-none' 
                  : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'
              }`}>
                <div className="whitespace-pre-wrap">{msg.content}</div>
                <div className={`text-xs mt-1 ${msg.role === 'user' ? 'text-primary-100' : 'text-gray-400'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5 text-primary-600" />
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none px-4 py-4 shadow-sm">
                <div className="bouncing-dots flex items-center h-2">
                  <span></span><span></span><span></span>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mx-4 my-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              <strong>Error:</strong> {error}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-white border-t border-gray-100">
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask for advice..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              disabled={loading}
              aria-label="Message input"
            />
            <Button 
              type="submit" 
              disabled={!input.trim() || loading}
              className="rounded-full w-10 h-10 p-0 flex items-center justify-center shrink-0"
              aria-label="Send message"
            >
              <Send className="w-5 h-5" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  )
}
