import { useState, useEffect } from 'react'
import { Sparkles, RefreshCw, Loader2, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { mlService } from '@/services/ml.service'

interface MLRecommendation {
  title: string
  category: string
  priority: string
  description: string
  match_score: number
}

export default function AIRecommendations() {
  const [recs, setRecs] = useState<MLRecommendation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function loadRecs() {
    setIsLoading(true)
    setError(null)
    try {
      const data = await mlService.getRecommendations()
      setRecs(data.recommendations)
    } catch {
      setError('Could not load ML recommendations')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadRecs() }, [])

  return (
    <motion.div whileHover={{ scale: 1.01, y: -2 }} className="rounded-2xl border p-5 transition-all duration-300 bg-gradient-to-br from-base-950 to-base-900 border-ember-500/20 hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(234,63,12,0.15)] hover:border-ember-500/50 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-ember-gradient flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-ash-100">Smart Habits</h3>
            <p className="text-[10px] text-ash-500">Based on ML Correlation</p>
          </div>
        </div>
        <button
          onClick={loadRecs}
          disabled={isLoading}
          className="text-ash-500 hover:text-ember-400 transition-colors"
          title="Refresh recommendations"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 text-ember-400 animate-spin" />
        </div>
      )}

      {error && !isLoading && (
        <p className="text-sm text-red-400 text-center py-4">{error}</p>
      )}

      {!isLoading && !error && (
        <div className="space-y-3">
          {recs.map((rec, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.01, x: 2 }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-xl border border-base-800 bg-base-950 p-3.5 hover:border-ember-500/30 transition-all duration-300"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ash-100">{rec.title}</p>
                  <p className="text-xs text-ash-400 mt-0.5 leading-relaxed line-clamp-2">{rec.description}</p>
                </div>
                <div className="text-[10px] font-bold text-ember-500 bg-ember-500/10 px-2 py-1 rounded-md shrink-0">
                  {rec.match_score}% Match
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-[10px] font-bold text-ash-500 bg-base-900 px-2 py-0.5 rounded-md">{rec.category}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${rec.priority === 'High' ? 'text-ember-400 bg-ember-500/10' : 'text-ash-500 bg-base-900'}`}>
                  {rec.priority} Priority
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
