'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { sendMessage } from '@/lib/actions/chat'
import type { ChatMessage } from '@/types/database'
import { Send } from 'lucide-react'

export function ChatFeed({
  initialMessages,
  villageId,
  currentFamilyId,
}: {
  initialMessages: ChatMessage[]
  villageId: string
  currentFamilyId: string
}) {
  const [messages, setMessages] = useState(initialMessages)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  // Subscribe to realtime messages
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`chat:${villageId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `village_id=eq.${villageId}`,
        },
        async (payload) => {
          // Fetch the full message with family data
          const { data } = await supabase
            .from('chat_messages')
            .select('*, family:families(*)')
            .eq('id', payload.new.id)
            .single()

          if (data) {
            setMessages((prev) => {
              // Avoid duplicates
              if (prev.some(m => m.id === data.id)) return prev
              return [...prev, data]
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [villageId])

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || sending) return

    setSending(true)
    const formData = new FormData()
    formData.set('message', input.trim())
    const result = await sendMessage(formData)
    if (result?.error) {
      alert(result.error)
    } else {
      setInput('')
    }
    setSending(false)
  }

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 200px)' }}>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
        {messages.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg) => {
            const isMine = msg.family_id === currentFamilyId
            return (
              <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                  isMine
                    ? 'bg-amber-600 text-white rounded-br-md'
                    : 'bg-white border border-gray-200 text-gray-900 rounded-bl-md'
                }`}>
                  {!isMine && (
                    <p className="text-xs font-medium text-amber-700 mb-0.5">
                      {msg.family?.family_name || 'Unknown'}
                    </p>
                  )}
                  <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                  <p className={`text-[10px] mt-1 ${isMine ? 'text-amber-200' : 'text-gray-400'}`}>
                    {new Date(msg.created_at).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form ref={formRef} onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          maxLength={500}
          className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!input.trim() || sending}
          className="bg-amber-600 text-white px-4 py-2.5 rounded-xl hover:bg-amber-700 disabled:opacity-50 transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  )
}
