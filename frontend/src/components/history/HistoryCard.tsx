import { CheckCircle2, XCircle, Flame, Calendar as CalIcon } from 'lucide-react'
import { motion } from 'framer-motion'

interface HistoryCardProps {
  totalCompletions: number
  totalTargets: number
  completionPercentage: number
}

export default function HistoryCard({ totalCompletions, totalTargets, completionPercentage }: HistoryCardProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Successful Days Card */}
      <motion.div 
        whileHover={{ scale: 1.02, y: -2 }}
        className="relative overflow-hidden rounded-2xl bg-base-950 border border-base-800 p-5 hover:border-green-500/50 hover:shadow-[0_0_20px_rgba(74,222,128,0.15)] transition-all duration-300"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-full blur-xl pointer-events-none" />
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle2 className="w-4 h-4 text-green-400" />
          <p className="text-ash-500 text-xs font-bold uppercase tracking-widest">Successful Days</p>
        </div>
        <p className="font-display font-bold text-3xl text-ash-100 mt-2">{totalCompletions}</p>
      </motion.div>

      {/* Total Days Card */}
      <motion.div 
        whileHover={{ scale: 1.02, y: -2 }}
        className="relative overflow-hidden rounded-2xl bg-base-950 border border-base-800 p-5 hover:border-blue-500/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] transition-all duration-300"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />
        <div className="flex items-center gap-2 mb-2">
          <CalIcon className="w-4 h-4 text-blue-400" />
          <p className="text-ash-500 text-xs font-bold uppercase tracking-widest">Total Days</p>
        </div>
        <p className="font-display font-bold text-3xl text-ash-100 mt-2">{totalTargets}</p>
      </motion.div>

      {/* Success Rate Card */}
      <motion.div 
        whileHover={{ scale: 1.02, y: -2 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-base-950 to-base-900 border border-ember-500/20 p-5 hover:border-ember-500/50 hover:shadow-[0_0_30px_rgba(234,63,12,0.25)] transition-all duration-300 group"
      >
        <div className="absolute -top-8 -right-8 w-32 h-32 bg-ember-500/20 rounded-full blur-2xl pointer-events-none animate-pulse" />
        <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-red-600/10 rounded-full blur-xl pointer-events-none" />
        <div className="flex items-center gap-2 mb-2 relative z-10">
          <Flame className="w-4 h-4 text-ember-500 drop-shadow-[0_0_10px_rgba(234,63,12,0.5)]" />
          <p className="text-ember-500/80 text-xs font-bold uppercase tracking-widest">Success Rate</p>
        </div>
        <p className="font-display font-bold text-4xl text-transparent bg-clip-text bg-gradient-to-br from-ember-400 to-red-600 mt-2 relative z-10">{completionPercentage}%</p>
      </motion.div>
    </div>
  )
}
