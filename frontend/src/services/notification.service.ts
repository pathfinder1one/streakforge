import api from './api'
import type { NotificationsResponse } from '@/types/notification'

export async function getNotifications(unreadOnly = false): Promise<NotificationsResponse> {
  const { data } = await api.get<NotificationsResponse>('/notifications', {
    params: { unread_only: unreadOnly },
  })
  return data
}

export async function markRead(id: number): Promise<void> {
  await api.post(`/notifications/${id}/read`)
}

export async function markAllRead(): Promise<void> {
  await api.post('/notifications/read-all')
}

export async function sendNudge(recipientId: number, message?: string): Promise<void> {
  await api.post('/notifications/nudge', { recipient_id: recipientId, message })
}

export async function sendCheer(recipientId: number, message?: string): Promise<void> {
  await api.post('/notifications/cheer', { recipient_id: recipientId, message })
}

export async function getPendingReminders(): Promise<{ reminders: { target_id: number; title: string; alert_time: string; category: string }[] }> {
  const { data } = await api.get('/notifications/pending-reminders')
  return data
}
