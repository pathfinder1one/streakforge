import api from './api'

export async function getAnalytics() {
  const { data } = await api.get('/analytics')
  return data
}

export async function getWeeklyAnalytics() {
  const { data } = await api.get('/analytics/weekly')
  return data
}

export async function getMonthlyAnalytics() {
  const { data } = await api.get('/analytics/monthly')
  return data
}

export async function getAIInsights() {
  const { data } = await api.get('/ai/insights')
  return data
}

export async function logMetric(targetId: number, value: number, note?: string) {
  const { data } = await api.post(`/targets/${targetId}/log-metric`, { value, note })
  return data
}

export async function failNegativeTarget(targetId: number) {
  const { data } = await api.post(`/targets/${targetId}/fail-today`)
  return data
}

export async function exportCalendarICS(): Promise<Blob> {
  const { data } = await api.get('/calendar/export.ics', { responseType: 'blob' })
  return data
}
