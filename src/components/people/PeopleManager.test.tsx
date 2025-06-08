import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { PeopleManager } from './PeopleManager'
import { Person, Sex } from '../../types'

// Mock the validation utilities
vi.mock('../../utils/validation', () => ({
  validatePerson: vi.fn().mockReturnValue({ isValid: true, errors: [] }),
  generateId: vi.fn().mockReturnValue('test-person-id')
}))

describe('PeopleManager', () => {
  const mockPeople: Person[] = [
    {
      id: 'person-1',
      name: 'John Doe',
      dateOfBirth: '1980-01-15',
      sex: Sex.M,
      createdAt: '2024-01-01T00:00:00.000Z'
    },
    {
      id: 'person-2',
      name: 'Jane Smith',
      dateOfBirth: '1985-06-20',
      sex: Sex.F,
      createdAt: '2024-01-01T00:00:00.000Z'
    }
  ]

  const mockOnUpdatePeople = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders people manager with existing people', () => {
    render(
      <PeopleManager 
        people={mockPeople} 
        onUpdatePeople={mockOnUpdatePeople} 
      />
    )

    expect(screen.getByText('People')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
  })

  it('displays empty state when no people exist', () => {
    render(
      <PeopleManager 
        people={[]} 
        onUpdatePeople={mockOnUpdatePeople} 
      />
    )

    expect(screen.getByText('No people added yet')).toBeInTheDocument()
    expect(screen.getByText('Add Your First Person')).toBeInTheDocument()
  })

  it('allows adding a new person', async () => {
    render(
      <PeopleManager 
        people={[]} 
        onUpdatePeople={mockOnUpdatePeople} 
      />
    )

    // Click add person button
    fireEvent.click(screen.getByText('Add Your First Person'))

    // Fill in the form
    fireEvent.change(screen.getByLabelText('Name (optional)'), {
      target: { value: 'Test Person' }
    })
    fireEvent.change(screen.getByLabelText('Date of Birth *'), {
      target: { value: '1990-01-01' }
    })
    fireEvent.change(screen.getByLabelText('Sex *'), {
      target: { value: Sex.M }
    })

    // Submit form
    fireEvent.click(screen.getByText('Add Person'))

    await waitFor(() => {
      expect(mockOnUpdatePeople).toHaveBeenCalledWith([
        expect.objectContaining({
          id: 'test-person-id',
          name: 'Test Person',
          dateOfBirth: '1990-01-01',
          sex: Sex.M
        })
      ])
    })
  })

  it('handles edit person flow', async () => {
    render(
      <PeopleManager 
        people={mockPeople} 
        onUpdatePeople={mockOnUpdatePeople} 
      />
    )

    // Click edit button for first person
    const editButtons = screen.getAllByLabelText(/Edit/)
    fireEvent.click(editButtons[0])

    // Should show edit form
    expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument()
    expect(screen.getByDisplayValue('1980-01-15')).toBeInTheDocument()

    // Change name
    fireEvent.change(screen.getByDisplayValue('John Doe'), {
      target: { value: 'John Updated' }
    })

    // Save changes
    fireEvent.click(screen.getByText('Save'))

    await waitFor(() => {
      expect(mockOnUpdatePeople).toHaveBeenCalledWith([
        expect.objectContaining({
          id: 'person-1',
          name: 'John Updated',
          dateOfBirth: '1980-01-15',
          sex: Sex.M
        }),
        mockPeople[1]
      ])
    })
  })

  it('handles delete person with confirmation', async () => {
    render(
      <PeopleManager 
        people={mockPeople} 
        onUpdatePeople={mockOnUpdatePeople} 
      />
    )

    // Click delete button for first person
    const deleteButtons = screen.getAllByLabelText(/Delete/)
    fireEvent.click(deleteButtons[0])

    // Should show confirmation
    expect(screen.getByText(/Are you sure you want to delete John Doe/)).toBeInTheDocument()

    // Confirm deletion
    fireEvent.click(screen.getByText('Delete'))

    await waitFor(() => {
      expect(mockOnUpdatePeople).toHaveBeenCalledWith([mockPeople[1]])
    })
  })

  it('cancels deletion when cancel is clicked', () => {
    render(
      <PeopleManager 
        people={mockPeople} 
        onUpdatePeople={mockOnUpdatePeople} 
      />
    )

    // Click delete button
    const deleteButtons = screen.getAllByLabelText(/Delete/)
    fireEvent.click(deleteButtons[0])

    // Click cancel
    fireEvent.click(screen.getByText('Cancel'))

    // Should not call update
    expect(mockOnUpdatePeople).not.toHaveBeenCalled()
  })

  it('shows summary information correctly', () => {
    render(
      <PeopleManager 
        people={mockPeople} 
        onUpdatePeople={mockOnUpdatePeople} 
      />
    )

    expect(screen.getByText('2')).toBeInTheDocument() // Total count
    expect(screen.getByText('1')).toBeInTheDocument() // Adults
    expect(screen.getByText('0')).toBeInTheDocument() // Children
  })

  it('handles accessibility correctly', () => {
    render(
      <PeopleManager 
        people={mockPeople} 
        onUpdatePeople={mockOnUpdatePeople} 
      />
    )

    // Check for proper ARIA labels
    expect(screen.getByLabelText('Edit John Doe')).toBeInTheDocument()
    expect(screen.getByLabelText('Delete John Doe')).toBeInTheDocument()
})

it('disables main add button when editing', () => {
  render(<PeopleManager people={mockPeople} onUpdatePeople={mockOnUpdatePeople} />)
    
    // Click edit button
    fireEvent.click(screen.getByLabelText('Edit John Doe'))
    
    // Main add button should be disabled
    const addButton = screen.getByTestId('main-add-person-button')
    expect(addButton).toBeDisabled()
  })

  it('allows adding person from main button when people exist', async () => {
    render(<PeopleManager people={mockPeople} onUpdatePeople={mockOnUpdatePeople} />)
    
    fireEvent.click(screen.getByTestId('main-add-person-button'))
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Third Person' } })
    fireEvent.change(screen.getByLabelText(/date of birth/i), { target: { value: '1995-01-01' } })
    fireEvent.change(screen.getByLabelText(/sex/i), { target: { value: 'F' } })
    
    fireEvent.click(screen.getByRole('button', { name: 'Add Person' }))
    
    await waitFor(() => {
      expect(mockOnUpdatePeople).toHaveBeenCalledWith([
        ...mockPeople,
        expect.objectContaining({
          name: 'Third Person',
          dateOfBirth: '1995-01-01',
          sex: Sex.F
        })
      ])
    })
  })
})

