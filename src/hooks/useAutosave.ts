import { useEffect, useRef } from 'react'
import { scheduleAutosave, cancelAutosave } from '../services/storage'

export function useAutosave(planData: any, enabled: boolean = true, delay: number = 2000) {
  const lastSavedRef = useRef<string>('')

  useEffect(() => {
    if (!enabled || !planData) {
      return
    }

    const currentDataStr = JSON.stringify(planData)
    
    // Only autosave if data has actually changed
    if (currentDataStr !== lastSavedRef.current) {
      lastSavedRef.current = currentDataStr
      scheduleAutosave(planData, delay)
    }

    return () => {
      cancelAutosave()
    }
  }, [planData, enabled, delay])

  useEffect(() => {
    return () => {
      cancelAutosave()
    }
  }, [])
}
