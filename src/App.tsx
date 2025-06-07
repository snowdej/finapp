import { useState } from 'react'
import { Calculator, PiggyBank, TrendingUp } from 'lucide-react'

function App() {
  const [darkMode, setDarkMode] = useState(false)

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle('dark')
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <div className="bg-background text-foreground">
        {/* Header */}
        <header className="border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Financial Projection Tool</h1>
            <button
              onClick={toggleDarkMode}
              className="px-3 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-accent"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-semibold mb-8">Welcome to Your Financial Dashboard</h2>
            
            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-card text-card-foreground p-6 rounded-lg border">
                <div className="flex items-center mb-4">
                  <PiggyBank className="h-8 w-8 text-primary mr-3" />
                  <h3 className="text-xl font-semibold">Assets & Pensions</h3>
                </div>
                <p className="text-muted-foreground">
                  Track ISAs, SIPPs, property, and other investments with detailed projections.
                </p>
              </div>

              <div className="bg-card text-card-foreground p-6 rounded-lg border">
                <div className="flex items-center mb-4">
                  <Calculator className="h-8 w-8 text-primary mr-3" />
                  <h3 className="text-xl font-semibold">Income & Commitments</h3>
                </div>
                <p className="text-muted-foreground">
                  Manage salaries, benefits, mortgages, and ongoing expenses with inflation adjustments.
                </p>
              </div>

              <div className="bg-card text-card-foreground p-6 rounded-lg border">
                <div className="flex items-center mb-4">
                  <TrendingUp className="h-8 w-8 text-primary mr-3" />
                  <h3 className="text-xl font-semibold">Projections & Scenarios</h3>
                </div>
                <p className="text-muted-foreground">
                  Visualise your financial future with detailed reports and what-if scenarios.
                </p>
              </div>
            </div>

            {/* Status */}
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-semibold mb-2">System Status</h4>
              <div className="space-y-2 text-sm">
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
                  <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                  Dependencies: Recharts, React-Table, IndexedDB ready for integration
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default App
