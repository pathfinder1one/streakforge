import api from './api'

export interface SuggestedTask {
  title: string
  category: string
  minimum_time: number
  priority: string
}

export interface ExecutedCommand {
  action: string
  target_id?: number
  detail?: string
}

export interface ChatResponse {
  message: string
  suggested_tasks: SuggestedTask[]
  created_tasks?: number[]
  executed_commands?: ExecutedCommand[]
}

export interface Recommendation {
  type: 'motivation' | 'tip' | 'insight' | 'challenge'
  icon: string
  title: string
  description: string
}

export const aiService = {
  async chat(message: string, createTasks = false): Promise<ChatResponse> {
    const res = await api.post('/ai/chat', {
      message,
      create_suggested_tasks: createTasks,
    })
    return res.data
  },

  async prioritize(targetIds: number[]): Promise<{ ordered_ids: number[] }> {
    const res = await api.post('/ai/prioritize', { target_ids: targetIds })
    return res.data
  },

  async planGoal(goal: string, days = 7, createTasks = false): Promise<{ tasks: SuggestedTask[], created_ids: number[] }> {
    const res = await api.post('/ai/plan-goal', { goal, days, create_tasks: createTasks })
    return res.data
  },

  async getRecommendations(): Promise<{ recommendations: Recommendation[] }> {
    const res = await api.get('/ai/recommendations')
    return res.data
  },

  async getCalendarMonth(year: number, month: number) {
    const res = await api.get(`/calendar/month?year=${year}&month=${month}`)
    return res.data
  },

  async getCalendarDay(dateStr: string) {
    const res = await api.get(`/calendar/day/${dateStr}`)
    return res.data
  },
}
