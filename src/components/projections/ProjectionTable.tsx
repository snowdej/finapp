import { useState, useCallback, useMemo } from 'react'
import { ProjectionSummary } from '../../utils/calculations'
import { FinancialPlan } from '../../types'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { cn } from '../../utils/cn'
import { generateAriaLabel, formatCurrencyForScreenReader, generateTableDescription } from '../../utils/accessibility'
import { useAnnouncer } from '../../hooks/useAnnouncer'
import { Download, Search, ChevronDown, ChevronRight } from 'lucide-react'

interface ProjectionTableProps {
  projectionSummary: ProjectionSummary
  plan: FinancialPlan
}

interface ProjectionRow {
  year: number
  category: string
  netWorth: number
  totalAssets: number
  totalIncome: number
  totalCommitments: number
  cashFlow: number
  hasSubcategories?: boolean
}

interface SortConfig {
  key: string
  direction: 'asc' | 'desc'
}

export function ProjectionTable({ projectionSummary, plan }: ProjectionTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'year', direction: 'asc' })
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const { announce } = useAnnouncer()

  // Transform projection data into table rows
  const tableData = useMemo((): ProjectionRow[] => {
    return projectionSummary.snapshots.map(snapshot => ({
      year: snapshot.year,
      category: 'Total',
      netWorth: snapshot.netWorth,
      totalAssets: snapshot.totalAssets,
      totalIncome: snapshot.totalIncome,
      totalCommitments: Math.abs(snapshot.totalCommitments),
      cashFlow: snapshot.cashFlow,
      hasSubcategories: true
    }))
  }, [projectionSummary])

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return tableData
    
    return tableData.filter(row => 
      row.year.toString().includes(searchTerm) ||
      row.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [tableData, searchTerm])

  // Sort data based on current sort configuration
  const sortedData = useMemo(() => {
    const sorted = [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key as keyof ProjectionRow]
      const bValue = b[sortConfig.key as keyof ProjectionRow]
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue
      }
      
      const aStr = String(aValue).toLowerCase()
      const bStr = String(bValue).toLowerCase()
      
      if (sortConfig.direction === 'asc') {
        return aStr.localeCompare(bStr)
      } else {
        return bStr.localeCompare(aStr)
      }
    })
    
    return sorted
  }, [filteredData, sortConfig])

  const columns = [
    { id: 'year', label: 'Year', className: 'text-center' },
    { id: 'category', label: 'Category', className: '' },
    { id: 'netWorth', label: 'Net Worth', className: 'text-right' },
    { id: 'totalAssets', label: 'Total Assets', className: 'text-right' },
    { id: 'totalIncome', label: 'Total Income', className: 'text-right' },
    { id: 'totalCommitments', label: 'Total Commitments', className: 'text-right' },
    { id: 'cashFlow', label: 'Cash Flow', className: 'text-right' }
  ]

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

  const exportToCSV = () => {
    const headers = columns.map(col => col.label).join(',')
    const rows = sortedData.map(row => 
      columns.map(col => {
        const value = row[col.id as keyof ProjectionRow]
        return typeof value === 'number' ? value.toString() : `"${value}"`
      }).join(',')
    ).join('\n')
    
    const csv = `${headers}\n${rows}`
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `financial-projections-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
    
    announce('Projection table exported to CSV')
  }

  return (
    <Card asSection aria-labelledby="projection-table-heading">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle as="h3" id="projection-table-heading">
            Financial Projections Table
          </CardTitle>
          <Button 
            variant="outline" 
            onClick={exportToCSV}
            aria-label="Export projection table as CSV file"
          >
            <Download className="h-4 w-4 mr-2" aria-hidden="true" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Search and Controls */}
        <div className="mb-4 space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label htmlFor="table-search" className="sr-only">
                Search projections
              </Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="table-search"
                  placeholder="Search by year or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                  aria-describedby="search-description"
                />
              </div>
              <div id="search-description" className="sr-only">
                Search through projection data by year or category name
              </div>
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground">
            Showing {sortedData.length} of {tableData.length} projections
          </div>
        </div>

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
                            {expandedCategories.has(row.category) ? (
                              <ChevronDown className="h-4 w-4" aria-hidden="true" />
                            ) : (
                              <ChevronRight className="h-4 w-4" aria-hidden="true" />
                            )}
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

        {sortedData.length === 0 && (
          <div className="text-center py-8 text-muted-foreground" role="status">
            {searchTerm ? 'No projections match your search criteria' : 'No projection data available'}
          </div>
        )}

        {/* Keyboard Instructions */}
        <div className="text-xs text-muted-foreground mt-4" role="note">
          <p><strong>Keyboard navigation:</strong> Use Tab to move between sortable headers, Enter or Space to sort, Tab to navigate expandable categories.</p>
        </div>
      </CardContent>
    </Card>
  )
}