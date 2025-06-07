import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import App from './App'

// Setup DOM environment for tests
import '@testing-library/jest-dom'

describe('App', () => {
  it('renders the main heading', () => {
    render(<App />)
    expect(screen.getByText('Financial Projection Tool')).toBeInTheDocument()
  })

  it('renders welcome message', () => {
    render(<App />)
    expect(screen.getByText('Welcome to Your Financial Dashboard')).toBeInTheDocument()
  })

  it('toggles dark mode', () => {
    render(<App />)
    const toggleButton = screen.getByText('🌙')
    
    fireEvent.click(toggleButton)
    expect(screen.getByText('☀️')).toBeInTheDocument()
    
    fireEvent.click(screen.getByText('☀️'))
    expect(screen.getByText('🌙')).toBeInTheDocument()
  })

  it('displays all feature cards', () => {
    render(<App />)
    expect(screen.getByText('Assets & Pensions')).toBeInTheDocument()
    expect(screen.getByText('Income & Commitments')).toBeInTheDocument()
    expect(screen.getByText('Projections & Scenarios')).toBeInTheDocument()
  })
})
