import { useState, useEffect } from 'react'
import { 
  Calculator, 
  PiggyBank, 
  TrendingUp, 
  Users, 
  Wallet, 
  CreditCard, 
  Calendar, 
  GitBranch, 
  Settings,
  LayoutDashboard,
  LucideIcon
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card'
import { Button } from './components/ui/button'
import { ImportExportDialog } from './components/ui/ImportExportDialog'
import { loadAllPlans, savePlan } from './services/storage'
import { useAutosave } from './hooks/useAutosave'
import { PeopleManager } from './components/people/PeopleManager'
import { AssetManager } from './components/assets/AssetManager'
import { IncomeManager } from './components/income/IncomeManager'
import { CommitmentManager } from './components/commitments/CommitmentManager'
import { EventManager } from './components/events/EventManager'
import { AssumptionsManager } from './components/assumptions/AssumptionsManager'
import { getDefaultAssumptions } from './utils/assumptions'
import { generateId } from './utils/validation'
import { Person, Asset, Income, Commitment, Event, PlanAssumptions, AssumptionOverride, Scenario } from './types'
import { ScenarioManager } from './components/scenarios/ScenarioManager'

type TabId = 'dashboard' | 'people' | 'assets' | 'income' | 'commitments' | 'events' | 'scenarios' | 'settings'

interface NavItem {
  id: TabId;
  label: string;
  icon: LucideIcon;
}

function App() {
  const [darkMode, setDarkMode] = useState(false)
  const [activeTab, setActiveTab] = useState<TabId>('dashboard')
  const [currentPlan, setCurrentPlan] = useState<any>(null)
  const [planId, setPlanId] = useState<string | null>(null)

  // Enable autosave for the current plan
  useAutosave(currentPlan, !!currentPlan)

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'dark') {
      setDarkMode(true)
      document.documentElement.classList.add('dark')
    }
  }, [])

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    document.documentElement.classList.toggle('dark', newDarkMode)
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light')
  }

  const handleUpdateAssumptions = (assumptions: PlanAssumptions) => {
    if (currentPlan) {
      const updatedPlan = { ...currentPlan, assumptions }
      setCurrentPlan(updatedPlan)
      // Auto-save will be triggered by useAutosave hook
    }
  }

  const handleUpdateOverrides = (overrides: AssumptionOverride[]) => {
    if (currentPlan) {
      const updatedPlan = { ...currentPlan, overrides }
      setCurrentPlan(updatedPlan)
      // Auto-save will be triggered by useAutosave hook
    }
  }

  const handleUpdateScenarios = (scenarios: Scenario[]) => {
    if (currentPlan) {
      const updatedPlan = { ...currentPlan, scenarios }
      setCurrentPlan(updatedPlan)
      // Auto-save will be triggered by useAutosave hook
    }
  }

  const handleSetActiveScenario = (scenarioId: string) => {
    if (currentPlan) {
      const updatedPlan = { ...currentPlan, activeScenarioId: scenarioId }
      setCurrentPlan(updatedPlan)
      // Auto-save will be triggered by useAutosave hook
    }
  }

  // Load or create initial plan
  useEffect(() => {
    const initializePlan = async () => {
      try {
        const plans = await loadAllPlans()
        if (plans.length > 0) {
          // Load the most recent plan
          const latestPlan = plans.sort((a, b) => 
            new Date(b.updatedAt || b.createdAt).getTime() - 
            new Date(a.updatedAt || a.createdAt).getTime()
          )[0]
          setCurrentPlan(latestPlan)
          setPlanId(latestPlan.id)
        } else {
          // Create a default plan with base scenario
          const defaultAssumptions = getDefaultAssumptions()
          const baseScenario: Scenario = {
            id: generateId('scenario'),
            planId: `plan-${Date.now()}`,
            name: 'Base Scenario',
            description: 'Default baseline scenario',
            isBase: true,
            assumptions: defaultAssumptions,
            overrides: [],
            createdAt: new Date().toISOString()
          }

          const defaultPlan = {
            id: `plan-${Date.now()}`,
            name: 'My Financial Plan',
            people: [],
            assets: [],
            income: [],
            commitments: [],
            events: [],
            assumptions: defaultAssumptions,
            overrides: [],
            scenarios: [baseScenario],
            activeScenarioId: baseScenario.id,
            createdAt: new Date().toISOString()
          }
          
          await savePlan(defaultPlan)
          setCurrentPlan(defaultPlan)
          setPlanId(defaultPlan.id)
        }
      } catch (error) {
        console.error('Failed to initialize plan:', error)
      }
    }

    initializePlan()
  }, [])

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'people', label: 'People', icon: Users },
    { id: 'assets', label: 'Assets', icon: PiggyBank },
    { id: 'income', label: 'Income', icon: Wallet },
    { id: 'commitments', label: 'Commitments', icon: CreditCard },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'scenarios', label: 'Scenarios', icon: GitBranch },
    { id: 'settings', label: 'Settings', icon: Settings }
  ]

  const handleImportSuccess = (newPlanId: string) => {
    // Optionally switch to the imported plan
    console.log('Plan imported with ID:', newPlanId)
    // You could load the new plan here if desired
  }

  const handleUpdatePeople = (people: Person[]) => {
    if (currentPlan) {
      const updatedPlan = { ...currentPlan, people }
      setCurrentPlan(updatedPlan)
      // Auto-save will be triggered by useAutosave hook
    }
  }

  const handleUpdateAssets = (assets: Asset[]) => {
    if (currentPlan) {
      const updatedPlan = { ...currentPlan, assets }
      setCurrentPlan(updatedPlan)
      // Auto-save will be triggered by useAutosave hook
    }
  }

  const handleUpdateIncome = (income: Income[]) => {
    if (currentPlan) {
      const updatedPlan = { ...currentPlan, income }
      setCurrentPlan(updatedPlan)
      // Auto-save will be triggered by useAutosave hook
    }
  }

  const handleUpdateCommitments = (commitments: Commitment[]) => {
    if (currentPlan) {
      const updatedPlan = { ...currentPlan, commitments }
      setCurrentPlan(updatedPlan)
      // Auto-save will be triggered by useAutosave hook
    }
  }

  const handleUpdateEvents = (events: Event[]) => {
    if (currentPlan) {
      const updatedPlan = { ...currentPlan, events }
      setCurrentPlan(updatedPlan)
      // Auto-save will be triggered by useAutosave hook
    }
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Welcome to Your Financial Dashboard</h2>
              <p className="text-muted-foreground mt-2">
                Plan your financial future with comprehensive projections and scenario modeling
              </p>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-card text-card-foreground">
                <CardHeader>
                  <div className="flex items-center mb-4">
                    <PiggyBank className="h-8 w-8 text-primary mr-3" />
                    <CardTitle>Assets & Pensions</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Track ISAs, SIPPs, property, and other investments with detailed projections.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="bg-card text-card-foreground">
                <CardHeader>
                  <div className="flex items-center mb-4">
                    <Calculator className="h-8 w-8 text-primary mr-3" />
                    <CardTitle>Income & Commitments</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Manage salaries, benefits, mortgages, and ongoing expenses with inflation adjustments.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="bg-card text-card-foreground">
                <CardHeader>
                  <div className="flex items-center mb-4">
                    <TrendingUp className="h-8 w-8 text-primary mr-3" />
                    <CardTitle>Projections & Scenarios</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Visualise your financial future with detailed reports and what-if scenarios.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="bg-card p-6 rounded-lg border">
                <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <h3 className="text-sm font-medium">Total Assets</h3>
                </div>
                <div className="text-2xl font-bold">£0</div>
                <p className="text-xs text-muted-foreground">
                  {currentPlan?.assets?.length || 0} assets configured
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg border">
                <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <h3 className="text-sm font-medium">Monthly Income</h3>
                </div>
                <div className="text-2xl font-bold">£0</div>
                <p className="text-xs text-muted-foreground">
                  {currentPlan?.income?.length || 0} income sources
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg border">
                <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <h3 className="text-sm font-medium">People</h3>
                </div>
                <div className="text-2xl font-bold">{currentPlan?.people?.length || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {(currentPlan?.people?.length || 0) === 0 ? 'No people added yet' : 'people in plan'}
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg border">
                <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <h3 className="text-sm font-medium">Scenarios</h3>
                </div>
                <div className="text-2xl font-bold">1</div>
                <p className="text-xs text-muted-foreground">Base scenario</p>
              </div>
            </div>

            {/* Status */}
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-semibold mb-2">System Status</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                  IndexedDB Storage: Ready
                </div>
                <div className="flex items-center">
                  <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                  Autosave: {currentPlan ? 'Active' : 'Waiting for data'}
                </div>
                <div className="flex items-center">
                  <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                  Import/Export: Available
                </div>
                <div className="flex items-center">
                  <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                  React + TypeScript: Ready
                </div>
                <div className="flex items-center">
                  <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                  Tailwind CSS: Configured
                </div>
                <div className="flex items-center">
                  <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                  Dark/Light Mode: Functional
                </div>
                <div className="flex items-center">
                  <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                  Navigation: Complete
                </div>
                <div className="flex items-center">
                  <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                  Dependencies: Recharts, React-Table, IndexedDB ready for integration
                </div>
              </div>
            </div>
          </div>
        )
      case 'people':
        return (
          <PeopleManager
            people={currentPlan?.people || []}
            onUpdatePeople={handleUpdatePeople}
          />
        )
      case 'assets':
        return (
          <AssetManager
            assets={currentPlan?.assets || []}
            people={currentPlan?.people || []}
            onUpdateAssets={handleUpdateAssets}
          />
        )
      case 'income':
        return (
          <IncomeManager
            income={currentPlan?.income || []}
            people={currentPlan?.people || []}
            assets={currentPlan?.assets || []}
            onUpdateIncome={handleUpdateIncome}
          />
        )
      case 'commitments':
        return (
          <CommitmentManager
            commitments={currentPlan?.commitments || []}
            people={currentPlan?.people || []}
            assets={currentPlan?.assets || []}
            onUpdateCommitments={handleUpdateCommitments}
          />
        )
      case 'events':
        return (
          <EventManager
            events={currentPlan?.events || []}
            people={currentPlan?.people || []}
            assets={currentPlan?.assets || []}
            onUpdateEvents={handleUpdateEvents}
          />
        )
      case 'scenarios':
        return (
          <ScenarioManager
            planId={currentPlan?.id || ''}
            scenarios={currentPlan?.scenarios || []}
            activeScenarioId={currentPlan?.activeScenarioId}
            currentAssumptions={currentPlan?.assumptions || getDefaultAssumptions()}
            currentOverrides={currentPlan?.overrides || []}
            people={currentPlan?.people || []}
            assets={currentPlan?.assets || []}
            income={currentPlan?.income || []}
            commitments={currentPlan?.commitments || []}
            onUpdateScenarios={handleUpdateScenarios}
            onSetActiveScenario={handleSetActiveScenario}
          />
        )
      case 'settings':
        return (
          <div className="space-y-6">
            <ImportExportDialog 
              planId={planId ?? undefined}
              onImportSuccess={handleImportSuccess}
            />
          </div>
        )
      default:
        const currentNavItem = navItems.find(item => item.id === activeTab)
        const IconComponent = currentNavItem?.icon
        
        return (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
              {IconComponent && (
                <IconComponent className="w-12 h-12 text-muted-foreground" />
              )}
            </div>
            <h2 className="text-2xl font-bold mb-4">
              {currentNavItem?.label}
            </h2>
            <p className="text-muted-foreground">This section is coming soon...</p>
          </div>
        )
    }
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <div className="bg-background text-foreground">
        {/* Header */}
        <header className="border-b border-border bg-card">
          <div className="px-6 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold">Financial Projection Tool</h1>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleDarkMode}
              aria-label={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
            >
              {darkMode ? '☀️' : '🌙'}
            </Button>
          </div>
        </header>

        <div className="flex">
          {/* Sidebar Navigation */}
          <nav className="w-64 bg-card border-r border-border min-h-[calc(100vh-73px)]">
            <div className="p-4">
              <ul className="space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full text-left px-3 py-2 rounded-md transition-colors flex items-center space-x-3 ${
                          activeTab === item.id
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                        aria-label={`Navigate to ${item.label}`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          </nav>

          {/* Main Content */}
          <main className="flex-1 p-6">
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  )
}

export default App
