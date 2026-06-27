import api from './api'
import type { DashboardResponse, StreakResponse, HistoryResponse } from '@/types/streak'

export async function getDashboard(): Promise<DashboardResponse> {
  const { data } = await api.get<DashboardResponse>('/dashboard')
  return data
}

export async function getStreak(): Promise<StreakResponse> {
  const { data } = await api.get<StreakResponse>('/streak')
  return data
}

export async function getHistory(): Promise<HistoryResponse> {
  const { data } = await api.get<HistoryResponse>('/history')
  return data
}
