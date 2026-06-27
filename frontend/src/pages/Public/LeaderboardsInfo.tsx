import { Trophy, Medal, Star, Flame } from 'lucide-react'
import { motion } from 'framer-motion'

export default function LeaderboardsInfo() {
  return (
    <div className="min-h-screen bg-base-950 pt-24 pb-20 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-yellow-500/10 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-xs font-bold text-yellow-400 uppercase tracking-widest mb-6 shadow-[0_0_20px_rgba(234,179,8,0.2)]">
            <Trophy className="w-4 h-4" />
            Global Rankings
          </span>
          <h1 className="text-5xl sm:text-6xl font-display font-bold text-ash-50 mb-6 leading-tight">
            Rise to the <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-ember-500">Top 1%</span>
          </h1>
          <p className="text-xl text-ash-400 max-w-2xl mx-auto leading-relaxed">
            Compete with thousands of high achievers globally. Every target you complete and every streak you maintain pushes you higher up the ranks.
          </p>
        </motion.div>

        {/* Mock Leaderboard */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-base-900/60 backdrop-blur-xl border border-base-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
          
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-base-800">
            <h2 className="text-2xl font-display font-bold text-ash-100 flex items-center gap-3">
              <Medal className="w-6 h-6 text-yellow-400" /> Top Forgers This Week
            </h2>
            <div className="px-4 py-2 bg-base-950 rounded-lg text-sm text-ash-400 border border-base-800">
              Updates daily
            </div>
          </div>

          <div className="space-y-4">
            {[
              { rank: 1, name: 'AlexTheGreat', xp: '12,450', streak: 45, icon: '🥇', color: 'from-yellow-400/20 border-yellow-500/50' },
              { rank: 2, name: 'CodeNinja', xp: '11,200', streak: 38, icon: '🥈', color: 'from-slate-400/20 border-slate-400/50' },
              { rank: 3, name: 'MarathonRunner', xp: '10,950', streak: 112, icon: '🥉', color: 'from-amber-600/20 border-amber-600/50' },
              { rank: 4, name: 'StudyMachine', xp: '9,840', streak: 21, icon: '⭐', color: 'from-base-800 border-base-700' },
              { rank: 5, name: 'You (Preview)', xp: '1,200', streak: 3, icon: '🔥', color: 'from-ember-900/40 border-ember-500 shadow-[0_0_15px_rgba(249,89,26,0.2)]' },
            ].map((user, i) => (
              <div 
                key={i} 
                className={`flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r ${user.color} border backdrop-blur-sm transition-all hover:scale-[1.01]`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 text-center font-bold text-xl text-ash-500">{user.icon}</div>
                  <div>
                    <div className="font-bold text-ash-100 text-lg">{user.name}</div>
                    <div className="text-xs text-ash-400 flex items-center gap-2 mt-1">
                      <span className="flex items-center gap-1 text-ember-400 font-medium"><Flame className="w-3 h-3" /> {user.streak} days</span>
                      <span className="w-1 h-1 bg-base-700 rounded-full" />
                      Level {Math.floor(parseInt(user.xp.replace(',', '')) / 1000) + 1}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-yellow-400 text-xl">{user.xp}</div>
                  <div className="text-xs text-ash-500 font-medium uppercase tracking-wider mt-1">XP Earned</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
