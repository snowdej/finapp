import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import App from './App'

describe('App', () => {
  beforeEach(() => {
    // Clear localStorage mock before each test
    vi.clearAllMocks()
    localStorage.clear()
    // Remove any existing dark class
    document.documentElement.classList.remove('dark')
  })

  it('renders the main heading', () => {
    render(<App />)
    expect(screen.getByText('Financial Projection Tool')).toBeInTheDocument()
  })

  it('renders welcome message', () => {
    render(<App />)
    expect(screen.getByText('Welcome to Your Financial Dashboard')).toBeInTheDocument()
  })

  it('toggles dark mode and persists in localStorage', () => {
    render(<App />)
    const toggleButton = screen.getByLabelText(/switch to dark mode/i)
    
    // Should start in light mode
    expect(toggleButton).toHaveTextContent('🌙')
    
    // Click to enable dark mode
    fireEvent.click(toggleButton)
    expect(screen.getByLabelText(/switch to light mode/i)).toHaveTextContent('☀️')
    expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'dark')
    
    // Click to disable dark mode
    fireEvent.click(screen.getByLabelText(/switch to light mode/i))
    expect(screen.getByLabelText(/switch to dark mode/i)).toHaveTextContent('🌙')
    expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'light')
  })

  it('displays all navigation items', () => {
    render(<App />)
    
    // Check navigation items specifically by their aria-labels
    expect(screen.getByLabelText('Navigate to Dashboard')).toBeInTheDocument()
    expect(screen.getByLabelText('Navigate to People')).toBeInTheDocument()
    expect(screen.getByLabelText('Navigate to Assets')).toBeInTheDocument()
    expect(screen.getByLabelText('Navigate to Income')).toBeInTheDocument()
    expect(screen.getByLabelText('Navigate to Commitments')).toBeInTheDocument()
    expect(screen.getByLabelText('Navigate to Events')).toBeInTheDocument()
    expect(screen.getByLabelText('Navigate to Scenarios')).toBeInTheDocument()
    expect(screen.getByLabelText('Navigate to Settings')).toBeInTheDocument()
  })

  it('navigates between tabs', () => {
    render(<App />)
    
    // Should start on dashboard
    expect(screen.getByText('Welcome to Your Financial Dashboard')).toBeInTheDocument()
    
    // Navigate to People
    fireEvent.click(screen.getByLabelText('Navigate to People'))
    expect(screen.getByText('This section is coming soon...')).toBeInTheDocument()
    
    // Navigate back to Dashboard
    fireEvent.click(screen.getByLabelText('Navigate to Dashboard'))
    expect(screen.getByText('Welcome to Your Financial Dashboard')).toBeInTheDocument()
  })

  it('displays all feature cards on dashboard', () => {
    render(<App />)
    expect(screen.getByText('Assets & Pensions')).toBeInTheDocument()
    expect(screen.getByText('Income & Commitments')).toBeInTheDocument()
    expect(screen.getByText('Projections & Scenarios')).toBeInTheDocument()
  })

  it('displays summary cards with initial values', () => {
    render(<App />)
    
    // Use more specific selectors for summary cards
    expect(screen.getByRole('heading', { name: 'Total Assets' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Monthly Income' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'People' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Scenarios' })).toBeInTheDocument()
    
    // Check that there are exactly 2 £0 values (for Total Assets and Monthly Income)
    const zeroValues = screen.getAllByText('£0')
    expect(zeroValues).toHaveLength(2)
    
    // Check specific descriptive text
    expect(screen.getByText('No assets added yet')).toBeInTheDocument()
    expect(screen.getByText('No income added yet')).toBeInTheDocument()
    expect(screen.getByText('No people added yet')).toBeInTheDocument()
    expect(screen.getByText('Base scenario')).toBeInTheDocument()
    
    // Check that the numeric value "0" appears for people count
    expect(screen.getByText('0')).toBeInTheDocument()
    
    // Check that "1" appears for scenarios count
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('loads dark mode from localStorage on mount', () => {
    // Mock localStorage.getItem to return 'dark'
    localStorage.getItem = vi.fn().mockReturnValue('dark')
    
    render(<App />)
    
    // Should start in dark mode
    expect(screen.getByLabelText(/switch to light mode/i)).toHaveTextContent('☀️')
    expect(localStorage.getItem).toHaveBeenCalledWith('theme')
  })
})
