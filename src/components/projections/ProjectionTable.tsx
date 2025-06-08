import { useState } from 'react'
import { ProjectionSummary, groupProjectionsByCategory } from '../../utils/calculations'
import { FinancialPlan } from '../../types'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { ChevronDown, ChevronRight, TrendingUp, TrendingDown, AlertTriangle, Download, Search } from 'lucide-react'

interface ProjectionTableProps {
  projectionSummary: ProjectionSummary
  plan: FinancialPlan
}

export function ProjectionTable({ projectionSummary, plan }: ProjectionTableProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['Assets', 'Income']))
  const [selectedYear, setSelectedYear] = useState(projectionSummary.snapshots[0]?.year || new Date().getFullYear())
  const [searchTerm, setSearchTerm] = useState('')
  const [showOnlyWarnings, setShowOnlyWarnings] = useState(false)
  
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
  
  // Filter items based on search and warning filter
  const filteredGroupedItems = Object.entries(groupedItems).reduce((acc, [category, data]) => {
    const filteredItems = data.items.filter(item => {
      const matchesSearch = !searchTerm || 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.toLowerCase().includes(searchTerm.toLowerCase())
      
      const hasWarnings = item.warnings.some(w => w.year === selectedYear)
      const matchesWarningFilter = !showOnlyWarnings || hasWarnings
      
      return matchesSearch && matchesWarningFilter
    })
    
    if (filteredItems.length > 0) {
      acc[category] = {
        ...data,
        items: filteredItems,
        total: filteredItems.reduce((sum, item) => sum + (item.yearlyValues[selectedYear] || 0), 0)
      }
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

  const exportCSV = () => {
    const csvData: string[][] = []
    
    // Headers
    csvData.push(['Category', 'Item', 'Value', 'Owners', 'Has Overrides', 'Has Warnings'])
    
    // Data rows
    Object.entries(filteredGroupedItems).forEach(([category, data]) => {
      data.items.forEach(item => {
        const value = item.yearlyValues[selectedYear] || 0
        const owners = item.ownerIds.map(id => 
          plan.people.find(p => p.id === id)?.name
        ).filter(Boolean).join(', ')
        const hasWarnings = item.warnings.some(w => w.year === selectedYear)
        
        csvData.push([
          category,
          item.name,
          value.toString(),
          owners,
          item.hasOverrides ? 'Yes' : 'No',
          hasWarnings ? 'Yes' : 'No'
        ])
      })
    })
    
    const csvContent = csvData.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `financial-projection-${selectedYear}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Data Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-center">
            {/* Year Selector */}
            <div className="flex items-center gap-2">
              <label htmlFor="year-select" className="text-sm font-medium">Year:</label>
              <select
                id="year-select"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="border rounded px-3 py-1"
              >
                {projectionSummary.snapshots.map(snapshot => (
                  <option key={snapshot.year} value={snapshot.year}>
                    {snapshot.year}
                  </option>
                ))}
              </select>
            </div>

            {/* Search */}
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-48"
              />
            </div>

            {/* Filter Controls */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="warnings-filter"
                checked={showOnlyWarnings}
                onChange={(e) => setShowOnlyWarnings(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="warnings-filter" className="text-sm font-medium">
                Show only items with warnings
              </label>
            </div>

            {/* Actions */}
            <div className="flex gap-2 ml-auto">
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
              <Button
                variant="outline"
                size="sm"
                onClick={exportCSV}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
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
          {Object.keys(filteredGroupedItems).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm || showOnlyWarnings ? 'No items match your filter criteria' : 'No data available'}
            </div>
          ) : (
            <div className="space-y-2">
              {Object.entries(filteredGroupedItems).map(([category, data]) => (
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
                        const warnings = item.warnings.filter(w => w.year === selectedYear)
                        
                        return (
                          <div key={item.id} className="border-b last:border-b-0">
                            <div className="flex items-center justify-between p-3 pl-8">
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
                            
                            {/* Show warnings for this item */}
                            {warnings.length > 0 && (
                              <div className="px-8 pb-3">
                                {warnings.map((warning, index) => (
                                  <div key={index} className="text-xs text-orange-600 bg-orange-50 p-2 rounded border">
                                    <strong>{warning.type.replace('_', ' ')}:</strong> {warning.message}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Year-over-Year Comparison Table (Compact) */}
      <Card>
        <CardHeader>
          <CardTitle>Year-over-Year Summary (Key Years)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Year</th>
                  <th className="text-right p-2">Net Worth</th>
                  <th className="text-right p-2">Cash Flow</th>
                  <th className="text-right p-2">Assets</th>
                  <th className="text-center p-2">Warnings</th>
                </tr>
              </thead>
              <tbody>
                {projectionSummary.snapshots.filter((_, index) => 
                  index % 5 === 0 || index === projectionSummary.snapshots.length - 1
                ).map(snapshot => (
                  <tr 
                    key={snapshot.year} 
                    className={`border-b hover:bg-muted/50 ${snapshot.year === selectedYear ? 'bg-blue-50' : ''}`}
                  >
                    <td className="p-2 font-medium">{snapshot.year}</td>
                    <td className="p-2 text-right font-medium">{formatCurrency(snapshot.netWorth)}</td>
                    <td className={`p-2 text-right ${snapshot.cashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(snapshot.cashFlow)}
                    </td>
                    <td className="p-2 text-right">{formatCurrency(snapshot.totalAssets)}</td>
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