import { useState } from 'react'
import { ProjectionSummary, calculateNetWorthProgression, calculateCashFlowProgression } from '../../utils/calculations'
import { FinancialPlan } from '../../types'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from 'recharts'
import { TrendingUp, TrendingDown, DollarSign, PieChart as PieChartIcon, BarChart3, Download } from 'lucide-react'

interface ProjectionChartsProps {
  projectionSummary: ProjectionSummary
  plan: FinancialPlan
}

export function ProjectionCharts({ projectionSummary, plan }: ProjectionChartsProps) {
  const [selectedChartPeriod, setSelectedChartPeriod] = useState<'all' | '10' | '20' | '30'>('20')
  
  // Filter data based on selected period
  const getFilteredData = (period: string) => {
    const maxYears = period === 'all' ? projectionSummary.snapshots.length : parseInt(period)
    return projectionSummary.snapshots.slice(0, maxYears)
  }
  
  const filteredSnapshots = getFilteredData(selectedChartPeriod)

  // Prepare data for charts
  const netWorthData = filteredSnapshots.map(snapshot => ({
    year: snapshot.year,
    netWorth: Math.round(snapshot.netWorth),
    assets: Math.round(snapshot.totalAssets),
    income: Math.round(snapshot.totalIncome),
    commitments: Math.round(snapshot.totalCommitments),
    cashFlow: Math.round(snapshot.cashFlow)
  }))

  const cashFlowData = filteredSnapshots.map(snapshot => ({
    year: snapshot.year,
    cashFlow: Math.round(snapshot.cashFlow),
    income: Math.round(snapshot.totalIncome),
    commitments: Math.round(-snapshot.totalCommitments),
    netIncome: Math.round(snapshot.totalIncome - snapshot.totalCommitments)
  }))

  // Asset breakdown data for current year and final year
  const currentSnapshot = projectionSummary.snapshots[0]
  const finalSnapshot = projectionSummary.snapshots[projectionSummary.snapshots.length - 1]
  
  const currentAssetBreakdown = Object.entries(currentSnapshot?.assetsByCategory || {})
    .filter(([_, value]) => value > 0)
    .map(([category, value]) => ({
      name: category,
      value: Math.round(value),
      percentage: Math.round((value / currentSnapshot.totalAssets) * 100)
    }))

  const finalAssetBreakdown = Object.entries(finalSnapshot?.assetsByCategory || {})
    .filter(([_, value]) => value > 0)
    .map(([category, value]) => ({
      name: category,
      value: Math.round(value),
      percentage: Math.round((value / finalSnapshot.totalAssets) * 100)
    }))

  // Asset growth over time data
  const assetGrowthData = filteredSnapshots.map(snapshot => {
    const data: any = { year: snapshot.year }
    Object.entries(snapshot.assetsByCategory).forEach(([category, value]) => {
      data[category] = Math.round(value)
    })
    return data
  })

  // Get unique asset categories for chart colors
  const assetCategories = Object.keys(currentSnapshot?.assetsByCategory || {})
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF6B6B', '#4ECDC4', '#45B7D1']

  const formatCurrency = (value: number) => {
    if (Math.abs(value) >= 1000000) {
      return `£${(value / 1000000).toFixed(1)}M`
    } else if (Math.abs(value) >= 1000) {
      return `£${(value / 1000).toFixed(0)}K`
    }
    return `£${value.toLocaleString()}`
  }

  const formatTooltip = (value: number, name: string) => {
    return [formatCurrency(value), name]
  }

  const exportChartData = (chartType: string) => {
    let dataToExport: any[] = []
    let filename = ''

    switch (chartType) {
      case 'networth':
        dataToExport = netWorthData
        filename = 'net-worth-projection'
        break
      case 'cashflow':
        dataToExport = cashFlowData
        filename = 'cash-flow-projection'
        break
      case 'assets':
        dataToExport = assetGrowthData
        filename = 'asset-growth-projection'
        break
      default:
        return
    }

    const csvContent = [
      Object.keys(dataToExport[0]).join(','),
      ...dataToExport.map(row => Object.values(row).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${filename}-${selectedChartPeriod}years.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Chart Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Chart Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">Time Period:</label>
            <div className="flex gap-2">
              {['10', '20', '30', 'all'].map(period => (
                <Button
                  key={period}
                  variant={selectedChartPeriod === period ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedChartPeriod(period as any)}
                >
                  {period === 'all' ? 'All Years' : `${period} Years`}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Net Worth Progression */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Net Worth & Asset Progression
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportChartData('networth')}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={netWorthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip formatter={formatTooltip} />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="assets" 
                fill="#8884d8" 
                fillOpacity={0.3}
                stroke="#8884d8"
                name="Total Assets"
              />
              <Line 
                type="monotone" 
                dataKey="netWorth" 
                stroke="#FF8042" 
                strokeWidth={3}
                name="Net Worth"
                dot={{ fill: '#FF8042', strokeWidth: 2, r: 4 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Cash Flow Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Cash Flow Analysis
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportChartData('cashflow')}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={cashFlowData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip formatter={formatTooltip} />
              <Legend />
              <Bar 
                dataKey="income" 
                fill="#00C49F" 
                name="Annual Income"
                fillOpacity={0.8}
              />
              <Bar 
                dataKey="commitments" 
                fill="#FF8042" 
                name="Annual Commitments"
                fillOpacity={0.8}
              />
              <Line 
                type="monotone" 
                dataKey="cashFlow" 
                stroke="#8884d8" 
                strokeWidth={3}
                name="Net Cash Flow"
                dot={{ fill: '#8884d8', strokeWidth: 2, r: 3 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Asset Growth Over Time */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Asset Growth by Category
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportChartData('assets')}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={assetGrowthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip formatter={formatTooltip} />
              <Legend />
              {assetCategories.map((category, index) => (
                <Area
                  key={category}
                  type="monotone"
                  dataKey={category}
                  stackId="1"
                  stroke={COLORS[index % COLORS.length]}
                  fill={COLORS[index % COLORS.length]}
                  fillOpacity={0.7}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Asset Allocation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              Current Asset Allocation
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentAssetBreakdown.length > 0 ? (
              <div className="space-y-4">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={currentAssetBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name} (${percentage}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {currentAssetBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Value']} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {currentAssetBreakdown.map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span>{item.name}</span>
                      </div>
                      <span className="font-medium">{formatCurrency(item.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No assets to display
              </div>
            )}
          </CardContent>
        </Card>

        {/* Projected Asset Allocation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              Projected Asset Allocation ({finalSnapshot?.year})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {finalAssetBreakdown.length > 0 ? (
              <div className="space-y-4">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={finalAssetBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name} (${percentage}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {finalAssetBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Value']} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {finalAssetBreakdown.map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span>{item.name}</span>
                      </div>
                      <span className="font-medium">{formatCurrency(item.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No projected assets
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Key Metrics Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Key Financial Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(Math.max(...netWorthData.map(d => d.netWorth)))}
              </div>
              <div className="text-sm text-muted-foreground">Peak Net Worth</div>
              <div className="text-xs text-muted-foreground">
                Year {netWorthData.find(d => d.netWorth === Math.max(...netWorthData.map(d => d.netWorth)))?.year}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(Math.max(...cashFlowData.map(d => d.cashFlow)))}
              </div>
              <div className="text-sm text-muted-foreground">Peak Cash Flow</div>
              <div className="text-xs text-muted-foreground">
                Year {cashFlowData.find(d => d.cashFlow === Math.max(...cashFlowData.map(d => d.cashFlow)))?.year}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(((finalSnapshot?.netWorth || 0) - (currentSnapshot?.netWorth || 0)) / (currentSnapshot?.netWorth || 1) * 100)}%
              </div>
              <div className="text-sm text-muted-foreground">Total Growth</div>
              <div className="text-xs text-muted-foreground">
                {currentSnapshot?.year} to {finalSnapshot?.year}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {Math.round(filteredSnapshots.reduce((sum, s) => sum + s.cashFlow, 0) / filteredSnapshots.length) > 0 ? 
                  Math.round(filteredSnapshots.filter(s => s.cashFlow > 0).length / filteredSnapshots.length * 100) :
                  0
                }%
              </div>
              <div className="text-sm text-muted-foreground">Positive Cash Flow</div>
              <div className="text-xs text-muted-foreground">
                Percentage of years
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Year-over-Year Growth Rates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Year-over-Year Growth Rates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={netWorthData.slice(1, 11).map((current, index) => {
              const previous = netWorthData[index]
              const growthRate = previous.netWorth > 0 ? 
                ((current.netWorth - previous.netWorth) / previous.netWorth * 100) : 0
              const assetGrowthRate = previous.assets > 0 ? 
                ((current.assets - previous.assets) / previous.assets * 100) : 0
              
              return {
                year: current.year,
                netWorthGrowth: Math.round(growthRate * 100) / 100,
                assetGrowth: Math.round(assetGrowthRate * 100) / 100
              }
            })}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis label={{ value: 'Growth Rate (%)', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value: number) => [`${value}%`, 'Growth Rate']} />
              <Legend />
              <Bar dataKey="netWorthGrowth" fill="#8884d8" name="Net Worth Growth %" />
              <Bar dataKey="assetGrowth" fill="#82ca9d" name="Asset Growth %" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
