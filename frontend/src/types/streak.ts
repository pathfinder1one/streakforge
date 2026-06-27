import type { Target } from './target'

export interface StreakResponse {
  current_streak: number
  longest_streak: number
}

export interface DashboardResponse {
  current_streak: number
  longest_streak: number
  streak_freezes: number
  completion_percentage: number
  total_today: number
  completed_today: number
  targets_today: Target[]
}

export interface HistoryEntry {
  date: string
  success: boolean
}

export interface HistoryResponse {
  entries: HistoryEntry[]
  total_completions: number
  total_targets: number
  completion_percentage: number
}
