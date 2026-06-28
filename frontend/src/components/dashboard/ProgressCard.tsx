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
      className="relative overflow-hidden rounded-[24px] p-6 transition-all duration-300 bg-[#f4ebe1] hover:-translate-y-1 hover:scale-[1.01] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(234,63,12,0.1)] border border-white/50"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-ember-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between relative">
        {/* Left: text content */}
        <div className="flex-1">
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <Target className="w-3 h-3 text-ember-500" />
            XP Progress
          </p>
          <div className="flex items-baseline gap-1.5 mb-3">
            <motion.span
              key={completed}
              initial={{ scale: 1.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="font-display font-bold text-3xl text-slate-800"
            >
              {completed}
            </motion.span>
            <span className="text-slate-500 text-sm font-semibold">/ {total} XP</span>
          </div>

          {/* Bar */}
          <div className="h-2.5 rounded-full bg-[#e8dbcf] overflow-hidden w-40">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-ember-gradient rounded-full"
            />
          </div>
        </div>

        {/* Right: circular progress (optional, might remove if sticking purely to the image, but I'll style it to fit) */}
        <div className="shrink-0">
          <svg width="80" height="80" viewBox="0 0 90 90" className="-rotate-90">
            <circle
              cx="45" cy="45" r={CIRCLE_R}
              fill="none"
              stroke="#e8dbcf"
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
          <p className="text-center text-[10px] font-bold text-ember-500 -mt-2.5">{pct}%</p>
        </div>
      </div>
    </motion.div>
  )
}
