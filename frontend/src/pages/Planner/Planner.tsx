import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, ChevronLeft, ChevronRight, Target } from 'lucide-react'
import api from '@/services/api'
import { format, addDays, startOfWeek, isSameDay } from 'date-fns'

export default function Planner() {
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [scheduledTargets, setScheduledTargets] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // In a real app, you would fetch targets for this specific week.
    // Since we don't have a /targets/week endpoint yet, we'll fetch all active targets
    // and just pretend they are scheduled or show frequency.
    const fetchTargets = async () => {
      setIsLoading(true)
      try {
        const { data } = await api.get('/targets?active_only=true')
        setScheduledTargets(data)
      } catch (e) {
        console.error(e)
      } finally {
        setIsLoading(false)
      }
    }
    fetchTargets()
  }, [currentWeekStart])

  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(currentWeekStart, i))

  return (
    <div className="px-6 py-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="w-7 h-7 text-ember-400" />
          <div>
            <h1 className="text-2xl font-bold text-ash-50">Weekly Planner</h1>
            <p className="text-ash-500 text-sm">Organize your goals for the week.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-base-900 rounded-lg p-1 border border-base-800">
          <button 
            onClick={() => setCurrentWeekStart(addDays(currentWeekStart, -7))}
            className="p-1 hover:bg-base-800 rounded transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-ash-400" />
          </button>
          <span className="text-sm font-medium text-ash-300 min-w-[100px] text-center">
            {format(currentWeekStart, 'MMM d')} - {format(addDays(currentWeekStart, 6), 'MMM d')}
          </span>
          <button 
            onClick={() => setCurrentWeekStart(addDays(currentWeekStart, 7))}
            className="p-1 hover:bg-base-800 rounded transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-ash-400" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {weekDays.map((day, idx) => {
          const isToday = isSameDay(day, new Date())
          
          // Filter targets for this day (simplified logic based on frequency)
          // Since our backend doesn't fully support specific day scheduling yet,
          // we'll just show Daily targets on every day, and others randomly or conditionally.
          const dayTargets = scheduledTargets.filter(t => {
            if (t.frequency === 'daily') return true
            if (t.frequency === 'weekly' && day.getDay() === 1) return true // Show weekly on Mondays
            return false
          })

          return (
            <motion.div
              key={day.toISOString()}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`flex flex-col rounded-2xl border ${
                isToday ? 'bg-base-900/80 border-ember-500/30' : 'bg-base-900/40 border-base-800/60'
              } overflow-hidden`}
            >
              <div className={`p-3 text-center border-b ${isToday ? 'bg-ember-500/10 border-ember-500/20' : 'border-base-800/60'}`}>
                <p className={`text-xs font-semibold uppercase tracking-wider ${isToday ? 'text-ember-400' : 'text-ash-500'}`}>
                  {format(day, 'EEE')}
                </p>
                <p className={`text-lg font-bold ${isToday ? 'text-ash-50' : 'text-ash-300'}`}>
                  {format(day, 'd')}
                </p>
              </div>
              
              <div className="p-2 space-y-2 flex-1 min-h-[150px]">
                {isLoading ? (
                  <div className="h-10 bg-base-800 rounded animate-pulse" />
                ) : dayTargets.length > 0 ? (
                  dayTargets.map(t => (
                    <div key={t.id} className="text-xs p-2 rounded-lg bg-base-800/50 border border-base-700/50 flex items-start gap-2">
                      <Target className="w-3 h-3 text-ember-500 shrink-0 mt-0.5" />
                      <span className="text-ash-300 line-clamp-2">{t.title}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center p-4">
                    <p className="text-[10px] text-ash-500">No targets</p>
                  </div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
