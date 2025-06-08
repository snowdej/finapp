import { useState } from 'react'
import { Scenario, PlanAssumptions, AssumptionOverride, ValidationError } from '../../types'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'

interface ScenarioFormProps {
  scenario?: Scenario
  planId: string
  defaultAssumptions: PlanAssumptions
  defaultOverrides: AssumptionOverride[]
  onSubmit: (scenario: Partial<Scenario>) => ValidationError[]
  onCancel: () => void
  submitLabel: string
}

export function ScenarioForm({ 
  scenario, 
  planId,
  defaultAssumptions,
  defaultOverrides,
  onSubmit, 
  onCancel, 
  submitLabel 
}: ScenarioFormProps) {
  const [formData, setFormData] = useState<Partial<Scenario>>({
    name: scenario?.name || '',
    description: scenario?.description || '',
    isBase: scenario?.isBase || false,
    assumptions: scenario?.assumptions || defaultAssumptions,
    overrides: scenario?.overrides || defaultOverrides,
    planId
  })
  const [errors, setErrors] = useState<ValidationError[]>([])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const validationErrors = onSubmit(formData)
    setErrors(validationErrors)
  }

  const getFieldError = (field: string) => {
    return errors.find(error => error.field === field)?.message
  }

  const handleAssumptionChange = (field: keyof PlanAssumptions, value: number) => {
    setFormData(prev => ({
      ...prev,
      assumptions: {
        ...prev.assumptions!,
        [field]: value
      }
    }))
  }

  const handleAssetGrowthChange = (assetType: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      assumptions: {
        ...prev.assumptions!,
        assetGrowthRates: {
          ...prev.assumptions!.assetGrowthRates,
          [assetType]: value
        }
      }
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Scenario Name (optional)</Label>
          <Input
            id="name"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Will be auto-generated if left blank"
          />
          {getFieldError('name') && (
            <p className="text-sm text-destructive">{getFieldError('name')}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isBase"
              checked={formData.isBase || false}
              onChange={(e) => setFormData({ ...formData, isBase: e.target.checked })}
              className="rounded border-gray-300"
              aria-label="Mark as base scenario"
            />
            <Label htmlFor="isBase">Mark as base scenario</Label>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea
          id="description"
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe what makes this scenario unique"
          rows={3}
        />
      </div>

      {/* Key Assumptions - Simplified for scenario creation */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold">Key Assumptions</h4>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="inflationRate">Inflation Rate (%)</Label>
            <Input
              id="inflationRate"
              type="number"
              step="0.1"
              value={formData.assumptions?.inflationRate || ''}
              onChange={(e) => handleAssumptionChange('inflationRate', parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="incomeGrowthRate">Income Growth (%)</Label>
            <Input
              id="incomeGrowthRate"
              type="number"
              step="0.1"
              value={formData.assumptions?.incomeGrowthRate || ''}
              onChange={(e) => handleAssumptionChange('incomeGrowthRate', parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="retirementAge">Retirement Age</Label>
            <Input
              id="retirementAge"
              type="number"
              value={formData.assumptions?.retirementAge || ''}
              onChange={(e) => handleAssumptionChange('retirementAge', parseInt(e.target.value) || 0)}
            />
          </div>
        </div>

        {/* Asset Growth Rates - Key ones only */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="isaGrowth">ISA Growth Rate (%)</Label>
            <Input
              id="isaGrowth"
              type="number"
              step="0.1"
              value={formData.assumptions?.assetGrowthRates?.ISA || ''}
              onChange={(e) => handleAssetGrowthChange('ISA', parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sippGrowth">SIPP Growth Rate (%)</Label>
            <Input
              id="sippGrowth"
              type="number"
              step="0.1"
              value={formData.assumptions?.assetGrowthRates?.SIPP || ''}
              onChange={(e) => handleAssetGrowthChange('SIPP', parseFloat(e.target.value) || 0)}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit">{submitLabel}</Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
