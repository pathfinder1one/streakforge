import { useNavigate } from 'react-router-dom'
import { ArrowRight, Flame, Target, Trophy, Activity, Zap, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'
import Button from '@/components/common/Button'

export default function Hero() {
  const navigate = useNavigate()

  return (
    // Removed justify-center here so it doesn't pull the cards up
    <section className="landing-hero-background relative overflow-hidden min-h-screen flex flex-col pt-0 pb-0">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-ember-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-ember-500/8 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 w-full">
        
        {/* NEW WRAPPER: Centers just the text and buttons in the initial viewport */}
        <div className="flex flex-col justify-center items-center min-h-[90vh] pt-20 pb-10">
          
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-8"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-ember-500/10 border border-ember-500/30 text-xs font-semibold text-ember-400 tracking-widest uppercase">
              <Flame className="w-3.5 h-3.5" />
              The Gamified Habit Tracker · Now with AI
            </span>
          </motion.div>

          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-center mb-6"
          >
            <h1 className="font-display font-bold text-5xl sm:text-6xl lg:text-7xl xl:text-8xl leading-[1.05] tracking-tight text-ash-100">
              Level Up Your
              <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-ember-400 via-orange-400 to-amber-400">
                Real Life.
              </span>
            </h1>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center text-lg sm:text-xl text-ash-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Track daily targets, earn XP, build unbreakable streaks and unlock
            achievements with AI-powered habit science.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button size="lg" onClick={() => navigate('/register')} className="group shadow-ember-lg px-8">
              Start Playing Free
              <ArrowRight className="inline-block w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="secondary" size="lg" onClick={() => navigate('/login')} className="px-8">
              Login
            </Button>
          </motion.div>
        </div>

        {/* ── 5 Floating Mockup Cards ── */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative flex items-center justify-center gap-4 h-[400px] sm:h-[480px] w-full max-w-[1200px] mx-auto mt-12 perspective-1000"
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[60%] bg-ember-600/20 rounded-[100%] blur-[120px] pointer-events-none" />

          {/* Card 1: Streak Stats */}
          <motion.div
            animate={{ y: [-4, 4, -4] }}
            whileHover={{ scale: 1.15, zIndex: 50, transition: { duration: 0.2 } }}
            style={{ scale: 0.9, zIndex: 10 }}
            transition={{ y: { repeat: Infinity, duration: 6, ease: 'easeInOut', delay: 0.2 } }}
            className="hidden lg:block w-48 xl:w-56 shrink-0 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-2xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.5)] relative cursor-pointer"
          >
            <div className="flex items-center gap-2 mb-6">
              <div className="w-6 h-6 rounded-full bg-ember-500 flex items-center justify-center text-white text-[10px] font-bold">S</div>
              <span className="text-xs font-bold text-ash-100">Streak Stats</span>
              <span className="ml-auto text-[10px] font-bold text-green-400">12 Days</span>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-ash-400">Current Streak</span>
                <span className="text-[11px] font-bold text-ember-400">6 Days</span>
              </div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-[11px] text-ash-400">Longest</span>
                <span className="text-[11px] font-bold text-ash-100">18 Days</span>
              </div>
              <div className="w-full bg-base-800 rounded-full h-1.5 mt-2">
                <div className="bg-ember-500 h-1.5 rounded-full w-[60%] shadow-[0_0_8px_rgba(234,63,12,0.6)]" />
              </div>
              <div className="flex justify-between items-center mt-3 pt-3 border-t border-base-800">
                <span className="text-[11px] text-ash-400">Today's Progress</span>
                <span className="text-[11px] font-bold text-ash-100">80%</span>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Analytics */}
          <motion.div
            animate={{ y: [-6, 6, -6] }}
            whileHover={{ scale: 1.15, zIndex: 50, transition: { duration: 0.2 } }}
            style={{ scale: 0.95, zIndex: 20 }}
            transition={{ y: { repeat: Infinity, duration: 5.5, ease: 'easeInOut', delay: 0.5 } }}
            className="hidden md:block w-52 xl:w-60 shrink-0 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-2xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.5)] relative cursor-pointer"
          >
            <div className="flex items-center gap-2 mb-6">
              <div className="w-6 h-6 rounded-full bg-ember-500 flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-xs font-bold text-ash-100">Analytics</span>
              <span className="ml-auto text-[10px] font-bold text-green-400">94% ↑</span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-ash-400">This Week</span>
                <span className="text-[11px] font-bold text-ash-100">↑</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-ash-400">Best Day</span>
                <span className="text-[11px] font-bold text-ash-100">Tuesday</span>
              </div>
              <div className="flex items-end justify-between h-14 mt-4 px-1">
                {[30, 50, 90, 45, 80, 75].map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ duration: 0.8, delay: 1 + i * 0.1 }}
                    className="w-4 rounded-t-sm bg-ember-500 hover:bg-ember-400 transition-colors shadow-[0_0_8px_rgba(234,63,12,0.3)]"
                  />
                ))}
              </div>
              <div className="flex justify-between text-[8px] font-bold text-ash-500 px-1 pt-1">
                <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
              </div>
            </div>
          </motion.div>

          {/* Card 3: Main Profile XP */}
          <motion.div
            animate={{ y: [-8, 8, -8] }}
            whileHover={{ 
              scale: 1.15, 
              zIndex: 50, 
              boxShadow: "0 0 40px rgba(234,63,12,0.4)",
              borderColor: "rgba(234,63,12,0.6)",
              transition: { duration: 0.2 } 
            }}
            style={{ scale: 1, zIndex: 30 }}
            transition={{ y: { repeat: Infinity, duration: 7, ease: 'easeInOut' } }}
            className="w-72 sm:w-80 md:w-96 shrink-0 rounded-2xl backdrop-blur-2xl p-5 shadow-[0_12px_40px_rgba(0,0,0,0.6)] bg-white/[0.05] border border-white/20 relative cursor-pointer overflow-hidden"
          >
            {/* Soft inner glow on the center card */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-base-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-ember-500 flex items-center justify-center text-white font-bold text-lg shadow-[0_0_15px_rgba(234,63,12,0.4)]">P</div>
                <div>
                  <div className="text-sm font-bold text-ash-50">Player One</div>
                  <div className="text-[11px] text-ember-400 font-medium">Level 12 · Pyromancer</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-yellow-400">1,240</div>
                <div className="text-[10px] text-ash-500 uppercase tracking-wider">Forge Coins</div>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex justify-between text-[10px] text-ash-500 font-medium mb-2">
                <span>XP Progress</span>
                <span>840 / 1200 XP</span>
              </div>
              <div className="w-full bg-base-900 rounded-full h-2.5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '70%' }}
                  transition={{ duration: 1.5, delay: 0.8, ease: 'easeOut' }}
                  className="bg-ember-500 h-2.5 rounded-full shadow-[0_0_10px_rgba(234,63,12,0.8)]"
                />
              </div>
            </div>

            <div className="space-y-3">
              {[
                { name: 'Morning Workout', xp: '+25 XP', icon: Activity, color: 'text-blue-400', bg: 'bg-blue-400/10', done: true },
                { name: 'Read 10 Pages', xp: '+15 XP', icon: Target, color: 'text-purple-400', bg: 'bg-purple-400/10', done: true },
                { name: 'Meditate 10min', xp: '+10 XP', icon: Flame, color: 'text-ember-400', bg: 'bg-ember-400/10', done: false },
                { name: 'Code 45min', xp: '+30 XP', icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-400/10', done: false },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-white/5 hover:border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-colors duration-300 shadow-sm relative z-10">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${item.bg}`}>
                      <item.icon className={`w-4 h-4 ${item.color}`} />
                    </div>
                    <span className={`text-xs font-bold ${item.done ? 'line-through text-ash-600' : 'text-ash-200'}`}>{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-green-400">{item.xp}</span>
                    {item.done && <span className="text-[11px] text-green-400">✓</span>}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Card 4: Achievements */}
          <motion.div
            animate={{ y: [-5, 5, -5] }}
            whileHover={{ scale: 1.15, zIndex: 50, transition: { duration: 0.2 } }}
            style={{ scale: 0.95, zIndex: 20 }}
            transition={{ y: { repeat: Infinity, duration: 6.5, ease: 'easeInOut', delay: 0.8 } }}
            className="hidden md:block w-52 xl:w-60 shrink-0 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-2xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.5)] relative cursor-pointer"
          >
            <div className="flex items-center gap-2 mb-6">
              <div className="w-6 h-6 rounded-full bg-ember-500 flex items-center justify-center">
                <Trophy className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-xs font-bold text-ash-100">Achievements</span>
              <span className="ml-auto text-[10px] font-bold text-yellow-400">15 Pts</span>
            </div>
            <div className="space-y-4">
              {[
                { title: 'Focus Master', sub: 'Complete 10 focus sessions', icon: Target, color: 'text-purple-400', bg: 'bg-purple-500/10', done: true },
                { title: 'Early Bird', sub: '5 AM club', icon: Flame, color: 'text-ember-400', bg: 'bg-ember-500/10', done: true },
                { title: 'Consistent Coder', sub: 'Code 10 days in a row', icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-500/10', done: false, progress: '7/10' },
              ].map((ach, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-8 h-8 shrink-0 rounded-full ${ach.bg} flex items-center justify-center`}>
                    <ach.icon className={`w-3.5 h-3.5 ${ach.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-bold text-ash-100 truncate">{ach.title}</div>
                    <div className="text-[9px] text-ash-500 truncate">{ach.sub}</div>
                  </div>
                  <div className="shrink-0">
                    {ach.done ? (
                      <span className="text-green-400 text-[10px] font-bold">✓</span>
                    ) : (
                      <span className="text-ember-400 text-[10px] font-bold">{ach.progress}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Card 5: Daily Goal */}
          <motion.div
            animate={{ y: [-3, 3, -3] }}
            whileHover={{ scale: 1.15, zIndex: 50, transition: { duration: 0.2 } }}
            style={{ scale: 0.9, zIndex: 10 }}
            transition={{ y: { repeat: Infinity, duration: 5, ease: 'easeInOut', delay: 1.2 } }}
            className="hidden lg:block w-48 xl:w-56 shrink-0 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-2xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.5)] relative cursor-pointer"
          >
            <div className="flex items-center gap-2 mb-6">
              <div className="w-6 h-6 rounded-full bg-ember-500 flex items-center justify-center">
                <Target className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-xs font-bold text-ash-100">Daily Goal</span>
              <span className="ml-auto text-[10px] font-bold text-green-400">3/4</span>
            </div>

            <div className="relative flex justify-center items-center py-4">
              <svg className="w-28 h-28 transform -rotate-90">
                <circle cx="56" cy="56" r="46" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-base-800" />
                <motion.circle
                  initial={{ strokeDasharray: "0 289" }}
                  animate={{ strokeDasharray: `${289 * 0.75} 289` }}
                  transition={{ duration: 1.5, delay: 0.8, ease: "easeOut" }}
                  cx="56" cy="56" r="46" stroke="currentColor" strokeWidth="8" fill="transparent" strokeLinecap="round"
                  className="text-ember-500 drop-shadow-[0_0_12px_rgba(234,63,12,0.6)]"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-ash-50">75%</span>
                <span className="text-[9px] font-semibold text-ash-400 tracking-wide uppercase mt-0.5">Completed</span>
              </div>
            </div>

            <div className="text-center mt-2">
              <span className="text-[11px] font-bold text-ash-300">Keep going!</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Marquee strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-20 pt-8 border-t border-base-900 overflow-hidden"
        >
          <p className="text-center text-[10px] font-bold text-ash-600 uppercase tracking-widest mb-6">
            Trusted by Elite Performers Worldwide
          </p>
          <div className="flex gap-16 items-center whitespace-nowrap animate-[scroll_30s_linear_infinite]">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex gap-16 items-center shrink-0">
                {['Google', 'Microsoft', 'Y Combinator', 'Stanford', 'Meta', 'Amazon', 'IIT Delhi', 'OpenAI'].map((name) => (
                  <span key={name} className="text-base font-display font-bold text-ash-600 hover:text-ash-400 transition-colors cursor-default">
                    {name}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}