import { CheckCircle2, XCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import type { HistoryEntry } from '@/types/streak'

interface CalendarViewProps {
  entries: HistoryEntry[]
}

function formatDate(dateStr: string): { day: string; date: string } {
  const d = new Date(dateStr + 'T00:00:00')
  return {
    day: d.toLocaleDateString(undefined, { weekday: 'long' }),
    date: d.toLocaleDateString(undefined, { day: '2-digit', month: 'long', year: 'numeric' }),
  }
}

export default function CalendarView({ entries }: CalendarViewProps) {
  if (entries.length === 0) {
    return (
      <div className="rounded-2xl border p-12 text-center border-dashed bg-gradient-to-br from-base-950 to-base-900 border-ember-500/20 border hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(234,63,12,0.15)] hover:border-ember-500/50 transition-all duration-300 shadow-sm">
        <div className="text-4xl mb-4 opacity-50">🗓️</div>
        <p className="text-ash-400 font-medium text-sm">No history yet.</p>
        <p className="text-ash-500 text-xs mt-1">Complete your first day to start building your log.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {entries.map((entry, i) => {
        const { day, date } = formatDate(entry.date)
        return (
          <motion.div
            key={entry.date}
            whileHover={{ scale: 1.01, x: 2 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${
              entry.success
                ? 'bg-base-950 border-base-800 hover:border-green-500/30 hover:shadow-md'
                : 'bg-base-950/40 border-base-900/50 opacity-70 hover:opacity-100 hover:border-base-800'
            }`}
          >
            <div>
              <p className={`font-semibold text-sm ${entry.success ? 'text-ash-100' : 'text-ash-400'}`}>
                {day}
              </p>
              <p className="text-xs text-ash-500 font-mono mt-0.5">{date}</p>
            </div>

            <div className="shrink-0">
              {entry.success ? (
                <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-xs font-bold text-green-400">
                  <CheckCircle2 className="w-4 h-4" />
                  Success
                </span>
              ) : (
                <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-base-800 border border-base-700 text-xs font-bold text-ash-500">
                  <XCircle className="w-4 h-4" />
                  Missed
                </span>
              )}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
