import { Scenario, Person, Asset, Income, Commitment } from '../../types'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge.tsx'
import { BarChart3, TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface ScenarioComparisonProps {
  scenarios: Scenario[]
  people: Person[]
  assets: Asset[]
  income: Income[]
  commitments: Commitment[]
}

export function ScenarioComparison({
  scenarios,
  people,
  assets,
  income,
  commitments
}: ScenarioComparisonProps) {
  if (scenarios.length < 2) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Need at least 2 scenarios to compare</h3>
          <p className="text-muted-foreground text-center">
            Create multiple scenarios to see how different assumptions affect your financial projections
          </p>
        </CardContent>
      </Card>
    )
  }

  const baseScenario = scenarios.find(s => s.isBase) || scenarios[0]
  const comparisonScenarios = scenarios.filter(s => s.id !== baseScenario.id)

  const getComparisonIcon = (baseValue: number, compareValue: number) => {
    if (compareValue > baseValue) return <TrendingUp className="h-4 w-4 text-green-600" />
    if (compareValue < baseValue) return <TrendingDown className="h-4 w-4 text-red-600" />
    return <Minus className="h-4 w-4 text-gray-400" />
  }

  const formatDifference = (baseValue: number, compareValue: number) => {
    const diff = compareValue - baseValue
    const prefix = diff > 0 ? '+' : ''
    if (Math.abs(diff) < 0.1) return '0%'
    return `${prefix}${diff.toFixed(1)}%`
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Scenario Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Comparing all scenarios against: <strong>{baseScenario.name}</strong>
            {baseScenario.isBase && <Badge variant="default" className="ml-2">BASE</Badge>}
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Assumption</th>
                  <th className="text-left p-2">{baseScenario.name}</th>
                  {comparisonScenarios.map(scenario => (
                    <th key={scenario.id} className="text-left p-2">
                      {scenario.name}
                      {scenario.isBase && <Badge variant="default" className="ml-1 text-xs">BASE</Badge>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-2 font-medium">Inflation Rate</td>
                  <td className="p-2">{baseScenario.assumptions.inflationRate}%</td>
                  {comparisonScenarios.map(scenario => (
                    <td key={scenario.id} className="p-2">
                      <div className="flex items-center gap-2">
                        {scenario.assumptions.inflationRate}%
                        {getComparisonIcon(baseScenario.assumptions.inflationRate, scenario.assumptions.inflationRate)}
                        <span className="text-xs text-muted-foreground">
                          {formatDifference(baseScenario.assumptions.inflationRate, scenario.assumptions.inflationRate)}
                        </span>
                      </div>
                    </td>
                  ))}
                </tr>

                <tr className="border-b">
                  <td className="p-2 font-medium">Income Growth</td>
                  <td className="p-2">{baseScenario.assumptions.incomeGrowthRate}%</td>
                  {comparisonScenarios.map(scenario => (
                    <td key={scenario.id} className="p-2">
                      <div className="flex items-center gap-2">
                        {scenario.assumptions.incomeGrowthRate}%
                        {getComparisonIcon(baseScenario.assumptions.incomeGrowthRate, scenario.assumptions.incomeGrowthRate)}
                        <span className="text-xs text-muted-foreground">
                          {formatDifference(baseScenario.assumptions.incomeGrowthRate, scenario.assumptions.incomeGrowthRate)}
                        </span>
                      </div>
                    </td>
                  ))}
                </tr>

                <tr className="border-b">
                  <td className="p-2 font-medium">Retirement Age</td>
                  <td className="p-2">{baseScenario.assumptions.retirementAge}</td>
                  {comparisonScenarios.map(scenario => (
                    <td key={scenario.id} className="p-2">
                      <div className="flex items-center gap-2">
                        {scenario.assumptions.retirementAge}
                        {getComparisonIcon(baseScenario.assumptions.retirementAge, scenario.assumptions.retirementAge)}
                        <span className="text-xs text-muted-foreground">
                          {scenario.assumptions.retirementAge - baseScenario.assumptions.retirementAge > 0 ? '+' : ''}
                          {scenario.assumptions.retirementAge - baseScenario.assumptions.retirementAge} years
                        </span>
                      </div>
                    </td>
                  ))}
                </tr>

                <tr className="border-b">
                  <td className="p-2 font-medium">ISA Growth</td>
                  <td className="p-2">{baseScenario.assumptions.assetGrowthRates.ISA}%</td>
                  {comparisonScenarios.map(scenario => (
                    <td key={scenario.id} className="p-2">
                      <div className="flex items-center gap-2">
                        {scenario.assumptions.assetGrowthRates.ISA}%
                        {getComparisonIcon(baseScenario.assumptions.assetGrowthRates.ISA, scenario.assumptions.assetGrowthRates.ISA)}
                        <span className="text-xs text-muted-foreground">
                          {formatDifference(baseScenario.assumptions.assetGrowthRates.ISA, scenario.assumptions.assetGrowthRates.ISA)}
                        </span>
                      </div>
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="p-2 font-medium">SIPP Growth</td>
                  <td className="p-2">{baseScenario.assumptions.assetGrowthRates.SIPP}%</td>
                  {comparisonScenarios.map(scenario => (
                    <td key={scenario.id} className="p-2">
                      <div className="flex items-center gap-2">
                        {scenario.assumptions.assetGrowthRates.SIPP}%
                        {getComparisonIcon(baseScenario.assumptions.assetGrowthRates.SIPP, scenario.assumptions.assetGrowthRates.SIPP)}
                        <span className="text-xs text-muted-foreground">
                          {formatDifference(baseScenario.assumptions.assetGrowthRates.SIPP, scenario.assumptions.assetGrowthRates.SIPP)}
                        </span>
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Overrides Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Overrides Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {scenarios.map(scenario => (
              <div key={scenario.id} className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  {scenario.name}
                  {scenario.isBase && <Badge variant="default">BASE</Badge>}
                </h4>
                {scenario.overrides && scenario.overrides.length > 0 ? (
                  <div className="space-y-2">
                    {scenario.overrides.map((override, index) => (
                      <div key={index} className="text-sm bg-muted p-2 rounded">
                        <span className="font-medium">{override.overrideType}</span> override: {override.value}%
                        {override.description && (
                          <span className="text-muted-foreground"> - {override.description}</span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No overrides defined</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
