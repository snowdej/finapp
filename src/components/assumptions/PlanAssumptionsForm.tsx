import { useState } from 'react'
import { PlanAssumptions, ValidationError } from '../../types'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'

interface PlanAssumptionsFormProps {
  assumptions: PlanAssumptions
  onSubmit: (assumptions: Partial<PlanAssumptions>) => ValidationError[]
}

export function PlanAssumptionsForm({ assumptions, onSubmit }: PlanAssumptionsFormProps) {
  const [formData, setFormData] = useState<PlanAssumptions>(assumptions)
  const [errors, setErrors] = useState<ValidationError[]>([])
  const [hasChanges, setHasChanges] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const validationErrors = onSubmit(formData)
    setErrors(validationErrors)
    if (validationErrors.length === 0) {
      setHasChanges(false)
    }
  }

  const handleChange = (field: keyof PlanAssumptions, value: number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setHasChanges(true)
  }

  const handleAssetGrowthChange = (assetType: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      assetGrowthRates: {
        ...prev.assetGrowthRates,
        [assetType]: value
      }
    }))
    setHasChanges(true)
  }

  const handleTaxRateChange = (taxType: keyof PlanAssumptions['taxRates'], value: number) => {
    setFormData(prev => ({
      ...prev,
      taxRates: {
        ...prev.taxRates,
        [taxType]: value
      }
    }))
    setHasChanges(true)
  }

  const getFieldError = (field: string) => {
    return errors.find(error => error.field === field)?.message
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* General Economic Assumptions */}
      <Card>
        <CardHeader>
          <CardTitle>General Economic Assumptions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="inflationRate">Inflation Rate (% per year)</Label>
            <Input
              id="inflationRate"
              type="number"
              step="0.1"
              value={formData.inflationRate || ''}
              onChange={(e) => handleChange('inflationRate', parseFloat(e.target.value) || 0)}
            />
            {getFieldError('inflationRate') && (
              <p className="text-sm text-destructive">{getFieldError('inflationRate')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="incomeGrowthRate">Income Growth Rate (% per year)</Label>
            <Input
              id="incomeGrowthRate"
              type="number"
              step="0.1"
              value={formData.incomeGrowthRate || ''}
              onChange={(e) => handleChange('incomeGrowthRate', parseFloat(e.target.value) || 0)}
            />
            {getFieldError('incomeGrowthRate') && (
              <p className="text-sm text-destructive">{getFieldError('incomeGrowthRate')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="commitmentGrowthRate">Commitment Growth Rate (% per year)</Label>
            <Input
              id="commitmentGrowthRate"
              type="number"
              step="0.1"
              value={formData.commitmentGrowthRate || ''}
              onChange={(e) => handleChange('commitmentGrowthRate', parseFloat(e.target.value) || 0)}
            />
            {getFieldError('commitmentGrowthRate') && (
              <p className="text-sm text-destructive">{getFieldError('commitmentGrowthRate')}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Life Planning */}
      <Card>
        <CardHeader>
          <CardTitle>Life Planning</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="retirementAge">Retirement Age</Label>
            <Input
              id="retirementAge"
              type="number"
              value={formData.retirementAge || ''}
              onChange={(e) => handleChange('retirementAge', parseInt(e.target.value) || 0)}
            />
            {getFieldError('retirementAge') && (
              <p className="text-sm text-destructive">{getFieldError('retirementAge')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lifeExpectancy">Life Expectancy</Label>
            <Input
              id="lifeExpectancy"
              type="number"
              value={formData.lifeExpectancy || ''}
              onChange={(e) => handleChange('lifeExpectancy', parseInt(e.target.value) || 0)}
            />
            {getFieldError('lifeExpectancy') && (
              <p className="text-sm text-destructive">{getFieldError('lifeExpectancy')}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Asset Growth Rates */}
      <Card>
        <CardHeader>
          <CardTitle>Asset Growth Rates (% per year)</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          {Object.entries(formData.assetGrowthRates).map(([assetType, rate]) => (
            <div key={assetType} className="space-y-2">
              <Label htmlFor={`asset-${assetType}`}>{assetType}</Label>
              <Input
                id={`asset-${assetType}`}
                type="number"
                step="0.1"
                value={rate as number}
                onChange={(e) => handleAssetGrowthChange(assetType, parseFloat(e.target.value) || 0)}
              />
              {getFieldError(`assetGrowthRates.${assetType}`) && (
                <p className="text-sm text-destructive">{getFieldError(`assetGrowthRates.${assetType}`)}</p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Tax Rates */}
      <Card>
        <CardHeader>
          <CardTitle>Tax Rates (%)</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="incomeTax">Income Tax</Label>
            <Input
              id="incomeTax"
              type="number"
              step="0.1"
              value={formData.taxRates.income || ''}
              onChange={(e) => handleTaxRateChange('income', parseFloat(e.target.value) || 0)}
            />
            {getFieldError('taxRates.income') && (
              <p className="text-sm text-destructive">{getFieldError('taxRates.income')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="capitalGainsTax">Capital Gains Tax</Label>
            <Input
              id="capitalGainsTax"
              type="number"
              step="0.1"
              value={formData.taxRates.capitalGains || ''}
              onChange={(e) => handleTaxRateChange('capitalGains', parseFloat(e.target.value) || 0)}
            />
            {getFieldError('taxRates.capitalGains') && (
              <p className="text-sm text-destructive">{getFieldError('taxRates.capitalGains')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="inheritanceTax">Inheritance Tax</Label>
            <Input
              id="inheritanceTax"
              type="number"
              step="0.1"
              value={formData.taxRates.inheritanceTax || ''}
              onChange={(e) => handleTaxRateChange('inheritanceTax', parseFloat(e.target.value) || 0)}
            />
            {getFieldError('taxRates.inheritanceTax') && (
              <p className="text-sm text-destructive">{getFieldError('taxRates.inheritanceTax')}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={!hasChanges}>
          Save Assumptions
        </Button>
      </div>
    </form>
  )
}
