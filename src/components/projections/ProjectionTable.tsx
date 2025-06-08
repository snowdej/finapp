import { useState } from 'react'
import { ProjectionSummary, groupProjectionsByCategory } from '../../utils/calculations'
import { FinancialPlan } from '../../types'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { ChevronDown, ChevronRight, TrendingUp, TrendingDown, AlertTriangle, Download, Search } from 'lucide-react'

interface ProjectionTableProps {
  projectionSummary: ProjectionSummary
  plan: FinancialPlan
}

export function ProjectionTable({ projectionSummary, plan }: ProjectionTableProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['ISA', 'SIPP', 'Income']))
  const [selectedYear, setSelectedYear] = useState(projectionSummary.snapshots[0]?.year || new Date().getFullYear())
  const [searchTerm, setSearchTerm] = useState('')
  const [showAllYears, setShowAllYears] = useState(false)
  
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
  
  // Filter items based on search term
  const filteredGroupedItems = Object.entries(groupedItems).reduce((acc, [category, data]) => {
    if (searchTerm) {
      const filteredItems = data.items.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.toLowerCase().includes(searchTerm.toLowerCase())
      )
      if (filteredItems.length > 0) {
        acc[category] = {
          items: filteredItems,
          total: filteredItems.reduce((sum, item) => sum + (item.yearlyValues[selectedYear] || 0), 0)
        }
      }
    } else {
      acc[category] = data
    }
    return acc
  }, {} as typeof groupedItems)
  
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

  const exportDetailedCSV = () => {
    const headers = ['Category', 'Item', 'Type', 'Owners', 'Value', 'Has Overrides', 'Warnings']
    const rows = Object.entries(filteredGroupedItems).flatMap(([category, data]) =>
      data.items.map(item => {
        const value = item.yearlyValues[selectedYear] || 0
        const owners = item.ownerIds.map(id => plan.people.find(p => p.id === id)?.name).filter(Boolean).join('; ')
        const hasWarnings = item.warnings.some(w => w.year === selectedYear)
        
        return [
          category,
          item.name,
          item.type,
          owners,
          value.toFixed(2),
          item.hasOverrides ? 'Yes' : 'No',
          hasWarnings ? 'Yes' : 'No'
        ]
      })
    )

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `financial-breakdown-${selectedYear}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const exportYearlyCSV = () => {
    const headers = ['Year', 'Total Assets', 'Total Income', 'Total Commitments', 'Net Worth', 'Cash Flow', 'Warnings Count']
    const rows = projectionSummary.snapshots.map(snapshot => [
      snapshot.year,
      snapshot.totalAssets.toFixed(2),
      snapshot.totalIncome.toFixed(2),
      snapshot.totalCommitments.toFixed(2),
      snapshot.netWorth.toFixed(2),
      snapshot.cashFlow.toFixed(2),
      snapshot.warnings.length
    ])

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `yearly-summary-${projectionSummary.startYear}-${projectionSummary.endYear}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }
  
  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Data Table Controls</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={exportDetailedCSV}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export Breakdown
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportYearlyCSV}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export Yearly
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search Items</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Quick Actions</Label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setExpandedCategories(new Set(Object.keys(filteredGroupedItems)))}
                >
                  Expand All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setExpandedCategories(new Set())}
                >
                  Collapse All
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Year Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Year to View</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            {projectionSummary.snapshots.slice(0, showAllYears ? undefined : 20).map(snapshot => (
              <Button
                key={snapshot.year}
                variant={snapshot.year === selectedYear ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedYear(snapshot.year)}
              >
                {snapshot.year}
              </Button>
            ))}
            {projectionSummary.snapshots.length > 20 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllYears(!showAllYears)}
              >
                {showAllYears ? 'Show Less' : `+${projectionSummary.snapshots.length - 20} more`}
              </Button>
            )}
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
          <CardTitle>Detailed Breakdown {searchTerm && `(filtered: "${searchTerm}")`}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(filteredGroupedItems).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No items found matching "{searchTerm}"
              </div>
            ) : (
              Object.entries(filteredGroupedItems).map(([category, data]) => (
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
                          <div key={item.id} className="flex items-center justify-between p-3 pl-8 border-b last:border-b-0 hover:bg-muted/30">
                            <div className="flex items-center gap-2 flex-1">
                              <span className="font-medium">{item.name}</span>
                              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                                {item.type}
                              </span>
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
              ))
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Year-over-Year Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>Year-over-Year Summary (First 20 Years)</CardTitle>
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
                  <th className="text-right p-2">Growth %</th>
                  <th className="text-center p-2">Warnings</th>
                </tr>
              </thead>
              <tbody>
                {projectionSummary.snapshots.slice(0, 20).map((snapshot, index) => {
                  const previousSnapshot = index > 0 ? projectionSummary.snapshots[index - 1] : null
                  const growthRate = previousSnapshot && previousSnapshot.netWorth > 0 ? 
                    ((snapshot.netWorth - previousSnapshot.netWorth) / previousSnapshot.netWorth * 100) : 0
                  
                  return (
                    <tr 
                      key={snapshot.year} 
                      className={`border-b hover:bg-muted/50 ${snapshot.year === selectedYear ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                    >
                      <td className="p-2 font-medium">{snapshot.year}</td>
                      <td className="p-2 text-right">{formatCurrency(snapshot.totalAssets)}</td>
                      <td className="p-2 text-right text-green-600">{formatCurrency(snapshot.totalIncome)}</td>
                      <td className="p-2 text-right text-red-600">{formatCurrency(snapshot.totalCommitments)}</td>
                      <td className="p-2 text-right font-medium">{formatCurrency(snapshot.netWorth)}</td>
                      <td className={`p-2 text-right ${snapshot.cashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(snapshot.cashFlow)}
                      </td>
                      <td className={`p-2 text-right text-xs ${growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {index > 0 ? `${growthRate >= 0 ? '+' : ''}${growthRate.toFixed(1)}%` : '-'}
                      </td>
                      <td className="p-2 text-center">
                        {snapshot.warnings.length > 0 && (
                          <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">
                            {snapshot.warnings.length}
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {projectionSummary.snapshots.length > 20 && (
            <div className="mt-4 text-center text-sm text-muted-foreground">
              Showing first 20 years. Use the year selector above to view specific years.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
