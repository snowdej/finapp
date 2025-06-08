import { useState, useCallback } from 'react'
import { ProjectionSummary, groupProjectionsByCategory } from '../../utils/calculations'
import { FinancialPlan } from '../../types'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { ChevronDown, ChevronRight, TrendingUp, TrendingDown, AlertTriangle, Download, Search } from 'lucide-react'
import { generateAriaLabel, formatCurrencyForScreenReader, generateTableDescription } from '../../utils/accessibility'
import { useAnnouncer } from '../../hooks/useAnnouncer'

interface ProjectionTableProps {
  projectionSummary: ProjectionSummary
  plan: FinancialPlan
}

export function ProjectionTable({ projectionSummary, plan }: ProjectionTableProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['Assets', 'Income']))
  const [selectedYear, setSelectedYear] = useState(projectionSummary.snapshots[0]?.year || new Date().getFullYear())
  const [searchTerm, setSearchTerm] = useState('')
  const [showOnlyWarnings, setShowOnlyWarnings] = useState(false)
  const [sortConfig, setSortConfig] = useState({ key: 'category', direction: 'asc' })
  const { announce } = useAnnouncer()

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(category)) {
      newExpanded.delete(category)
    } else {
      newExpanded.add(category)
    }
    setExpandedCategories(newExpanded)
  }

  const handleSort = useCallback((columnId: string) => {
    const newDirection = sortConfig.key === columnId && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    setSortConfig({ key: columnId, direction: newDirection })

    // Announce sort change
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

  const selectedSnapshot = projectionSummary.snapshots.find(s => s.year === selectedYear)
  if (!selectedSnapshot) return null

  const groupedItems = groupProjectionsByCategory(selectedSnapshot.items, selectedYear)

  // Filter items based on search and warning filter
  const filteredGroupedItems = Object.entries(groupedItems).reduce((acc, [category, data]) => {
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
    <div className="space-y-4">
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
            Financial projection showing yearly snapshots from {projectionSummary.snapshots[0]?.year} to {projectionSummary.snapshots[projectionSummary.snapshots.length - 1]?.year}.
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
                      ? sortConfig.direction === 'asc' ? 'ascending' : 'descending'
                      : 'none'
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
                key={`${row.year}-${row.category}`}
                role="row"
                className="border-b transition-colors hover:bg-muted/50 focus-within:bg-muted/50"
              >
                {columns.map((column) => {
                  const cellValue = row[column.id as keyof ProjectionRow]
                  const isExpandable = column.id === 'category' && row.hasSubcategories

                  return (
                    <td
                      key={column.id}
                      role="gridcell"
                      className={cn("p-4 align-middle", column.className)}
                      aria-describedby={column.id === 'netWorth' ? `net-worth-description-${rowIndex}` : undefined}
                    >
                      {isExpandable ? (
                        <button
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
                          <span aria-hidden="true">
                            {expandedCategories.has(row.category) ? '▼' : '▶'}
                          </span>
                          <span>{cellValue}</span>
                        </button>
                      ) : (
                        <span>
                          {typeof cellValue === 'number'
                            ? cellValue.toLocaleString('en-GB', {
                              style: 'currency',
                              currency: 'GBP',
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0
                            })
                            : cellValue
                          }
                        </span>
                      )}

                      {/* Hidden description for screen readers */}
                      {column.id === 'netWorth' && typeof cellValue === 'number' && (
                        <span id={`net-worth-description-${rowIndex}`} className="sr-only">
                          Net worth for {row.year}: {formatCurrencyForScreenReader(cellValue)}
                        </span>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Keyboard Instructions */}
      <div className="text-xs text-muted-foreground mt-4" role="note">
        <p><strong>Keyboard navigation:</strong> Use Tab to move between sortable headers, Enter or Space to sort, Tab to navigate expandable categories.</p>
      </div>
    </div>
  )
}