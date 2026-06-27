import { useState } from 'react'
import {
  Bot,
  BookOpen,
  Brain,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Dumbbell,
  Flame,
  Laptop,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

const features = [
  {
    icon: Target,
    title: 'Daily Targets',
    description: 'Define what matters - study, coding, health, reading - with priority and category.',
    color: 'text-blue-400',
    glow: 'group-hover:shadow-[0_0_30px_rgba(96,165,250,0.2)]',
    border: 'group-hover:border-blue-500/40',
    accent: 'from-blue-400 to-cyan-300',
    proof: 'Priority + category',
  },
  {
    icon: Flame,
    title: 'Epic Streaks',
    description: 'Current and longest streaks update automatically. Turn consistency into a game.',
    color: 'text-ember-400',
    glow: 'group-hover:shadow-[0_0_30px_rgba(234,63,12,0.2)]',
    border: 'group-hover:border-ember-500/40',
    accent: 'from-ember-500 to-amber-400',
    proof: 'Live streak engine',
  },
  {
    icon: Clock,
    title: 'Time Verification',
    description: 'Targets stay locked until your minimum time is genuinely spent. No fake completions.',
    color: 'text-purple-400',
    glow: 'group-hover:shadow-[0_0_30px_rgba(192,132,252,0.2)]',
    border: 'group-hover:border-purple-500/40',
    accent: 'from-purple-400 to-fuchsia-400',
    proof: 'Minimum time lock',
  },
  {
    icon: Shield,
    title: 'Streak Freezes',
    description: 'Life happens. Buy streak freezes with coins you earn to protect your progress.',
    color: 'text-cyan-400',
    glow: 'group-hover:shadow-[0_0_30px_rgba(34,211,238,0.2)]',
    border: 'group-hover:border-cyan-500/40',
    accent: 'from-cyan-300 to-emerald-400',
    proof: 'Recovery built in',
  },
  {
    icon: TrendingUp,
    title: 'XP & Leveling',
    description: 'Every target completed grants XP and Coins. Watch your rank grow over time.',
    color: 'text-yellow-400',
    glow: 'group-hover:shadow-[0_0_30px_rgba(250,204,21,0.2)]',
    border: 'group-hover:border-yellow-500/40',
    accent: 'from-yellow-300 to-amber-500',
    proof: 'XP + Forge Coins',
  },
  {
    icon: CalendarCheck,
    title: 'Daily History',
    description: 'A running log of every day - success or miss - so patterns become obvious.',
    color: 'text-green-400',
    glow: 'group-hover:shadow-[0_0_30px_rgba(74,222,128,0.2)]',
    border: 'group-hover:border-green-500/40',
    accent: 'from-green-300 to-emerald-500',
    proof: 'Pattern memory',
  },
]

const solutions = [
  {
    label: 'Students',
    icon: BookOpen,
    title: 'Built for exam warriors',
    description:
      'Set daily study targets per subject. Track time spent, protect your streak during exam season with freezes, and watch your focus compound week over week.',
    stats: [
      { value: '3x', label: 'More consistent' },
      { value: '47%', label: 'Better grades' },
      { value: '21 days', label: 'Avg streak' },
    ],
    mockup: [
      { name: 'Physics - Past Papers', time: '45 min', done: true },
      { name: 'Maths - Calculus Ch.5', time: '30 min', done: true },
      { name: 'Chemistry Notes', time: '20 min', done: false },
    ],
    accent: 'from-blue-400 to-cyan-300',
  },
  {
    label: 'Athletes',
    icon: Dumbbell,
    title: 'Train. Track. Dominate.',
    description:
      'Log every workout, stretch, and recovery session. The timer keeps you honest, and the streak keeps you coming back even on the hardest days.',
    stats: [
      { value: '89%', label: 'Completion rate' },
      { value: '2x', label: 'Stronger habits' },
      { value: '30+ days', label: 'Top streaks' },
    ],
    mockup: [
      { name: 'Morning Run - 5km', time: '35 min', done: true },
      { name: 'Strength Training', time: '45 min', done: false },
      { name: 'Evening Stretch', time: '10 min', done: false },
    ],
    accent: 'from-ember-500 to-amber-400',
  },
  {
    label: 'Developers',
    icon: Laptop,
    title: 'Ship code every single day.',
    description:
      'Add DSA practice, open source contributions, or side project time as daily targets. AI helps you prioritize what to build next.',
    stats: [
      { value: '5x', label: 'More PRs merged' },
      { value: '60%', label: 'Less procrastination' },
      { value: '100+', label: 'Problems solved' },
    ],
    mockup: [
      { name: 'LeetCode - 2 Problems', time: '45 min', done: true },
      { name: 'Side Project Feature', time: '60 min', done: true },
      { name: 'Read Tech Article', time: '15 min', done: false },
    ],
    accent: 'from-purple-400 to-blue-400',
  },
  {
    label: 'AI-Powered',
    icon: Bot,
    title: 'Your personal AI coach',
    description:
      'Tell the AI your goal and it breaks it into daily tasks. Ask it to prioritize your targets and get personalized recommendations based on your history.',
    stats: [
      { value: 'AI', label: 'Powered planning' },
      { value: '< 2s', label: 'Response time' },
      { value: '24/7', label: 'Smart nudges' },
    ],
    mockup: [
      { name: 'AI: "Study plan created!"', time: 'Chat', done: true },
      { name: 'AI Sort - Tasks reordered', time: 'Smart', done: true },
      { name: 'Daily tip: Focus on Math first', time: 'Tip', done: false },
    ],
    accent: 'from-cyan-300 to-emerald-400',
  },
]

export default function Features() {
  const [activeTab, setActiveTab] = useState(0)
  const activeSolution = solutions[activeTab]
  const ActiveIcon = activeSolution.icon

  return (
    <>
      <section id="features" className="landing-section-background py-28 px-6 relative overflow-hidden border-t border-base-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_50%,rgba(234,63,12,0.05),transparent)] pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-base-800 text-[10px] font-bold text-ash-500 uppercase tracking-widest mb-6">
              <Sparkles className="w-3 h-3 text-ember-500" />
              Features
            </span>
            <h2 className="font-display font-bold text-4xl sm:text-5xl text-ash-100 mb-5">
              Everything to stay{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-ember-400 to-amber-400">
                consistent
              </span>
            </h2>
            <p className="text-lg text-ash-400 max-w-2xl mx-auto leading-relaxed">
              No fluff. The mechanics of discipline combined with addictive game design.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                whileHover={{ y: -6, scale: 1.02 }}
                className={`group relative min-h-[250px] overflow-hidden rounded-[1.75rem] border border-base-800 bg-base-900/75 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl transition-all duration-300 cursor-default ${feature.glow} ${feature.border}`}
              >
                <div className={`absolute -right-14 -top-14 h-40 w-40 rounded-full bg-gradient-to-br ${feature.accent} opacity-10 blur-2xl transition-opacity duration-300 group-hover:opacity-20`} />
                <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-ember-500/45 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-white/[0.34] to-transparent dark:from-white/[0.03]" />

                <div className="relative z-10 flex h-full flex-col">
                  <div className="mb-7 flex items-center justify-between">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-base-800 bg-base-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_16px_36px_rgba(15,23,42,0.08)] transition-transform duration-300 group-hover:scale-110">
                      <feature.icon className={`w-6 h-6 ${feature.color}`} strokeWidth={2} />
                    </div>
                    <span className="rounded-full border border-base-800 bg-base-950/70 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-ash-500">
                      Core
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-xl text-ash-100 mb-3">{feature.title}</h3>
                  <p className="text-sm text-ash-400 leading-relaxed">{feature.description}</p>
                  <div className="mt-auto pt-6">
                    <span className="inline-flex items-center gap-2 rounded-full bg-ember-500/10 px-3 py-1.5 text-xs font-bold text-ember-600">
                      <Sparkles className="h-3.5 w-3.5" />
                      {feature.proof}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-section-background-alt py-28 px-6 border-t border-base-900 relative overflow-hidden">
        <div className="absolute left-1/2 top-16 h-72 w-[min(980px,90vw)] -translate-x-1/2 rounded-full bg-ember-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-ember-500/20 bg-base-900/70 text-[10px] font-bold text-ash-500 uppercase tracking-widest mb-6 shadow-sm backdrop-blur-md">
              <Brain className="w-3 h-3 text-ember-500" />
              Solutions
            </span>
            <h2 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-ash-100 mb-5">
              Built for every{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-ember-500 via-orange-400 to-amber-400">
                kind of achiever
              </span>
            </h2>
            <p className="text-lg text-ash-400 max-w-3xl mx-auto leading-relaxed">
              One app that adapts to your goals - whether you're studying for finals, training for a marathon, or shipping code.
            </p>
          </motion.div>

          <div className="mb-12 flex justify-center">
            <div className="flex max-w-full gap-2 overflow-x-auto rounded-2xl border border-base-800 bg-base-900/70 p-2 shadow-[0_16px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl scrollbar-thin">
              {solutions.map((solution, i) => {
                const TabIcon = solution.icon
                const isActive = activeTab === i

                return (
                  <button
                    key={solution.label}
                    onClick={() => setActiveTab(i)}
                    className={`relative flex shrink-0 items-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold transition-all duration-300 ${
                      isActive
                        ? 'border-transparent bg-ember-gradient text-white shadow-[0_14px_34px_rgba(249,89,26,0.28)]'
                        : 'border-transparent text-ash-400 hover:bg-base-950/70 hover:text-ash-100'
                    }`}
                  >
                    <TabIcon className="h-4 w-4" />
                    {solution.label}
                  </button>
                )
              })}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35 }}
              className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]"
            >
              <div className="relative">
                <div className={`absolute -left-10 -top-8 h-32 w-32 rounded-full bg-gradient-to-br ${activeSolution.accent} opacity-10 blur-2xl`} />
                <div className="relative">
                  <div className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${activeSolution.accent} text-white shadow-[0_18px_45px_rgba(249,89,26,0.18)]`}>
                    <ActiveIcon className="h-7 w-7" />
                  </div>
                  <h3 className="font-display text-3xl font-extrabold leading-tight text-ash-100 sm:text-4xl">
                    {activeSolution.title}
                  </h3>
                  <p className="mt-5 max-w-xl text-base leading-relaxed text-ash-400">
                    {activeSolution.description}
                  </p>

                  <div className="mt-8 grid max-w-xl grid-cols-3 gap-3">
                    {activeSolution.stats.map((stat) => (
                      <div key={stat.label} className="rounded-2xl border border-ember-500/15 bg-base-900/70 p-4 shadow-sm backdrop-blur-md">
                        <div className="font-display text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-ember-500 to-amber-400">
                          {stat.value}
                        </div>
                        <div className="mt-1 text-xs font-medium text-ash-500">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="relative lg:pl-4">
                <div className="absolute inset-8 rounded-full bg-ember-500/10 blur-3xl" />
                <motion.div
                  animate={{ y: [-5, 5, -5] }}
                  transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
                  className="relative overflow-hidden rounded-[2rem] border border-base-800 bg-base-900/85 p-6 shadow-[0_30px_100px_rgba(15,23,42,0.14)] backdrop-blur-2xl"
                >
                  <div className="absolute inset-x-10 top-0 h-1 rounded-full bg-gradient-to-r from-transparent via-ember-500 to-transparent" />
                  <div className="mb-5 flex items-center gap-3 border-b border-base-800 pb-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ember-500/10">
                      <Bot className="h-5 w-5 text-ember-500" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-ash-100">Today's Targets</div>
                      <div className="text-xs text-ash-500">{activeSolution.label} mode</div>
                    </div>
                    <span className="ml-auto flex items-center gap-1.5 rounded-full bg-green-500/10 px-2.5 py-1 text-[10px] font-bold text-green-500">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                      Active
                    </span>
                  </div>

                  <div className="space-y-3">
                    {activeSolution.mockup.map((item) => (
                      <div
                        key={item.name}
                        className={`flex items-center justify-between gap-4 rounded-2xl border p-4 transition-all duration-300 ${
                          item.done
                            ? 'border-green-500/25 bg-green-500/10'
                            : 'border-base-800 bg-base-950/60 hover:border-ember-500/25'
                        }`}
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${item.done ? 'border-green-400 bg-green-400' : 'border-base-600'}`}>
                            {item.done && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                          </div>
                          <span className={`truncate text-sm font-semibold ${item.done ? 'text-ash-500 line-through' : 'text-ash-200'}`}>
                            {item.name}
                          </span>
                        </div>
                        <span className="shrink-0 font-mono text-xs font-bold text-ash-500">{item.time}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
    </>
  )
}
