import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Flame, Zap, Star, Crown, Users, ChevronUp, ChevronDown, Minus } from 'lucide-react'
import { getGlobalLeaderboard } from '@/services/leaderboard.service'
import type { LeaderboardEntry, LeaderboardSortBy } from '@/types/leaderboard'
import { getAssetUrl } from '@/utils/url'

const TABS: { label: string; value: LeaderboardSortBy; icon: React.ReactNode; color: string }[] = [
  { label: 'Current Streak', value: 'current_streak', icon: <Flame className="w-4 h-4" />, color: 'text-ember-400' },
  { label: 'Longest Streak', value: 'longest_streak', icon: <Trophy className="w-4 h-4" />, color: 'text-yellow-400' },
  { label: 'Level', value: 'level', icon: <Star className="w-4 h-4" />, color: 'text-purple-400' },
  { label: 'Total XP', value: 'total_xp', icon: <Zap className="w-4 h-4" />, color: 'text-blue-400' },
]

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-2xl">👑</span>
  if (rank === 2) return <span className="text-2xl">🥈</span>
  if (rank === 3) return <span className="text-2xl">🥉</span>
  return <span className="w-8 h-8 flex items-center justify-center text-sm font-bold text-ash-400">#{rank}</span>
}

function StatValue({ sortBy, entry }: { sortBy: LeaderboardSortBy; entry: LeaderboardEntry }) {
  switch (sortBy) {
    case 'current_streak': return <><span className="font-bold text-ember-400">{entry.current_streak}</span><span className="text-ash-500 text-xs ml-1">days</span></>
    case 'longest_streak': return <><span className="font-bold text-yellow-400">{entry.longest_streak}</span><span className="text-ash-500 text-xs ml-1">days</span></>
    case 'level': return <><span className="font-bold text-purple-400">Lv.{entry.level}</span></>
    case 'total_xp': return <><span className="font-bold text-blue-400">{entry.xp}</span><span className="text-ash-500 text-xs ml-1">XP</span></>
    default: return null
  }
}

export default function Leaderboard() {
  const [sortBy, setSortBy] = useState<LeaderboardSortBy>('current_streak')
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [myRank, setMyRank] = useState<number | null>(null)
  const [totalUsers, setTotalUsers] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    getGlobalLeaderboard(sortBy).then((res) => {
      setEntries(res.leaderboard)
      setMyRank(res.my_rank)
      setTotalUsers(res.total_users)
      setIsLoading(false)
    }).catch(() => setIsLoading(false))
  }, [sortBy])

  const top3 = entries.slice(0, 3)
  const rest = entries.slice(3)

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-3">
          <Trophy className="w-8 h-8 text-yellow-400" />
          <h1 className="text-3xl font-bold text-ash-50">Leaderboard</h1>
        </div>
        <p className="text-ash-400">{totalUsers} forge warriors competing globally</p>
        {myRank && (
          <div className="inline-flex items-center gap-2 bg-ember-500/10 border border-ember-500/30 rounded-full px-4 py-1.5">
            <Users className="w-4 h-4 text-ember-400" />
            <span className="text-ember-300 text-sm font-medium">Your rank: #{myRank} of {totalUsers}</span>
          </div>
        )}
      </div>

      {/* Sort Tabs */}
      <div className="flex gap-2 rounded-xl p-1.5 border bg-gradient-to-br from-base-950 to-base-900 border-ember-500/20 border hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(234,63,12,0.15)] hover:border-ember-500/50 transition-all duration-300 shadow-sm">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setSortBy(tab.value)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
              sortBy === tab.value
                ? 'bg-base-800 text-ash-50 shadow-md'
                : 'text-ash-500 hover:text-ash-300'
            }`}
          >
            <span className={sortBy === tab.value ? tab.color : ''}>{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 rounded-full border-2 border-ember-500 border-t-transparent animate-spin" />
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={sortBy}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            {/* Top 3 Podium (#11) */}
            {top3.length >= 3 && (
              <div className="mb-8 p-6 rounded-2xl bg-base-900/60 border border-base-800/60 backdrop-blur-sm">
                <div className="flex items-end justify-center gap-3">
                  {/* 2nd Place */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex flex-col items-center flex-1"
                  >
                    <div className="text-2xl mb-1">🥈</div>
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-white font-bold text-lg mb-2 overflow-hidden ${top3[1]?.is_me ? 'ring-2 ring-ember-500' : ''}`}>
                      {top3[1]?.avatar_url ? (
                        <img src={getAssetUrl(top3[1].avatar_url)} alt="" className="w-full h-full object-cover" />
                      ) : (
                        top3[1]?.name?.[0]?.toUpperCase()
                      )}
                    </div>
                    <p className="text-xs font-bold text-ash-200 truncate max-w-[80px] text-center">{top3[1]?.name}</p>
                    <div className="mt-1 text-xs"><StatValue sortBy={sortBy} entry={top3[1]} /></div>
                    <div className="mt-2 w-full h-20 bg-gradient-to-t from-slate-500/40 to-slate-500/10 border border-slate-500/30 rounded-t-xl flex items-center justify-center">
                      <span className="text-slate-300 font-bold text-xl">2</span>
                    </div>
                  </motion.div>

                  {/* 1st Place — Tallest */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0 }}
                    className="flex flex-col items-center flex-1"
                  >
                    <Crown className="w-6 h-6 text-yellow-400 mb-1 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]" />
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center text-white font-bold text-2xl mb-2 shadow-[0_0_20px_rgba(250,204,21,0.4)] overflow-hidden ${top3[0]?.is_me ? 'ring-2 ring-ember-500' : ''}`}>
                      {top3[0]?.avatar_url ? (
                        <img src={getAssetUrl(top3[0].avatar_url)} alt="" className="w-full h-full object-cover" />
                      ) : (
                        top3[0]?.name?.[0]?.toUpperCase()
                      )}
                    </div>
                    <p className="text-sm font-bold text-yellow-300 truncate max-w-[90px] text-center">{top3[0]?.name}</p>
                    <div className="mt-1 text-sm"><StatValue sortBy={sortBy} entry={top3[0]} /></div>
                    <div className="mt-2 w-full h-28 bg-gradient-to-t from-yellow-500/40 to-yellow-500/10 border border-yellow-500/40 rounded-t-xl flex items-center justify-center shadow-[0_0_20px_rgba(250,204,21,0.15)]">
                      <span className="text-yellow-300 font-bold text-2xl">1</span>
                    </div>
                  </motion.div>

                  {/* 3rd Place */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-col items-center flex-1"
                  >
                    <div className="text-2xl mb-1">🥉</div>
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-amber-700 to-amber-900 flex items-center justify-center text-white font-bold text-lg mb-2 overflow-hidden ${top3[2]?.is_me ? 'ring-2 ring-ember-500' : ''}`}>
                      {top3[2]?.avatar_url ? (
                        <img src={getAssetUrl(top3[2].avatar_url)} alt="" className="w-full h-full object-cover" />
                      ) : (
                        top3[2]?.name?.[0]?.toUpperCase()
                      )}
                    </div>
                    <p className="text-xs font-bold text-ash-200 truncate max-w-[80px] text-center">{top3[2]?.name}</p>
                    <div className="mt-1 text-xs"><StatValue sortBy={sortBy} entry={top3[2]} /></div>
                    <div className="mt-2 w-full h-14 bg-gradient-to-t from-amber-700/40 to-amber-700/10 border border-amber-700/30 rounded-t-xl flex items-center justify-center">
                      <span className="text-amber-500 font-bold text-xl">3</span>
                    </div>
                  </motion.div>
                </div>
              </div>
            )}

            {/* Full List */}
            <div className="space-y-2">
              {entries.map((entry, idx) => (
                <motion.div
                  key={entry.user_id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(idx * 0.03, 0.3) }}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                    entry.is_me
                      ? 'bg-ember-500/10 border-ember-500/40 ring-1 ring-ember-500/30'
                      : 'bg-base-900 border-base-800 hover:border-base-700'
                  }`}
                >
                  <div className="w-10 flex items-center justify-center shrink-0">
                    <RankBadge rank={entry.rank} />
                  </div>

                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-ember-600 to-purple-600 flex items-center justify-center shrink-0 overflow-hidden">
                    {entry.avatar_url ? (
                      <img src={getAssetUrl(entry.avatar_url)} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white font-bold text-sm">{entry.name[0].toUpperCase()}</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`font-semibold truncate ${entry.is_me ? 'text-ember-300' : 'text-ash-100'}`}>
                        {entry.name} {entry.is_me && <span className="text-xs text-ember-400">(you)</span>}
                      </p>
                      <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full shrink-0">Lv.{entry.level}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-ash-500 flex items-center gap-1">
                        <Flame className="w-3 h-3 text-ember-500" /> {entry.current_streak}d streak
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <StatValue sortBy={sortBy} entry={entry} />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}
