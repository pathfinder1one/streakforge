import { useState, useEffect } from 'react'
import { BrainCircuit } from 'lucide-react'
import { motion } from 'framer-motion'
import api from '@/services/api'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'

interface MoodData {
  mood_score: number
  mood_label: string
  completion_rate: number
  sample_count: number
}

interface MoodResponse {
  data: MoodData[]
  insight: string
  has_data: boolean
}

export default function MoodCorrelation() {
  const [data, setData] = useState<MoodResponse | null>(null)
  
  useEffect(() => {
    api.get('/analytics/mood-correlation').then(res => setData(res.data)).catch(console.error)
  }, [])

  if (!data) return <div className="skeleton h-48 w-full rounded-2xl" />

  return (
    <div className="bg-gradient-to-br from-base-800/60 to-base-900/80 backdrop-blur-xl border border-base-700/50 rounded-2xl p-6 shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-amber-500/10 rounded-xl">
          <BrainCircuit className="w-5 h-5 text-amber-500" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-ash-100">Mood vs Performance</h2>
          <p className="text-xs text-ash-400">How your feelings affect your streak</p>
        </div>
      </div>

      <div className="bg-amber-500/10 border border-amber-500/20 text-amber-200 text-sm p-4 rounded-xl mb-6 flex items-start gap-3 shadow-inner">
        <span className="text-xl">💡</span>
        <p className="font-medium pt-0.5">{data.insight}</p>
      </div>

      {data.has_data && (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#262320" vertical={false} />
              <XAxis dataKey="mood_label" tick={{fill: '#a89e93', fontSize: 12}} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => `${v * 100}%`} tick={{fill: '#a89e93', fontSize: 12}} axisLine={false} tickLine={false} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload as MoodData
                    return (
                      <div className="bg-base-800 border border-base-700 rounded-xl px-4 py-3 shadow-xl">
                        <p className="text-white font-bold mb-1">{d.mood_label} Mood</p>
                        <p className="text-amber-400 font-semibold text-sm">
                          Completion Rate: {Math.round(d.completion_rate * 100)}%
                        </p>
                        <p className="text-ash-400 text-xs mt-1">Based on {d.sample_count} days</p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Bar dataKey="completion_rate" radius={[6, 6, 0, 0]} fill="#f59e0b" maxBarSize={50} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
