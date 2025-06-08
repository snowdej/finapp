import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { AssetManager } from './AssetManager'
import { Asset, Person, Sex, AssetType } from '../../types'

vi.mock('../../utils/validation', () => ({
  validateAsset: vi.fn().mockReturnValue({ isValid: true, errors: [] }),
  generateId: vi.fn().mockReturnValue('test-asset-id')
}))

describe('AssetManager', () => {
  const mockPeople: Person[] = [
    {
      id: 'person-1',
      name: 'John Doe',
      dateOfBirth: '1980-01-15',
      sex: Sex.M,
      createdAt: '2024-01-01T00:00:00.000Z'
    }
  ]

  const mockAssets: Asset[] = [
    {
      id: 'asset-1',
      name: 'ISA Account',
      type: AssetType.ISA,
      currentValue: 50000,
      ownerIds: ['person-1'],
      loans: [],
      valueOverrides: [],
      createdAt: '2024-01-01T00:00:00.000Z'
    }
  ]

  const mockOnUpdateAssets = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders assets manager with existing assets', () => {
    render(
      <AssetManager 
        assets={mockAssets} 
        people={mockPeople}
        onUpdateAssets={mockOnUpdateAssets} 
      />
    )

    expect(screen.getByText('Assets')).toBeInTheDocument()
    expect(screen.getByText('ISA Account')).toBeInTheDocument()
    expect(screen.getByText('£50,000')).toBeInTheDocument()
  })

  it('shows empty state when no people exist', () => {
    render(
      <AssetManager 
        assets={[]} 
        people={[]}
        onUpdateAssets={mockOnUpdateAssets} 
      />
    )

    expect(screen.getByText('No people in plan')).toBeInTheDocument()
  })

  it('shows empty state when no assets exist but people do', () => {
    render(
      <AssetManager 
        assets={[]} 
        people={mockPeople}
        onUpdateAssets={mockOnUpdateAssets} 
      />
    )

    expect(screen.getByText('No assets added yet')).toBeInTheDocument()
  })

  it('allows adding a new asset', async () => {
    render(
      <AssetManager 
        assets={[]} 
        people={mockPeople}
        onUpdateAssets={mockOnUpdateAssets} 
      />
    )

    // Click add asset button
    fireEvent.click(screen.getByText('Add Your First Asset'))

    // Fill in the form
    fireEvent.change(screen.getByLabelText('Asset Name (optional)'), {
      target: { value: 'Test SIPP' }
    })
    fireEvent.change(screen.getByLabelText('Asset Type *'), {
      target: { value: AssetType.SIPP }
    })
    fireEvent.change(screen.getByLabelText('Current Value *'), {
      target: { value: '25000' }
    })

    // Select owner
    fireEvent.click(screen.getByLabelText('John Doe'))

    // Submit form
    fireEvent.click(screen.getByText('Add Asset'))

    await waitFor(() => {
      expect(mockOnUpdateAssets).toHaveBeenCalledWith([
        expect.objectContaining({
          id: 'test-asset-id',
          name: 'Test SIPP',
          type: AssetType.SIPP,
          currentValue: 25000,
          ownerIds: ['person-1']
        })
      ])
    })
  })

  it('calculates total asset value correctly', () => {
    const multipleAssets = [
      ...mockAssets,
      {
        id: 'asset-2',
        name: 'SIPP',
        type: AssetType.SIPP,
        currentValue: 100000,
        ownerIds: ['person-1'],
        loans: [],
        valueOverrides: [],
        createdAt: '2024-01-01T00:00:00.000Z'
      }
    ]

    render(
      <AssetManager 
        assets={multipleAssets} 
        people={mockPeople}
        onUpdateAssets={mockOnUpdateAssets} 
      />
    )

    expect(screen.getByText('£150,000')).toBeInTheDocument() // Total value
    expect(screen.getByText('2')).toBeInTheDocument() // Asset count
  })

  it('handles asset deletion with confirmation', async () => {
    render(
      <AssetManager 
        assets={mockAssets} 
        people={mockPeople}
        onUpdateAssets={mockOnUpdateAssets} 
      />
    )

    // Click delete button
    const deleteButtons = screen.getAllByLabelText(/Delete/)
    fireEvent.click(deleteButtons[0])

    // Should show confirmation
    expect(screen.getByText(/Are you sure you want to delete this asset/)).toBeInTheDocument()

    // Confirm deletion
    fireEvent.click(screen.getByText('Confirm'))

    await waitFor(() => {
      expect(mockOnUpdateAssets).toHaveBeenCalledWith([])
    })
  })
})
