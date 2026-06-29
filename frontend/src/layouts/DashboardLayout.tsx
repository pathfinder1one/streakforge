import { useState, useEffect } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  Flame, LayoutDashboard, ListChecks, History as HistoryIcon,
  User, LogOut, PanelLeftClose, PanelLeftOpen, CalendarDays, Bot,
  Trophy, Users, ShoppingBag, BarChart3, Settings as SettingsIcon, Calendar, Gavel
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useTargetStore } from '@/store/targetStore'
import ThemeToggle from '@/components/common/ThemeToggle'
import NotificationBell from '@/components/common/NotificationBell'
import TopNavbar from '@/components/common/TopNavbar'
import OfflineBanner from '@/components/common/OfflineBanner'
import Onboarding from '@/components/common/Onboarding'
import { useTargetAlerts } from '@/hooks/useTargetAlerts'
import { useReminders } from '@/hooks/useReminders'
import { usePullToRefresh } from '@/hooks/usePullToRefresh'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/targets', icon: ListChecks, label: 'Targets' },
  { to: '/squads', icon: Users, label: 'Squads' },
  { to: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/planner', icon: Calendar, label: 'Planner' },
  { to: '/calendar', icon: CalendarDays, label: 'Calendar' },
  { to: '/history', icon: HistoryIcon, label: 'History' },
  { to: '/shop', icon: ShoppingBag, label: 'Forge Shop' },
  { to: '/assistant', icon: Bot, label: 'AI Assistant' },
  { to: '/profile', icon: User, label: 'Profile' },
  { to: '/settings', icon: SettingsIcon, label: 'Settings' },
]

const navGroups = [
  {
    title: 'Core Actions',
    items: [
      navItems[0], // Dashboard
      navItems[1], // Targets
      navItems[5], // Planner
    ]
  },
  {
    title: 'Insights & Data',
    items: [
      navItems[4], // Analytics
      navItems[6], // Calendar
      navItems[7], // History
    ]
  },
  {
    title: 'Community & Rewards',
    items: [
      navItems[2], // Squads
      navItems[3], // Leaderboard
      navItems[8], // Forge Shop
    ]
  },
  {
    title: 'Copilot & Account',
    items: [
      navItems[9], // AI Assistant
      navItems[10], // Profile
      navItems[11], // Settings
    ]
  }
]

export default function DashboardLayout() {
  const navigate = useNavigate()
  const logout = useAuthStore((s) => s.logout)
  const user = useAuthStore((s) => s.user)
  const [isCollapsed, setIsCollapsed] = useState(false)
  
  const targets = useTargetStore((s) => s.targets)
  const fetchTargets = useTargetStore((s) => s.fetchTargets)

  // Initialize background alerts and reminders
  useTargetAlerts()
  useReminders()

  // Pull to refresh logic for mobile
  const { isRefreshing } = usePullToRefresh(async () => {
    await fetchTargets()
    await useAuthStore.getState().fetchProfile()
  })

  // Fetch targets on mount to keep badge updated
  useEffect(() => {
    if (user) fetchTargets()
  }, [user, fetchTargets])

  const pendingTargetsCount = targets.filter((t) => t.is_active && !t.is_completed_today).length

  const [breachedCount, setBreachedCount] = useState(0)
  useEffect(() => {
    if (user) {
      import('@/services/court.service').then(m => {
        m.getBreachedContracts().then(res => setBreachedCount(res.length)).catch(() => {})
      })
    }
  }, [user])

  function handleLogout() {
    logout()
    navigate('/')
  }

  // Streak at risk warning (evening = after 6 PM)
  const hour = new Date().getHours()
  const showStreakWarning = hour >= 18 && (user?.current_streak ?? 0) > 0

  return (
    <div className="min-h-screen flex bg-base-950">
      {isRefreshing && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-ember-500 h-1 animate-pulse" />
      )}
      <OfflineBanner />
      <Onboarding />

      {/* Streak freeze warning banner */}
      {showStreakWarning && !breachedCount && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-orange-950 via-red-950 to-orange-950 border-b border-orange-800/50 px-4 py-2 flex items-center justify-center gap-3 text-sm">
          <Flame className="w-4 h-4 text-orange-400 animate-pulse shrink-0" />
          <span className="text-orange-200 font-medium">⚠️ Your streak is at risk! Complete today's targets before midnight.</span>
        </div>
      )}

      {/* Court Summons banner */}
      {breachedCount > 0 && (
        <div 
          onClick={() => navigate('/court')}
          className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-red-950 via-red-900 to-red-950 border-b border-red-500/50 px-4 py-2 flex items-center justify-center gap-3 text-sm cursor-pointer hover:bg-red-900 transition-colors shadow-[0_0_15px_rgba(220,38,38,0.3)]"
        >
          <Gavel className="w-4 h-4 text-red-400 animate-bounce shrink-0" />
          <span className="text-red-100 font-bold uppercase tracking-wider">Court Summons: You have {breachedCount} breached contract(s). Click to face the Judge.</span>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex shrink-0 border-r border-base-800/60 flex-col h-screen sticky top-0 transition-all duration-300 ${isCollapsed ? 'w-[72px]' : 'w-64'} ${(showStreakWarning || breachedCount > 0) ? 'mt-9' : ''} bg-base-950/90 backdrop-blur-xl`}>
        <div className={`h-16 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between px-4'} border-b border-base-800/60`}>
          {!isCollapsed && (
            <div className="flex items-center gap-2 overflow-hidden">
              <img src="/logo.png?v=3" alt="Logo" className="hidden dark:block w-8 h-8 object-contain shrink-0" />
              <img src="/logo-light.png?v=3" alt="Logo" className="block dark:hidden w-8 h-8 object-contain shrink-0" />
              <span className="font-display font-semibold text-lg text-ash-100 whitespace-nowrap">
                Streak<span className="text-ember-500">Forge</span>
              </span>
            </div>
          )}
          {isCollapsed && (
            <img src="/logo.png?v=3" alt="Logo" className="hidden dark:block w-8 h-8 object-contain shrink-0" />
          )}
          {isCollapsed && (
            <img src="/logo-light.png?v=3" alt="Logo" className="block dark:hidden w-8 h-8 object-contain shrink-0 absolute" />
          )}

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`text-ash-400 hover:text-ash-100 transition-colors p-1 ${isCollapsed ? 'mt-2 absolute -right-3 bg-base-900 border border-base-800 rounded-full shadow-lg' : ''}`}
            title="Toggle Sidebar"
          >
            {isCollapsed ? <PanelLeftOpen className="w-4 h-4 m-1" /> : <PanelLeftClose className="w-5 h-5" />}
          </button>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto scrollbar-thin">
          {!isCollapsed && user && (
            <div className="mb-4 px-1">
              <div className="rounded-xl p-3 bg-base-900/60 border border-base-800/60 backdrop-blur-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-ash-200">Level {user.level}</span>
                  <span className="text-xs font-bold text-yellow-500 flex items-center gap-1">
                    {user.coins} 🪙
                  </span>
                </div>
                <div className="w-full bg-base-950 rounded-full h-1.5 mb-1 overflow-hidden">
                  <div
                    className="bg-ember-gradient h-1.5 rounded-full transition-all duration-1000 glow-pulse"
                    style={{ width: `${Math.min((user.xp / (user.level * 100)) * 100, 100)}%` }}
                  />
                </div>
                <div className="text-[10px] text-right text-ash-500">{user.xp} / {user.level * 100} XP</div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {navGroups.map((group) => (
              <div key={group.title} className="space-y-0.5">
                {!isCollapsed && (
                  <div className="px-3 mb-1.5 text-[10px] font-bold text-ash-500 uppercase tracking-wider">
                    {group.title}
                  </div>
                )}
                {group.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    title={isCollapsed ? item.label : undefined}
                    className={({ isActive }) =>
                      `group relative flex items-center ${isCollapsed ? 'justify-center px-0' : 'justify-between px-3'} py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-ember-500/12 text-ember-400 shadow-[0_0_20px_rgba(249,89,26,0.12)] border border-ember-500/25'
                          : 'text-ash-400 hover:text-ash-100 hover:bg-base-800/60 border border-transparent'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
                          {isActive && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-ember-500 rounded-r-full shadow-[0_0_8px_rgba(249,89,26,0.8)]" />
                          )}
                          <item.icon className={`w-5 h-5 shrink-0 transition-all duration-200 ${isActive ? 'text-ember-400 scale-110 drop-shadow-[0_0_6px_rgba(249,89,26,0.6)]' : 'group-hover:scale-110'}`} />
                          {!isCollapsed && <span className={isActive ? 'font-semibold' : ''}>{item.label}</span>}
                        </div>
                        
                        {/* Feature #23 - Pending targets badge */}
                        {item.to === '/targets' && pendingTargetsCount > 0 && !isCollapsed && (
                          <span className="bg-ember-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center shadow-[0_0_8px_rgba(249,89,26,0.5)]">
                            {pendingTargetsCount}
                          </span>
                        )}
                        {item.to === '/targets' && pendingTargetsCount > 0 && isCollapsed && (
                          <span className="absolute top-1.5 right-2 w-2 h-2 bg-ember-500 rounded-full shadow-[0_0_6px_rgba(249,89,26,0.8)]" />
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            ))}
          </div>
        </nav>

        <div className="p-3 border-t border-base-800/60">
          {!isCollapsed ? (
            <div className="flex items-center gap-3 px-1">
              <div className="w-8 h-8 rounded-full bg-ember-gradient flex items-center justify-center text-white font-display font-bold shrink-0 shadow-[0_0_12px_rgba(249,89,26,0.3)]">
                {user?.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-ash-100 font-medium truncate">{user?.name}</p>
                <p className="text-[10px] text-ash-500 truncate">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                title="Log Out"
                className="text-ash-500 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-950/20"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-ember-gradient flex items-center justify-center text-white font-display font-bold shrink-0">
                {user?.name.charAt(0).toUpperCase()}
              </div>
            </div>
          )}
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <TopNavbar />
        <main className="flex-1 overflow-y-auto relative pb-20 md:pb-0 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation (#19) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-base-950/95 backdrop-blur-xl border-t border-base-800/60 flex items-center justify-around px-2 py-2">
        {navItems.slice(0, 5).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-ember-400'
                  : 'text-ash-500 hover:text-ash-200'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={`w-5 h-5 ${isActive ? 'drop-shadow-[0_0_6px_rgba(249,89,26,0.8)]' : ''}`} />
                <span className="text-[9px] font-medium">{item.label.split(' ')[0]}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

