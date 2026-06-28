import { Flame, Trophy, Snowflake } from 'lucide-react'
import { motion } from 'framer-motion'

interface StreakCardProps {
  currentStreak: number
  longestStreak: number
  streakFreezes: number
}

export default function StreakCard({ currentStreak, longestStreak, streakFreezes }: StreakCardProps) {
  const isOnFire = currentStreak >= 7

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="relative overflow-hidden rounded-[24px] bg-[#f4ebe1] border border-white/50 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(234,63,12,0.1)] transition-all duration-300 group"
    >
      {/* Animated glow orbs */}
      <div className="absolute -right-8 -top-8 w-40 h-40 bg-ember-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute -left-4 bottom-0 w-32 h-32 bg-red-600/10 rounded-full blur-2xl" />

      {/* Header */}
      <div className="relative flex items-start justify-between mb-4">
        <div>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Streak Stats</p>
          <div className="flex items-baseline gap-1.5">
            <motion.span
              key={currentStreak}
              initial={{ scale: 1.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="font-display font-bold text-4xl text-slate-800"
            >
              {currentStreak}
            </motion.span>
            <span className="text-slate-500 text-lg font-semibold">days</span>
          </div>
        </div>
        <motion.div
          animate={isOnFire ? { rotate: [-3, 3, -3] } : {}}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <Flame className="w-14 h-14 text-ember-500 drop-shadow-[0_0_15px_rgba(234,63,12,0.4)]" strokeWidth={1.5} />
        </motion.div>
      </div>

      {/* Progress bar toward next milestone */}
      <div className="relative mb-4">
        <div className="w-full bg-[#e8dbcf] rounded-full h-2.5 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, (currentStreak % 10) * 10)}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-ember-gradient rounded-full"
          />
        </div>
        <p className="text-[10px] text-slate-400 mt-1.5 font-medium">{10 - (currentStreak % 10)} more days to next milestone</p>
      </div>

      {/* Footer stats */}
      <div className="relative flex items-center justify-between border-t border-[#e8dbcf] pt-4 gap-2">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-ember-500/70 shrink-0" />
          <span className="text-slate-500 text-xs font-semibold">
            Longest: <span className="font-bold text-slate-800">{longestStreak} days</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Snowflake className="w-4 h-4 text-blue-400/80 shrink-0" />
          <span className="text-slate-500 text-xs font-semibold">
            Freezes: <span className="font-bold text-slate-800">{streakFreezes}/3</span>
          </span>
        </div>
      </div>
    </motion.div>
  )
}
