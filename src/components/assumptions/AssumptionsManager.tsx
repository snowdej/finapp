import { useState } from 'react'
import { PlanAssumptions, AssumptionOverride, Person, Asset, Income, Commitment } from '../../types'
import { validatePlanAssumptions, generateId } from '../../utils/validation'
import { getDefaultAssumptions } from '../../utils/assumptions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import * as Tabs from '@radix-ui/react-tabs'
import { PlanAssumptionsForm } from './PlanAssumptionsForm.tsx'
import { OverridesManager } from './OverridesManager.tsx'
import { AssumptionsPreview } from './AssumptionsPreview.tsx'
import { Settings, TrendingUp, Target, Eye } from 'lucide-react'

interface AssumptionsManagerProps {
  assumptions: PlanAssumptions
  overrides: AssumptionOverride[]
  people: Person[]
  assets: Asset[]
  income: Income[]
  commitments: Commitment[]
  onUpdateAssumptions: (assumptions: PlanAssumptions) => void
  onUpdateOverrides: (overrides: AssumptionOverride[]) => void
}

export function AssumptionsManager({
  assumptions,
  overrides,
  people,
  assets,
  income,
  commitments,
  onUpdateAssumptions,
  onUpdateOverrides
}: AssumptionsManagerProps) {
  const [activeTab, setActiveTab] = useState('plan')

  const handleUpdateAssumptions = (newAssumptions: Partial<PlanAssumptions>) => {
    const validation = validatePlanAssumptions(newAssumptions)
    if (!validation.isValid) {
      return validation.errors
    }

    const updatedAssumptions: PlanAssumptions = {
      ...assumptions,
      ...newAssumptions,
      updatedAt: new Date().toISOString()
    }

    onUpdateAssumptions(updatedAssumptions)
    return []
  }

  const handleResetToDefaults = () => {
    const defaultAssumptions = getDefaultAssumptions()
    onUpdateAssumptions({
      ...defaultAssumptions,
      id: assumptions.id,
      planId: assumptions.planId,
      createdAt: assumptions.createdAt,
      updatedAt: new Date().toISOString()
    })
  }

  const allItems = [
    ...assets.map(a => ({ ...a, itemType: 'asset' as const })),
    ...income.map(i => ({ ...i, itemType: 'income' as const })),
    ...commitments.map(c => ({ ...c, itemType: 'commitment' as const }))
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Assumptions & Overrides</h2>
          <p className="text-muted-foreground mt-2">
            Configure plan-wide assumptions and create specific overrides for categories or individual items
          </p>
        </div>
        <Button 
          onClick={handleResetToDefaults}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Settings className="h-4 w-4" />
          Reset to Defaults
        </Button>
      </div>

      <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <Tabs.List className="grid w-full grid-cols-3">
          <Tabs.Trigger value="plan" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Plan Assumptions
          </Tabs.Trigger>
          <Tabs.Trigger value="overrides" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Overrides
          </Tabs.Trigger>
          <Tabs.Trigger value="preview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Preview
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="plan">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Plan-Wide Assumptions
              </CardTitle>
              <CardDescription>
                These default rates apply to all items unless overridden at the category or item level
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PlanAssumptionsForm
                assumptions={assumptions}
                onSubmit={handleUpdateAssumptions}
              />
            </CardContent>
          </Card>
        </Tabs.Content>

        <Tabs.Content value="overrides">
          <OverridesManager
            overrides={overrides}
            assets={assets}
            income={income}
            commitments={commitments}
            onUpdateOverrides={onUpdateOverrides}
          />
        </Tabs.Content>

        <Tabs.Content value="preview">
          <AssumptionsPreview
            assumptions={assumptions}
            overrides={overrides}
            items={allItems}
          />
        </Tabs.Content>
      </Tabs.Root>
    </div>
  )
}
