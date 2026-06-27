import { useEffect, useState } from 'react'
import { CalendarDays } from 'lucide-react'
import { AnalyticsResponse } from '@/types/analytics'
import api from '@/services/api'
import { motion } from 'framer-motion'

export default function ActivityHeatmap() {
  const [data, setData] = useState<AnalyticsResponse['heatmap']>([])

  useEffect(() => {
    api.get('/analytics').then((res) => setData(res.data.heatmap)).catch(console.error)
  }, [])

  // Create a 365-day array mapping dates to counts
  const today = new Date()
  const days: { date: Date; dateStr: string }[] = Array.from({ length: 365 }).map((_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (364 - i))
    return { date: d, dateStr: d.toISOString().split('T')[0] }
  })

  // Group by month and then by weeks
  const monthsData: { monthName: string; weeks: typeof days[] }[] = []
  
  let currentMonthStr = ''
  let currentMonthIndex = -1

  days.forEach((dayObj) => {
    const monthStr = `${dayObj.date.getFullYear()}-${dayObj.date.getMonth()}`
    
    if (monthStr !== currentMonthStr) {
      currentMonthStr = monthStr
      monthsData.push({
        monthName: dayObj.date.toLocaleString('default', { month: 'short' }),
        weeks: [],
      })
      currentMonthIndex++
    }
    
    const monthObj = monthsData[currentMonthIndex]
    
    if (monthObj.weeks.length === 0 || dayObj.date.getDay() === 0) {
      // Start a new week if it's Sunday (0) or first day of the month
      monthObj.weeks.push([dayObj])
    } else {
      // Add to current week
      monthObj.weeks[monthObj.weeks.length - 1].push(dayObj)
    }
  })

  const countMap = new Map(data.map((item) => [item.date, item.count]))

  const getColor = (count: number) => {
    if (count === 0) return 'bg-base-800'
    if (count === 1) return 'bg-ember-900'
    if (count <= 3) return 'bg-ember-600'
    return 'bg-ember-400'
  }

  return (
    <motion.div 
      whileHover={{ scale: 1.01, y: -2 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border p-6 flex flex-col mt-6 shadow-sm transition-all duration-300 bg-gradient-to-br from-base-950 to-base-900 border-ember-500/20 border hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(234,63,12,0.15)] hover:border-ember-500/50"
    >
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-lg bg-base-800 flex items-center justify-center">
          <CalendarDays className="w-4 h-4 text-ash-300" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-ash-100">Activity Heatmap</h3>
          <p className="text-[10px] text-ash-500">Your tracking consistency over the last year</p>
        </div>
      </div>
      
      <div className="flex flex-col overflow-x-auto pb-4 scrollbar-thin">
        <div className="min-w-max">
          
          <div className="flex">
            {/* Day Labels (Mon, Wed, Fri) */}
            <div className="flex flex-col gap-[3px] text-[10px] text-ash-500 pr-3 mt-[1px] w-[30px] shrink-0 font-medium">
              <div className="h-3.5 flex items-center justify-end"></div>
              <div className="h-3.5 flex items-center justify-end">Mon</div>
              <div className="h-3.5 flex items-center justify-end"></div>
              <div className="h-3.5 flex items-center justify-end">Wed</div>
              <div className="h-3.5 flex items-center justify-end"></div>
              <div className="h-3.5 flex items-center justify-end">Fri</div>
              <div className="h-3.5 flex items-center justify-end"></div>
            </div>

            {/* Heatmap Grid Grouped by Months */}
            <div className="flex gap-4">
              {monthsData.map((month, mIndex) => (
                <div key={mIndex} className="flex flex-col">
                  {/* Grid for this month */}
                  <div className="flex gap-[3px]">
                    {month.weeks.map((week, wIndex) => (
                      <div key={wIndex} className="flex flex-col gap-[3px] shrink-0">
                        {/* Pad empty days at the start of the first week */}
                        {wIndex === 0 && Array.from({ length: week[0].date.getDay() }).map((_, j) => (
                          <div key={`empty-start-${j}`} className="w-3.5 h-3.5 bg-transparent" />
                        ))}
                        
                        {week.map((dayObj) => {
                          const count = countMap.get(dayObj.dateStr) || 0
                          return (
                            <div
                              key={dayObj.dateStr}
                              title={`${dayObj.dateStr}: ${count} targets completed`}
                              className={`w-3.5 h-3.5 rounded-[3px] ${getColor(count)} transition-all duration-200 hover:ring-1 hover:ring-ash-300 hover:scale-125 hover:z-10`}
                            />
                          )
                        })}

                        {/* Pad empty days at the end of the last week */}
                        {wIndex === month.weeks.length - 1 && Array.from({ length: 6 - week[week.length - 1].date.getDay() }).map((_, j) => (
                          <div key={`empty-end-${j}`} className="w-3.5 h-3.5 bg-transparent" />
                        ))}
                      </div>
                    ))}
                  </div>

                  {/* Month Label at bottom */}
                  <div className="text-[10px] font-medium text-ash-500 mt-3 ml-1">
                    {month.monthName}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      <div className="flex justify-end items-center mt-2 text-[10px] text-ash-400 gap-2 font-medium">
        <span>Less</span>
        <div className="w-3 h-3 rounded-[3px] bg-base-800" />
        <div className="w-3 h-3 rounded-[3px] bg-ember-900" />
        <div className="w-3 h-3 rounded-[3px] bg-ember-600" />
        <div className="w-3 h-3 rounded-[3px] bg-ember-400" />
        <span>More</span>
      </div>
    </motion.div>
  )
}
