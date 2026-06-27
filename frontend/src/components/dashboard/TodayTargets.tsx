import { useState, useEffect, useRef } from 'react'
import { CheckCircle2, Circle, ExternalLink, Play, Square, Clock, Calendar, Bell, Flame, Zap, CheckSquare, Square as SquareIcon, BookOpen, Code, Dumbbell, Target as TargetIcon, Camera } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Target } from '@/types/target'
import * as targetService from '@/services/target.service'
import { useTargetStore } from '@/store/targetStore'
import { useAuthStore } from '@/store/authStore'

interface TodayTargetsProps {
  targets: Target[]
  onChange: () => void
}

const priorityConfig: Record<string, { label: string; cls: string; dot: string }> = {
  High: { label: 'High', cls: 'text-ember-400 bg-ember-500/10 border-ember-500/20', dot: 'bg-ember-400' },
  Medium: { label: 'Med', cls: 'text-amber-400 bg-amber-500/10 border-amber-500/20', dot: 'bg-amber-400' },
  Low: { label: 'Low', cls: 'text-ash-400 bg-base-700/50 border-base-700', dot: 'bg-ash-500' },
}

const categoryIcon: Record<string, React.ElementType> = {
  Study: BookOpen, Coding: Code, Health: Dumbbell, Reading: BookOpen, Personal: TargetIcon,
}

function formatSeconds(total: number): string {
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function TargetRow({ target, onChange }: { target: Target; onChange: () => void }) {
  const [sessionId, setSessionId] = useState<number | null>(null)
  const [liveSeconds, setLiveSeconds] = useState(target.seconds_spent_today)
  const [isRunning, setIsRunning] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [justCompleted, setJustCompleted] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const toggleSubtask = useTargetStore((s) => s.toggleSubtask)

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => setLiveSeconds((s) => s + 1), 1000)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [isRunning])

  const requiredSeconds = target.minimum_time * 60
  const canComplete = liveSeconds >= requiredSeconds
  const progressPct = requiredSeconds > 0 ? Math.min(100, (liveSeconds / requiredSeconds) * 100) : 100
  const isDone = target.is_completed_today
  const cfg = priorityConfig[target.priority] || priorityConfig.Low

  async function handleStart() {
    if (target.link) window.open(target.link, '_blank', 'noopener,noreferrer')
    const res = await targetService.startSession(target.id)
    setSessionId(res.session_id)
    setIsRunning(true)
  }

  async function handleStop(markComplete: boolean) {
    if (!sessionId) return
    setIsSubmitting(true)
    try {
      await targetService.endSession(sessionId, markComplete)
      setIsRunning(false)
      setSessionId(null)
      if (markComplete) setJustCompleted(true)
      
      // Update profile to reflect newly awarded XP and Coins
      useAuthStore.getState().fetchProfile()
      
      onChange()
    } catch {
      setIsRunning(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleToggleSubtask(subtaskId: number) {
    await toggleSubtask(target.id, subtaskId)
  }

  return (
    <motion.div
      layout
      whileHover={{ scale: 1.01, y: -2 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-2xl border transition-all duration-300 ${
        isDone
          ? 'bg-base-900/40 border-base-800/50'
          : isRunning
          ? 'bg-base-900 border-ember-600/50 shadow-[0_0_20px_rgba(234,63,12,0.1)]'
          : 'bg-base-900 border-base-800 hover:border-base-700'
      }`}
    >
      {/* Running pulse top border */}
      {isRunning && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-ember-gradient animate-pulse" />
      )}

      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <div className="mt-0.5 shrink-0">
            {isDone ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                <CheckCircle2 className="w-5 h-5 text-ember-500" />
              </motion.div>
            ) : (
              <Circle className="w-5 h-5 text-ash-600" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            {/* Title row */}
            <div className="flex items-center gap-2 flex-wrap mb-1">
              {(() => {
                const Icon = categoryIcon[target.category] || TargetIcon
                return <Icon className="w-4 h-4 text-ash-400 shrink-0" />
              })()}
              <h4 className={`font-medium text-sm ${isDone ? 'text-ash-500 line-through' : 'text-ash-100'}`}>
                {target.title}
              </h4>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.cls}`}>
                <span className={`w-1.5 h-1.5 rounded-full inline-block mr-1 ${cfg.dot}`} />
                {cfg.label}
              </span>
              {isRunning && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-ember-400 animate-pulse">
                  <Flame className="w-3 h-3" /> LIVE
                </span>
              )}
            </div>

            {/* Scheduled / alert meta */}
            {(target.scheduled_date || target.alert_time) && (
              <div className="flex items-center gap-3 text-[11px] text-ash-500 mb-2">
                {target.scheduled_date && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-ember-400" />
                    {new Date(target.scheduled_date).toLocaleDateString()}
                  </span>
                )}
                {target.alert_time && (
                  <span className="flex items-center gap-1">
                    <Bell className="w-3 h-3 text-amber-400" />
                    {target.alert_time}
                  </span>
                )}
              </div>
            )}

            {/* Subtasks */}
            {target.subtasks && target.subtasks.length > 0 && !isDone && (
              <div className="mt-3 mb-2 space-y-1.5 rounded-xl p-3 border bg-gradient-to-br from-base-950 to-base-900 border-ember-500/20 border hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(234,63,12,0.15)] hover:border-ember-500/50 transition-all duration-300 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-ash-500">Micro-Habits</span>
                  <span className="text-[10px] text-ash-500 font-mono">
                    {target.subtasks.filter(s => s.is_completed).length}/{target.subtasks.length}
                  </span>
                </div>
                {target.subtasks.map((st) => (
                  <div 
                    key={st.id} 
                    className="flex items-center gap-2 group cursor-pointer"
                    onClick={() => handleToggleSubtask(st.id)}
                  >
                    <button className="text-ash-500 group-hover:text-ember-400 transition-colors shrink-0">
                      {st.is_completed ? (
                        <CheckSquare className="w-4 h-4 text-ember-500" />
                      ) : (
                        <SquareIcon className="w-4 h-4" />
                      )}
                    </button>
                    <span className={`text-xs transition-colors ${st.is_completed ? 'text-ash-600 line-through' : 'text-ash-300 group-hover:text-ash-200'}`}>
                      {st.title}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Timer + progress */}
            {!isDone && target.minimum_time > 0 && (
              <div className="mt-3 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5 text-ash-400 font-mono">
                    <Clock className="w-3 h-3" />
                    {formatSeconds(liveSeconds)} / {target.minimum_time}:00
                  </div>
                  {canComplete && !isRunning && (
                    <span className="text-green-400 font-bold text-[10px] flex items-center gap-1">
                      <Zap className="w-3 h-3" /> Ready!
                    </span>
                  )}
                </div>
                <div className="h-1.5 rounded-full bg-base-800 overflow-hidden">
                  <motion.div
                    animate={{ width: `${progressPct}%` }}
                    transition={{ duration: 0.5 }}
                    className={`h-full rounded-full ${canComplete ? 'bg-green-500' : 'bg-ember-gradient'}`}
                  />
                </div>
              </div>
            )}

              {/* Action buttons */}
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              {!isDone && !isRunning && target.minimum_time > 0 && (
                <button
                  onClick={handleStart}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-ember-gradient text-white hover:opacity-90 transition-opacity shadow-sm"
                >
                  <Play className="w-3 h-3" fill="white" />
                  {target.link ? 'Open & Start' : 'Start Timer'}
                </button>
              )}
              
              {!isDone && !isRunning && target.minimum_time === 0 && (
                <button
                  onClick={async () => {
                    setIsSubmitting(true);
                    try {
                      const res = await targetService.startSession(target.id);
                      await targetService.endSession(res.session_id, true);
                      useAuthStore.getState().fetchProfile();
                      onChange();
                    } catch (e) {
                      console.error(e);
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-500 transition-colors shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-3 h-3" />
                  )}
                  Mark Complete
                </button>
              )}

              {!isDone && isRunning && (
                <>
                  <button
                    onClick={() => handleStop(false)}
                    disabled={isSubmitting}
                    className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-base-800 text-ash-300 hover:bg-base-700 transition-colors disabled:opacity-50"
                  >
                    <Square className="w-3 h-3" />
                    Pause
                  </button>
                  <button
                    onClick={() => handleStop(true)}
                    disabled={isSubmitting || !canComplete}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-green-600 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-green-500 transition-colors"
                    title={!canComplete ? `Need ${formatSeconds(requiredSeconds - liveSeconds)} more` : undefined}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    Complete
                  </button>
                </>
              )}
              
              {/* AI Proof Verification */}
              {!isDone && (
                <div className="relative">
                  <input 
                    type="file" 
                    accept="image/*" 
                    id={`proof-${target.id}`} 
                    className="hidden" 
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      setIsSubmitting(true)
                      try {
                        const { mlService } = await import('@/services/ml.service')
                        const res = await mlService.verifyImage(target.id, file)
                        if (res.verified) {
                          alert('✅ AI Verified! ' + res.reason)
                          useAuthStore.getState().fetchProfile()
                          onChange()
                        } else {
                          alert('❌ Verification Failed: ' + res.reason)
                        }
                      } catch (err) {
                        alert('Error verifying image.')
                      } finally {
                        setIsSubmitting(false)
                      }
                    }}
                  />
                  <label 
                    htmlFor={`proof-${target.id}`}
                    className={`flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg border border-ember-500/30 text-ember-400 bg-ember-500/10 cursor-pointer hover:bg-ember-500/20 transition-colors ${isSubmitting ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    <Camera className="w-3 h-3" /> Verify with AI
                  </label>
                </div>
              )}

              {target.link && (
                <a
                  href={target.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[11px] text-ash-500 hover:text-ember-400 ml-auto transition-colors"
                >
                  Resource <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function TodayTargets({ targets, onChange }: TodayTargetsProps) {
  if (targets.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-2xl border border-dashed p-12 text-center bg-gradient-to-br from-base-950 to-base-900 border-ember-500/20 border hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(234,63,12,0.15)] hover:border-ember-500/50 transition-all duration-300 shadow-sm"
      >
        <TargetIcon className="w-10 h-10 mx-auto text-ash-500 mb-3" />
        <p className="text-ash-400 text-sm font-medium">No targets due today.</p>
        <p className="text-ash-600 text-xs mt-1">Create one to get the fire started!</p>
      </motion.div>
    )
  }

  const done = targets.filter((t) => t.is_completed_today).length
  const total = targets.length

  return (
    <div className="space-y-3">
      {/* Mini completion bar at top */}
      <div className="flex items-center gap-3 mb-1">
        <div className="flex-1 h-1 rounded-full bg-base-800 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(done / total) * 100}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full bg-ember-gradient rounded-full"
          />
        </div>
        <span className="text-[11px] font-mono text-ash-500 shrink-0">{done}/{total} done</span>
      </div>

      <AnimatePresence>
        {targets.map((t) => (
          <TargetRow key={t.id} target={t} onChange={onChange} />
        ))}
      </AnimatePresence>
    </div>
  )
}
