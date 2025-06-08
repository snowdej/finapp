import { useState, useCallback, useMemo } from 'react'
import { ProjectionSummary, groupProjectionsByCategory } from '../../utils/calculations'
import { FinancialPlan } from '../../types'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { ChevronDown, ChevronRight, TrendingUp, TrendingDown, AlertTriangle, Download, Search, Filter } from 'lucide-react'
import { generateAriaLabel, formatCurrencyForScreenReader, generateTableDescription } from '../../utils/accessibility'
import { useAnnouncer } from '../../hooks/useAnnouncer'
import { cn } from '../../utils/cn'

interface ProjectionTableProps {
  projectionSummary: ProjectionSummary
  plan: FinancialPlan
}

interface ProjectionRow {
  year: number
  category: string
  item: string
  value: number
  owners: string
  hasOverrides: boolean
  hasWarnings: boolean
  hasSubcategories?: boolean
}

export function ProjectionTable({ projectionSummary, plan }: ProjectionTableProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['Assets', 'Income']))
  const [selectedYear, setSelectedYear] = useState(projectionSummary.snapshots[0]?.year || new Date().getFullYear())
  const [searchTerm, setSearchTerm] = useState('')
  const [showOnlyWarnings, setShowOnlyWarnings] = useState(false)
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'category', direction: 'asc' })
  const { announce } = useAnnouncer()

  const columns = [
    { id: 'category', label: 'Category', className: 'w-[200px]' },
    { id: 'item', label: 'Item', className: 'min-w-[200px]' },
    { id: 'value', label: 'Value', className: 'text-right w-[150px]' },
    { id: 'owners', label: 'Owners', className: 'w-[150px]' },
    { id: 'status', label: 'Status', className: 'w-[100px]' }
  ]

  const selectedSnapshot = projectionSummary.snapshots.find(s => s.year === selectedYear)

  const sortedData = useMemo(() => {
    if (!selectedSnapshot) return []

    const groupedItems = groupProjectionsByCategory(selectedSnapshot.items, selectedYear)
    const rows: ProjectionRow[] = []

    Object.entries(groupedItems).forEach(([category, data]) => {
      const filteredItems = data.items.filter(item => {
        const matchesSearch =
          !searchTerm ||
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          category.toLowerCase().includes(searchTerm.toLowerCase())

        const hasWarnings = item.warnings.some(w => w.year === selectedYear)
        const matchesWarningFilter = !showOnlyWarnings || hasWarnings

        return matchesSearch && matchesWarningFilter
      })

      if (filteredItems.length > 0) {
        // Add category header row
        rows.push({
          year: selectedYear,
          category,
          item: '',
          value: data.total,
          owners: '',
          hasOverrides: false,
          hasWarnings: false,
          hasSubcategories: true
        })

        // Add item rows if category is expanded
        if (expandedCategories.has(category)) {
          filteredItems.forEach(item => {
            const owners = item.ownerIds.map(id =>
              plan.people.find(p => p.id === id)?.name
            ).filter(Boolean).join(', ')

            rows.push({
              year: selectedYear,
              category: '',
              item: item.name,
              value: item.yearlyValues[selectedYear] || 0,
              owners,
              hasOverrides: item.hasOverrides,
              hasWarnings: item.warnings.some(w => w.year === selectedYear),
              hasSubcategories: false
            })
          })
        }
      }
    })

    // Sort the data
    return rows.sort((a, b) => {
      const aValue = a[sortConfig.key as keyof ProjectionRow]
      const bValue = b[sortConfig.key as keyof ProjectionRow]

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' 
          ? aValue - bValue
          : bValue - aValue
      }

      return 0
    })
  }, [selectedSnapshot, selectedYear, searchTerm, showOnlyWarnings, expandedCategories, sortConfig, plan.people])

  const handleSort = useCallback((columnId: string) => {
    const newDirection = sortConfig.key === columnId && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    setSortConfig({ key: columnId, direction: newDirection })
    announce(`Table sorted by ${columnId} in ${newDirection}ending order`)
  }, [sortConfig, announce])

  const handleExpandToggle = useCallback((category: string) => {
    setExpandedCategories(prev => {
      const newExpanded = prev.has(category) 
        ? new Set([...prev].filter(cat => cat !== category))
        : new Set([...prev, category])
      
      const action = newExpanded.has(category) ? 'expanded' : 'collapsed'
      announce(`${category} category ${action}`)
      
      return newExpanded
    })
  }, [announce])

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })
  }

  const exportCSV = () => {
    const csvData: string[][] = []
    csvData.push(['Category', 'Item', 'Value', 'Owners', 'Has Overrides', 'Has Warnings'])

    sortedData.forEach(row => {
      if (!row.hasSubcategories) {
        csvData.push([
          row.category || 'N/A',
          row.item,
          row.value.toString(),
          row.owners,
          row.hasOverrides ? 'Yes' : 'No',
          row.hasWarnings ? 'Yes' : 'No'
        ])
      }
    })

    const csvContent = csvData.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `financial-projection-${selectedYear}.csv`
    link.click()
    URL.revokeObjectURL(url)
    announce('Table data exported to CSV')
  }

  if (!selectedSnapshot) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          No projection data available for the selected year.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Financial Projection Table</span>
            <div className="flex items-center gap-2">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="text-sm border rounded px-2 py-1"
                aria-label="Select year for projection table"
              >
                {projectionSummary.snapshots.map(snapshot => (
                  <option key={snapshot.year} value={snapshot.year}>
                    {snapshot.year}
                  </option>
                ))}
              </select>
              <Button variant="outline" size="sm" onClick={exportCSV}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="search">Search items</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search categories and items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="warnings-only"
                checked={showOnlyWarnings}
                onChange={(e) => setShowOnlyWarnings(e.target.checked)}
                className="rounded"
                aria-label="Show warnings only"
              />
              <Label htmlFor="warnings-only" className="text-sm">
                Show warnings only
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table Description for Screen Readers */}
      <div className="sr-only">
        {generateTableDescription(
          sortedData.length,
          columns.length,
          'Financial projection data'
        )}
      </div>

      <div className="rounded-md border overflow-auto" role="region" aria-label="Financial projection table">
        <table className="w-full caption-bottom text-sm" role="table">
          <caption className="sr-only">
            Financial projection for year {selectedYear}. 
            Use arrow keys to navigate and space to sort columns.
          </caption>

          <thead className="[&_tr]:border-b" role="rowgroup">
            <tr role="row">
              {columns.map((column) => (
                <th
                  key={column.id}
                  role="columnheader"
                  className={cn(
                    "h-12 px-4 text-left align-middle font-medium text-muted-foreground cursor-pointer hover:bg-muted/50",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    column.className
                  )}
                  tabIndex={0}
                  onClick={() => handleSort(column.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleSort(column.id)
                    }
                  }}
                  aria-sort={
                    sortConfig.key === column.id 
                      ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending')
                      : undefined
                  }
                  aria-label={generateAriaLabel(`Sort by ${column.label}`, sortConfig.key === column.id ? `currently ${sortConfig.direction}ending` : 'not sorted')}
                >
                  <div className="flex items-center space-x-2">
                    <span>{column.label}</span>
                    {sortConfig.key === column.id && (
                      <span aria-hidden="true">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="[&_tr:last-child]:border-0" role="rowgroup">
            {sortedData.map((row, rowIndex) => (
              <tr 
                key={`${row.year}-${row.category}-${row.item}-${rowIndex}`}
                role="row"
                className={cn(
                  "border-b transition-colors hover:bg-muted/50 focus-within:bg-muted/50",
                  row.hasSubcategories && "bg-muted/20 font-medium"
                )}
              >
                {/* Category */}
                <td role="gridcell" className="p-4 align-middle">
                  {row.hasSubcategories ? (
                    <button
                      type="button"
                      onClick={() => handleExpandToggle(row.category)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          handleExpandToggle(row.category)
                        }
                      }}
                      className="flex items-center space-x-2 text-left hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
                      aria-expanded={expandedCategories.has(row.category)}
                      aria-label={`${expandedCategories.has(row.category) ? 'Collapse' : 'Expand'} ${row.category} category`}
                    >
                      {expandedCategories.has(row.category) ? (
                        <ChevronDown className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <ChevronRight className="h-4 w-4" aria-hidden="true" />
                      )}
                      <span>{row.category}</span>
                    </button>
                  ) : (
                    <span className="ml-6 text-muted-foreground">{row.category}</span>
                  )}
                </td>

                {/* Item */}
                <td role="gridcell" className="p-4 align-middle">
                  {row.item && (
                    <div className="flex items-center gap-2">
                      <span>{row.item}</span>
                      {row.hasOverrides && (
                        <AlertTriangle className="h-4 w-4 text-orange-500" aria-label="Has overrides" />
                      )}
                    </div>
                  )}
                </td>

                {/* Value */}
                <td role="gridcell" className="p-4 align-middle text-right">
                  <span className={cn(
                    "font-mono",
                    row.value >= 0 ? "text-green-600" : "text-red-600"
                  )}>
                    {formatCurrency(row.value)}
                  </span>
                </td>

                {/* Owners */}
                <td role="gridcell" className="p-4 align-middle">
                  <span className="text-sm text-muted-foreground">{row.owners}</span>
                </td>

                {/* Status */}
                <td role="gridcell" className="p-4 align-middle">
                  <div className="flex items-center gap-1">
                    {row.hasWarnings && (
                      <AlertTriangle className="h-4 w-4 text-red-500" aria-label="Has warnings" />
                    )}
                    {row.hasOverrides && (
                      <div className="w-2 h-2 bg-orange-500 rounded-full" aria-label="Has overrides" />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm">
            <div>
              <div className="font-bold text-lg">{sortedData.filter(r => !r.hasSubcategories).length}</div>
              <div className="text-muted-foreground">Items</div>
            </div>
            <div>
              <div className="font-bold text-lg">{sortedData.filter(r => r.hasWarnings).length}</div>
              <div className="text-muted-foreground">Warnings</div>
            </div>
            <div>
              <div className="font-bold text-lg">{sortedData.filter(r => r.hasOverrides).length}</div>
              <div className="text-muted-foreground">Overrides</div>
            </div>
            <div>
              <div className="font-bold text-lg">
                {formatCurrency(sortedData.reduce((sum, r) => sum + (r.hasSubcategories ? r.value : 0), 0))}
              </div>
              <div className="text-muted-foreground">Total Value</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Keyboard Instructions */}
      <div className="text-xs text-muted-foreground mt-4" role="note">
        <p><strong>Keyboard navigation:</strong> Use Tab to move between sortable headers, Enter or Space to sort, Tab to navigate expandable categories.</p>
      </div>
    </div>
  )
}