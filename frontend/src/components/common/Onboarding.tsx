// @ts-nocheck
import { useState, useEffect } from 'react'
import { Joyride, Step, STATUS } from 'react-joyride'
import { useAuthStore } from '@/store/authStore'

export default function Onboarding() {
  const [run, setRun] = useState(false)
  const user = useAuthStore((s) => s.user)

  useEffect(() => {
    const hasSeen = localStorage.getItem('streakforge_onboarding')
    if (user && !hasSeen) {
      localStorage.setItem('streakforge_onboarding', 'true') // Mark as seen immediately
      const timer = setTimeout(() => setRun(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [user])

  const steps: Step[] = [
    {
      target: 'body',
      content: 'Welcome to StreakForge! Ready to crush your goals? Let’s take a quick tour.',
      placement: 'center',
    },
    {
      target: '[data-tour="today-targets"]',
      content: 'Here are your targets for today. Complete them to maintain your streak!',
      placement: 'bottom',
    },
    {
      target: '[data-tour="add-target"]',
      content: 'Click here to forge a new habit or target.',
      placement: 'bottom',
    },
    {
      target: '[data-tour="daily-spin"]',
      content: 'Don’t forget to spin the wheel daily for free XP and coins!',
      placement: 'bottom',
    },
    {
      target: '[data-tour="user-stats"]',
      content: 'Your current streak, level, and Forge Coins are displayed here.',
      placement: 'left',
    },
  ]

  const handleJoyrideCallback = (data: any) => {
    const { status } = data
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED]

    if (finishedStatuses.includes(status)) {
      setRun(false)
      localStorage.setItem('streakforge_onboarding', 'true')
    }
  }

  return (
    // @ts-ignore
    <Joyride
      steps={steps}
      run={run}
      continuous
      scrollToFirstStep
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      styles={{
        options: {
          arrowColor: '#1f2937',
          backgroundColor: '#1f2937',
          overlayColor: 'rgba(0, 0, 0, 0.75)',
          primaryColor: '#ea3f0c',
          textColor: '#f9fafb',
          zIndex: 1000,
        },
        tooltip: {
          borderRadius: '16px',
          border: '1px solid rgba(234, 63, 12, 0.2)',
          boxShadow: '0 0 20px rgba(234, 63, 12, 0.15)',
        },
        buttonNext: {
          borderRadius: '8px',
          fontWeight: 600,
        },
        buttonBack: {
          color: '#9ca3af',
        },
        buttonSkip: {
          color: '#9ca3af',
        },
      } as any}
    />
  )
}
