export interface Notification {
  id: number
  type: 'nudge' | 'cheer' | 'system' | 'achievement' | 'level_up'
  title: string
  message: string
  icon: string | null
  sender_name: string
  is_read: boolean
  created_at: string
}

export interface NotificationsResponse {
  notifications: Notification[]
  unread_count: number
}
