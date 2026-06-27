import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Flame, Target, Trophy, BarChart3, ShieldCheck, Zap, ChevronDown, ChevronRight, ArrowRight, ListChecks, Calendar, Share2, Layers, Award, Sparkles, Settings, Activity, Users } from 'lucide-react'
import Button from './Button'
import { useAuthStore } from '@/store/authStore'
import ThemeToggle from '@/components/common/ThemeToggle'

const MEGA_MENU_TABS = [
  {
    id: 'core',
    label: 'Core Features',
    icon: Target,
    iconColor: 'text-ember-400',
    content: {
      bannerTitle: 'StreakForge Core Intelligence',
      bannerDesc: 'Turn your daily habits into an unstoppable growth channel. Build consistency with our advanced goal tracking system.',
      bannerGradient: 'from-ember-900/60 to-indigo-950/60',
      bannerIcon: Sparkles,
      cols: [
        {
          title: 'Habit Visibility',
          links: [
            { icon: ListChecks, text: 'Target Management' },
            { icon: Flame, text: 'Dynamic Streaks' },
            { icon: Calendar, text: 'Daily Check-ins' },
          ]
        },
        {
          title: 'Analytics Tracker',
          links: [
            { icon: Activity, text: 'Heatmap Analytics' },
            { icon: BarChart3, text: 'Progress Reports' },
            { icon: Zap, text: 'Velocity Tracking' },
          ]
        },
        {
          title: 'Optimization Tools',
          links: [
            { icon: Settings, text: 'Custom Rules' },
            { icon: Share2, text: 'Team Sharing' },
            { icon: Award, text: 'Smart Rewards' },
          ]
        }
      ]
    }
  },
  {
    id: 'gamification',
    label: 'Gamification',
    icon: Trophy,
    iconColor: 'text-yellow-500',
    content: {
      bannerTitle: 'Turn life into a game',
      bannerDesc: 'Level up your real life by earning XP, gold, and unlocking achievements for hitting your daily targets.',
      bannerGradient: 'from-yellow-900/60 to-orange-950/60',
      bannerIcon: Award,
      cols: [
        {
          title: 'Economy',
          links: [
            { icon: Flame, text: 'Forge Coins' },
            { icon: Settings, text: 'Streak Freezes' },
            { icon: Calendar, text: 'Shop Upgrades' },
          ]
        },
        {
          title: 'Progression',
          links: [
            { icon: Activity, text: 'XP & Leveling' },
            { icon: BarChart3, text: 'Leaderboards' },
            { icon: Zap, text: 'Ranks & Badges' },
          ]
        },
        {
          title: 'Cosmetics',
          links: [
            { icon: Target, text: 'Avatar Frames' },
            { icon: Share2, text: 'Custom Themes' },
            { icon: Award, text: 'Profile Flair' },
          ]
        }
      ]
    }
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    iconColor: 'text-emerald-400',
    content: {
      bannerTitle: 'Data-driven discipline',
      bannerDesc: 'Visualize your progress with GitHub-style heatmaps and detailed velocity metrics to find your optimal routine.',
      bannerGradient: 'from-emerald-900/60 to-teal-950/60',
      bannerIcon: Activity,
      cols: [
        {
          title: 'Visualizations',
          links: [
            { icon: Calendar, text: 'Commit Heatmaps' },
            { icon: Flame, text: 'Streak Graphs' },
            { icon: ListChecks, text: 'Completion Rates' },
          ]
        },
        {
          title: 'Insights',
          links: [
            { icon: Zap, text: 'Peak Productivity' },
            { icon: Target, text: 'Goal Distribution' },
            { icon: BarChart3, text: 'Weekly Reports' },
          ]
        },
        {
          title: 'Exporting',
          links: [
            { icon: Share2, text: 'PDF Summaries' },
            { icon: Settings, text: 'CSV Exports' },
            { icon: Award, text: 'Public Dashboards' },
          ]
        }
      ]
    }
  },
  {
    id: 'integrations',
    label: 'Integrations',
    icon: Layers,
    iconColor: 'text-purple-400',
    content: {
      bannerTitle: 'Connect your workflow',
      bannerDesc: 'Sync StreakForge with the tools you already use to automatically complete targets and track your time.',
      bannerGradient: 'from-purple-900/60 to-pink-950/60',
      bannerIcon: Zap,
      cols: [
        {
          title: 'Developer',
          links: [
            { icon: ShieldCheck, text: 'GitHub Commits' },
            { icon: Settings, text: 'GitLab Sync' },
            { icon: Activity, text: 'WakaTime' },
          ]
        },
        {
          title: 'Fitness & Health',
          links: [
            { icon: Target, text: 'Apple Health' },
            { icon: Flame, text: 'Strava Runs' },
            { icon: Calendar, text: 'MyFitnessPal' },
          ]
        },
        {
          title: 'Productivity',
          links: [
            { icon: ListChecks, text: 'Notion Sync' },
            { icon: Share2, text: 'Todoist API' },
            { icon: BarChart3, text: 'Google Calendar' },
          ]
        }
      ]
    }
  },
  {
    id: 'enterprise',
    label: 'Enterprise',
    icon: ShieldCheck,
    iconColor: 'text-blue-400',
    content: {
      bannerTitle: "Scale your team's focus",
      bannerDesc: 'Bring the power of gamified habit tracking to your entire organization with enterprise-grade security and admin tools.',
      bannerGradient: 'from-blue-900/60 to-indigo-950/60',
      bannerIcon: ShieldCheck,
      cols: [
        {
          title: 'Management',
          links: [
            { icon: Users, text: 'Team Squads' },
            { icon: Target, text: 'Org Leaderboards' },
            { icon: Settings, text: 'Admin Controls' },
          ]
        },
        {
          title: 'Security',
          links: [
            { icon: ShieldCheck, text: 'SSO & SAML' },
            { icon: ListChecks, text: 'Audit Logs' },
            { icon: Award, text: 'Compliance' },
          ]
        },
        {
          title: 'Support',
          links: [
            { icon: Activity, text: 'Dedicated CSM' },
            { icon: Zap, text: 'SLA Guarantees' },
            { icon: Calendar, text: 'Custom Onboarding' },
          ]
        }
      ]
    }
  }
]

export default function Navbar() {
  const navigate = useNavigate()
  const token = useAuthStore((s) => s.token)
  const [activeTab, setActiveTab] = useState('core')

  return (
    <header className="sticky top-0 z-50 border-b border-base-800/70 bg-base-950/78 shadow-[0_12px_40px_rgba(15,23,42,0.04)] backdrop-blur-2xl">
      <nav className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-base-900 shadow-sm ring-1 ring-base-800 transition-transform group-hover:scale-105">
            <img src="/logo.png?v=3" alt="StreakForge Logo" className="hidden dark:block h-11 w-11 rounded-xl object-contain" />
            <img src="/logo-light.png?v=3" alt="StreakForge Logo" className="block dark:hidden h-11 w-11 rounded-xl object-contain" />
          </span>
          <span className="font-display font-bold text-xl tracking-tight text-ash-100">
            Streak<span className="text-ember-500">Forge</span>
          </span>
        </Link>

        <div className="hidden lg:flex items-center gap-7 text-sm font-semibold text-ash-300">
          <div className="relative group py-5">
            <button className="flex items-center gap-1 hover:text-ember-400 transition-colors">
              Features <ChevronDown className="w-4 h-4 opacity-70 group-hover:rotate-180 transition-transform" />
            </button>
            
            {/* Mega Menu Dropdown */}
            <div className="absolute top-full left-1/2 -translate-x-[20%] w-[900px] border rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 flex overflow-hidden translate-y-2 group-hover:translate-y-0 bg-gradient-to-br from-base-950 to-base-900 border-ember-500/20 hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(234,63,12,0.15)] hover:border-ember-500/50">
              
              {/* Left Sidebar */}
              <div className="w-64 bg-base-950 p-4 border-r border-base-800 flex flex-col gap-1 shrink-0">
                {MEGA_MENU_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onMouseEnter={() => setActiveTab(tab.id)}
                    className={`flex items-center justify-between w-full px-4 py-3 text-left text-sm font-medium rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'text-ember-400 bg-ember-500/10'
                        : 'text-ash-400 hover:bg-base-800 hover:text-ash-100'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? tab.iconColor : ''}`} /> {tab.label}
                    </span>
                    {activeTab === tab.id && <ChevronRight className="w-4 h-4" />}
                  </button>
                ))}
              </div>

              {/* Main Content Area */}
              <div className="flex-1 p-8 bg-base-900">
                {MEGA_MENU_TABS.map((tab) => (
                  <div
                    key={tab.id}
                    className={`transition-opacity duration-300 ${
                      activeTab === tab.id ? 'block opacity-100 animate-in fade-in' : 'hidden opacity-0'
                    }`}
                  >
                    {/* Banner */}
                    <div className={`w-full bg-gradient-to-r ${tab.content.bannerGradient} rounded-xl p-6 mb-8 flex relative overflow-hidden border border-base-800`}>
                      <div className="relative z-10 w-3/4">
                        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                          {tab.content.bannerTitle} <tab.content.bannerIcon className="w-4 h-4 text-white/70" />
                        </h3>
                        <p className="text-sm text-ash-300 mb-4 leading-relaxed">{tab.content.bannerDesc}</p>
                        <Link to="/register" className="text-sm font-semibold text-white flex items-center gap-2 hover:text-white/80 transition-colors w-fit">
                          Learn more <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                      <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 blur-2xl rounded-full translate-x-1/2"></div>
                      <div className="absolute -right-10 -top-10 opacity-10"><tab.icon className="w-40 h-40 text-white" /></div>
                    </div>

                    {/* 3 Columns */}
                    <div className="grid grid-cols-3 gap-8">
                      {tab.content.cols.map((col, idx) => (
                        <div key={idx}>
                          <h4 className="text-xs font-bold text-ash-100 mb-4 uppercase tracking-wider">{col.title}</h4>
                          <div className="space-y-4">
                            {col.links.map((link, lIdx) => (
                              <a href="#" key={lIdx} className="flex items-center gap-3 text-sm text-ash-400 hover:text-white transition-colors">
                                <link.icon className="w-4 h-4 text-ash-500" /> {link.text}
                              </a>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Footer of mega menu */}
                    <div className="mt-8 pt-6 border-t border-base-800 flex justify-between items-center">
                      <p className="text-xs text-ash-500">Supercharge your productivity.</p>
                      <a href="#" className="text-sm font-medium text-ash-300 hover:text-white flex items-center justify-end gap-2 transition-colors">
                        Explore API <ArrowRight className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Link to="/leaderboards" className="hover:text-ember-400 transition-colors py-5">
            Leaderboards
          </Link>
          <Link to="/community" className="hover:text-ember-400 transition-colors py-5">
            Community
          </Link>
          <Link to="/testimonials" className="hover:text-ember-400 transition-colors py-5">
            Testimonials
          </Link>
          <Link to="/pricing" className="hover:text-ember-400 transition-colors py-5">
            Pro Plan
          </Link>
        </div>

        <div className="flex items-center gap-6">
          <ThemeToggle />
          <div className="w-px h-6 bg-base-800 hidden sm:block"></div>
          {token ? (
            <Button size="sm" onClick={() => navigate('/dashboard')}>
              Dashboard
            </Button>
          ) : (
            <div className="flex items-center gap-6">
              <button 
                onClick={() => navigate('/login')}
                className="text-sm font-semibold text-ash-300 hover:text-ember-500 transition-colors"
              >
                Log In
              </button>
              <div className="hidden sm:flex gap-3">
                <Button variant="secondary" size="sm" onClick={() => navigate('/register')}>
                  Get a demo
                </Button>
                <Button size="sm" onClick={() => navigate('/register')} className="bg-ember-gradient text-white shadow-[0_14px_30px_rgba(249,89,26,0.24)]">
                  Get started
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>
    </header>
  )
}
