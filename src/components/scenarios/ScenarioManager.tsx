import { useState } from 'react'
import { Scenario, PlanAssumptions, AssumptionOverride, Person, Asset, Income, Commitment } from '../../types'
import { validateScenario, generateId } from '../../utils/validation'
import { getDefaultAssumptions } from '../../utils/assumptions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { ScenarioList } from './ScenarioList.tsx'
import { ScenarioForm } from './ScenarioForm.tsx'
import { ScenarioComparison } from './ScenarioComparison.tsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { GitBranch, Plus, BarChart3, Copy } from 'lucide-react'

interface ScenarioManagerProps {
  planId: string
  scenarios: Scenario[]
  activeScenarioId?: string
  currentAssumptions: PlanAssumptions
  currentOverrides: AssumptionOverride[]
  people: Person[]
  assets: Asset[]
  income: Income[]
  commitments: Commitment[]
  onUpdateScenarios: (scenarios: Scenario[]) => void
  onSetActiveScenario: (scenarioId: string) => void
}

export function ScenarioManager({
  planId,
  scenarios,
  activeScenarioId,
  currentAssumptions,
  currentOverrides,
  people,
  assets,
  income,
  commitments,
  onUpdateScenarios,
  onSetActiveScenario
}: ScenarioManagerProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('scenarios')

  const generateScenarioName = (existingScenarios: Scenario[]): string => {
    const count = existingScenarios.length + 1
    return `Scenario ${count}`
  }

  const getBaseScenario = (): Scenario | undefined => {
    return scenarios.find(s => s.isBase)
  }

  const getCurrentScenario = (): Scenario | undefined => {
    return scenarios.find(s => s.id === activeScenarioId)
  }

  const handleAddScenario = (scenarioData: Partial<Scenario>) => {
    const validation = validateScenario(scenarioData)
    if (!validation.isValid) {
      return validation.errors
    }

    const newScenario: Scenario = {
      id: generateId('scenario'),
      planId,
      name: scenarioData.name?.trim() || generateScenarioName(scenarios),
      description: scenarioData.description,
      isBase: scenarioData.isBase || false,
      assumptions: scenarioData.assumptions!,
      overrides: scenarioData.overrides || [],
      createdAt: new Date().toISOString()
    }

    // If this is being marked as base, unmark other base scenarios
    let updatedScenarios = [...scenarios]
    if (newScenario.isBase) {
      updatedScenarios = updatedScenarios.map(s => ({ ...s, isBase: false }))
    }

    updatedScenarios.push(newScenario)
    onUpdateScenarios(updatedScenarios)
    setIsAdding(false)
    return []
  }

  const handleEditScenario = (scenarioData: Partial<Scenario>) => {
    const validation = validateScenario(scenarioData)
    if (!validation.isValid) {
      return validation.errors
    }

    let updatedScenarios = scenarios.map(scenario => 
      scenario.id === editingId 
        ? {
            ...scenario,
            name: scenarioData.name?.trim() || scenario.name,
            description: scenarioData.description,
            isBase: scenarioData.isBase || false,
            assumptions: scenarioData.assumptions!,
            overrides: scenarioData.overrides || [],
            updatedAt: new Date().toISOString()
          }
        : scenario
    )

    // If this is being marked as base, unmark other base scenarios
    if (scenarioData.isBase) {
      updatedScenarios = updatedScenarios.map(s => 
        s.id === editingId ? s : { ...s, isBase: false }
      )
    }

    onUpdateScenarios(updatedScenarios)
    setEditingId(null)
    return []
  }

  const handleCopyScenario = (sourceScenario: Scenario) => {
    const newScenario: Scenario = {
      ...sourceScenario,
      id: generateId('scenario'),
      name: `${sourceScenario.name} (Copy)`,
      isBase: false, // Copies are never base scenarios
      createdAt: new Date().toISOString(),
      updatedAt: undefined
    }

    onUpdateScenarios([...scenarios, newScenario])
  }

  const handleDeleteScenario = (scenarioId: string) => {
    const scenarioToDelete = scenarios.find(s => s.id === scenarioId)
    if (!scenarioToDelete) return

    // Prevent deletion of the last scenario
    if (scenarios.length === 1) {
      alert('Cannot delete the last scenario. You must have at least one scenario.')
      return
    }

    // If deleting the active scenario, switch to base or first scenario
    if (scenarioId === activeScenarioId) {
      const baseScenario = getBaseScenario()
      const nextScenario = baseScenario || scenarios.find(s => s.id !== scenarioId)
      if (nextScenario) {
        onSetActiveScenario(nextScenario.id)
      }
    }

    const updatedScenarios = scenarios.filter(s => s.id !== scenarioId)
    onUpdateScenarios(updatedScenarios)
  }

  const handleSetBaseScenario = (scenarioId: string) => {
    const updatedScenarios = scenarios.map(s => ({
      ...s,
      isBase: s.id === scenarioId,
      updatedAt: s.id === scenarioId ? new Date().toISOString() : s.updatedAt
    }))
    onUpdateScenarios(updatedScenarios)
  }

  const handleCancel = () => {
    setIsAdding(false)
    setEditingId(null)
  }

  const createFromCurrent = () => {
    const newScenario: Partial<Scenario> = {
      name: generateScenarioName(scenarios),
      description: 'Created from current plan state',
      isBase: false,
      assumptions: currentAssumptions,
      overrides: currentOverrides
    }
    
    const validation = validateScenario(newScenario)
    if (validation.isValid) {
      handleAddScenario(newScenario)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Scenarios</h2>
          <p className="text-muted-foreground mt-2">
            Create and compare different what-if scenarios for your financial plan
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={createFromCurrent}
            variant="outline"
            disabled={isAdding || editingId !== null}
            className="flex items-center gap-2"
          >
            <Copy className="h-4 w-4" />
            Create from Current
          </Button>
          <Button 
            onClick={() => setIsAdding(true)}
            disabled={isAdding || editingId !== null}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Scenario
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="scenarios" className="flex items-center gap-2">
            <GitBranch className="h-4 w-4" />
            Manage Scenarios
          </TabsTrigger>
          <TabsTrigger value="comparison" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Compare Scenarios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scenarios">
          {/* Current Scenario Info */}
          {getCurrentScenario() && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GitBranch className="h-5 w-5 text-primary" />
                  Active Scenario: {getCurrentScenario()!.name}
                  {getCurrentScenario()!.isBase && (
                    <span className="bg-primary text-primary-foreground px-2 py-1 text-xs rounded-full">
                      BASE
                    </span>
                  )}
                </CardTitle>
                <CardDescription>
                  All changes you make will be applied to this scenario
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  {getCurrentScenario()!.description || 'No description provided'}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Add Scenario Form */}
          {isAdding && (
            <Card>
              <CardHeader>
                <CardTitle>Create New Scenario</CardTitle>
                <CardDescription>
                  Create a new what-if scenario with different assumptions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScenarioForm
                  planId={planId}
                  defaultAssumptions={currentAssumptions}
                  defaultOverrides={currentOverrides}
                  onSubmit={handleAddScenario}
                  onCancel={handleCancel}
                  submitLabel="Create Scenario"
                />
              </CardContent>
            </Card>
          )}

          {/* Scenario List */}
          <ScenarioList
            scenarios={scenarios}
            activeScenarioId={activeScenarioId}
            editingId={editingId}
            onEdit={setEditingId}
            onDelete={handleDeleteScenario}
            onCopy={handleCopyScenario}
            onSetActive={onSetActiveScenario}
            onSetBase={handleSetBaseScenario}
            onSave={handleEditScenario}
            onCancel={handleCancel}
            disabled={isAdding}
            planId={planId}
          />
        </TabsContent>

        <TabsContent value="comparison">
          <ScenarioComparison
            scenarios={scenarios}
            people={people}
            assets={assets}
            income={income}
            commitments={commitments}
          />
        </TabsContent>
      </Tabs>

      {/* Summary */}
      {scenarios.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Scenario Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{scenarios.length}</div>
                <div className="text-sm text-muted-foreground">Total Scenarios</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {scenarios.filter(s => s.isBase).length}
                </div>
                <div className="text-sm text-muted-foreground">Base Scenarios</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {activeScenarioId ? '1' : '0'}
                </div>
                <div className="text-sm text-muted-foreground">Active Scenario</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {scenarios.reduce((sum, s) => sum + (s.overrides?.length || 0), 0)}
                </div>
                <div className="text-sm text-muted-foreground">Total Overrides</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
