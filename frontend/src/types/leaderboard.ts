export interface LeaderboardEntry {
  rank: number
  user_id: number
  name: string
  current_streak: number
  longest_streak: number
  level: number
  xp: number
  coins: number
  is_me: boolean
  avatar_url?: string | null
}

export interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[]
  my_rank: number | null
  total_users: number
  sort_by: string
}

export type LeaderboardSortBy = 'current_streak' | 'longest_streak' | 'level' | 'total_xp'
