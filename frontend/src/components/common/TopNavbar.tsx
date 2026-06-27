import { useLocation, useNavigate, Link } from 'react-router-dom'
import { Search, HelpCircle, LogOut } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import NotificationBell from './NotificationBell'
import SpinWheel from '../dashboard/SpinWheel'
import { useAuthStore } from '@/store/authStore'
import { getAssetUrl } from '@/utils/url'

export default function TopNavbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const logout = useAuthStore((s) => s.logout)
  const user = useAuthStore((s) => s.user)

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <header className="h-16 shrink-0 border-b border-base-800/50 bg-gradient-to-r from-base-900/90 via-base-800/60 to-base-900/90 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-40 shadow-sm">
      <div className="flex items-center gap-4">
        {/* Intentionally left blank to avoid double titles with page headers */}
      </div>
      
      <div className="flex items-center gap-6">
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ash-500" />
          <input 
            type="text" 
            placeholder="Search tasks, squads..." 
            className="w-64 bg-base-900 border border-base-800 rounded-full pl-10 pr-4 py-1.5 text-sm text-ash-100 focus:outline-none focus:border-ember-500 transition-colors"
          />
        </div>
        
        <div className="flex items-center gap-3 md:border-l border-base-800 md:pl-6">
          <SpinWheel />
          <button className="text-ash-400 hover:text-ash-100 transition-colors p-1" title="Help & Docs">
            <HelpCircle className="w-5 h-5" />
          </button>
          <NotificationBell />
          <ThemeToggle />
          
          <button
            onClick={handleLogout}
            title="Log Out"
            className="flex items-center justify-center p-2 rounded-xl text-ash-400 hover:text-red-400 hover:bg-red-950/20 transition-all border border-transparent hover:border-red-900/30 shadow-sm"
          >
            <LogOut className="w-5 h-5" />
          </button>
          
          <Link to="/profile" className="w-8 h-8 rounded-full bg-ember-gradient flex items-center justify-center text-white font-display font-bold ml-2 shadow-sm hover:ring-2 hover:ring-ember-500/50 hover:scale-105 transition-all cursor-pointer overflow-hidden" title="Go to Profile">
            {user?.avatar_url ? (
              <img src={getAssetUrl(user.avatar_url)} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              user?.name?.charAt(0).toUpperCase()
            )}
          </Link>
        </div>
      </div>
    </header>
  )
}
