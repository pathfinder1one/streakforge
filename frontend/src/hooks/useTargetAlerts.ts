import { useEffect, useRef } from 'react'
import { useAuthStore } from '@/store/authStore'
import api from '@/services/api'
import type { Target } from '@/types/target'

export function useTargetAlerts() {
  const token = useAuthStore((s) => s.token)
  const alertedTargets = useRef<Set<number>>(new Set())

  useEffect(() => {
    if (!token) return

    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    const checkAlerts = async () => {
      try {
        const res = await api.get('/dashboard')
        const targets: Target[] = res.data.targets_today

        const now = new Date()
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

        targets.forEach(target => {
          if (target.alert_time === currentTime && !target.is_completed_today) {
            if (!alertedTargets.current.has(target.id)) {
              alertedTargets.current.add(target.id)
              
              if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('Target Reminder', {
                  body: `Time to complete your target: ${target.title}!`,
                })
              } else {
                import('react-hot-toast').then(({ default: toast }) => {
                  toast.success(`Reminder: It's time to work on "${target.title}"!`, {
                    duration: 10000,
                    icon: '⏰'
                  })
                })
              }
            }
          }
        })
      } catch (e) {
        console.error('Failed to fetch targets for alerts', e)
      }
    }

    // Check initially
    checkAlerts()
    
    // Check every minute
    const intervalId = setInterval(checkAlerts, 60000)

    return () => {
      clearInterval(intervalId)
    }
  }, [token])
}
