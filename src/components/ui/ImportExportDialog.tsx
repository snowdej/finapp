import { useState } from 'react'
import { Button } from './button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card'
import { Download, Upload, AlertCircle } from 'lucide-react'
import { downloadPlanAsJSON, importPlanFromFile } from '../../services/storage'

interface ImportExportDialogProps {
  planId?: string
  onImportSuccess?: (planId: string) => void
  onClose?: () => void
}

export function ImportExportDialog({ planId, onImportSuccess, onClose }: ImportExportDialogProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleExport = async () => {
    if (!planId) return
    
    setIsExporting(true)
    setError(null)
    
    try {
      await downloadPlanAsJSON(planId)
      setSuccess('Plan exported successfully!')
    } catch (error) {
      setError('Failed to export plan. Please try again.')
      console.error('Export error:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    setError(null)
    setSuccess(null)

    try {
      const newPlanId = await importPlanFromFile(file)
      setSuccess('Plan imported successfully!')
      onImportSuccess?.(newPlanId)
    } catch (error) {
      setError('Failed to import plan. Please check the file format.')
      console.error('Import error:', error)
    } finally {
      setIsImporting(false)
      // Clear the input
      event.target.value = ''
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Import & Export</h2>
        <p className="text-muted-foreground">
          Save your financial plans as JSON files or import existing plans.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
          <AlertCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          <span className="text-sm text-green-700 dark:text-green-300">{success}</span>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Export */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Export Plan
            </CardTitle>
            <CardDescription>
              Download your current financial plan as a JSON file for backup or sharing.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleExport}
              disabled={!planId || isExporting}
              className="w-full"
            >
              {isExporting ? 'Exporting...' : 'Export Current Plan'}
            </Button>
          </CardContent>
        </Card>

        {/* Import */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Import Plan
            </CardTitle>
            <CardDescription>
              Upload a previously exported JSON file to create a new financial plan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <label htmlFor="import-file" className="block text-sm font-medium mb-2">
                Select JSON file to import
              </label>
              <input
                id="import-file"
                type="file"
                accept=".json"
                onChange={handleImport}
                disabled={isImporting}
                className="block w-full text-sm text-muted-foreground
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-medium
                  file:bg-primary file:text-primary-foreground
                  hover:file:bg-primary/90
                  file:disabled:opacity-50"
              />
              {isImporting && (
                <p className="text-sm text-muted-foreground">Importing...</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {onClose && (
        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      )}
    </div>
  )
}
