export type Category = 'Study' | 'Coding' | 'Reading' | 'Health' | 'Personal'
export type Priority = 'High' | 'Medium' | 'Low'
export type Frequency = 'Daily' | 'Weekly' | 'One Time'
export type TargetType = 'positive' | 'negative'

export interface Target {
  id: number
  title: string
  link: string | null
  category: Category
  priority: Priority
  minimum_time: number
  frequency: Frequency
  scheduled_date: string | null
  alert_time: string | null
  is_active: boolean
  created_at: string
  seconds_spent_today: number
  is_completed_today: boolean
  can_complete: boolean
  subtasks: Subtask[]
  target_type: TargetType
  metric_unit: string | null
  metric_goal: number | null
  metric_logged_today: number
  is_failed_today: boolean
  deadline_date: string | null
}

export interface Subtask {
  id: number
  title: string
  is_completed: boolean
  created_at: string
}

export interface TargetCreatePayload {
  title: string
  link?: string | null
  category: Category
  priority: Priority
  minimum_time: number
  frequency: Frequency
  scheduled_date?: string | null
  alert_time?: string | null
  subtasks?: Partial<Subtask>[]
  target_type?: TargetType
  metric_unit?: string | null
  metric_goal?: number | null
  deadline_date?: string | null
}

export type TargetUpdatePayload = Partial<TargetCreatePayload> & {
  is_active?: boolean
  subtasks?: Partial<Subtask>[]
}

export interface SessionStartResponse {
  session_id: number
  started_at: string
}

export interface SessionEndResponse {
  session_id: number
  duration_seconds: number
  completed: boolean
}
