import { useEffect, useState } from 'react'
import type { HistoryResponse } from '@/types/streak'
import * as dashboardService from '@/services/dashboard.service'
import HistoryCard from '@/components/history/HistoryCard'
import CalendarView from '@/components/history/CalendarView'
import Loader from '@/components/common/Loader'

export default function History() {
  const [data, setData] = useState<HistoryResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    dashboardService
      .getHistory()
      .then(setData)
      .catch((err) => setError(err?.response?.data?.detail ?? 'Failed to load history'))
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <div className="px-8 py-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="font-display font-semibold text-2xl text-ash-100">History</h1>
        <p className="text-ash-400 text-sm mt-1">Every day, tracked.</p>
      </div>

      {isLoading && <Loader label="Loading history..." />}
      {error && <div className="p-4 rounded-xl bg-red-950/30 border border-red-900/50 text-red-300 text-sm">{error}</div>}

      {data && !isLoading && (
        <div className="space-y-6">
          <HistoryCard
            totalCompletions={data.total_completions}
            totalTargets={data.total_targets}
            completionPercentage={data.completion_percentage}
          />
          <CalendarView entries={data.entries} />
        </div>
      )}
    </div>
  )
}
