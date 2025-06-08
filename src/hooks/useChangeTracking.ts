import { useCallback } from 'react'
import { FinancialPlan } from '../types'
import { changeTracker } from '../services/changeTracking'

export function useChangeTracking(planId: string | null, plan: FinancialPlan | null) {
  const trackChange = useCallback(
    async (actionType: 'create' | 'update' | 'import', beforeData?: any) => {
      if (!planId || !plan) return

      try {
        const summary = `${actionType === 'create' ? 'Created' : actionType === 'update' ? 'Updated' : 'Imported'} plan: ${plan.name || 'Unknown'}`
        const details = actionType === 'import' 
          ? `Imported plan with ${plan.people?.length || 0} people, ${plan.assets?.length || 0} assets`
          : `Plan ${actionType}d`

        await changeTracker.recordChange(
          actionType,
          'plan',
          summary,
          details,
          {
            entityId: plan.id,
            beforeSnapshot: beforeData,
            afterSnapshot: plan
          }
        )
      } catch (error) {
        console.error('Failed to track change:', error)
      }
    },
    [planId, plan]
  )

  return { trackChange }
}
