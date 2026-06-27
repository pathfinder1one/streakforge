import { useState, useRef } from 'react'
import { Trophy, Medal, Star, Flame, Calendar, Clock, Edit2, Check, X, Users, Upload, Shield, Crown, Zap, TrendingUp, Camera, ShoppingBag } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { format } from 'date-fns'
import api from '@/services/api'
import toast from 'react-hot-toast'
import Button from '@/components/common/Button'
import { uploadAvatar } from '@/services/auth.service'
import { getAssetUrl } from '@/utils/url'
import TrophyRoom from '@/components/profile/TrophyRoom'

const LEVEL_TITLES = [
  'Spark', 'Ember', 'Flame', 'Blaze', 'Inferno',
  'Pyromancer', 'Fire Lord', 'Dragon', 'Phoenix', 'Legend',
]

function getLevelTitle(level: number): string {
  return LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)] || 'Legend'
}

export default function Profile() {
  const user = useAuthStore((s) => s.user)
  const fetchProfile = useAuthStore((s) => s.fetchProfile)
  const [buying, setBuying] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    try {
      setUploading(true)
      await uploadAvatar(file)
      await fetchProfile()
    } catch (error) {
      console.error('Error uploading avatar:', error)
    } finally {
      setUploading(false)
    }
  }

  if (!user) return null

  const xpForNextLevel = user.level * 100
  const xpPct = Math.min(100, (user.xp / xpForNextLevel) * 100)

  const handleBuyFreeze = async () => {
    if (user.coins < 100 || user.streak_freezes >= 5) return
    try {
      setBuying(true)
      await api.post('/user/buy-freeze')
      await fetchProfile()
    } catch (e) {
      console.error('Error buying freeze:', e)
    } finally {
      setBuying(false)
    }
  }

  return (
    <div className="px-6 py-8 w-full max-w-6xl mx-auto">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="font-display font-semibold text-2xl text-ash-100">Profile</h1>
        <p className="text-ash-400 text-sm mt-1">Your forge stats, badges and shop.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column */}
        <div className="w-full lg:w-80 shrink-0 space-y-5">
          {/* Identity Card */}
          <div className="rounded-2xl bg-base-900 border border-base-800 p-6 flex flex-col items-center text-center">
            <div 
              onClick={handleAvatarClick}
              className="relative w-20 h-20 rounded-full bg-base-950 border-2 border-base-800 flex items-center justify-center text-ash-400 font-display font-bold text-2xl mb-4 group cursor-pointer overflow-hidden"
            >
              {user.avatar_url ? (
                <img src={getAssetUrl(user.avatar_url)} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-5 h-5 text-white" />
              </div>
              {uploading && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-ember-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />
            <h2 className="font-display font-bold text-xl text-ash-100">{user.name}</h2>
            <p className="text-ash-400 text-sm mt-1">{user.email}</p>

            {/* Level badge */}
            <div className="mt-4 flex items-center gap-1.5 px-3 py-1 bg-ember-500/10 rounded-full border border-ember-500/20">
              <Star className="w-3.5 h-3.5 text-ember-500" fill="currentColor" />
              <span className="text-ember-500 text-xs font-bold uppercase tracking-wider">Level {user.level} · {getLevelTitle(user.level)}</span>
            </div>

            {/* XP bar */}
            <div className="w-full mt-6">
              <div className="flex justify-between text-[10px] text-ash-500 font-medium uppercase tracking-wider mb-2">
                <span>{user.xp} XP</span>
                <span>{xpForNextLevel} XP</span>
              </div>
              <div className="w-full bg-base-800 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-ember-500 h-1.5 rounded-full transition-all duration-1000"
                  style={{ width: `${xpPct}%` }}
                ></div>
              </div>
            </div>

            {/* Coins */}
            <div className="mt-6 pt-6 border-t border-base-800 w-full flex items-center justify-center gap-2">
              <span className="text-yellow-500 text-lg">🪙</span> 
              <span className="font-bold text-ash-100">{user.coins} Coins</span>
            </div>
          </div>

          {/* Streak Stats */}
          <div className="rounded-2xl bg-base-900 border border-base-800 p-5">
            <h2 className="font-display font-semibold text-xs text-ash-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5 text-ember-500" />
              Streak Stats
            </h2>
            <div className="space-y-3">
              {[
                { icon: Flame, label: 'Current Streak', value: `${user.current_streak} days`, color: 'text-ember-500' },
                { icon: Trophy, label: 'Longest Streak', value: `${user.longest_streak} days`, color: 'text-yellow-500' },
                { icon: Zap, label: 'Streak Freezes', value: `${user.streak_freezes} / 5`, color: 'text-blue-500' },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="flex items-center justify-between p-3 rounded-xl bg-base-950/50 border border-base-800">
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${color}`} />
                    <span className="text-sm text-ash-300">{label}</span>
                  </div>
                  <span className="text-sm font-bold text-ash-100">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Forge Shop */}
          <div className="rounded-2xl bg-base-900 border border-base-800 p-5">
            <h2 className="font-display font-semibold text-xs text-ash-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <ShoppingBag className="w-3.5 h-3.5 text-yellow-500" />
              Forge Shop
            </h2>

            <div className="bg-base-950/50 rounded-xl p-4 border border-base-800">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-ash-100">Streak Freeze</p>
                    <p className="text-[10px] text-ash-400 mt-0.5">Protects your streak for 1 day</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-yellow-500">100 🪙</p>
                  <p className="text-[10px] text-ash-500 mt-0.5">{user.streak_freezes}/5 owned</p>
                </div>
              </div>

              {/* Freeze slots visual */}
              <div className="flex gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div 
                    key={i} 
                    className={`flex-1 h-1.5 rounded-full transition-colors ${i < user.streak_freezes ? 'bg-blue-500' : 'bg-base-800'}`}
                  />
                ))}
              </div>

              <button
                onClick={handleBuyFreeze}
                disabled={buying || user.coins < 100 || user.streak_freezes >= 5}
                className="w-full py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors
                  bg-blue-500 hover:bg-blue-600 text-white
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-500"
              >
                {buying ? 'Buying...' 
                  : user.streak_freezes >= 5 ? 'Max Reached'
                  : user.coins < 100 ? `Need ${100 - user.coins} more coins`
                  : 'Purchase Freeze'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex-1 min-w-0">
          <TrophyRoom />
        </div>
      </div>
    </div>
  )
}
