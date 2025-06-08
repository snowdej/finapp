import { ProjectionSummary, getWarningsBySeverity } from '../../utils/calculations'
import { FinancialPlan } from '../../types'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Alert, AlertDescription } from '../ui/alert.tsx'
import { AlertTriangle, AlertCircle, Info, XCircle } from 'lucide-react'

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
        return <XCircle className="h-4 w-4" />
      case 'medium':
        return <AlertTriangle className="h-4 w-4" />
      case 'low':
        return <Info className="h-4 w-4" />
    }
  }

  const getSeverityColor = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'medium':
        return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'low':
        return 'text-blue-600 bg-blue-50 border-blue-200'
    }
  }

  const getSeverityLabel = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'high':
        return 'Critical Issues'
      case 'medium':
        return 'Important Warnings'
      case 'low':
        return 'Minor Notices'
    }
  }

  if (totalWarnings === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-green-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2 text-green-700">No Issues Detected</h3>
          <p className="text-muted-foreground text-center">
            Your financial projections look healthy with no warnings or issues detected.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Projection Warnings Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-orange-600">{totalWarnings}</div>
              <div className="text-sm text-muted-foreground">Total Warnings</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{warningsBySeverity.high.length}</div>
              <div className="text-sm text-muted-foreground">Critical Issues</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">{warningsBySeverity.medium.length}</div>
              <div className="text-sm text-muted-foreground">Important Warnings</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{warningsBySeverity.low.length}</div>
              <div className="text-sm text-muted-foreground">Minor Notices</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Warnings by Severity */}
      {(['high', 'medium', 'low'] as const).map(severity => {
        const warnings = warningsBySeverity[severity]
        if (warnings.length === 0) return null

        return (
          <Card key={severity}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getSeverityIcon(severity)}
                {getSeverityLabel(severity)} ({warnings.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {warnings.map((warning, index) => (
                  <Alert key={index} className={getSeverityColor(severity)}>
                    <AlertDescription className="flex items-center justify-between">
                      <div>
                        <strong>Year {warning.year}:</strong> {warning.message}
                      </div>
                      <div className="text-xs text-muted-foreground ml-4">
                        {warning.type.replace('_', ' ').toUpperCase()}
                      </div>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        )
      })}

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-600" />
            Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {warningsBySeverity.high.length > 0 && (
              <Alert className="border-red-200 bg-red-50">
                <XCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">
                  <strong>Critical Issues Detected:</strong> Review assets with negative balances. 
                  Consider adjusting assumptions or increasing income sources to prevent financial shortfalls.
                </AlertDescription>
              </Alert>
            )}
            
            {warningsBySeverity.medium.length > 0 && (
              <Alert className="border-orange-200 bg-orange-50">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-700">
                  <strong>Important Warnings:</strong> Some projections show unusual patterns. 
                  Verify growth rates and check for data entry errors.
                </AlertDescription>
              </Alert>
            )}

            <Alert className="border-blue-200 bg-blue-50">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-700">
                <strong>Regular Review:</strong> Update your assumptions annually and after major life events. 
                Consider creating multiple scenarios to explore different possibilities.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

      {/* Warning Details by Year */}
      <Card>
        <CardHeader>
          <CardTitle>Warnings by Year</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Year</th>
                  <th className="text-left p-2">Type</th>
                  <th className="text-left p-2">Severity</th>
                  <th className="text-left p-2">Message</th>
                </tr>
              </thead>
              <tbody>
                {projectionSummary.snapshots
                  .filter(snapshot => snapshot.warnings.length > 0)
                  .flatMap(snapshot => 
                    snapshot.warnings.map(warning => ({ ...warning, year: snapshot.year }))
                  )
                  .sort((a, b) => a.year - b.year)
                  .map((warning, index) => (
                    <tr key={index} className="border-b hover:bg-muted/50">
                      <td className="p-2 font-medium">{warning.year}</td>
                      <td className="p-2">
                        <span className="capitalize">
                          {warning.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                          warning.severity === 'high' ? 'bg-red-100 text-red-800' :
                          warning.severity === 'medium' ? 'bg-orange-100 text-orange-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {getSeverityIcon(warning.severity)}
                          {warning.severity.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-2">{warning.message}</td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
