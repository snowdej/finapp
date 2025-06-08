import { useState, useEffect, useMemo } from 'react'
import { FinancialPlan, Scenario } from '../../types'
import { calculateProjections, ProjectionSummary, groupProjectionsByCategory } from '../../utils/calculations'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { ProjectionTable } from './ProjectionTable.tsx'
import { ProjectionCharts } from './ProjectionCharts.tsx'
import { ProjectionWarnings } from './ProjectionWarnings.tsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Calculator, TrendingUp, AlertTriangle, Table, BarChart3 } from 'lucide-react'

interface ProjectionEngineProps {
  plan: FinancialPlan
  activeScenario?: Scenario
}

export function ProjectionEngine({ plan, activeScenario }: ProjectionEngineProps) {
  const [startYear, setStartYear] = useState(new Date().getFullYear())
  const [endYear, setEndYear] = useState(new Date().getFullYear() + 30)
  const [isCalculating, setIsCalculating] = useState(false)
  const [activeTab, setActiveTab] = useState('table')
  
  // Memoized projection calculation
  const projectionSummary = useMemo(() => {
    if (!plan) return null
    
    try {
      setIsCalculating(true)
      return calculateProjections(plan, activeScenario, startYear, endYear)
    } catch (error) {
      console.error('Projection calculation error:', error)
      return null
    } finally {
      setIsCalculating(false)
    }
  }, [plan, activeScenario, startYear, endYear])
  
  const handleRecalculate = () => {
    // Force recalculation by updating a dependency
    setIsCalculating(true)
    setTimeout(() => setIsCalculating(false), 100)
  }
  
  const handleExportData = () => {
    if (!projectionSummary) return
    
    // Convert projection data to CSV format
    const csvData = projectionSummary.snapshots.map(snapshot => ({
      Year: snapshot.year,
      'Total Assets': snapshot.totalAssets.toFixed(2),
      'Total Income': snapshot.totalIncome.toFixed(2),
      'Total Commitments': snapshot.totalCommitments.toFixed(2),
      'Net Worth': snapshot.netWorth.toFixed(2),
      'Cash Flow': snapshot.cashFlow.toFixed(2)
    }))
    
    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `financial-projections-${startYear}-${endYear}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }
  
  if (!plan || plan.people.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Calculator className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Data to Project</h3>
          <p className="text-muted-foreground text-center">
            Add people, assets, income, or commitments to your plan to generate financial projections
          </p>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Financial Projections</h2>
          <p className="text-muted-foreground mt-2">
            Year-by-year projections based on your current plan
            {activeScenario && ` (${activeScenario.name})`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={handleExportData}
            variant="outline"
            disabled={!projectionSummary || isCalculating}
          >
            Export CSV
          </Button>
          <Button 
            onClick={handleRecalculate}
            disabled={isCalculating}
          >
            {isCalculating ? 'Calculating...' : 'Recalculate'}
          </Button>
        </div>
      </div>
      
      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Projection Settings</CardTitle>
          <CardDescription>
            Configure the time period for your financial projections
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startYear">Start Year</Label>
              <Input
                id="startYear"
                type="number"
                value={startYear}
                onChange={(e) => setStartYear(parseInt(e.target.value) || new Date().getFullYear())}
                min={2000}
                max={2100}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endYear">End Year</Label>
              <Input
                id="endYear"
                type="number"
                value={endYear}
                onChange={(e) => setEndYear(parseInt(e.target.value) || new Date().getFullYear() + 30)}
                min={startYear + 1}
                max={2150}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Summary Cards */}
      {projectionSummary && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="bg-card p-6 rounded-lg border">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium">Projection Period</h3>
            </div>
            <div className="text-2xl font-bold">{endYear - startYear + 1} years</div>
            <p className="text-xs text-muted-foreground">
              {startYear} to {endYear}
            </p>
          </div>
          
          <div className="bg-card p-6 rounded-lg border">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium">Final Net Worth</h3>
            </div>
            <div className="text-2xl font-bold">
              £{(projectionSummary.snapshots[projectionSummary.snapshots.length - 1]?.netWorth || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Projected for {endYear}
            </p>
          </div>
          
          <div className="bg-card p-6 rounded-lg border">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium">Warnings</h3>
            </div>
            <div className="text-2xl font-bold text-orange-600">
              {projectionSummary.totalWarnings}
            </div>
            <p className="text-xs text-muted-foreground">
              Issues detected
            </p>
          </div>
          
          <div className="bg-card p-6 rounded-lg border">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium">Data Points</h3>
            </div>
            <div className="text-2xl font-bold">
              {projectionSummary.snapshots.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Years calculated
            </p>
          </div>
        </div>
      )}
      
      {/* Main Content */}
      {projectionSummary && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="table" className="flex items-center gap-2">
              <Table className="h-4 w-4" />
              Data Table
            </TabsTrigger>
            <TabsTrigger value="charts" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Charts
            </TabsTrigger>
            <TabsTrigger value="warnings" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Warnings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="table">
            <ProjectionTable 
              projectionSummary={projectionSummary}
              plan={plan}
            />
          </TabsContent>

          <TabsContent value="charts">
            <ProjectionCharts 
              projectionSummary={projectionSummary}
              plan={plan}
            />
          </TabsContent>

          <TabsContent value="warnings">
            <ProjectionWarnings 
              projectionSummary={projectionSummary}
              plan={plan}
            />
          </TabsContent>
        </Tabs>
      )}
      
      {isCalculating && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
              <h3 className="text-lg font-semibold mb-2">Calculating Projections</h3>
              <p className="text-muted-foreground">
                Processing {endYear - startYear + 1} years of financial data...
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
