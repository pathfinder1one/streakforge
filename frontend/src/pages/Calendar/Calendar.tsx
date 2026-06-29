import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, CheckCircle2, Circle, Calendar as CalIcon, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { aiService } from '@/services/ai.service'
import Loader from '@/components/common/Loader'

interface CalendarDay {
  date: string
  total_targets: number
  completed_targets: number
  success: boolean
  has_history: boolean
}

interface DayTarget {
  id: number
  title: string
  category: string
  priority: string
  completed: boolean
}

const CATEGORY_COLORS: Record<string, string> = {
  Study: 'bg-blue-500',
  Coding: 'bg-purple-500',
  Health: 'bg-green-500',
  Reading: 'bg-yellow-500',
  Personal: 'bg-ember-500',
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export default function Calendar() {
  const navigate = useNavigate()
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [days, setDays] = useState<CalendarDay[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [dayTargets, setDayTargets] = useState<DayTarget[]>([])
  const [isDayLoading, setIsDayLoading] = useState(false)

  useEffect(() => {
    loadMonth()
  }, [year, month])

  async function loadMonth() {
    setIsLoading(true)
    setSelectedDate(null)
    try {
      const data = await aiService.getCalendarMonth(year, month)
      setDays(data.days)
    } catch {
      setDays([])
    } finally {
      setIsLoading(false)
    }
  }

  async function selectDay(dateStr: string) {
    setSelectedDate(dateStr)
    setIsDayLoading(true)
    try {
      const data = await aiService.getCalendarDay(dateStr)
      setDayTargets(data.targets)
    } catch {
      setDayTargets([])
    } finally {
      setIsDayLoading(false)
    }
  }

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear((y) => y - 1) }
    else setMonth((m) => m - 1)
  }

  function nextMonth() {
    if (month === 12) { setMonth(1); setYear((y) => y + 1) }
    else setMonth((m) => m + 1)
  }

  const firstDay = new Date(year, month - 1, 1).getDay()
  const todayStr = now.toISOString().split('T')[0]

  return (
    <div className="px-8 py-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display font-semibold text-2xl text-ash-100 flex items-center gap-2">
          <CalIcon className="w-6 h-6 text-ember-500" />
          Calendar
        </h1>
        <p className="text-ash-400 text-sm mt-1">Your productivity at a glance.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 backdrop-blur-md rounded-2xl border p-6 shadow-sm bg-gradient-to-br from-base-950 to-base-900 border-ember-500/20 border hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(234,63,12,0.15)] hover:border-ember-500/50 transition-all duration-300">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={prevMonth}
              className="p-2 rounded-xl bg-base-800 hover:bg-base-700 text-ash-300 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="font-display font-bold text-xl text-ash-100 tracking-wide">
              {MONTHS[month - 1]} <span className="text-ember-400">{year}</span>
            </h2>
            <button
              onClick={nextMonth}
              className="p-2 rounded-xl bg-base-800 hover:bg-base-700 text-ash-300 hover:text-white transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 mb-3">
            {WEEKDAYS.map((d) => (
              <div key={d} className="text-center text-[10px] font-bold text-ash-500 uppercase tracking-widest py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <Loader label="Loading calendar..." />
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}

              {days.map((day) => {
                const d = new Date(day.date + 'T00:00:00').getDate()
                const isToday = day.date === todayStr
                const isSelected = day.date === selectedDate
                const isFuture = day.date > todayStr
                const completionPct = day.total_targets > 0 ? (day.completed_targets / day.total_targets) * 100 : 0

                return (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    key={day.date}
                    onClick={() => selectDay(day.date)}
                    className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center transition-all text-sm font-semibold border
                      ${isSelected ? 'border-ember-500 bg-ember-500/10 shadow-[0_0_15px_rgba(234,63,12,0.15)] text-ember-400' : 'border-transparent'}
                      ${isToday && !isSelected ? 'bg-base-800 text-white' : ''}
                      ${!isToday && !isSelected ? 'bg-base-950 hover:border-base-700 text-ash-300' : ''}
                      ${isFuture ? 'text-ash-500 opacity-60' : ''}
                    `}
                  >
                    <span className="z-10">{d}</span>

                    {/* Completion indicator */}
                    {!isFuture && day.total_targets > 0 && (
                      <div className="absolute bottom-2 flex gap-0.5">
                        {day.success ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_5px_rgba(74,222,128,0.5)]" />
                        ) : completionPct > 50 ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        )}
                      </div>
                    )}
                  </motion.button>
                )
              })}
            </div>
          )}

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-6 pt-5 border-t border-base-800">
            <div className="flex items-center gap-2 text-xs font-medium text-ash-400">
              <span className="w-2.5 h-2.5 rounded-full bg-green-400 shadow-[0_0_5px_rgba(74,222,128,0.5)]" /> Perfect Day
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-ash-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Partial
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-ash-400">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Missed
            </div>
          </div>
        </div>

        {/* Day Detail Panel */}
        <div className="backdrop-blur-md rounded-2xl border p-6 shadow-sm flex flex-col bg-gradient-to-br from-base-950 to-base-900 border-ember-500/20 border hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(234,63,12,0.15)] hover:border-ember-500/50 transition-all duration-300">
          {!selectedDate ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-ash-500">
              <div className="w-16 h-16 rounded-full bg-base-800 flex items-center justify-center mb-4">
                <CalIcon className="w-8 h-8 text-ash-600" />
              </div>
              <p className="text-base font-semibold text-ash-300">Select a day</p>
              <p className="text-xs mt-1">Click any date to view or schedule targets</p>
            </div>
          ) : isDayLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader label="Loading targets..." />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedDate}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex-1"
              >
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-display font-bold text-lg text-ash-100">
                    {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </h3>
                  <button
                    onClick={() => navigate(`/targets/new?date=${selectedDate}`)}
                    className="p-2 bg-ember-500/10 text-ember-400 hover:bg-ember-500 hover:text-white rounded-lg transition-colors border border-ember-500/20 hover:border-ember-500 shadow-sm"
                    title="Add Event"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex items-center gap-2 mb-6 pb-4 border-b border-base-800">
                  <div className="h-1.5 flex-1 bg-base-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-ember-gradient rounded-full" 
                      style={{ width: `${dayTargets.length > 0 ? (dayTargets.filter((t) => t.completed).length / dayTargets.length) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-ash-400 font-mono">
                    {dayTargets.filter((t) => t.completed).length}/{dayTargets.length}
                  </span>
                </div>

                {dayTargets.length === 0 ? (
                  <div className="text-center py-10 rounded-xl border border-dashed bg-gradient-to-br from-base-950 to-base-900 border-ember-500/20 border hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(234,63,12,0.15)] hover:border-ember-500/50 transition-all duration-300 shadow-sm">
                    <p className="text-sm text-ash-500 font-medium">No targets scheduled for this day.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5 overflow-y-auto pr-2 custom-scrollbar" style={{ maxHeight: 'calc(100vh - 350px)' }}>
                    {dayTargets.map((t, i) => (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        key={t.id}
                        className={`flex items-center gap-3 p-3 rounded-xl border ${
                          t.completed 
                            ? 'border-green-900/30 bg-green-950/20' 
                            : 'border-base-800 bg-base-950'
                        }`}
                      >
                        {t.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
                        ) : (
                          <Circle className="w-5 h-5 text-ash-600 shrink-0" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className={`text-sm font-semibold truncate ${t.completed ? 'text-ash-400 line-through' : 'text-ash-200'}`}>
                            {t.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="flex items-center gap-1.5 text-[10px] font-bold text-ash-500 bg-base-900 px-2 py-0.5 rounded-full">
                              <span className={`w-1.5 h-1.5 rounded-full ${CATEGORY_COLORS[t.category] || 'bg-ash-500'}`} />
                              {t.category}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  )
}
