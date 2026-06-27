import { useEffect } from 'react'
import { getPendingReminders } from '@/services/notification.service'

let shownReminders = new Set<string>()

export function useReminders() {
  useEffect(() => {
    // Request notification permission on first use
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    const check = async () => {
      if (!('Notification' in window) || Notification.permission !== 'granted') return
      try {
        const { reminders } = await getPendingReminders()
        for (const reminder of reminders) {
          const key = `${reminder.target_id}-${reminder.alert_time}-${new Date().toDateString()}`
          if (!shownReminders.has(key)) {
            shownReminders.add(key)
            new Notification(`⏰ StreakForge Reminder`, {
              body: `Time to work on: ${reminder.title}`,
              icon: '/icon-192.png',
              tag: key,
            })
          }
        }
      } catch {
        // Silently fail if API not reachable
      }
    }

    check()
    const id = setInterval(check, 60_000)
    return () => clearInterval(id)
  }, [])
}
