export interface RegisterPayload {
  name: string
  email: string
  password: string
  tz_offset_minutes: number
}

export interface LoginPayload {
  email: string
  password: string
}

export interface TokenResponse {
  access_token: string
  token_type: string
}

export interface UserProfile {
  id: number
  name: string
  email: string
  current_streak: number
  longest_streak: number
  streak_freezes: number
  xp: number
  level: number
  coins: number
  avatar_url?: string
  last_monthly_reward_claim?: string
  tz_offset_minutes: number
  user_persona?: string
  is_demo?: boolean
  referral_code?: string
}
