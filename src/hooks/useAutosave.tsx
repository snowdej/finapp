import { useEffect, useRef } from 'react'
import { savePlan } from '../services/storage'

export function useAutosave(plan: any, enabled: boolean, delay: number = 2000) {
  const timeoutRef = useRef<NodeJS.Timeout>()
  const previousPlanRef = useRef<string>()

  useEffect(() => {
    if (!enabled || !plan) {
      return
    }

    const currentPlanString = JSON.stringify(plan)
    
    // Don't save if plan hasn't changed
    if (previousPlanRef.current === currentPlanString) {
      return
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set new timeout
    timeoutRef.current = setTimeout(async () => {
      try {
        await savePlan(plan)
        previousPlanRef.current = currentPlanString
        console.log('Plan auto-saved')
      } catch (error) {
        console.error('Auto-save failed:', error)
      }
    }, delay)

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [plan, enabled, delay])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])
}
