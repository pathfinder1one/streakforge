import { create } from 'zustand'
import type { Notification } from '@/types/notification'
import * as notifService from '@/services/notification.service'

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  fetch: () => Promise<void>
  markRead: (id: number) => Promise<void>
  markAllRead: () => Promise<void>
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetch: async () => {
    set({ isLoading: true })
    try {
      const res = await notifService.getNotifications()
      set({ notifications: res.notifications, unreadCount: res.unread_count })
    } finally {
      set({ isLoading: false })
    }
  },

  markRead: async (id: number) => {
    await notifService.markRead(id)
    set((s) => ({
      notifications: s.notifications.map((n) => n.id === id ? { ...n, is_read: true } : n),
      unreadCount: Math.max(0, s.unreadCount - 1),
    }))
  },

  markAllRead: async () => {
    await notifService.markAllRead()
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, is_read: true })),
      unreadCount: 0,
    }))
  },
}))
