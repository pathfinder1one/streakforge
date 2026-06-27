import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HeartPulse } from 'lucide-react'
import api from '@/services/api'
import toast from 'react-hot-toast'

const MOODS = [
  { label: 'Great', emoji: '🤩', color: 'from-green-500 to-emerald-600' },
  { label: 'Good', emoji: '😊', color: 'from-blue-400 to-blue-600' },
  { label: 'Okay', emoji: '😐', color: 'from-yellow-400 to-yellow-600' },
  { label: 'Bad', emoji: '😔', color: 'from-orange-400 to-orange-600' },
  { label: 'Awful', emoji: '😫', color: 'from-red-500 to-red-700' },
]

export default function MoodTracker() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDone, setIsDone] = useState(false)

  const handleMoodSelect = async (mood: string) => {
    setSelectedMood(mood)
    setIsSubmitting(true)
    try {
      await api.post(`/user/mood?mood=${mood}`)
      toast.success('Mood logged for today!')
      setIsDone(true)
    } catch (error) {
      toast.error('Failed to log mood')
      setSelectedMood(null)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isDone) {
    return (
      <div className="bg-base-900/60 backdrop-blur-xl border border-base-800/60 rounded-2xl p-6 text-center shadow-sm">
        <HeartPulse className="w-8 h-8 text-ember-500 mx-auto mb-2" />
        <p className="text-ash-100 font-medium">Mood logged successfully!</p>
        <p className="text-xs text-ash-400 mt-1">Keep it up. We'll track your emotional journey.</p>
      </div>
    )
  }

  return (
    <div className="bg-base-900/60 backdrop-blur-xl border border-base-800/60 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <HeartPulse className="w-5 h-5 text-ember-500" />
        <h3 className="font-semibold text-ash-100">How are you feeling today?</h3>
      </div>
      
      <div className="flex justify-between items-center gap-2">
        {MOODS.map((m) => (
          <motion.button
            key={m.label}
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleMoodSelect(m.label)}
            disabled={isSubmitting}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
              selectedMood === m.label ? 'bg-base-800 ring-2 ring-ember-500/50' : 'hover:bg-base-800/50'
            }`}
          >
            <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${m.color} flex items-center justify-center text-2xl shadow-inner`}>
              {m.emoji}
            </div>
            <span className="text-[10px] font-medium text-ash-400">{m.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
