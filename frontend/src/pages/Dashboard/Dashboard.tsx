import { useAuthStore } from '@/store/authStore'
import { useDashboard } from '@/hooks/useDashboard'
import StreakCard from '@/components/dashboard/StreakCard'
import ProgressCard from '@/components/dashboard/ProgressCard'
import TodayTargets from '@/components/dashboard/TodayTargets'
import ActivityHeatmap from '@/components/dashboard/ActivityHeatmap'
import AnalyticsCharts from '@/components/dashboard/AnalyticsCharts'
import AIRecommendations from '@/components/dashboard/AIRecommendations'
import MoodTracker from '@/components/dashboard/MoodTracker'
import AICopilot from '@/components/ai/AICopilot'
import { useState, useEffect } from 'react'
import { mlService } from '@/services/ml.service'
import { AlertTriangle, ShieldCheck, Star, Zap, Trophy, Flame } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import toast from 'react-hot-toast'

const MOTIVATIONAL_QUOTES = [
  { quote: "We are what we repeatedly do. Excellence is not an act, but a habit.", author: "Aristotle" },
  { quote: "The secret of your future is hidden in your daily routine.", author: "Mike Murdock" },
  { quote: "Motivation is what gets you started. Habit is what keeps you going.", author: "Jim Ryun" },
  { quote: "Small daily improvements are the key to staggering long-term results.", author: "Robin Sharma" },
  { quote: "Discipline is the bridge between goals and accomplishment.", author: "Jim Rohn" },
  { quote: "You don't rise to the level of your goals, you fall to the level of your systems.", author: "James Clear" },
  { quote: "A year from now you will wish you had started today.", author: "Karen Lamb" },
]

function getGreeting(name: string) {
  const hour = new Date().getHours()
  if (hour < 12) return `Good morning, ${name} ☀️`
  if (hour < 17) return `Good afternoon, ${name} 👋`
  if (hour < 21) return `Good evening, ${name} 🌆`
  return `Late night grind, ${name} 🌙`
}

// Skeleton card component
function SkeletonCard({ className = '' }: { className?: string }) {
  return <div className={`skeleton h-32 rounded-2xl ${className}`} />
}

export default function Dashboard() {
  const user = useAuthStore((s) => s.user)
  const { data, isLoading, error, refresh } = useDashboard()
  const [showLevelUp, setShowLevelUp] = useState(false)
  const [prevLevel, setPrevLevel] = useState(user?.level ?? 1)

  const firstName = user?.name?.split(' ')[0] ?? 'there'
  const todayQuote = MOTIVATIONAL_QUOTES[new Date().getDay() % MOTIVATIONAL_QUOTES.length]

  // Detect level up
  useEffect(() => {
    if (user && user.level > prevLevel) {
      setShowLevelUp(true)
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors: ['#f9591a', '#fbbf24', '#ea3f0c'] })
      setTimeout(() => setShowLevelUp(false), 4000)
    }
    setPrevLevel(user?.level ?? 1)
  }, [user?.level])

  // Streak milestone confetti
  useEffect(() => {
    if (data?.current_streak && [7, 14, 30, 60, 100].includes(data.current_streak)) {
      confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 }, colors: ['#f9591a', '#fbbf24', '#ffffff'] })
      toast.success(`🔥 ${data.current_streak}-day streak milestone! You're on fire!`, { duration: 5000 })
    }
  }, [data?.current_streak])

  return (
    <div className="px-6 py-8 max-w-5xl">
      {/* Level-up animation modal (#28) */}
      <AnimatePresence>
        {showLevelUp && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <div className="bg-base-900/95 border border-ember-500/40 rounded-3xl p-10 text-center shadow-[0_0_60px_rgba(249,89,26,0.4)] backdrop-blur-xl">
              <div className="text-6xl mb-4">⚡</div>
              <h2 className="font-display font-bold text-3xl text-gradient-ember mb-2">LEVEL UP!</h2>
              <p className="text-ash-300 text-lg">You reached <span className="font-bold text-ember-400">Level {user?.level}</span>!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-8">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display font-semibold text-2xl text-ash-100"
        >
          {getGreeting(firstName)}
        </motion.h1>
        <p className="text-ash-500 text-sm mt-1">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Daily Motivational Quote (#30) */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6 p-4 rounded-xl bg-base-900/40 border border-base-800/60 backdrop-blur-sm"
      >
        <p className="text-sm text-ash-300 italic">"{todayQuote.quote}"</p>
        <p className="text-xs text-ash-500 mt-1 font-medium">— {todayQuote.author}</p>
      </motion.div>

      {/* Skeleton loaders (#6) */}
      {isLoading && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SkeletonCard />
            <SkeletonCard />
          </div>
          <SkeletonCard className="h-48" />
          <SkeletonCard className="h-64" />
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-950/30 border border-red-900/50 text-red-300 text-sm">{error}</div>
      )}

      {data && !isLoading && (
        <div className="space-y-6">
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <StreakCard
              currentStreak={data.current_streak}
              longestStreak={data.longest_streak}
              streakFreezes={data.streak_freezes || 0}
            />
            <ProgressCard
              completed={data.completed_today}
              total={data.total_today}
              percentage={data.completion_percentage}
            />
          </motion.div>

          <RiskPredictorWidget />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <MoodTracker />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            data-tour="today-targets"
          >
            <h2 className="font-display font-medium text-ash-100 mb-3 text-sm uppercase tracking-widest text-ash-500">Today's Targets</h2>
            <TodayTargets targets={data.targets_today} onChange={refresh} />
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            <ActivityHeatmap />
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            <AIRecommendations />
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
            <AnalyticsCharts />
          </motion.div>
        </div>
      )}

      {/* Floating AI Copilot */}
      <AICopilot />
    </div>
  )
}

function RiskPredictorWidget() {
  const [risk, setRisk] = useState<any>(null)

  useEffect(() => {
    mlService.getRiskScore().then(setRisk).catch(console.error)
  }, [])

  if (!risk) return null

  const isHigh = risk.risk_score > 60

  return (
    <div className={`p-4 rounded-2xl border flex items-center justify-between shadow-sm transition-all ${isHigh ? 'bg-red-500/10 border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.15)]' : 'bg-green-500/10 border-green-500/20'}`}>
      <div className="flex items-center gap-3">
        {isHigh ? <AlertTriangle className="w-6 h-6 text-red-500 animate-pulse" /> : <ShieldCheck className="w-6 h-6 text-green-500" />}
        <div>
          <h3 className={`font-bold text-sm ${isHigh ? 'text-red-400' : 'text-green-400'}`}>AI Streak Predictor</h3>
          <p className="text-xs text-ash-400">{risk.message}</p>
        </div>
      </div>
      <div className="text-right">
        <div className={`text-2xl font-bold font-display ${isHigh ? 'text-red-500' : 'text-green-500'}`}>{risk.risk_score}%</div>
        <div className="text-[10px] uppercase tracking-widest text-ash-500 font-bold">Failure Risk Tomorrow</div>
      </div>
    </div>
  )
}

