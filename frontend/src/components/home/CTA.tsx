import { useNavigate } from 'react-router-dom'
import { ArrowRight, Flame, ShieldCheck, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import Button from '@/components/common/Button'

export default function CTA() {
  const navigate = useNavigate()

  return (
    <section className="landing-cta-background py-28 px-6 border-t border-base-900 relative overflow-hidden">
      <div className="absolute left-1/2 top-1/2 h-[560px] w-[min(1100px,92vw)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-ember-500/12 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-[2rem] border border-ember-500/20 bg-base-900/80 p-8 text-center shadow-[0_30px_120px_rgba(249,89,26,0.18)] backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:border-ember-500/35 sm:p-14 lg:p-16"
        >
          <div className="absolute inset-x-16 top-0 h-1 rounded-full bg-gradient-to-r from-transparent via-ember-500 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(249,89,26,0.16),transparent_42%),linear-gradient(135deg,rgba(255,255,255,0.55),transparent_32%)] pointer-events-none dark:bg-[radial-gradient(circle_at_50%_0%,rgba(249,89,26,0.18),transparent_42%),linear-gradient(135deg,rgba(255,255,255,0.05),transparent_32%)]" />
          <div className="absolute -left-20 top-12 h-44 w-44 rounded-full border border-ember-500/10" />
          <div className="absolute -right-16 bottom-8 h-36 w-36 rounded-full border border-cyan-400/10" />

          <div className="relative z-10">
            <div className="mb-7 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl bg-ember-500 blur-xl opacity-40" />
                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-ember-gradient text-white shadow-ember">
                  <Flame className="h-8 w-8" />
                </div>
              </div>
            </div>

            <div className="mb-5 flex flex-wrap items-center justify-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-ember-500/20 bg-ember-500/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-ember-600">
                <Sparkles className="h-3.5 w-3.5" />
                Start today
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-base-800 bg-base-950/70 px-3 py-1 text-xs font-semibold text-ash-500">
                <ShieldCheck className="h-3.5 w-3.5 text-green-500" />
                Free forever
              </span>
            </div>

            <h2 className="mx-auto mb-5 max-w-3xl font-display text-4xl font-extrabold leading-tight text-ash-100 sm:text-5xl lg:text-6xl">
              Your streak starts the moment{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-ember-500 via-orange-400 to-amber-400">
                you stop scrolling.
              </span>
            </h2>

            <p className="mx-auto mb-10 max-w-2xl text-base leading-relaxed text-ash-400 sm:text-lg">
              Free to start. No credit card. No excuses. Just you and the discipline you've always known you're capable of.
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" onClick={() => navigate('/register')} className="group shadow-ember-lg px-10">
                Create Your First Target
                <ArrowRight className="inline-block w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="secondary" size="lg" onClick={() => navigate('/login')} className="px-8">
                Already have an account
              </Button>
            </div>

            <div className="mt-9 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-ash-500">
              <span>10,000+ achievers joined</span>
              <span className="hidden h-1 w-1 rounded-full bg-ash-500/50 sm:block" />
              <span>No credit card needed</span>
              <span className="hidden h-1 w-1 rounded-full bg-ash-500/50 sm:block" />
              <span>First target in under a minute</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
