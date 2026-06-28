import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart3, Calendar, TrendingUp, Clock, Target, Download, Flame, Star } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts'
import { getWeeklyAnalytics, getMonthlyAnalytics, getAnalytics, exportCalendarICS } from '@/services/analytics.service'
import ActivityHeatmap from '@/components/dashboard/ActivityHeatmap'
import MoodCorrelation from '@/components/dashboard/MoodCorrelation'

const ORANGE_SHADES = ['#ea3f0c', '#f05030', '#f56040', '#f87058', '#fba080', '#fdc0a8', '#fed8c8']
const CATEGORY_COLORS: Record<string, string> = {
  Study: '#6366f1', Coding: '#ec4899', Reading: '#10b981', Health: '#f59e0b', Personal: '#8b5cf6'
}

type Tab = 'weekly' | 'monthly' | 'heatmap'

function StatCard({ icon, label, value, sub, color = 'text-ember-400' }: {
  icon: React.ReactNode; label: string; value: string | number; sub?: string; color?: string
}) {
  return (
    <motion.div 
      whileHover={{ scale: 1.02, y: -2 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-base-800/60 to-base-900/80 backdrop-blur-xl border border-base-700/50 p-5 shadow-lg hover:shadow-[0_0_30px_rgba(234,63,12,0.15)] hover:border-ember-500/40 transition-all duration-300 group flex flex-col justify-between min-h-[140px]"
    >
      <div className="absolute -top-8 -right-8 w-24 h-24 bg-ember-500/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 animate-pulse pointer-events-none" />
      <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-red-600/5 rounded-full blur-xl pointer-events-none" />
      
      <div className={`relative z-10 ${color} drop-shadow-[0_0_8px_rgba(234,63,12,0.3)]`}>{icon}</div>
      
      <div className="relative z-10 mt-auto pt-4 flex flex-col">
        <div className="text-4xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-br from-zinc-100 to-zinc-400 drop-shadow-sm">{value}</div>
        <div className="text-ember-500 text-xs font-bold uppercase tracking-widest mt-1.5">{label}</div>
        {sub && <div className="text-zinc-500 text-[10px] mt-1 font-medium">{sub}</div>}
      </div>
    </motion.div>
  )
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-base-800 border border-base-700 rounded-xl px-4 py-3 text-sm shadow-xl">
        <p className="text-ash-300 font-medium mb-1">{label}</p>
        {payload.map((entry: any, i: number) => (
          <p key={i} style={{ color: entry.color }} className="font-semibold">
            {entry.name}: {entry.value}{entry.name?.includes('rate') ? '%' : entry.name?.includes('min') ? ' min' : ''}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function Analytics() {
  const [activeTab, setActiveTab] = useState<Tab>('weekly')
  const [weeklyData, setWeeklyData] = useState<any>(null)
  const [monthlyData, setMonthlyData] = useState<any>(null)
  const [heatmapData, setHeatmapData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const [weekly, monthly, heat] = await Promise.all([
          getWeeklyAnalytics(),
          getMonthlyAnalytics(),
          getAnalytics(),
        ])
        setWeeklyData(weekly)
        setMonthlyData(monthly)
        setHeatmapData(heat)
      } catch (e) {
        console.error(e)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  const handleExportICS = async () => {
    setIsExporting(true)
    try {
      const blob = await exportCalendarICS()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'streakforge-targets.ics'
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setIsExporting(false)
    }
  }

  const TABS = [
    { id: 'weekly', label: '7 Days', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'monthly', label: '30 Days', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'heatmap', label: 'Heatmap', icon: <Calendar className="w-4 h-4" /> },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-7 h-7 text-ember-400" />
          <div>
            <h1 className="text-2xl font-bold text-ash-50">Analytics</h1>
            <p className="text-ash-500 text-sm">Your performance at a glance</p>
          </div>
        </div>
        <button
          onClick={handleExportICS}
          disabled={isExporting}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium border text-ash-300 hover:text-ash-100 rounded-xl transition-all bg-gradient-to-br from-base-950 to-base-900 border-ember-500/20 border hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(234,63,12,0.15)] hover:border-ember-500/50 duration-300 shadow-sm"
        >
          <Download className="w-4 h-4" />
          {isExporting ? 'Exporting…' : 'Export to Calendar (.ics)'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 rounded-xl p-1.5 border w-fit bg-gradient-to-br from-base-950 to-base-900 border-ember-500/20 border hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(234,63,12,0.15)] hover:border-ember-500/50 transition-all duration-300 shadow-sm">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id ? 'bg-base-800 text-ash-50 shadow' : 'text-ash-500 hover:text-ash-300'
            }`}
          >
            {tab.icon}{tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-28 border rounded-2xl animate-pulse bg-gradient-to-br from-base-950 to-base-900 border-ember-500/20 border hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(234,63,12,0.15)] hover:border-ember-500/50 transition-all duration-300 shadow-sm" />
          ))}
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {activeTab === 'weekly' && weeklyData && (
            <motion.div key="weekly" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard icon={<Target className="w-5 h-5" />} label="Completed" value={weeklyData.summary.total_completed} sub="targets this week" />
                <StatCard icon={<TrendingUp className="w-5 h-5" />} label="Completion Rate" value={`${weeklyData.summary.avg_completion_rate}%`} color="text-green-400" />
                <StatCard icon={<Clock className="w-5 h-5" />} label="Time Focused" value={`${weeklyData.summary.total_time_minutes}m`} color="text-blue-400" />
                <StatCard icon={<Flame className="w-5 h-5" />} label="Successful Days" value={weeklyData.summary.days_successful} sub="out of 7" color="text-ember-400" />
              </div>

              {/* Best category badge */}
              {weeklyData.summary.best_category && (
                <div className="flex items-center gap-3 bg-purple-500/10 border border-purple-500/20 rounded-xl px-4 py-3">
                  <Star className="w-5 h-5 text-purple-400" />
                  <span className="text-ash-300 text-sm">Best category this week: <span className="font-semibold text-purple-300">{weeklyData.summary.best_category}</span></span>
                </div>
              )}

              {/* Completion rate chart */}
              <div className="border rounded-2xl p-5 bg-gradient-to-br from-base-950 to-base-900 border-ember-500/20 border hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(234,63,12,0.15)] hover:border-ember-500/50 transition-all duration-300 shadow-sm">
                <h3 className="text-ash-200 font-semibold mb-5">Daily Completion Rate</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={weeklyData.days} barSize={32}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="day_name" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} domain={[0, 100]} unit="%" />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="completion_rate" name="completion rate" radius={[6, 6, 0, 0]}>
                      {weeklyData.days.map((_: any, idx: number) => (
                        <Cell key={idx} fill={`url(#barGrad${idx})`} />
                      ))}
                    </Bar>
                    <defs>
                      {weeklyData.days.map((_: any, idx: number) => (
                        <linearGradient key={idx} id={`barGrad${idx}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#ea3f0c" stopOpacity={0.9} />
                          <stop offset="100%" stopColor="#ea3f0c" stopOpacity={0.3} />
                        </linearGradient>
                      ))}
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Time spent per day */}
              <div className="border rounded-2xl p-5 bg-gradient-to-br from-base-950 to-base-900 border-ember-500/20 border hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(234,63,12,0.15)] hover:border-ember-500/50 transition-all duration-300 shadow-sm">
                <h3 className="text-ash-200 font-semibold mb-5">Time Focused per Day (minutes)</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={weeklyData.days} barSize={28}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="day_name" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="time_spent_minutes" name="minutes focused" fill="#6366f1" radius={[6, 6, 0, 0]} fillOpacity={0.85} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}

          {activeTab === 'monthly' && monthlyData && (
            <motion.div key="monthly" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard icon={<Target className="w-5 h-5" />} label="Days Successful" value={monthlyData.summary.days_successful} sub={`of ${monthlyData.summary.days_tracked} tracked`} />
                <StatCard icon={<TrendingUp className="w-5 h-5" />} label="Monthly Rate" value={`${monthlyData.summary.completion_rate}%`} color="text-green-400" />
                <StatCard icon={<Clock className="w-5 h-5" />} label="Total Focused" value={`${monthlyData.summary.total_time_hours}h`} color="text-blue-400" />
                <StatCard icon={<Flame className="w-5 h-5" />} label="Best Streak" value={`${monthlyData.summary.longest_streak}d`} color="text-ember-400" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-2xl p-4 bg-gradient-to-br from-base-950 to-base-900 border-ember-500/20 border hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(234,63,12,0.15)] hover:border-ember-500/50 transition-all duration-300 shadow-sm">
                  <p className="text-ash-500 text-xs uppercase font-bold tracking-wider mb-1">Best Day of Week</p>
                  <p className="text-2xl font-bold text-green-400">{monthlyData.summary.best_day_of_week}</p>
                </div>
                <div className="border rounded-2xl p-4 bg-gradient-to-br from-base-950 to-base-900 border-ember-500/20 border hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(234,63,12,0.15)] hover:border-ember-500/50 transition-all duration-300 shadow-sm">
                  <p className="text-ash-500 text-xs uppercase font-bold tracking-wider mb-1">Toughest Day</p>
                  <p className="text-2xl font-bold text-red-400">{monthlyData.summary.worst_day_of_week}</p>
                </div>
              </div>

              {/* Weekday breakdown */}
              <div className="border rounded-2xl p-5 bg-gradient-to-br from-base-950 to-base-900 border-ember-500/20 border hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(234,63,12,0.15)] hover:border-ember-500/50 transition-all duration-300 shadow-sm">
                <h3 className="text-ash-200 font-semibold mb-5">Success by Day of Week</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={monthlyData.weekday_breakdown} barSize={28}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="day" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="success_days" name="successful days" fill="#10b981" radius={[6, 6, 0, 0]} fillOpacity={0.85} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Weekly trend */}
              <div className="border rounded-2xl p-5 bg-gradient-to-br from-base-950 to-base-900 border-ember-500/20 border hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(234,63,12,0.15)] hover:border-ember-500/50 transition-all duration-300 shadow-sm">
                <h3 className="text-ash-200 font-semibold mb-5">4-Week Completion Trend</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={monthlyData.weekly_trend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="week" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} domain={[0, 100]} unit="%" />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="completion_rate" name="completion rate" stroke="#ea3f0c" strokeWidth={2.5} dot={{ fill: '#ea3f0c', r: 5 }} activeDot={{ r: 7 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}

          {activeTab === 'heatmap' && heatmapData && (
            <motion.div key="heatmap" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              
              {/* Top Insights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {heatmapData.best_time_of_day && (
                  <StatCard icon={<Clock className="w-5 h-5" />} label="Best Time of Day" value={heatmapData.best_time_of_day} sub="Most productive time period" color="text-yellow-400" />
                )}
                {heatmapData.most_frequent_mood && (
                  <StatCard icon={<Star className="w-5 h-5" />} label="Frequent Mood" value={heatmapData.most_frequent_mood} sub="Most common emotional state" color="text-pink-400" />
                )}
              </div>

              {/* Category pie */}
              {heatmapData.by_category?.length > 0 && (
                <div className="border rounded-2xl p-5 bg-gradient-to-br from-base-950 to-base-900 border-ember-500/20 border hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(234,63,12,0.15)] hover:border-ember-500/50 transition-all duration-300 shadow-sm">
                  <h3 className="text-ash-200 font-semibold mb-5">Completions by Category</h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie data={heatmapData.by_category} dataKey="count" nameKey="category" cx="50%" cy="50%" outerRadius={100} label={(entry: any) => `${entry.name} ${((entry.percent || 0) * 100).toFixed(0)}%`}>
                        {heatmapData.by_category.map((entry: any, idx: number) => (
                          <Cell key={idx} fill={CATEGORY_COLORS[entry.category] || ORANGE_SHADES[idx % ORANGE_SHADES.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: any) => [`${v} completions`, '']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Priority bar chart */}
              {heatmapData.by_priority?.length > 0 && (
                <div className="border rounded-2xl p-5 bg-gradient-to-br from-base-950 to-base-900 border-ember-500/20 border hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(234,63,12,0.15)] hover:border-ember-500/50 transition-all duration-300 shadow-sm">
                  <h3 className="text-ash-200 font-semibold mb-5">Completions by Priority</h3>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={heatmapData.by_priority} layout="vertical" barSize={24}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                      <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="priority" tick={{ fill: '#9ca3af', fontSize: 13 }} axisLine={false} tickLine={false} width={65} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="count" name="completions" radius={[0, 6, 6, 0]}>
                        {heatmapData.by_priority.map((entry: any, idx: number) => (
                          <Cell key={idx} fill={entry.priority === 'High' ? '#ef4444' : entry.priority === 'Medium' ? '#f59e0b' : '#6366f1'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Render the Dashboard ActivityHeatmap component directly */}
              <ActivityHeatmap />
              
              {/* Feature 3: Mood Correlation */}
              <div className="mt-8">
                <MoodCorrelation />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  )
}
