import { motion } from 'framer-motion'
import { Target } from 'lucide-react'

interface ProgressCardProps {
  completed: number
  total: number
  percentage: number
}

const CIRCLE_R = 36
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_R

export default function ProgressCard({ completed, total, percentage }: ProgressCardProps) {
  const pct = total > 0 ? percentage : 0
  const strokeDashoffset = CIRCLE_CIRCUMFERENCE - (pct / 100) * CIRCLE_CIRCUMFERENCE

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="relative overflow-hidden rounded-2xl border p-6 transition-all duration-300 bg-base-900/60 backdrop-blur-xl border-ember-500/20 border hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(234,63,12,0.15)] hover:border-ember-500/50 shadow-sm"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-ember-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between relative">
        {/* Left: text content */}
        <div className="flex-1">
          <p className="text-ash-500 text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <Target className="w-3 h-3 text-ember-500" />
            Today's Progress
          </p>
          <div className="flex items-baseline gap-1.5 mb-3">
            <motion.span
              key={completed}
              initial={{ scale: 1.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="font-display font-bold text-4xl text-ash-100"
            >
              {completed}
            </motion.span>
            <span className="text-ash-500 text-lg">/ {total}</span>
          </div>

          {/* Bar */}
          <div className="h-2 rounded-full bg-base-800 overflow-hidden w-36">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-ember-gradient rounded-full"
            />
          </div>
          <p className="text-xs text-ash-500 mt-1.5 font-mono">{pct}% complete</p>
        </div>

        {/* Right: circular progress */}
        <div className="shrink-0">
          <svg width="90" height="90" viewBox="0 0 90 90" className="-rotate-90">
            <circle
              cx="45" cy="45" r={CIRCLE_R}
              fill="none"
              stroke="rgb(26,24,22)"
              strokeWidth="8"
            />
            <motion.circle
              cx="45" cy="45" r={CIRCLE_R}
              fill="none"
              stroke="url(#emberGrad)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={CIRCLE_CIRCUMFERENCE}
              initial={{ strokeDashoffset: CIRCLE_CIRCUMFERENCE }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            />
            <defs>
              <linearGradient id="emberGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffa674" />
                <stop offset="100%" stopColor="#ea3f0c" />
              </linearGradient>
            </defs>
          </svg>
          <p className="text-center text-xs font-bold text-ember-400 -mt-2">{pct}%</p>
        </div>
      </div>
    </motion.div>
  )
}
