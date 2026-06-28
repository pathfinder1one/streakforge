import { useState, useRef, useEffect } from 'react'
import { Bot, Send, Mic, MicOff, Sparkles, Plus, Loader2, AlertTriangle, CheckCircle, Flame as FlameIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { aiService, type ChatResponse, type SuggestedTask, type ExecutedCommand } from '@/services/ai.service'
import { useVoiceInput } from '@/hooks/useVoiceInput'
import { useTargetStore } from '@/store/targetStore'
import { useAuthStore } from '@/store/authStore'
import AIRecommendations from '@/components/dashboard/AIRecommendations'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  suggestedTasks?: SuggestedTask[]
  createdTasks?: boolean
  executedCommands?: ExecutedCommand[]
  agentName?: string
  agentType?: string
}

const QUICK_PROMPTS = [
  'Plan my day for maximum productivity',
  'Create a structured study plan',
  'Suggest a quick workout routine',
  'Give me tips to avoid burnout',
]

export default function Assistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hello! I am The Sentinel, your ultra-advanced accountability Coach.\n\nI monitor your habits, negotiate your targets, and won't hesitate to penalize excuses.\n\nTell me, what did you accomplish today?",
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { fetchTargets } = useTargetStore()
  const { fetchProfile } = useAuthStore()

  const { isListening, isSupported, toggleListening } = useVoiceInput({
    onResult: (text) => {
      setInput((prev) => prev + text)
    },
  })

  // Load conversation history on mount
  useEffect(() => {
    aiService.getHistory(undefined, 20).then((history) => {
      if (history && history.length > 0) {
        const historyMsgs: Message[] = history.map((m) => ({
          id: `history-${m.id}`,
          role: m.role as 'user' | 'assistant',
          content: m.message,
          agentName: m.agent_name,
          agentType: m.agent_type,
        }))
        setMessages([messages[0], ...historyMsgs])
      }
    }).catch(() => { /* ignore if history fails */ })
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

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
        executedCommands: res.executed_commands?.length ? res.executed_commands : undefined,
        agentName: res.agent_name,
        agentType: res.agent_type,
      }
      setMessages((prev) => [...prev, assistantMsg])
      
      // If AI did something autonomous, refresh our state
      if (res.executed_commands && res.executed_commands.length > 0) {
        await fetchTargets()
        await fetchProfile()
      }
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
      inputRef.current?.focus()
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
    <div className="px-6 lg:px-10 py-8 max-w-7xl mx-auto h-[calc(100vh-2rem)] flex flex-col">
      <div className="mb-6 flex items-center justify-between shrink-0">
        <div>
          <h1 className="font-display font-semibold text-2xl text-ash-100 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-ember-500" />
            AI Coach
            <span className="text-[10px] uppercase tracking-widest font-bold bg-ember-500/20 text-ember-400 px-2 py-0.5 rounded-full border border-ember-500/30">VIP</span>
          </h1>
          <p className="text-ash-400 text-sm mt-1">Your personal productivity strategist.</p>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        
        {/* Chat Interface */}
        <div className="lg:col-span-2 bg-base-900/80 backdrop-blur-md rounded-3xl border border-base-800 shadow-xl flex flex-col overflow-hidden relative hover:-translate-y-1">
          
          {/* Subtle background glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-ember-500/5 rounded-full blur-[100px] pointer-events-none" />

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 custom-scrollbar relative z-10">
            {messages.map((msg) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={msg.id} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] ${msg.role === 'user' ? 'order-1' : ''}`}>
                  {msg.role === 'assistant' && (
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-ember-gradient flex items-center justify-center shadow-md">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-xs font-semibold text-ash-400">Coach</span>
                    </div>
                  )}
                  <div
                    className={`rounded-2xl px-5 py-4 text-[15px] leading-relaxed whitespace-pre-wrap shadow-sm ${
                      msg.role === 'user'
                        ? 'bg-ember-gradient text-white rounded-tr-sm shadow-[0_4px_20px_rgba(234,63,12,0.2)]'
                        : 'bg-base-950/80 border border-base-800 text-ash-100 rounded-tl-sm'
                    }`}
                  >
                    {msg.content}
                  </div>

                      {/* Suggested Tasks */}
                  {msg.suggestedTasks && msg.suggestedTasks.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-[11px] text-ember-500 font-bold uppercase tracking-widest flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Action Plan
                      </p>
                      {msg.suggestedTasks.map((task, i) => (
                        <div key={i} className="bg-base-950 border border-base-800 rounded-xl px-4 py-3 text-sm hover:border-base-700 transition-colors shadow-sm">
                          <p className="text-ash-100 font-semibold">{task.title}</p>
                          <div className="flex items-center gap-3 mt-1.5 text-[11px] text-ash-500 font-medium">
                            <span className="bg-base-900 px-2 py-0.5 rounded-md">{task.category}</span>
                            <span>{task.minimum_time} mins</span>
                            <span className={task.priority === 'High' ? 'text-ember-400' : ''}>{task.priority} Priority</span>
                          </div>
                        </div>
                      ))}
                      {!msg.createdTasks ? (
                        <button
                          onClick={() => addTasksToTracker(msg.id, msg.suggestedTasks!)}
                          className="w-full mt-2 flex items-center justify-center gap-2 text-sm font-bold text-ember-400 hover:text-white bg-ember-500/10 border border-ember-500/20 rounded-xl py-3 hover:bg-ember-gradient hover:shadow-[0_4px_20px_rgba(234,63,12,0.3)] transition-all"
                        >
                          <Plus className="w-4 h-4" />
                          Add Plan to My Targets
                        </button>
                      ) : (
                        <div className="mt-2 text-center text-xs text-green-400 font-bold bg-green-500/10 border border-green-500/20 rounded-xl py-2">
                          ✓ Plan activated! Tasks added.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Executed Commands (Sentinel Actions) */}
                  {msg.executedCommands && msg.executedCommands.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-[11px] text-ash-400 font-bold uppercase tracking-widest flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Sentinel Actions
                      </p>
                      {msg.executedCommands.map((cmd, i) => {
                        let Icon = Sparkles
                        let colorClass = "text-ash-300 bg-base-800/50 border-base-700"
                        if (cmd.action === "mark_complete") {
                          Icon = CheckCircle
                          colorClass = "text-green-400 bg-green-500/10 border-green-500/20"
                        } else if (cmd.action === "deduct_coins") {
                          Icon = FlameIcon
                          colorClass = "text-red-400 bg-red-500/10 border-red-500/20"
                        } else if (cmd.action === "renegotiate_target") {
                          Icon = AlertTriangle
                          colorClass = "text-amber-400 bg-amber-500/10 border-amber-500/20"
                        }

                        return (
                          <div key={i} className={`flex items-start gap-2.5 px-4 py-3 rounded-xl border text-sm shadow-sm ${colorClass}`}>
                            <Icon className="w-4 h-4 mt-0.5 shrink-0" />
                            <div className="flex-1">
                              <p className="font-semibold">{cmd.action.replace('_', ' ').toUpperCase()}</p>
                              {cmd.detail && <p className="text-xs opacity-80 mt-0.5">{cmd.detail}</p>}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}

            {/* Enhanced Typing Indicator (#13) */}
            {isLoading && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
                <div className="bg-base-900/80 border border-base-800/80 rounded-2xl rounded-tl-sm px-5 py-3.5 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5 items-center">
                      <span className="w-2.5 h-2.5 rounded-full bg-ember-400 animate-bounce shadow-[0_0_6px_rgba(249,89,26,0.6)]" style={{ animationDelay: '0ms' }} />
                      <span className="w-2.5 h-2.5 rounded-full bg-ember-400 animate-bounce shadow-[0_0_6px_rgba(249,89,26,0.6)]" style={{ animationDelay: '160ms' }} />
                      <span className="w-2.5 h-2.5 rounded-full bg-ember-400 animate-bounce shadow-[0_0_6px_rgba(249,89,26,0.6)]" style={{ animationDelay: '320ms' }} />
                    </div>
                    <span className="text-xs text-ash-500 ml-1">AI is thinking...</span>
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-base-900 border-t border-base-800 relative z-10 shrink-0">
            {messages.length <= 1 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {QUICK_PROMPTS.map((p) => (
                  <button
                    key={p}
                    onClick={() => sendMessage(p)}
                    className="text-xs bg-base-950 hover:bg-base-800 text-ash-300 hover:text-white rounded-full px-4 py-2 transition-all border border-base-800 hover:border-ember-500/30 whitespace-nowrap"
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
            <div className="flex items-center gap-3 bg-base-950 rounded-2xl px-4 py-3 border border-base-800 focus-within:border-ember-500/50 focus-within:shadow-[0_0_15px_rgba(234,63,12,0.1)] transition-all hover:-translate-y-1">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="Message your Coach..."
                className="flex-1 bg-transparent text-[15px] text-ash-100 placeholder-ash-600 outline-none"
                id="ai-coach-input"
              />
              {isSupported && (
                <button
                  onClick={toggleListening}
                  className={`p-2 rounded-xl transition-colors ${isListening ? 'bg-red-500/20 text-red-400 animate-pulse' : 'text-ash-400 hover:bg-base-800 hover:text-ash-100'}`}
                  title={isListening ? 'Stop listening' : 'Voice input'}
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
              )}
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || isLoading}
                className="p-2 rounded-xl bg-ember-gradient text-white disabled:opacity-50 disabled:grayscale transition-all hover:shadow-[0_0_15px_rgba(234,63,12,0.4)]"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Recommendations & Tools */}
        <div className="flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2 pb-8 min-h-0">
          <AIRecommendations />
          
          <motion.div whileHover={{ scale: 1.02, y: -2 }} className="bg-gradient-to-br from-base-950 to-base-900 border border-ember-500/20 rounded-3xl p-6 shadow-[0_0_30px_rgba(234,63,12,0.15)] hover:shadow-[0_0_40px_rgba(234,63,12,0.3)] hover:border-ember-500/50 transition-all duration-300 relative overflow-hidden group cursor-pointer shrink-0">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay"></div>
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-ember-500/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700 animate-pulse"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-red-600/10 rounded-full blur-2xl"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-1 bg-ember-500/10 border border-ember-500/20 rounded text-[10px] font-bold text-ember-500 uppercase tracking-wider backdrop-blur-md">Premium Feature</span>
                <Sparkles className="w-4 h-4 text-ember-500 drop-shadow-[0_0_8px_rgba(234,63,12,0.5)]" />
              </div>
              <h3 className="font-display font-bold text-2xl text-transparent bg-clip-text bg-gradient-to-br from-ember-400 to-red-600 mb-1">Deep Work Mode</h3>
              <p className="text-ash-400 text-xs mb-4">Block distractions and let AI guide your next 2 hours of focus.</p>
              
              <button className="w-full py-2.5 bg-ember-gradient text-white font-bold text-sm rounded-xl shadow-lg hover:shadow-[0_0_15px_rgba(234,63,12,0.4)] transition-all">
                Start Deep Work
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
