import { useEffect, useRef } from 'react'
import { changeTracker } from '../services/changeTracking'
import { FinancialPlan } from '../types'

export function useChangeTracking(planId: string | null, currentPlan: FinancialPlan | null) {
  const previousPlanRef = useRef<FinancialPlan | null>(null)
  const isInitializedRef = useRef(false)

  // Initialize change tracking when planId changes
  useEffect(() => {
    if (planId && !isInitializedRef.current) {
      changeTracker.initializePlan(planId)
      isInitializedRef.current = true
    }
  }, [planId])

  // Track changes when plan updates
  useEffect(() => {
    if (!planId || !currentPlan || !previousPlanRef.current) {
      previousPlanRef.current = currentPlan
      return
    }

    // Only track if this is not the initial load
    if (isInitializedRef.current && previousPlanRef.current !== currentPlan) {
      // Record a general plan update
      changeTracker.recordChange(
        'update',
        'plan',
        'Plan updated',
        'Financial plan data was modified',
        {
          beforeSnapshot: previousPlanRef.current,
          afterSnapshot: currentPlan
        }
      ).catch(error => {
        console.error('Failed to track change:', error)
      })
    }

    previousPlanRef.current = currentPlan
  }, [planId, currentPlan])

  const trackChange = async (
    action: 'create' | 'update' | 'delete',
    beforeData?: FinancialPlan
  ) => {
    if (!planId || !currentPlan) return

    try {
      await changeTracker.recordChange(
        action,
        'plan',
        `Plan ${action}d`,
        `Financial plan was ${action}d`,
        {
          beforeSnapshot: beforeData,
          afterSnapshot: currentPlan
        }
      )
    } catch (error) {
      console.error('Failed to track change:', error)
    }
  }

  return { trackChange }
}
