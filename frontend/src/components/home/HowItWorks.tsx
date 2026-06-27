import { motion } from 'framer-motion'
import { CheckCircle2, Flame, Lock, Target, Timer, Zap } from 'lucide-react'

const steps = [
  {
    num: '01',
    title: 'Create Your Target',
    desc: 'Set a title, category, priority, and the minimum time required. Add a link to your resource.',
    icon: Target,
    iconColor: 'text-blue-400',
    accent: 'from-blue-400 to-cyan-300',
    proof: 'Goal locked',
  },
  {
    num: '02',
    title: 'Open & Work',
    desc: 'Jump into the lecture, problem set, or workout. The session timer starts.',
    icon: Timer,
    iconColor: 'text-yellow-400',
    accent: 'from-yellow-300 to-amber-500',
    proof: 'Timer live',
  },
  {
    num: '03',
    title: 'Hit Minimum Time',
    desc: "The target unlocks only after you've genuinely spent the required time. No shortcuts.",
    icon: Lock,
    iconColor: 'text-purple-400',
    accent: 'from-purple-400 to-fuchsia-400',
    proof: 'Verified effort',
  },
  {
    num: '04',
    title: 'Complete & Earn',
    desc: 'Mark it done. Earn XP and Forge Coins instantly. Your level and streak update in real-time.',
    icon: Zap,
    iconColor: 'text-green-400',
    accent: 'from-green-300 to-emerald-500',
    proof: '+ XP paid',
  },
  {
    num: '05',
    title: 'Protect Your Streak',
    desc: 'Clear all targets today and your streak grows. Miss one? Use a freeze. Your progress is yours to keep.',
    icon: Flame,
    iconColor: 'text-ember-400',
    accent: 'from-ember-400 to-amber-300',
    proof: 'Streak saved',
  },
]

const stats = [
  { value: '10,000+', label: 'Streaks tracked', detail: 'Across study, training, code' },
  { value: '94%', label: 'User retention', detail: 'Built for daily return' },
  { value: '47 days', label: 'Avg longest streak', detail: 'Momentum you can see' },
  { value: '24/7', label: 'Progress loop', detail: 'Plan, act, earn, repeat' },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="landing-section-background py-28 px-6 border-t border-base-900 relative overflow-hidden">
      <div className="absolute left-1/2 top-16 h-72 w-[min(920px,90vw)] -translate-x-1/2 rounded-full bg-ember-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -right-24 bottom-12 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-ember-500/20 bg-base-900/70 text-[10px] font-bold text-ash-500 uppercase tracking-widest mb-6 shadow-sm backdrop-blur-md">
            <Flame className="w-3 h-3 text-ember-500" />
            How It Works
          </span>
          <h2 className="font-display font-bold text-4xl sm:text-5xl text-ash-100 mb-5">
            Five steps.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-ember-400 to-amber-400">
              Every day.
            </span>
          </h2>
          <p className="text-lg text-ash-400 max-w-xl mx-auto">
            That's the whole system. Simple enough to stick to. Powerful enough to transform you.
          </p>
        </motion.div>

        <div className="relative">
          <div className="absolute left-[10%] right-[10%] top-16 hidden h-px bg-gradient-to-r from-transparent via-ember-500/40 to-transparent lg:block" />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
            {steps.map((step, i) => {
              const Icon = step.icon

              return (
                <motion.div
                  key={step.num}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                  className="group relative overflow-hidden rounded-2xl border border-base-800/80 bg-base-900/75 p-5 text-left shadow-[0_18px_55px_rgba(15,23,42,0.07)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-ember-500/35 hover:shadow-[0_24px_70px_rgba(249,89,26,0.14)]"
                >
                  <div className={`absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br ${step.accent} opacity-10 blur-2xl transition-opacity duration-300 group-hover:opacity-20`} />

                  <div className="relative mb-6 flex items-center justify-between">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/60 bg-base-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_16px_36px_rgba(15,23,42,0.08)] dark:border-white/10">
                      <Icon className={`h-7 w-7 ${step.iconColor}`} />
                    </div>
                    <span className="rounded-full border border-ember-500/20 bg-ember-500/10 px-2.5 py-1 font-mono text-[10px] font-bold tracking-wider text-ember-600">
                      {step.num}
                    </span>
                  </div>

                  <h3 className="relative mb-2 font-display text-base font-bold text-ash-100">{step.title}</h3>
                  <p className="relative min-h-[5.25rem] text-sm leading-relaxed text-ash-400">{step.desc}</p>

                  <div className="relative mt-5 flex items-center gap-2 border-t border-base-800/80 pt-4">
                    <CheckCircle2 className="h-4 w-4 text-ember-500" />
                    <span className="text-xs font-semibold text-ash-300">{step.proof}</span>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.35 }}
          className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="group relative overflow-hidden rounded-2xl border border-ember-500/15 bg-base-900/75 p-5 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-ember-500/35 hover:shadow-[0_18px_45px_rgba(249,89,26,0.12)]"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-ember-500 to-transparent opacity-70" />
              <div className="mb-1 font-display text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-ember-500 to-amber-400">
                {stat.value}
              </div>
              <div className="text-sm font-semibold text-ash-200">{stat.label}</div>
              <div className="mt-1 text-xs leading-relaxed text-ash-500">{stat.detail}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
