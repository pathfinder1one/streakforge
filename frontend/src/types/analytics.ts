export interface HeatmapData {
  date: string
  count: number
}

export interface CategoryStat {
  category: string
  count: number
}

export interface PriorityStat {
  priority: string
  count: number
}

export interface AnalyticsResponse {
  heatmap: HeatmapData[]
  by_category: CategoryStat[]
  by_priority: PriorityStat[]
  best_time_of_day?: string
  most_frequent_mood?: string
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  is_unlocked: boolean
  progress_percentage: number
}
