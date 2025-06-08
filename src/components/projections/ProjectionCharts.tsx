import { useState } from 'react'
import { ProjectionSummary, calculateNetWorthProgression, calculateCashFlowProgression } from '../../utils/calculations'
import { FinancialPlan } from '../../types'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { TrendingUp, PieChart as PieChartIcon, BarChart3, Download } from 'lucide-react'

interface ProjectionChartsProps {
  projectionSummary: ProjectionSummary
  plan: FinancialPlan
}

export function ProjectionCharts({ projectionSummary, plan }: ProjectionChartsProps) {
  const [selectedYear, setSelectedYear] = useState(projectionSummary.snapshots[Math.floor(projectionSummary.snapshots.length / 2)]?.year || new Date().getFullYear())

  // Prepare data for charts
  const timelineData = projectionSummary.snapshots.map(snapshot => ({
    year: snapshot.year,
    netWorth: snapshot.netWorth,
    totalAssets: snapshot.totalAssets,
    totalIncome: snapshot.totalIncome,
    totalCommitments: Math.abs(snapshot.totalCommitments),
    cashFlow: snapshot.cashFlow
  }))

  const selectedSnapshot = projectionSummary.snapshots.find(s => s.year === selectedYear)
  const assetBreakdownData = selectedSnapshot ? Object.entries(selectedSnapshot.assetsByCategory).map(([category, value]) => ({
    name: category,
    value: Math.max(0, value),
    percentage: ((value / selectedSnapshot.totalAssets) * 100).toFixed(1)
  })).filter(item => item.value > 0) : []

  // Category trends over time
  const categoryTrendsData = projectionSummary.snapshots.map(snapshot => {
    const data: any = { year: snapshot.year }
    Object.entries(snapshot.assetsByCategory).forEach(([category, value]) => {
      if (value > 0) {
        data[category] = value
      }
    })
    return data
  })

  const colors = [
    '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00',
    '#0088fe', '#00c49f', '#ffbb28', '#ff8042', '#8dd1e1'
  ]

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `£${(value / 1000000).toFixed(1)}M`
    } else if (value >= 1000) {
      return `£${(value / 1000).toFixed(0)}K`
    }
    return `£${value.toLocaleString()}`
  }

  const formatYear = (year: number) => `'${year.toString().slice(-2)}`

  const downloadChart = (chartName: string) => {
    // This would normally require a library like html2canvas
    // For now, we'll just show an alert
    alert(`Download functionality for ${chartName} would be implemented here`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold">Financial Charts & Analysis</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => downloadChart('All Charts')}>
            <Download className="h-4 w-4 mr-2" />
            Export Charts
          </Button>
        </div>
      </div>

      <Tabs defaultValue="timeline" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="timeline" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Timeline
          </TabsTrigger>
          <TabsTrigger value="breakdown" className="flex items-center gap-2">
            <PieChartIcon className="h-4 w-4" />
            Breakdown
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Trends
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="timeline">
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            {/* Net Worth Over Time */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Net Worth Progression
                  <Button variant="ghost" size="sm" onClick={() => downloadChart('Net Worth')}>
                    <Download className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" tickFormatter={formatYear} />
                    <YAxis tickFormatter={formatCurrency} />
                    <Tooltip
                      formatter={(value: number) => [formatCurrency(value), 'Net Worth']}
                      labelFormatter={(year) => `Year ${year}`}
                    />
                    <Line
                      type="monotone"
                      dataKey="netWorth"
                      stroke="#8884d8"
                      strokeWidth={3}
                      dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Cash Flow Over Time */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Annual Cash Flow
                  <Button variant="ghost" size="sm" onClick={() => downloadChart('Cash Flow')}>
                    <Download className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" tickFormatter={formatYear} />
                    <YAxis tickFormatter={formatCurrency} />
                    <Tooltip
                      formatter={(value: number) => [formatCurrency(value), 'Cash Flow']}
                      labelFormatter={(year) => `Year ${year}`}
                    />
                    <Bar
                      dataKey="cashFlow"
                      fill={(dataPoint: any) => dataPoint.cashFlow >= 0 ? '#82ca9d' : '#ff7300'}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Income vs Commitments */}
            <Card className="md:col-span-1 lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Income vs Commitments
                  <Button variant="ghost" size="sm" onClick={() => downloadChart('Income vs Commitments')}>
                    <Download className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" tickFormatter={formatYear} />
                    <YAxis tickFormatter={formatCurrency} />
                    <Tooltip
                      formatter={(value: number, name: string) => [formatCurrency(value), name]}
                      labelFormatter={(year) => `Year ${year}`}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="totalIncome"
                      stackId="1"
                      stroke="#82ca9d"
                      fill="#82ca9d"
                      name="Income"
                    />
                    <Area
                      type="monotone"
                      dataKey="totalCommitments"
                      stackId="2"
                      stroke="#ff7300"
                      fill="#ff7300"
                      name="Commitments"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="breakdown">
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            {/* Asset Breakdown Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Asset Allocation ({selectedYear})
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                      className="text-sm border rounded px-2 py-1"
                      aria-label="Select year for asset allocation"
                    >
                      {projectionSummary.snapshots.map(snapshot => (
                        <option key={snapshot.year} value={snapshot.year}>
                          {snapshot.year}
                        </option>
                      ))}
                    </select>
                    <Button variant="ghost" size="sm" onClick={() => downloadChart('Asset Breakdown')}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={assetBreakdownData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {assetBreakdownData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Asset Breakdown Table */}
            <Card>
              <CardHeader>
                <CardTitle>Asset Details ({selectedYear})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {assetBreakdownData.map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: colors[index % colors.length] }}
                        />
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{formatCurrency(item.value)}</div>
                        <div className="text-sm text-muted-foreground">{item.percentage}%</div>
                      </div>
                    </div>
                  ))}
                  {assetBreakdownData.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No assets with positive values in {selectedYear}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends">
          <div className="space-y-6">
            {/* Category Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Asset Category Trends
                  <Button variant="ghost" size="sm" onClick={() => downloadChart('Category Trends')}>
                    <Download className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={categoryTrendsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" tickFormatter={formatYear} />
                    <YAxis tickFormatter={formatCurrency} />
                    <Tooltip
                      formatter={(value: number, name: string) => [formatCurrency(value), name]}
                      labelFormatter={(year) => `Year ${year}`}
                    />
                    <Legend />
                    {Object.keys(projectionSummary.categoryTotals).map((category, index) => (
                      <Area
                        key={category}
                        type="monotone"
                        dataKey={category}
                        stackId="1"
                        stroke={colors[index % colors.length]}
                        fill={colors[index % colors.length]}
                      />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Growth Rate Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Growth Rate Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {Object.entries(projectionSummary.categoryTotals).map(([category, yearlyValues]) => {
                    const years = Object.keys(yearlyValues).map(Number).sort()
                    const startValue = yearlyValues[years[0]] || 0
                    const endValue = yearlyValues[years[years.length - 1]] || 0
                    const totalGrowth = startValue > 0 ? ((endValue - startValue) / startValue) * 100 : 0
                    const annualGrowth = years.length > 1 ? Math.pow(endValue / startValue, 1 / (years.length - 1)) - 1 : 0

                    return (
                      <div key={category} className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2">{category}</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Start Value:</span>
                            <span>{formatCurrency(startValue)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>End Value:</span>
                            <span>{formatCurrency(endValue)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Total Growth:</span>
                            <span className={totalGrowth >= 0 ? 'text-green-600' : 'text-red-600'}>
                              {totalGrowth.toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Annual Growth:</span>
                            <span className={annualGrowth >= 0 ? 'text-green-600' : 'text-red-600'}>
                              {(annualGrowth * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analysis">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Key Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Key Financial Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(() => {
                    const firstSnapshot = projectionSummary.snapshots[0]
                    const lastSnapshot = projectionSummary.snapshots[projectionSummary.snapshots.length - 1]
                    const totalYears = lastSnapshot.year - firstSnapshot.year
                    const netWorthGrowth = firstSnapshot.netWorth > 0 ?
                      ((lastSnapshot.netWorth - firstSnapshot.netWorth) / firstSnapshot.netWorth) * 100 : 0
                    const avgCashFlow = timelineData.reduce((sum, item) => sum + item.cashFlow, 0) / timelineData.length
                    const positiveYears = timelineData.filter(item => item.cashFlow > 0).length
                    const cashFlowPositivity = (positiveYears / timelineData.length) * 100

                    return (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-3 border rounded">
                            <div className="text-2xl font-bold text-blue-600">
                              {formatCurrency(lastSnapshot.netWorth)}
                            </div>
                            <div className="text-sm text-muted-foreground">Final Net Worth</div>
                          </div>
                          <div className="text-center p-3 border rounded">
                            <div className={`text-2xl font-bold ${netWorthGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {netWorthGrowth.toFixed(1)}%
                            </div>
                            <div className="text-sm text-muted-foreground">Total Growth</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-3 border rounded">
                            <div className={`text-2xl font-bold ${avgCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {formatCurrency(avgCashFlow)}
                            </div>
                            <div className="text-sm text-muted-foreground">Avg Cash Flow</div>
                          </div>
                          <div className="text-center p-3 border rounded">
                            <div className={`text-2xl font-bold ${cashFlowPositivity >= 50 ? 'text-green-600' : 'text-red-600'}`}>
                              {cashFlowPositivity.toFixed(0)}%
                            </div>
                            <div className="text-sm text-muted-foreground">Positive Years</div>
                          </div>
                        </div>
                      </>
                    )
                  })()}
                </div>
              </CardContent>
            </Card>

            {/* Milestones */}
            <Card>
              <CardHeader>
                <CardTitle>Financial Milestones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(() => {
                    const milestones = []
                    const targets = [100000, 250000, 500000, 1000000, 2000000]

                    targets.forEach(target => {
                      const milestone = timelineData.find(item => item.netWorth >= target)
                      if (milestone) {
                        milestones.push({
                          target: formatCurrency(target),
                          year: milestone.year,
                          achieved: true
                        })
                      } else {
                        milestones.push({
                          target: formatCurrency(target),
                          year: null,
                          achieved: false
                        })
                      }
                    })

                    return milestones.map((milestone, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <span className="font-medium">{milestone.target} Net Worth</span>
                        {milestone.achieved ? (
                          <span className="text-green-600 font-medium">Year {milestone.year}</span>
                        ) : (
                          <span className="text-muted-foreground">Not reached</span>
                        )}
                      </div>
                    ))
                  })()}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
