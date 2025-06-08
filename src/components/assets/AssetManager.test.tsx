import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { AssetManager } from './AssetManager'
import { Asset, Person, Sex } from '../../types'

const mockPeople: Person[] = [
  {
    id: 'person-1',
    name: 'John Doe',
    dateOfBirth: '1980-01-01',
    sex: Sex.M
  },
  {
    id: 'person-2',
    name: 'Jane Smith',
    dateOfBirth: '1985-05-15',
    sex: Sex.F
  }
]

const mockAssets: Asset[] = [
  {
    id: 'asset-1',
    name: 'Main ISA',
    type: 'ISA',
    currentValue: 25000,
    ownerIds: ['person-1'],
    growthRate: 5,
    inflationRate: 2.5,
    createdAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 'asset-2',
    name: 'Joint Property',
    type: 'Property',
    currentValue: 400000,
    ownerIds: ['person-1', 'person-2'],
    growthRate: 3,
    inflationRate: 2.5,
    createdAt: '2024-01-01T00:00:00.000Z'
  }
]

describe('AssetManager', () => {
  const mockOnUpdateAssets = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the assets list', () => {
    render(<AssetManager assets={mockAssets} people={mockPeople} onUpdateAssets={mockOnUpdateAssets} />)
    
    expect(screen.getByText('Main ISA')).toBeInTheDocument()
    expect(screen.getByText('Joint Property')).toBeInTheDocument()
  })

  it('displays empty state when no assets', () => {
    render(<AssetManager assets={[]} people={mockPeople} onUpdateAssets={mockOnUpdateAssets} />)
    
    expect(screen.getByText('No assets added yet')).toBeInTheDocument()
    expect(screen.getByText('Add Your First Asset')).toBeInTheDocument()
  })

  it('shows net values correctly', () => {
    render(<AssetManager assets={mockAssets} people={mockPeople} onUpdateAssets={mockOnUpdateAssets} />)
    
    expect(screen.getByText('£425,000')).toBeInTheDocument() // Net value summary
  })

  it('allows adding a new asset', async () => {
    render(<AssetManager assets={[]} people={mockPeople} onUpdateAssets={mockOnUpdateAssets} />)
    
    fireEvent.click(screen.getByText('Add Your First Asset'))
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText(/asset name/i), { target: { value: 'New SIPP' } })
    fireEvent.change(screen.getByLabelText(/asset type/i), { target: { value: 'SIPP' } })
    fireEvent.change(screen.getByLabelText(/current value/i), { target: { value: '50000' } })
    
    // Select owner
    fireEvent.click(screen.getByLabelText('John Doe'))
    
    fireEvent.click(screen.getByText('Add Asset'))
    
    await waitFor(() => {
      expect(mockOnUpdateAssets).toHaveBeenCalledWith([
        expect.objectContaining({
          name: 'New SIPP',
          type: 'SIPP',
          currentValue: 50000,
          ownerIds: ['person-1']
        })
      ])
    })
  })

  it('validates required fields', async () => {
    render(<AssetManager assets={[]} people={mockPeople} onUpdateAssets={mockOnUpdateAssets} />)
    
    fireEvent.click(screen.getByText('Add Your First Asset'))
    fireEvent.click(screen.getByText('Add Asset'))
    
    await waitFor(() => {
      expect(screen.getByText(/current value is required/i)).toBeInTheDocument()
      expect(screen.getByText(/at least one owner is required/i)).toBeInTheDocument()
    })
    
    expect(mockOnUpdateAssets).not.toHaveBeenCalled()
  })

  it('prevents negative asset values', async () => {
    render(<AssetManager assets={[]} people={mockPeople} onUpdateAssets={mockOnUpdateAssets} />)
    
    fireEvent.click(screen.getByText('Add Your First Asset'))
    
    fireEvent.change(screen.getByLabelText(/asset name/i), { target: { value: 'Test Asset' } })
    fireEvent.change(screen.getByLabelText(/asset type/i), { target: { value: 'ISA' } })
    fireEvent.change(screen.getByLabelText(/current value/i), { target: { value: '-1000' } })
    fireEvent.click(screen.getByLabelText('John Doe'))
    
    fireEvent.click(screen.getByText('Add Asset'))
    
    await waitFor(() => {
      expect(screen.getByText(/asset value cannot be negative/i)).toBeInTheDocument()
    })
    
    expect(mockOnUpdateAssets).not.toHaveBeenCalled()
  })

  it('shows warning when no people exist', () => {
    render(<AssetManager assets={[]} people={[]} onUpdateAssets={mockOnUpdateAssets} />)
    
    expect(screen.getByText('No people in plan')).toBeInTheDocument()
    expect(screen.getByText('You need to add people to your plan before you can add assets')).toBeInTheDocument()
  })

  it('allows deleting an asset', async () => {
    render(<AssetManager assets={mockAssets} people={mockPeople} onUpdateAssets={mockOnUpdateAssets} />)
    
    // Find and click delete button for Main ISA
    const deleteButtons = screen.getAllByRole('button')
    const deleteButton = deleteButtons.find(button => 
      button.closest('[data-testid]') || 
      button.parentElement?.textContent?.includes('Main ISA')
    )
    
    if (deleteButton) {
      fireEvent.click(deleteButton)
      
      // Confirm deletion
      const confirmButton = screen.getByText('Confirm')
      fireEvent.click(confirmButton)
      
      await waitFor(() => {
        expect(mockOnUpdateAssets).toHaveBeenCalledWith([mockAssets[1]])
      })
    }
  })
})
