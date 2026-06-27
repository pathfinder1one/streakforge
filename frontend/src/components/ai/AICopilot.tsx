import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, X, Send, Mic, MicOff, Sparkles, Plus, Loader2, ChevronDown } from 'lucide-react'
import { aiService, type ChatResponse, type SuggestedTask } from '@/services/ai.service'
import { useVoiceInput } from '@/hooks/useVoiceInput'
import { useTargetStore } from '@/store/targetStore'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  suggestedTasks?: SuggestedTask[]
  createdTasks?: boolean
}

const QUICK_PROMPTS = [
  'Plan my day',
  'Study plan for exam',
  'Create workout routine',
  'Help me focus',
]

export default function AICopilot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hey! I'm your AI Productivity Copilot\n\nI can help you:\n• Plan your goals & break them into tasks\n• Prioritize what matters most\n• Keep you motivated\n\nWhat would you like to work on today?",
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { fetchTargets } = useTargetStore()

  const { isListening, isSupported, toggleListening } = useVoiceInput({
    onResult: (text) => {
      setInput((prev) => prev + text)
    },
  })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [isOpen])

  async function sendMessage(text?: string) {
    const messageText = (text || input).trim()
    if (!messageText || isLoading) return

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
    }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    try {
      const res: ChatResponse = await aiService.chat(messageText)
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: res.message,
        suggestedTasks: res.suggested_tasks?.length ? res.suggested_tasks : undefined,
      }
      setMessages((prev) => [...prev, assistantMsg])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "Sorry, I couldn't connect right now. Please try again!",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  async function addTasksToTracker(msgId: string, tasks: SuggestedTask[]) {
    try {
      await aiService.chat(
        messages.find((m) => m.id === msgId)?.content || '',
        true,
      )
      await fetchTargets()
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msgId ? { ...m, createdTasks: true } : m,
        ),
      )
    } catch {
      // silent fail
    }
  }

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-ember-gradient shadow-ember-lg flex items-center justify-center text-white hover:scale-110 transition-transform"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        title="AI Copilot"
        id="ai-copilot-toggle"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <ChevronDown className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div key="bot" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
              <Bot className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pulse ring */}
        {!isOpen && (
          <span className="absolute w-full h-full rounded-full bg-ember-500/40 animate-ping" />
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-24px)] h-[520px] border rounded-2xl shadow-2xl flex flex-col overflow-hidden bg-gradient-to-br from-base-950 to-base-900 border-ember-500/20 border hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(234,63,12,0.15)] hover:border-ember-500/50 transition-all duration-300 shadow-sm"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-base-800 bg-gradient-to-r from-ember-950/50 to-base-900">
              <div className="w-8 h-8 rounded-full bg-ember-gradient flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-ash-100">AI Copilot</p>
                <p className="text-[10px] text-ember-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block" />
                  Online • Powered by Gemini
                </p>
              </div>
              <button onClick={() => setIsOpen(false)} className="ml-auto text-ash-500 hover:text-ash-200 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] ${msg.role === 'user' ? 'order-1' : ''}`}>
                    {msg.role === 'assistant' && (
                      <div className="w-6 h-6 rounded-full bg-ember-gradient flex items-center justify-center mb-1">
                        <Sparkles className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <div
                      className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                        msg.role === 'user'
                          ? 'bg-ember-gradient text-white rounded-tr-sm'
                          : 'bg-base-800 text-ash-100 rounded-tl-sm'
                      }`}
                    >
                      {msg.content}
                    </div>

                    {/* Suggested Tasks */}
                    {msg.suggestedTasks && msg.suggestedTasks.length > 0 && (
                      <div className="mt-2 space-y-1.5">
                        <p className="text-[10px] text-ash-500 font-medium uppercase tracking-wide">Suggested Tasks</p>
                        {msg.suggestedTasks.map((task, i) => (
                          <div key={i} className="bg-base-800/50 border border-base-700 rounded-lg px-3 py-2 text-xs">
                            <p className="text-ash-200 font-medium">{task.title}</p>
                            <p className="text-ash-500 mt-0.5">{task.category} · {task.minimum_time}m · {task.priority}</p>
                          </div>
                        ))}
                        {!msg.createdTasks ? (
                          <button
                            onClick={() => addTasksToTracker(msg.id, msg.suggestedTasks!)}
                            className="w-full flex items-center justify-center gap-1.5 text-xs font-medium text-ember-400 hover:text-ember-300 border border-ember-800/50 rounded-lg py-1.5 hover:bg-ember-950/30 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                            Add all to My Targets
                          </button>
                        ) : (
                          <p className="text-center text-xs text-green-400 py-1">✓ Tasks added to your targets!</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-base-800 rounded-2xl rounded-tl-sm px-4 py-3">
                    <Loader2 className="w-4 h-4 text-ember-400 animate-spin" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts */}
            {messages.length <= 1 && (
              <div className="px-3 py-2 flex gap-1.5 overflow-x-auto scrollbar-none">
                {QUICK_PROMPTS.map((p) => (
                  <button
                    key={p}
                    onClick={() => sendMessage(p)}
                    className="shrink-0 text-[11px] bg-base-800 hover:bg-base-700 text-ash-300 rounded-full px-3 py-1.5 transition-colors border border-base-700 whitespace-nowrap"
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="border-t border-base-800 px-3 py-3">
              <div className="flex items-center gap-2 bg-base-800 rounded-xl px-3 py-2 border border-base-700 focus-within:border-ember-700 transition-colors">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder="Ask me anything..."
                  className="flex-1 bg-transparent text-sm text-ash-100 placeholder-ash-600 outline-none"
                  id="ai-chat-input"
                />
                {isSupported && (
                  <button
                    onClick={toggleListening}
                    className={`text-ash-400 hover:text-ember-400 transition-colors ${isListening ? 'text-red-400 animate-pulse' : ''}`}
                    title={isListening ? 'Stop listening' : 'Voice input'}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                )}
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || isLoading}
                  className="text-ember-400 hover:text-ember-300 disabled:text-ash-700 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
