import { Check, Zap, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export default function Pricing() {
  return (
    <div className="min-h-screen bg-base-950 pt-24 pb-20 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-ember-500/10 blur-[150px] pointer-events-none rounded-full" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-ember-500/30 bg-ember-500/10 text-xs font-bold text-ember-400 uppercase tracking-widest mb-6">
            <Zap className="w-4 h-4" />
            Pricing Plans
          </span>
          <h1 className="text-5xl sm:text-6xl font-display font-bold text-ash-50 mb-6 leading-tight">
            Invest in your <span className="text-transparent bg-clip-text bg-gradient-to-r from-ember-400 to-amber-400">Consistency</span>
          </h1>
          <p className="text-xl text-ash-400 max-w-2xl mx-auto leading-relaxed">
            Start for free and build your foundation. Upgrade to Pro when you're ready to unlock advanced analytics, unlimited AI coaching, and premium cosmetics.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Tier */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="p-8 rounded-3xl bg-base-900/40 border border-base-800 backdrop-blur-sm relative"
          >
            <h3 className="text-2xl font-display font-bold text-ash-100 mb-2">Basic Forger</h3>
            <p className="text-ash-400 mb-6">Everything you need to build habits.</p>
            <div className="mb-8">
              <span className="text-5xl font-bold text-ash-50">$0</span>
              <span className="text-ash-500"> / forever</span>
            </div>
            <Link to="/register" className="block w-full py-3 px-4 bg-base-800 hover:bg-base-700 text-ash-100 text-center rounded-xl font-bold transition-colors mb-8">
              Start Free
            </Link>
            <div className="space-y-4">
              {[
                'Up to 5 active daily targets',
                'Basic streak tracking',
                'Earn XP and standard Forge Coins',
                'Access to standard Shop items',
                'Join 1 Squad',
                'Basic AI Target Generation (5/day)'
              ].map((feature, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-ash-500 shrink-0" />
                  <span className="text-ash-300">{feature}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Pro Tier */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="p-8 rounded-3xl bg-gradient-to-b from-ember-900/20 to-base-900/40 border border-ember-500/50 backdrop-blur-sm relative overflow-hidden shadow-[0_0_40px_rgba(234,63,12,0.15)]"
          >
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-yellow-400 to-ember-500" />
            <div className="absolute top-6 right-6 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-ember-500/20 text-xs font-bold text-ember-400 border border-ember-500/30">
              <Sparkles className="w-3 h-3" /> Most Popular
            </div>
            
            <h3 className="text-2xl font-display font-bold text-ash-100 mb-2">Pro Forger</h3>
            <p className="text-ember-400/80 mb-6">For the truly disciplined.</p>
            <div className="mb-8">
              <span className="text-5xl font-bold text-white">$8</span>
              <span className="text-ash-400"> / month</span>
            </div>
            <Link to="/register" className="block w-full py-3 px-4 bg-gradient-to-r from-ember-500 to-amber-500 hover:from-ember-400 hover:to-amber-400 text-white shadow-[0_0_20px_rgba(234,63,12,0.3)] text-center rounded-xl font-bold transition-all hover:scale-[1.02] active:scale-[0.98] mb-8">
              Upgrade to Pro
            </Link>
            <div className="space-y-4">
              {[
                'Unlimited active daily targets',
                'Advanced heatmap & analytics',
                '2x Forge Coin earnings',
                'Exclusive Pro Themes & Avatar Frames',
                'Unlimited Squads & Community features',
                'Unlimited AI Coaching & Generation',
                'Priority customer support'
              ].map((feature, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-ember-400 shrink-0" />
                  <span className="text-ash-200">{feature}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
