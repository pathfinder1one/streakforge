import { useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Gift, X, Sparkles } from 'lucide-react'
import api from '@/services/api'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import confetti from 'canvas-confetti'
import Button from '../common/Button'
import { triggerAchievementPopup } from '@/utils/achievementPopup'

export default function SpinWheel() {
  const [isOpen, setIsOpen] = useState(false)
  const [isSpinning, setIsSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [reward, setReward] = useState<{ type: string; amount: number } | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)
  
  const fetchProfile = useAuthStore(s => s.fetchProfile)

  const handleSpin = async () => {
    if (isSpinning) return
    setIsSpinning(true)
    setReward(null)

    try {
      const { data } = await api.post('/user/spin')
      
      // Calculate rotation
      const spins = 5 // Spin 5 times before stopping
      const extraDegrees = Math.floor(Math.random() * 360) // Random stop point
      const totalRotation = rotation + (spins * 360) + extraDegrees
      
      setRotation(totalRotation)
      
      // Wait for animation
      setTimeout(() => {
        setIsSpinning(false)
        setReward({ type: data.reward_type, amount: data.amount })
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } })
        
        // Trigger Achievement for High Roller
        if (data.reward_type === 'xp' && data.amount >= 20) {
          triggerAchievementPopup('High Roller', `Won ${data.amount} XP from the Daily Spin!`, '🎡')
        }
        
        fetchProfile() // refresh coins/xp
      }, 3000) // 3 seconds spin duration
      
    } catch (err: any) {
      setIsSpinning(false)
      toast.error(err.response?.data?.detail || 'Failed to spin')
      setIsOpen(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 text-yellow-400 hover:text-yellow-300 hover:scale-105 transition-all text-xs font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(234,179,8,0.2)]"
        title="Daily Spin!"
      >
        <Gift className="w-4 h-4 animate-bounce" />
        Daily Spin
      </button>

      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isOpen && (
            <div className="fixed inset-0 z-[100] overflow-y-auto p-4 flex">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => !isSpinning && setIsOpen(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />
              
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-base-900 border border-base-800 rounded-2xl p-6 md:p-8 max-w-sm w-full shadow-2xl mx-auto my-auto overflow-hidden"
              >
                <button
                  onClick={() => setIsOpen(false)}
                  disabled={isSpinning}
                  className="absolute top-4 right-4 text-ash-500 hover:text-ash-200 disabled:opacity-50 z-20"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="text-center mb-6">
                  <h2 className="text-2xl font-display font-bold text-ash-100 mb-1">Wheel of Fortune</h2>
                  <p className="text-ash-400 text-sm">Test your luck for a daily reward!</p>
                </div>

                {/* The Wheel */}
                <div className="relative w-56 h-56 mx-auto mb-6">
                  {/* Pointer */}
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[20px] border-t-ember-500 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" />
                  
                  <motion.div
                    className="w-full h-full rounded-full border-4 border-base-800 shadow-[0_0_30px_rgba(234,179,8,0.2)] bg-gradient-to-tr from-yellow-500/20 via-orange-500/20 to-red-500/20 flex items-center justify-center relative overflow-hidden"
                    animate={{ rotate: rotation }}
                    transition={{ duration: 3, ease: [0.15, 0.9, 0.2, 1] }}
                  >
                    {/* Basic segmented look */}
                    <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0_60deg,rgba(0,0,0,0.2)_60deg_120deg,transparent_120deg_180deg,rgba(0,0,0,0.2)_180deg_240deg,transparent_240deg_300deg,rgba(0,0,0,0.2)_300deg_360deg)] opacity-50" />
                    
                    <div className="w-12 h-12 rounded-full bg-base-950 border-2 border-yellow-500/50 z-10 flex items-center justify-center shadow-inner relative">
                      <Sparkles className="w-5 h-5 text-yellow-500" />
                    </div>
                  </motion.div>
                </div>

                <div className="h-[70px] flex items-center justify-center text-center mb-4">
                  {reward ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <p className="text-lg font-semibold text-ash-100">You won!</p>
                      <p className="text-3xl font-display font-bold text-yellow-400 mt-1">
                        {reward.amount} {reward.type.toUpperCase()}
                      </p>
                    </motion.div>
                  ) : null}
                </div>

                <Button
                  onClick={handleSpin}
                  disabled={isSpinning || reward !== null}
                  className="w-full font-bold text-lg py-3"
                >
                  {isSpinning ? 'Spinning...' : reward ? 'Come back tomorrow!' : 'Spin Now!'}
                </Button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  )
}
