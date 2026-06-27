import api from './api'
import type { LeaderboardResponse, LeaderboardSortBy } from '@/types/leaderboard'

export async function getGlobalLeaderboard(sortBy: LeaderboardSortBy = 'current_streak', limit = 50): Promise<LeaderboardResponse> {
  const { data } = await api.get<LeaderboardResponse>('/leaderboard/global', {
    params: { sort_by: sortBy, limit },
  })
  return data
}

export async function getSquadLeaderboard(squadId: number, sortBy: LeaderboardSortBy = 'current_streak') {
  const { data } = await api.get(`/leaderboard/squad/${squadId}`, {
    params: { sort_by: sortBy },
  })
  return data
}
