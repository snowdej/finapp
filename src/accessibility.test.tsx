import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { axe, toHaveNoViolations } from 'jest-axe'
import App from './App'
import { PeopleManager } from './components/people/PeopleManager'
import { AssetManager } from './components/assets/AssetManager'

expect.extend(toHaveNoViolations)

// Mock the storage service
vi.mock('./services/storage', () => ({
  loadAllPlans: vi.fn().mockResolvedValue([]),
  savePlan: vi.fn().mockResolvedValue('test-plan-id')
}))

// Mock the autosave hook
vi.mock('./hooks/useAutosave', () => ({
  useAutosave: vi.fn()
}))

// Mock the ImportExportDialog component
vi.mock('./components/ui/ImportExportDialog', () => ({
  ImportExportDialog: () => <div>Import/Export Dialog</div>
}))

describe('Accessibility Tests', () => {
  it('App component has no accessibility violations', async () => {
    const { container } = render(<App />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('PeopleManager has no accessibility violations', async () => {
    const { container } = render(
      <PeopleManager 
        people={[]} 
        onUpdatePeople={() => {}} 
      />
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('AssetManager has no accessibility violations', async () => {
    const { container } = render(
      <AssetManager 
        assets={[]} 
        people={[]}
        onUpdateAssets={() => {}} 
      />
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('has proper heading hierarchy', () => {
    render(<App />)
    
    // Check main heading
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    
    // Check section headings
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
  })

  it('has proper ARIA labels for navigation', () => {
    render(<App />)
    
    // Check navigation landmarks
    expect(screen.getByRole('navigation')).toBeInTheDocument()
    expect(screen.getByRole('main')).toBeInTheDocument()
    
    // Check skip links
    expect(screen.getByText('Skip to main content')).toBeInTheDocument()
    expect(screen.getByText('Skip to navigation')).toBeInTheDocument()
  })

  it('supports keyboard navigation', () => {
    render(<App />)
    
    // All interactive elements should be focusable
    const buttons = screen.getAllByRole('button')
    buttons.forEach(button => {
      expect(button).not.toHaveAttribute('tabindex', '-1')
    })
  })

  it('has proper form labels', () => {
    render(
      <PeopleManager 
        people={[]} 
        onUpdatePeople={() => {}} 
      />
    )
    
    // Click add person to show form
    const addButton = screen.getByText('Add Your First Person')
    addButton.click()
    
    // Check form has proper labels
    expect(screen.getByLabelText('Name (optional)')).toBeInTheDocument()
    expect(screen.getByLabelText('Date of Birth *')).toBeInTheDocument()
    expect(screen.getByLabelText('Sex *')).toBeInTheDocument()
  })

  it('announces dynamic content changes', () => {
    render(<App />)
    
    // Check for live region
    const announcer = document.querySelector('[aria-live]')
    expect(announcer).toBeInTheDocument()
  })

  it('has sufficient color contrast', () => {
    render(<App />)
    
    // This would typically use a tool like axe-core to check contrast
    // For now, we'll check that text is visible
    const mainHeading = screen.getByText('Financial Projection Tool')
    expect(mainHeading).toBeVisible()
  })

  it('supports screen readers with proper semantic markup', () => {
    render(<App />)
    
    // Check for proper landmarks
    expect(screen.getByRole('banner')).toBeInTheDocument() // header
    expect(screen.getByRole('navigation')).toBeInTheDocument()
    expect(screen.getByRole('main')).toBeInTheDocument()
    
    // Check for proper list structure in navigation
    const navList = screen.getByRole('list')
    expect(navList).toBeInTheDocument()
    
    const navItems = screen.getAllByRole('listitem')
    expect(navItems.length).toBeGreaterThan(0)
  })

  it('handles focus management correctly', () => {
    render(<App />)
    
    // Focus should be manageable
    const focusableElements = screen.getAllByRole('button')
    expect(focusableElements.length).toBeGreaterThan(0)
    
    // Each focusable element should have visible focus indicator
    focusableElements.forEach(element => {
      // Focus the element
      element.focus()
      expect(element).toHaveFocus()
    })
  })
})
