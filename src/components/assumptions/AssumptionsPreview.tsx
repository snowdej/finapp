import { PlanAssumptions, AssumptionOverride, Asset, Income, Commitment } from '../../types'
import { getCurrentRates } from '../../utils/assumptions'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Eye, Target, Settings, TrendingUp } from 'lucide-react'

interface AssumptionsPreviewProps {
  assumptions: PlanAssumptions
  overrides: AssumptionOverride[]
  items: Array<(Asset | Income | Commitment) & { itemType: 'asset' | 'income' | 'commitment' }>
}

export function AssumptionsPreview({ assumptions, overrides, items }: AssumptionsPreviewProps) {
  const currentYear = new Date().getFullYear()

  const getItemTypeIcon = (itemType: string): string => {
    switch (itemType) {
      case 'asset': return '🏦'
      case 'income': return '💰'
      case 'commitment': return '💳'
      default: return '📋'
    }
  }

  const getSourceColor = (source: string): string => {
    switch (source) {
      case 'Item Override': return 'text-red-600'
      case 'Category Override': return 'text-orange-600'
      case 'Item Specific': return 'text-blue-600'
      default: return 'text-gray-600'
    }
  }

  const getSourceIcon = (source: string): string => {
    switch (source) {
      case 'Item Override': return '🎯'
      case 'Category Override': return '📂'
      case 'Item Specific': return '🔧'
      default: return '⚙️'
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Current Rates Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            This shows the effective rates being applied to each item, taking into account the precedence hierarchy:
            <br />
            <span className="font-medium">Item Override</span> → <span className="font-medium">Category Override</span> → <span className="font-medium">Item Specific</span> → <span className="font-medium">Plan Default</span>
          </p>
        </CardContent>
      </Card>

      {items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No items to preview</h3>
            <p className="text-muted-foreground text-center">
              Add assets, income sources, or commitments to see how rates are applied
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map((item) => {
            const rates = getCurrentRates(item, currentYear, assumptions, overrides)
            const hasOverrides = rates.source !== 'Plan Default'

            return (
              <Card key={item.id} className={hasOverrides ? 'border-l-4 border-l-orange-500' : ''}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getItemTypeIcon(item.itemType)}</span>
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-muted-foreground capitalize">
                          {item.itemType} • {'type' in item ? item.type : item.itemType}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs">{getSourceIcon(rates.source)}</span>
                      <span className={`text-xs font-medium ${getSourceColor(rates.source)}`}>
                        {rates.source}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Growth Rate:</span>
                      <span className="font-medium">{rates.growth}% per year</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Inflation Rate:</span>
                      <span className="font-medium">{rates.inflation}% per year</span>
                    </div>
                  </div>
                  
                  {hasOverrides && (
                    <div className="mt-3 p-2 bg-orange-50 dark:bg-orange-900/20 rounded border border-orange-200 dark:border-orange-800">
                      <div className="flex items-center gap-2 text-xs text-orange-700 dark:text-orange-300">
                        <Target className="h-3 w-3" />
                        <span className="font-medium">Override Active</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Rate Source Legend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span>🎯</span>
              <span className="text-red-600 font-medium">Item Override</span>
              <span className="text-muted-foreground">- Highest priority</span>
            </div>
            <div className="flex items-center gap-2">
              <span>📂</span>
              <span className="text-orange-600 font-medium">Category Override</span>
              <span className="text-muted-foreground">- Medium priority</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🔧</span>
              <span className="text-blue-600 font-medium">Item Specific</span>
              <span className="text-muted-foreground">- Custom item rates</span>
            </div>
            <div className="flex items-center gap-2">
              <span>⚙️</span>
              <span className="text-gray-600 font-medium">Plan Default</span>
              <span className="text-muted-foreground">- Lowest priority</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}