import { MessageCircle, Star } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Testimonials() {
  const reviews = [
    {
      name: 'Sarah Jenkins',
      role: 'Medical Student',
      text: 'I used to struggle with consistency during exam season. StreakForge gameified my study habits. I just hit a 120-day streak and aced my boards. The minimum time verification actually forces me to sit down and do the work.',
      stars: 5,
    },
    {
      name: 'David Chen',
      role: 'Software Engineer',
      text: 'As a dev, the GitHub-style heatmap for my personal habits is exactly what my brain needed. I track my LeetCode problems, gym sessions, and reading. The AI coach prioritizing my daily targets saves me so much mental energy.',
      stars: 5,
    },
    {
      name: 'Marcus Thorne',
      role: 'Marathon Runner',
      text: 'My squad uses the community features to hold each other accountable for our training blocks. Seeing that my friends already completed their 5AM run targets is the ultimate motivation to get out of bed.',
      stars: 5,
    },
    {
      name: 'Elena Rodriguez',
      role: 'Freelance Designer',
      text: 'The UI is insanely gorgeous. The dark mode with the Ember theme makes me actually want to open the app every morning. It feels less like a boring to-do list and more like an RPG character sheet for my real life.',
      stars: 4,
    },
    {
      name: 'James Wilson',
      role: 'Entrepreneur',
      text: 'I bought a streak freeze with my hard-earned Forge coins right before a 14-hour flight. Kept my 45-day streak alive. The economy system is brilliant and makes you value your progress so much more.',
      stars: 5,
    },
    {
      name: 'Aisha Patel',
      role: 'Content Creator',
      text: 'I suffer from terrible ADHD. Traditional habit trackers never worked for me because they were too passive. StreakForge is active. The XP, the levels, the coins—it provides the instant dopamine hit I need to build long-term discipline.',
      stars: 5,
    }
  ]

  return (
    <div className="min-h-screen bg-base-950 pt-24 pb-20 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-ember-500/10 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-ember-500/30 bg-ember-500/10 text-xs font-bold text-ember-400 uppercase tracking-widest mb-6">
            <MessageCircle className="w-4 h-4" />
            Wall of Love
          </span>
          <h1 className="text-5xl sm:text-6xl font-display font-bold text-ash-50 mb-6 leading-tight">
            Loved by <span className="text-transparent bg-clip-text bg-gradient-to-r from-ember-400 to-amber-400">Achievers</span>
          </h1>
          <p className="text-xl text-ash-400 max-w-2xl mx-auto leading-relaxed">
            Don't just take our word for it. Here's what students, athletes, and professionals are saying about how StreakForge changed their lives.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
              className="p-8 rounded-3xl bg-base-900/50 backdrop-blur-sm border border-base-800 hover:border-ember-500/30 transition-all hover:shadow-[0_0_30px_rgba(234,63,12,0.1)] group"
            >
              <div className="flex gap-1 mb-6">
                {[...Array(review.stars)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                ))}
              </div>
              <p className="text-ash-300 leading-relaxed mb-8">"{review.text}"</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-base-800 to-base-900 border border-base-700 flex items-center justify-center text-lg font-bold text-ash-400">
                  {review.name.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-ash-100">{review.name}</div>
                  <div className="text-xs text-ember-500 font-medium">{review.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
