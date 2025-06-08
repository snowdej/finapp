import { useEffect, useCallback } from 'react'
import { changeTracker, trackPlanChange } from '../services/changeTracking'
import { FinancialPlan } from '../types'

export function useChangeTracking(planId: string | null, plan: FinancialPlan | null) {
  // Initialize change tracking when plan changes
  useEffect(() => {
    if (planId) {
      changeTracker.initializePlan(planId)
    }
  }, [planId])

  // Track plan changes when plan is updated
  const trackChange = useCallback(
    async (action: 'create' | 'update' | 'import', beforeData?: any) => {
      if (plan) {
        await trackPlanChange(action, plan, beforeData)
      }
    },
    [plan]
  )

  return {
    trackChange,
    changeTracker
  }
}
