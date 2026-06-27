import { Flame, Twitter, Github, MessagesSquare, Mail } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="relative bg-base-950 pt-20 pb-10 overflow-hidden border-t border-base-900">
      {/* Glow effect at the top center of the footer */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-ember-500/50 to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[150px] bg-ember-600/5 blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 mb-16">
          
          {/* Brand Col */}
          <div className="lg:col-span-2">
            <div className="flex flex-col gap-4">
              <Link to="/" className="flex items-center gap-3 group">
                <img src="/logo.png?v=3" alt="StreakForge Logo" className="hidden dark:block w-12 h-12 rounded-lg object-contain grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all" />
                <img src="/logo-light.png?v=3" alt="StreakForge Logo" className="block dark:hidden w-12 h-12 rounded-lg object-contain grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all" />
                <span className="font-display font-semibold text-xl tracking-tight text-ash-100">
                  Streak<span className="text-ember-500">Forge</span>
                </span>
              </Link>
            </div>
            <p className="text-sm text-ash-400 mb-6 max-w-sm leading-relaxed">
              Stop remembering your goals. Start completing them. Join thousands of elite performers leveling up their real life.
            </p>
            <div className="flex gap-4">
              <a href="#" className="p-2.5 border rounded-xl text-ash-400 hover:text-ember-400 hover:bg-base-800 shadow-sm bg-gradient-to-br from-base-950 to-base-900 border-ember-500/20 border hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(234,63,12,0.15)] hover:border-ember-500/50 transition-all duration-300">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="p-2.5 border rounded-xl text-ash-400 hover:text-ember-400 hover:bg-base-800 shadow-sm bg-gradient-to-br from-base-950 to-base-900 border-ember-500/20 border hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(234,63,12,0.15)] hover:border-ember-500/50 transition-all duration-300">
                <Github className="w-4 h-4" />
              </a>
              <a href="#" className="p-2.5 border rounded-xl text-ash-400 hover:text-ember-400 hover:bg-base-800 shadow-sm bg-gradient-to-br from-base-950 to-base-900 border-ember-500/20 border hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(234,63,12,0.15)] hover:border-ember-500/50 transition-all duration-300">
                <MessagesSquare className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links Col 1 */}
          <div>
            <h4 className="font-bold text-ash-100 mb-5 text-sm uppercase tracking-wider">Product</h4>
            <ul className="space-y-3.5 text-sm text-ash-400">
              <li><Link to="/features" className="hover:text-ember-400 transition-colors">Features</Link></li>
              <li><Link to="/leaderboard" className="hover:text-ember-400 transition-colors">Leaderboard</Link></li>
              <li><Link to="/squads" className="hover:text-ember-400 transition-colors">Squads</Link></li>
              <li><Link to="/shop" className="hover:text-ember-400 transition-colors">Forge Shop</Link></li>
            </ul>
          </div>

          {/* Links Col 2 */}
          <div>
            <h4 className="font-bold text-ash-100 mb-5 text-sm uppercase tracking-wider">Resources</h4>
            <ul className="space-y-3.5 text-sm text-ash-400">
              <li><a href="#" className="hover:text-ember-400 transition-colors">Habit Guide</a></li>
              <li><a href="#" className="hover:text-ember-400 transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-ember-400 transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-ember-400 transition-colors">API Docs</a></li>
            </ul>
          </div>

          {/* Subscribe Col */}
          <div>
            <h4 className="font-bold text-ash-100 mb-5 text-sm uppercase tracking-wider">Stay Updated</h4>
            <p className="text-xs text-ash-400 mb-4 leading-relaxed">Get the latest productivity tips and product updates in your inbox.</p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Enter email" 
                className="w-full border rounded-xl px-4 py-2.5 text-sm text-ash-100 placeholder:text-ash-600 focus:outline-none focus:border-ember-500 focus:shadow-[0_0_10px_rgba(234,63,12,0.1)] transition-all bg-gradient-to-br from-base-950 to-base-900 border-ember-500/20 border hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(234,63,12,0.15)] hover:border-ember-500/50 duration-300 shadow-sm"
              />
              <button className="bg-ember-500 hover:bg-ember-400 text-white p-2.5 rounded-xl transition-all shadow-ember shrink-0">
                <Mail className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-base-900 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-ash-500 font-medium">
            © {new Date().getFullYear()} StreakForge Inc. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-ash-500 font-medium">
            <a href="#" className="hover:text-ash-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-ash-300 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-ash-300 transition-colors">Cookie Settings</a>
          </div>
        </div>
      </div>
    </footer>
  )
}