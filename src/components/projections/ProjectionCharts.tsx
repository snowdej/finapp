import { ProjectionSummary, calculateNetWorthProgression, calculateCashFlowProgression } from '../../utils/calculations'
import { FinancialPlan } from '../../types'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp, TrendingDown, DollarSign, PieChart as PieChartIcon } from 'lucide-react'

interface ProjectionChartsProps {
  projectionSummary: ProjectionSummary
  plan: FinancialPlan
}

export function ProjectionCharts({ projectionSummary, plan }: ProjectionChartsProps) {
  // Prepare data for charts
  const netWorthData = projectionSummary.snapshots.map(snapshot => ({
    year: snapshot.year,
    netWorth: Math.round(snapshot.netWorth),
    assets: Math.round(snapshot.totalAssets),
    income: Math.round(snapshot.totalIncome),
    commitments: Math.round(snapshot.totalCommitments)
  }))

  const cashFlowData = projectionSummary.snapshots.map(snapshot => ({
    year: snapshot.year,
    cashFlow: Math.round(snapshot.cashFlow),
    income: Math.round(snapshot.totalIncome),
    commitments: Math.round(-snapshot.totalCommitments)
  }))

  // Asset breakdown data for current year
  const currentSnapshot = projectionSummary.snapshots[0]
  const assetBreakdownData = Object.entries(currentSnapshot?.assetsByCategory || {})
    .filter(([_, value]) => value > 0)
    .map(([category, value]) => ({
      name: category,
      value: Math.round(value),
      percentage: Math.round((value / currentSnapshot.totalAssets) * 100)
    }))

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658']

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

  return (
    <div className="space-y-6">
      {/* Net Worth Progression */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Net Worth Progression
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={netWorthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip formatter={formatTooltip} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="netWorth" 
                stroke="#8884d8" 
                strokeWidth={3}
                name="Net Worth"
              />
              <Line 
                type="monotone" 
                dataKey="assets" 
                stroke="#82ca9d" 
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Total Assets"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Cash Flow Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Cash Flow Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={cashFlowData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip formatter={formatTooltip} />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="income" 
                stackId="1"
                stroke="#00C49F" 
                fill="#00C49F"
                name="Income"
              />
              <Area 
                type="monotone" 
                dataKey="commitments" 
                stackId="1"
                stroke="#FF8042" 
                fill="#FF8042"
                name="Commitments"
              />
              <Line 
                type="monotone" 
                dataKey="cashFlow" 
                stroke="#8884d8" 
                strokeWidth={3}
                name="Net Cash Flow"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Asset Allocation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              Current Asset Allocation
            </CardTitle>
          </CardHeader>
          <CardContent>
            {assetBreakdownData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={assetBreakdownData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name} (${percentage}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {assetBreakdownData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Value']} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No assets to display
              </div>
            )}
          </CardContent>
        </Card>

        {/* Year-over-Year Growth */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Annual Growth Rates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={netWorthData.slice(0, 10)}> {/* First 10 years */}
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="income" fill="#00C49F" name="Income" />
                <Bar dataKey="commitments" fill="#FF8042" name="Commitments" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Summary Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Projection Summary Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(Math.max(...netWorthData.map(d => d.netWorth)))}
              </div>
              <div className="text-sm text-muted-foreground">Peak Net Worth</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(Math.max(...cashFlowData.map(d => d.cashFlow)))}
              </div>
              <div className="text-sm text-muted-foreground">Peak Cash Flow</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {projectionSummary.snapshots.length}
              </div>
              <div className="text-sm text-muted-foreground">Years Projected</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {Object.keys(currentSnapshot?.assetsByCategory || {}).length}
              </div>
              <div className="text-sm text-muted-foreground">Asset Categories</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
