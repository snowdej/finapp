import { useState } from 'react'
import { Button } from './button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card'
import { exportPlanAsJSON, importPlanFromJSON } from '../../services/storage'
import { Download, Upload } from 'lucide-react'

interface ImportExportDialogProps {
  planId?: string
  onImportSuccess?: (newPlanId: string) => void
  onClose?: () => void
}
export function ImportExportDialog({ planId, onImportSuccess, onClose }: ImportExportDialogProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)

  const handleExport = async () => {
    if (!planId) return

    setIsExporting(true)
    try {
      const jsonData = await exportPlanAsJSON(planId)
      
      // Create and download file
      const blob = new Blob([jsonData], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `financial-plan-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    setImportError(null)

    try {
      const text = await file.text()
      const newPlanId = await importPlanFromJSON(text)
      onImportSuccess?.(newPlanId)
    } catch (error) {
      setImportError('Failed to import plan. Please check the file format.')
      console.error('Import failed:', error)
    } finally {
      setIsImporting(false)
      // Reset file input
      event.target.value = ''
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Import & Export</h2>
        <p className="text-muted-foreground mt-2">
          Save your plan to a file or import an existing plan
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Export Plan
            </CardTitle>
            <CardDescription>
              Download your current financial plan as a JSON file
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleExport}
              disabled={!planId || isExporting}
              className="w-full"
            >
              {isExporting ? 'Exporting...' : 'Export Plan'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Import Plan
            </CardTitle>
            <CardDescription>
              Upload a previously exported financial plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              disabled={isImporting}
              placeholder="Choose a JSON file to import"
              aria-label="Import financial plan file"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            {importError && (
              <p className="text-sm text-destructive">{importError}</p>
            )}
            {isImporting && (
              <p className="text-sm text-muted-foreground">Importing...</p>
            )}
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
