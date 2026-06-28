import { useEffect, useState } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { PieChart as PieChartIcon, Target } from 'lucide-react'
import { motion } from 'framer-motion'
import { AnalyticsResponse } from '@/types/analytics'
import api from '@/services/api'

// StreakForge Premium Colors (Ember to Yellow to Blue)
const COLORS = ['#ea3f0c', '#f97316', '#eab308', '#3b82f6', '#8b5cf6']

export default function AnalyticsCharts() {
  const [data, setData] = useState<AnalyticsResponse | null>(null)

  useEffect(() => {
    api.get('/analytics').then((res) => setData(res.data)).catch(console.error)
  }, [])

  if (!data) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      {/* Category Pie Chart */}
      <motion.div 
        whileHover={{ scale: 1.02, y: -2 }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border p-6 shadow-sm transition-all duration-300 bg-gradient-to-br from-base-950 to-base-900 border-ember-500/20 border hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(234,63,12,0.15)] hover:border-ember-500/50"
      >
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-base-800 flex items-center justify-center">
            <PieChartIcon className="w-4 h-4 text-ash-300" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-ash-100">By Category</h3>
            <p className="text-[10px] text-ash-500">Distribution of all targets</p>
          </div>
        </div>

        <div className="h-56">
          {data.by_category.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.by_category}
                  dataKey="count"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={4}
                >
                  {data.by_category.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#181716', borderColor: '#262320', borderRadius: '12px', fontSize: '12px' }}
                  itemStyle={{ color: '#E9E5E0' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
             <div className="flex flex-col items-center justify-center h-full text-ash-600 gap-2">
               <PieChartIcon className="w-8 h-8 opacity-20" />
               <span className="text-xs">No data yet</span>
             </div>
          )}
        </div>
      </motion.div>

      {/* Priority Pie Chart */}
      <motion.div 
        whileHover={{ scale: 1.02, y: -2 }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border p-6 shadow-sm transition-all duration-300 bg-gradient-to-br from-base-950 to-base-900 border-ember-500/20 border hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(234,63,12,0.15)] hover:border-ember-500/50"
      >
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-base-800 flex items-center justify-center">
            <Target className="w-4 h-4 text-ash-300" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-ash-100">By Priority</h3>
            <p className="text-[10px] text-ash-500">How you prioritize your goals</p>
          </div>
        </div>

        <div className="h-56">
          {data.by_priority.length > 0 ? (
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={data.by_priority}
                   dataKey="count"
                   nameKey="priority"
                   cx="50%"
                   cy="50%"
                   innerRadius={55}
                   outerRadius={75}
                   paddingAngle={4}
                 >
                   {data.by_priority.map((_, index) => (
                     <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                   ))}
                 </Pie>
                 <Tooltip
                   contentStyle={{ backgroundColor: '#181716', borderColor: '#262320', borderRadius: '12px', fontSize: '12px' }}
                   itemStyle={{ color: '#E9E5E0' }}
                 />
                 <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
               </PieChart>
             </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-ash-600 gap-2">
               <Target className="w-8 h-8 opacity-20" />
               <span className="text-xs">No data yet</span>
             </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
