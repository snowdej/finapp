import { PlanAssumptions, AssumptionOverride } from '../../types'
import { getCurrentRates } from '../../utils/assumptions'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Eye, TrendingUp, AlertTriangle } from 'lucide-react'

interface AssumptionsPreviewProps {
  assumptions: PlanAssumptions
  overrides: AssumptionOverride[]
  items: Array<any>
}

export function AssumptionsPreview({
  assumptions,
  overrides,
  items
}: AssumptionsPreviewProps) {
  const currentYear = new Date().getFullYear()

  const getItemTypeIcon = (itemType: string): string => {
    switch (itemType) {
      case 'asset': return '💰'
      case 'income': return '💸'
      case 'commitment': return '💳'
      default: return '📊'
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Current Assumptions Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Plan Defaults */}
            <div>
              <h4 className="font-semibold mb-2">Plan-Wide Defaults</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Inflation:</span>
                  <div className="font-medium">{assumptions.inflationRate}%</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Income Growth:</span>
                  <div className="font-medium">{assumptions.incomeGrowthRate}%</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Commitment Growth:</span>
                  <div className="font-medium">{assumptions.commitmentGrowthRate}%</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Retirement Age:</span>
                  <div className="font-medium">{assumptions.retirementAge}</div>
                </div>
              </div>
            </div>

            {/* Asset Growth Rates */}
            <div>
              <h4 className="font-semibold mb-2">Asset Growth Rates</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                {Object.entries(assumptions.assetGrowthRates).map(([type, rate]) => (
                  <div key={type}>
                    <span className="text-muted-foreground">{type}:</span>
                    <div className="font-medium">{rate as number}%</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tax Rates */}
            <div>
              <h4 className="font-semibold mb-2">Tax Rates</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Income Tax:</span>
                  <div className="font-medium">{assumptions.taxRates.income}%</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Capital Gains:</span>
                  <div className="font-medium">{assumptions.taxRates.capitalGains}%</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Inheritance Tax:</span>
                  <div className="font-medium">{assumptions.taxRates.inheritanceTax}%</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items with Effective Rates */}
      {items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Effective Rates for Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {items.map((item) => {
                const rates = getCurrentRates(item, currentYear, assumptions, overrides)
                const hasOverride = rates.source !== 'Plan Default'
                
                return (
                  <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{getItemTypeIcon(item.itemType)}</span>
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-muted-foreground capitalize">
                          {item.itemType} • {rates.source}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Growth:</span>
                          <span className={`ml-1 font-medium ${hasOverride ? 'text-blue-600' : ''}`}>
                            {rates.growth}%
                          </span>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Inflation:</span>
                          <span className={`ml-1 font-medium ${hasOverride ? 'text-blue-600' : ''}`}>
                            {rates.inflation}%
                          </span>
                        </div>
                        {hasOverride && (
                          <AlertTriangle className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Overrides Summary */}
      {overrides.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Active Overrides Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {overrides.map((override) => (
                <div key={override.id} className="flex items-center justify-between p-2 bg-muted rounded-md">
                  <div className="text-sm">
                    <span className="font-medium capitalize">{override.overrideType}</span>
                    {' '}override for{' '}
                    <span className="font-medium">
                      {override.entityType === 'category' ? override.category : 'specific item'}
                    </span>
                  </div>
                  <div className="text-sm font-medium text-blue-600">
                    {override.value}%
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
