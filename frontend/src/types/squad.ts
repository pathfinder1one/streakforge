export interface SquadMember {
  user_id: number
  name: string
  role: 'owner' | 'member'
  current_streak: number
  longest_streak: number
  level: number
  xp: number
  joined_at: string
}

export interface Squad {
  id: number
  name: string
  description: string | null
  invite_code: string
  created_by: number
  member_count: number
  members: SquadMember[]
}

export interface SquadLeaderboardEntry {
  rank: number
  user_id: number
  name: string
  current_streak: number
  longest_streak: number
  level: number
  xp: number
  is_me: boolean
  coins?: number
}
