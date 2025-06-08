import { ProjectionSummary, getWarningsBySeverity } from '../../utils/calculations'
import { FinancialPlan } from '../../types'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { AlertTriangle, AlertCircle, Info, CheckCircle } from 'lucide-react'

interface ProjectionWarningsProps {
  projectionSummary: ProjectionSummary
  plan: FinancialPlan
}

export function ProjectionWarnings({ projectionSummary, plan }: ProjectionWarningsProps) {
  const warningsBySeverity = getWarningsBySeverity(projectionSummary)
  const totalWarnings = projectionSummary.totalWarnings

  const getSeverityIcon = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case 'medium':
        return <AlertCircle className="h-4 w-4 text-orange-600" />
      case 'low':
        return <Info className="h-4 w-4 text-blue-600" />
    }
  }

  const getSeverityColor = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'medium':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200'
    }
  }

  if (totalWarnings === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <CheckCircle className="h-12 w-12 text-green-600 mb-4" />
          <h3 className="text-lg font-semibold mb-2 text-green-700">All Clear!</h3>
          <p className="text-muted-foreground text-center">
            No warnings detected in your financial projections. Your plan looks solid!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">Projection Warnings & Issues</h3>
          <p className="text-muted-foreground mt-2">
            {totalWarnings} warning{totalWarnings !== 1 ? 's' : ''} detected across your financial projections
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="destructive">{warningsBySeverity.high.length} High</Badge>
          <Badge variant="default" className="bg-orange-600">{warningsBySeverity.medium.length} Medium</Badge>
          <Badge variant="secondary">{warningsBySeverity.low.length} Low</Badge>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              High Priority
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">{warningsBySeverity.high.length}</div>
            <p className="text-sm text-red-600">Critical issues requiring immediate attention</p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <AlertCircle className="h-5 w-5" />
              Medium Priority
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-700">{warningsBySeverity.medium.length}</div>
            <p className="text-sm text-orange-600">Issues that should be reviewed</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <Info className="h-5 w-5" />
              Low Priority
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">{warningsBySeverity.low.length}</div>
            <p className="text-sm text-blue-600">Minor issues for awareness</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Warnings */}
      {(['high', 'medium', 'low'] as const).map(severity => {
        const warnings = warningsBySeverity[severity]
        if (warnings.length === 0) return null

        return (
          <Card key={severity}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getSeverityIcon(severity)}
                {severity.charAt(0).toUpperCase() + severity.slice(1)} Priority Issues
                <Badge variant="outline">{warnings.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {warnings.map((warning, index) => (
                  <div
                    key={index}
                    className={`p-4 border rounded-lg ${getSeverityColor(severity)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">Year {warning.year}</span>
                          <Badge variant="outline" className="text-xs">
                            {warning.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Badge>
                        </div>
                        <p className="text-sm">{warning.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )
      })}

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {warningsBySeverity.high.length > 0 && (
              <div className="p-4 border-l-4 border-red-500 bg-red-50">
                <h4 className="font-semibold text-red-700 mb-2">High Priority Actions</h4>
                <ul className="text-sm text-red-600 space-y-1">
                  <li>• Review negative asset balances and adjust withdrawal strategies</li>
                  <li>• Consider increasing income or reducing commitments</li>
                  <li>• Validate unrealistic growth rate assumptions</li>
                </ul>
              </div>
            )}

            {warningsBySeverity.medium.length > 0 && (
              <div className="p-4 border-l-4 border-orange-500 bg-orange-50">
                <h4 className="font-semibold text-orange-700 mb-2">Medium Priority Actions</h4>
                <ul className="text-sm text-orange-600 space-y-1">
                  <li>• Review negative income or commitment values</li>
                  <li>• Consider scenario planning for different outcomes</li>
                  <li>• Validate data entry for accuracy</li>
                </ul>
              </div>
            )}

            {warningsBySeverity.low.length > 0 && (
              <div className="p-4 border-l-4 border-blue-500 bg-blue-50">
                <h4 className="font-semibold text-blue-700 mb-2">General Recommendations</h4>
                <ul className="text-sm text-blue-600 space-y-1">
                  <li>• Monitor projections regularly and update assumptions</li>
                  <li>• Consider creating multiple scenarios for comparison</li>
                  <li>• Review and update your plan annually</li>
                </ul>
              </div>
            )}

            {totalWarnings === 0 && (
              <div className="p-4 border-l-4 border-green-500 bg-green-50">
                <h4 className="font-semibold text-green-700 mb-2">Excellent Planning!</h4>
                <ul className="text-sm text-green-600 space-y-1">
                  <li>• Your projections look healthy with no major issues</li>
                  <li>• Continue monitoring and updating your plan regularly</li>
                  <li>• Consider stress-testing with different scenarios</li>
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}