import { useState } from 'react'
import { ProjectionSummary, groupProjectionsByCategory } from '../../utils/calculations'
import { FinancialPlan } from '../../types'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { ChevronDown, ChevronRight, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react'

interface ProjectionTableProps {
  projectionSummary: ProjectionSummary
  plan: FinancialPlan
}

export function ProjectionTable({ projectionSummary, plan }: ProjectionTableProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['Assets', 'Income']))
  const [selectedYear, setSelectedYear] = useState(projectionSummary.snapshots[0]?.year || new Date().getFullYear())
  
  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(category)) {
      newExpanded.delete(category)
    } else {
      newExpanded.add(category)
    }
    setExpandedCategories(newExpanded)
  }
  
  const selectedSnapshot = projectionSummary.snapshots.find(s => s.year === selectedYear)
  if (!selectedSnapshot) return null
  
  const groupedItems = groupProjectionsByCategory(selectedSnapshot.items, selectedYear)
  
  const formatCurrency = (amount: number) => {
    const isNegative = amount < 0
    const formatted = `£${Math.abs(amount).toLocaleString()}`
    return isNegative ? `-${formatted}` : formatted
  }
  
  const getCategoryIcon = (category: string, total: number) => {
    if (total > 0) return <TrendingUp className="h-4 w-4 text-green-600" />
    if (total < 0) return <TrendingDown className="h-4 w-4 text-red-600" />
    return null
  }
  
  return (
    <div className="space-y-6">
      {/* Year Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Year to View</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {projectionSummary.snapshots.map(snapshot => (
              <Button
                key={snapshot.year}
                variant={snapshot.year === selectedYear ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedYear(snapshot.year)}
              >
                {snapshot.year}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Summary for Selected Year */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Summary for {selectedYear}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(selectedSnapshot.totalAssets)}
              </div>
              <div className="text-sm text-muted-foreground">Total Assets</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(selectedSnapshot.totalIncome)}
              </div>
              <div className="text-sm text-muted-foreground">Total Income</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(selectedSnapshot.totalCommitments)}
              </div>
              <div className="text-sm text-muted-foreground">Total Commitments</div>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {formatCurrency(selectedSnapshot.netWorth)}
              </div>
              <div className="text-sm text-muted-foreground">Net Worth</div>
            </div>
            <div>
              <div className={`text-2xl font-bold ${selectedSnapshot.cashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(selectedSnapshot.cashFlow)}
              </div>
              <div className="text-sm text-muted-foreground">Cash Flow</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Detailed Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(groupedItems).map(([category, data]) => (
              <div key={category} className="border rounded-lg">
                <div 
                  className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50"
                  onClick={() => toggleCategory(category)}
                >
                  <div className="flex items-center gap-2">
                    {expandedCategories.has(category) ? 
                      <ChevronDown className="h-4 w-4" /> : 
                      <ChevronRight className="h-4 w-4" />
                    }
                    <span className="font-medium">{category}</span>
                    {getCategoryIcon(category, data.total)}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`font-bold ${data.total >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(data.total)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      ({data.items.length} items)
                    </span>
                  </div>
                </div>
                
                {expandedCategories.has(category) && (
                  <div className="border-t bg-muted/20">
                    {data.items.map(item => {
                      const value = item.yearlyValues[selectedYear] || 0
                      const hasWarnings = item.warnings.some(w => w.year === selectedYear)
                      
                      return (
                        <div key={item.id} className="flex items-center justify-between p-3 pl-8 border-b last:border-b-0">
                          <div className="flex items-center gap-2">
                            <span>{item.name}</span>
                            {item.hasOverrides && (
                              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                Override
                              </span>
                            )}
                            {hasWarnings && (
                              <AlertTriangle className="h-4 w-4 text-orange-500" />
                            )}
                          </div>
                          <div className="text-right">
                            <div className={`font-medium ${value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {formatCurrency(value)}
                            </div>
                            {item.ownerIds.length > 0 && (
                              <div className="text-xs text-muted-foreground">
                                {item.ownerIds.map(id => 
                                  plan.people.find(p => p.id === id)?.name
                                ).filter(Boolean).join(', ')}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Year-over-Year Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>Year-over-Year Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Year</th>
                  <th className="text-right p-2">Total Assets</th>
                  <th className="text-right p-2">Total Income</th>
                  <th className="text-right p-2">Total Commitments</th>
                  <th className="text-right p-2">Net Worth</th>
                  <th className="text-right p-2">Cash Flow</th>
                  <th className="text-center p-2">Warnings</th>
                </tr>
              </thead>
              <tbody>
                {projectionSummary.snapshots.map(snapshot => (
                  <tr 
                    key={snapshot.year} 
                    className={`border-b hover:bg-muted/50 ${snapshot.year === selectedYear ? 'bg-blue-50' : ''}`}
                  >
                    <td className="p-2 font-medium">{snapshot.year}</td>
                    <td className="p-2 text-right">{formatCurrency(snapshot.totalAssets)}</td>
                    <td className="p-2 text-right text-green-600">{formatCurrency(snapshot.totalIncome)}</td>
                    <td className="p-2 text-right text-red-600">{formatCurrency(snapshot.totalCommitments)}</td>
                    <td className="p-2 text-right font-medium">{formatCurrency(snapshot.netWorth)}</td>
                    <td className={`p-2 text-right ${snapshot.cashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(snapshot.cashFlow)}
                    </td>
                    <td className="p-2 text-center">
                      {snapshot.warnings.length > 0 && (
                        <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">
                          {snapshot.warnings.length}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
