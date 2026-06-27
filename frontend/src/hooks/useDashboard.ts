import { useState, useEffect, useCallback } from 'react'
import type { DashboardResponse } from '@/types/streak'
import * as dashboardService from '@/services/dashboard.service'

export function useDashboard() {
  const [data, setData] = useState<DashboardResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      const res = await dashboardService.getDashboard()
      setData(res)
      setError(null)
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? 'Failed to load dashboard')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { data, isLoading, error, refresh }
}
