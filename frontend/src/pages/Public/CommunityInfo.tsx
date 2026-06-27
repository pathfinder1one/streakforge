import { Users, Shield, MessageSquare, Target } from 'lucide-react'
import { motion } from 'framer-motion'

export default function CommunityInfo() {
  return (
    <div className="min-h-screen bg-base-950 pt-24 pb-20 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-500/10 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/30 bg-blue-500/10 text-xs font-bold text-blue-400 uppercase tracking-widest mb-6 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
            <Users className="w-4 h-4" />
            Squads & Community
          </span>
          <h1 className="text-5xl sm:text-6xl font-display font-bold text-ash-50 mb-6 leading-tight">
            Never build habits <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Alone</span>
          </h1>
          <p className="text-xl text-ash-400 max-w-2xl mx-auto leading-relaxed">
            Join or create a Squad. Share your targets, track each other's progress, and hold each other accountable. Because willpower is stronger in groups.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            {
              icon: Shield,
              title: 'Private Accountability',
              desc: 'Create invite-only squads for your friend group or study partners. See exactly who hit their targets and who slacked off today.',
              color: 'text-blue-400',
              bg: 'bg-blue-500/10 border-blue-500/20'
            },
            {
              icon: MessageSquare,
              title: 'Squad Chat & Cheers',
              desc: 'React to your squadmates\' completed targets. Drop a fire emoji when they hit a 10-day streak or send encouragement when they break it.',
              color: 'text-emerald-400',
              bg: 'bg-emerald-500/10 border-emerald-500/20'
            },
            {
              icon: Target,
              title: 'Shared Challenges',
              desc: 'Start a 30-day coding challenge or fitness bootcamp with your squad. The system automatically tracks the group\'s collective success rate.',
              color: 'text-purple-400',
              bg: 'bg-purple-500/10 border-purple-500/20'
            },
            {
              icon: Users,
              title: 'Global Forums',
              desc: 'Discuss productivity systems, share your target templates, and learn from the top 1% of achievers on the global leaderboards.',
              color: 'text-pink-400',
              bg: 'bg-pink-500/10 border-pink-500/20'
            }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
              className={`p-8 rounded-3xl border ${feature.bg} backdrop-blur-sm relative overflow-hidden group hover:scale-[1.02] transition-transform`}
            >
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <feature.icon className="w-32 h-32" />
              </div>
              <feature.icon className={`w-8 h-8 ${feature.color} mb-6`} />
              <h3 className="text-2xl font-display font-bold text-ash-100 mb-3">{feature.title}</h3>
              <p className="text-ash-400 leading-relaxed relative z-10">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
