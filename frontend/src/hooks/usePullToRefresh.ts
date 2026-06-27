import { useState, useEffect } from 'react'

export function usePullToRefresh(onRefresh: () => Promise<void>) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  useEffect(() => {
    let startY = 0
    let currentY = 0
    let isPulling = false

    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        startY = e.touches[0].clientY
        isPulling = true
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling) return
      currentY = e.touches[0].clientY
      const pullDistance = currentY - startY
      
      // Visual feedback could be added here
      if (pullDistance > 80 && !isRefreshing) {
        setIsRefreshing(true)
        onRefresh().finally(() => {
          setIsRefreshing(false)
          isPulling = false
        })
      }
    }

    const handleTouchEnd = () => {
      isPulling = false
    }

    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: true })
    window.addEventListener('touchend', handleTouchEnd)

    return () => {
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [onRefresh, isRefreshing])

  return { isRefreshing }
}
