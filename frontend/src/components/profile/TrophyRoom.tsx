import { useEffect, useState } from 'react'
import { Badge } from '@/types/analytics'
import api from '@/services/api'
import { Award } from 'lucide-react'
import { motion } from 'framer-motion'

export default function TrophyRoom() {
  const [badges, setBadges] = useState<Badge[]>([])

  useEffect(() => {
    api.get('/badges').then((res) => setBadges(res.data)).catch(console.error)
  }, [])

  const unlocked = badges.filter(b => b.is_unlocked)
  const locked = badges.filter(b => !b.is_unlocked)

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border p-6 bg-gradient-to-br from-base-950 to-base-900 border-ember-500/20 border hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(234,63,12,0.15)] hover:border-ember-500/50 transition-all duration-300 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <Award className="w-5 h-5 text-ash-100" />
          <h3 className="text-lg font-semibold text-ash-100">My Badges</h3>
        </div>
        
        {unlocked.length === 0 ? (
          <p className="text-sm text-ash-400">You haven't earned any badges yet. Keep going!</p>
        ) : (
          <div className="flex flex-wrap gap-6">
            {unlocked.map((badge) => (
              <motion.div whileHover={{ scale: 1.05, y: -5 }} key={badge.id} className="flex flex-col items-center w-24 relative group cursor-pointer">
                <div 
                  className="w-20 h-24 bg-gradient-to-br from-ember-500/20 to-ember-600/10 border border-ember-500/30 flex flex-col items-center justify-center mb-3 relative transition-transform hover:scale-110"
                  style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
                >
                  <span className="text-3xl filter drop-shadow-lg">{badge.icon}</span>
                </div>
                <h4 className="text-xs font-medium text-ash-100 text-center leading-tight">{badge.name}</h4>

                {/* Tooltip */}
                <div className="absolute hidden group-hover:block bottom-full mb-2 w-48 p-3 bg-base-800 border border-base-700 text-ash-100 text-xs rounded-xl shadow-xl text-center z-10">
                  <p className="font-bold text-sm text-white">{badge.name}</p>
                  <p className="text-ash-400 mt-1">{badge.description}</p>
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-base-800 border-b border-r border-base-700 transform rotate-45"></div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border p-6 bg-gradient-to-br from-base-950 to-base-900 border-ember-500/20 border hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(234,63,12,0.15)] hover:border-ember-500/50 transition-all duration-300 shadow-sm">
        <h3 className="text-sm font-medium text-ash-400 mb-6 uppercase tracking-wider">In Progress</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {locked.map((badge) => (
            <motion.div whileHover={{ scale: 1.02, y: -2 }} key={badge.id} className="flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 cursor-pointer bg-gradient-to-br from-base-950 to-base-900 border-ember-500/20 border hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(234,63,12,0.15)] hover:border-ember-500/50 shadow-sm">
              <div 
                className="w-12 h-14 bg-base-800 flex items-center justify-center shrink-0 grayscale opacity-50"
                style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
              >
                <span className="text-xl">{badge.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-ash-100 truncate">{badge.name}</h4>
                <p className="text-xs text-ash-400 truncate mt-0.5 mb-2">{badge.description}</p>
                
                <div className="w-full bg-base-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-ember-500 h-1.5 rounded-full transition-all"
                    style={{ width: `${Math.max(badge.progress_percentage, 5)}%` }}
                  ></div>
                </div>
                <p className="text-[10px] text-ash-500 mt-1">{Math.round(badge.progress_percentage)}% complete</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
