import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, Coins, Shield, Zap, Palette, Star, Check, Lock } from 'lucide-react'
import { getShopItems, buyItem, claimMonthlyReward } from '@/services/shop.service'
import { useAuthStore } from '@/store/authStore'
import type { ShopItem } from '@/types/shop'

const TYPE_ICONS: Record<string, React.ReactNode> = {
  streak_freeze: <Shield className="w-5 h-5" />,
  xp_boost: <Zap className="w-5 h-5" />,
  theme: <Palette className="w-5 h-5" />,
  avatar_frame: <Star className="w-5 h-5" />,
  badge_slot: <Star className="w-5 h-5" />,
}

const TYPE_COLORS: Record<string, string> = {
  streak_freeze: 'from-blue-600/30 to-blue-600/10 border-blue-500/30',
  xp_boost: 'from-yellow-600/30 to-yellow-600/10 border-yellow-500/30',
  theme: 'from-purple-600/30 to-purple-600/10 border-purple-500/30',
  avatar_frame: 'from-pink-600/30 to-pink-600/10 border-pink-500/30',
  badge_slot: 'from-green-600/30 to-green-600/10 border-green-500/30',
}

const TYPE_LABELS: Record<string, string> = {
  streak_freeze: 'Streak Freeze',
  xp_boost: 'XP Boost',
  theme: 'Theme',
  avatar_frame: 'Avatar Frame',
  badge_slot: 'Badge Slot',
}

function ShopItemCard({ item, onBuy, isBuying }: {
  item: ShopItem
  onBuy: (item: ShopItem) => void
  isBuying: boolean
}) {
  const gradientClass = TYPE_COLORS[item.item_type] || 'from-base-800 to-base-900 border-base-700'

  return (
    <motion.div
      layout
      whileHover={{ scale: 1.02, y: -2 }}
      className={`relative bg-gradient-to-b ${gradientClass} border rounded-2xl p-5 flex flex-col gap-4 overflow-hidden`}
    >
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

      {/* OWNED badge (#12) */}
      {item.is_purchased && (
        <div className="absolute top-3 right-3 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-[0_0_10px_rgba(34,197,94,0.5)] z-10">
          ✓ OWNED
        </div>
      )}

      {/* Badge */}
      <div className="flex items-start justify-between">
        <span className={`text-4xl`}>{item.icon || '📦'}</span>
        <span className="text-xs font-medium bg-base-900/60 text-ash-400 rounded-full px-2 py-1 backdrop-blur-sm">
          {TYPE_LABELS[item.item_type]}
        </span>
      </div>

      <div className="flex-1">
        <h3 className="font-semibold text-ash-50 text-lg leading-tight">{item.name}</h3>
        <p className="text-ash-400 text-sm mt-1 leading-relaxed">{item.description}</p>
      </div>

      {/* Price & Action */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 bg-base-900/50 rounded-lg px-3 py-1.5">
          <span className="text-yellow-400">🪙</span>
          <span className="font-bold text-yellow-300">{item.price}</span>
        </div>

        <button
          onClick={() => !item.is_purchased && item.can_afford && onBuy(item)}
          disabled={item.is_purchased || !item.can_afford || isBuying}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-semibold text-sm transition-all ${
            item.is_purchased
              ? 'bg-green-500/20 text-green-400 cursor-default'
              : item.can_afford
              ? 'bg-ember-500 hover:bg-ember-400 text-white cursor-pointer active:scale-95'
              : 'bg-base-800 text-ash-500 cursor-not-allowed'
          }`}
        >
          {item.is_purchased ? (
            <><Check className="w-4 h-4" /> Owned</>
          ) : item.can_afford ? (
            isBuying ? (
              <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              'Buy Now'
            )
          ) : (
            <><Lock className="w-3 h-3" /> Need More Coins</>
          )}
        </button>
      </div>
    </motion.div>
  )
}

export default function Shop() {
  const { user, fetchProfile } = useAuthStore()
  const [items, setItems] = useState<ShopItem[]>([])
  const [coins, setCoins] = useState(user?.coins || 0)
  const [isLoading, setIsLoading] = useState(true)
  const [buyingId, setBuyingId] = useState<number | null>(null)
  const [claiming, setClaiming] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('all')

  const handleClaimReward = async () => {
    setClaiming(true)
    try {
      const res = await claimMonthlyReward()
      setCoins(res.coins_remaining)
      setToast(res.detail)
      await fetchProfile()
    } catch (err: any) {
      setToast(err?.response?.data?.detail || 'Failed to claim reward')
    } finally {
      setClaiming(false)
      setTimeout(() => setToast(null), 3000)
    }
  }

  const hasClaimedThisMonth = () => {
    if (!user?.last_monthly_reward_claim) return false;
    const lastClaim = new Date(user.last_monthly_reward_claim);
    const now = new Date();
    return lastClaim.getFullYear() === now.getFullYear() && lastClaim.getMonth() === now.getMonth();
  }

  const load = () => {
    setIsLoading(true)
    getShopItems().then((res) => {
      setItems(res.items)
      setCoins(res.coins)
      setIsLoading(false)
    }).catch(() => setIsLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleBuy = async (item: ShopItem) => {
    setBuyingId(item.id)
    try {
      const res = await buyItem(item.id)
      setCoins(res.coins_remaining)
      setToast(`${item.icon || '🎁'} Purchased "${item.name}" successfully!`)
      await fetchProfile()
      load()
    } catch (err: any) {
      setToast(err?.response?.data?.detail || 'Purchase failed')
    } finally {
      setBuyingId(null)
      setTimeout(() => setToast(null), 3000)
    }
  }

  const filteredItems = filter === 'all' ? items : items.filter((i) => i.item_type === filter)

  const FILTER_TABS = [
    { value: 'all', label: 'All' },
    { value: 'streak_freeze', label: '🛡️ Freezes' },
    { value: 'xp_boost', label: '⚡ Boosts' },
    { value: 'theme', label: '🎨 Themes' },
    { value: 'avatar_frame', label: '⭐ Frames' },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-base-800 border border-ember-500/40 text-ash-50 px-6 py-3 rounded-xl shadow-2xl"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShoppingBag className="w-7 h-7 text-ember-400" />
          <div>
            <h1 className="text-2xl font-bold text-ash-50">Forge Shop</h1>
            <p className="text-ash-500 text-sm">Spend your Forge Coins on upgrades</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-4 py-2">
          <span className="text-xl">🪙</span>
          <span className="font-bold text-yellow-300 text-lg">{coins.toLocaleString()}</span>
          <span className="text-ash-500 text-sm">coins</span>
        </div>
      </div>

      {/* Monthly Reward Banner */}
      <div className="bg-gradient-to-r from-yellow-600/20 to-ember-600/20 border border-yellow-500/30 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center border border-yellow-500/40 shrink-0 shadow-inner">
            <span className="text-2xl drop-shadow-md">🎁</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-ash-50 tracking-wide">Monthly Free Coins</h3>
            <p className="text-yellow-500/80 text-sm font-medium mt-0.5">Claim your 500 free Forge Coins every month!</p>
          </div>
        </div>
        <button
          onClick={handleClaimReward}
          disabled={claiming || hasClaimedThisMonth()}
          className={`px-6 py-3 rounded-xl font-bold uppercase tracking-wider text-sm transition-all shadow-lg flex items-center gap-2 shrink-0 ${
            hasClaimedThisMonth()
              ? 'bg-base-900 text-ash-600 cursor-not-allowed shadow-none border border-base-800'
              : 'bg-gradient-to-r from-yellow-500 to-ember-500 hover:from-yellow-400 hover:to-ember-400 text-white hover:scale-105 active:scale-95 border border-yellow-400/50 hover:shadow-[0_0_20px_rgba(234,179,8,0.4)]'
          }`}
        >
          {claiming ? (
             <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : hasClaimedThisMonth() ? (
            <><Check className="w-4 h-4" /> Claimed for {new Date().toLocaleString('default', { month: 'long' })}</>
          ) : (
            'Claim 500 🪙'
          )}
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              filter === tab.value
                ? 'bg-ember-500 text-white'
                : 'bg-base-900 border border-base-800 text-ash-400 hover:text-ash-200 hover:border-base-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-56 rounded-2xl animate-pulse border bg-gradient-to-br from-base-950 to-base-900 border-ember-500/20 border hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(234,63,12,0.15)] hover:border-ember-500/50 transition-all duration-300 shadow-sm" />
          ))}
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredItems.map((item) => (
              <ShopItemCard
                key={item.id}
                item={item}
                onBuy={handleBuy}
                isBuying={buyingId === item.id}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {!isLoading && filteredItems.length === 0 && (
        <div className="text-center py-16 text-ash-500">
          <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No items in this category</p>
        </div>
      )}
    </div>
  )
}
