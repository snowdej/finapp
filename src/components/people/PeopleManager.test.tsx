import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { PeopleManager } from './PeopleManager'
import { Person, Sex } from '../../types'

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

describe('PeopleManager', () => {
  const mockOnUpdatePeople = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the people list', () => {
    render(<PeopleManager people={mockPeople} onUpdatePeople={mockOnUpdatePeople} />)
    
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
  })

  it('displays empty state when no people', () => {
    render(<PeopleManager people={[]} onUpdatePeople={mockOnUpdatePeople} />)
    
    expect(screen.getByText('No people added yet')).toBeInTheDocument()
    expect(screen.getByTestId('empty-state-add-person-button')).toBeInTheDocument()
  })

  it('allows adding a new person', async () => {
    render(<PeopleManager people={[]} onUpdatePeople={mockOnUpdatePeople} />)
    
    fireEvent.click(screen.getByRole('button', { name: 'Add Person' }))
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'New Person' } })
    fireEvent.change(screen.getByLabelText(/date of birth/i), { target: { value: '1990-01-01' } })
    fireEvent.change(screen.getByLabelText(/sex/i), { target: { value: 'M' } })
    
    fireEvent.click(screen.getByRole('button', { name: 'Add Person' }))
    
    await waitFor(() => {
      expect(mockOnUpdatePeople).toHaveBeenCalledWith([
        expect.objectContaining({
          name: 'New Person',
          dateOfBirth: '1990-01-01',
          sex: Sex.M
        })
      ])
    })
  })

  it('allows adding person from main button when people exist', async () => {
    render(<PeopleManager people={mockPeople} onUpdatePeople={mockOnUpdatePeople} />)
    
    // Should show the header Add Person button, not the "Add Your First Person" button
    expect(screen.queryByTestId('add-first-person')).not.toBeInTheDocument()
    
    // Click the header Add Person button
    fireEvent.click(screen.getByRole('button', { name: 'Add Person' }))
    
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

  it('auto-generates name if blank', async () => {
    render(<PeopleManager people={[]} onUpdatePeople={mockOnUpdatePeople} />)
    
    fireEvent.click(screen.getByRole('button', { name: 'Add Person' }))
    
    // Fill required fields but leave name blank
    fireEvent.change(screen.getByLabelText(/date of birth/i), { target: { value: '1990-01-01' } })
    fireEvent.change(screen.getByLabelText(/sex/i), { target: { value: 'M' } })
    
    fireEvent.click(screen.getByRole('button', { name: 'Add Person' }))
    
    await waitFor(() => {
      expect(mockOnUpdatePeople).toHaveBeenCalledWith([
        expect.objectContaining({
          name: 'Person 1',
          dateOfBirth: '1990-01-01',
          sex: Sex.M
        })
      ])
    })
  })

  it('validates required fields', async () => {
    render(<PeopleManager people={[]} onUpdatePeople={mockOnUpdatePeople} />)
    
    fireEvent.click(screen.getByTestId('empty-state-add-person-button'))
    fireEvent.click(screen.getByRole('button', { name: 'Add Person' }))
    
    await waitFor(() => {
      expect(screen.getByText(/date of birth is required/i)).toBeInTheDocument()
      expect(screen.getByText(/sex is required/i)).toBeInTheDocument()
    })
    
    expect(mockOnUpdatePeople).not.toHaveBeenCalled()
  })

  it('allows editing an existing person', async () => {
    render(<PeopleManager people={mockPeople} onUpdatePeople={mockOnUpdatePeople} />)
    
    // Click edit button for first person
    fireEvent.click(screen.getByLabelText('Edit John Doe'))
    
    // Update the name
    const nameInput = screen.getByDisplayValue('John Doe')
    fireEvent.change(nameInput, { target: { value: 'John Updated' } })
    
    fireEvent.click(screen.getByText('Save'))
    
    await waitFor(() => {
      expect(mockOnUpdatePeople).toHaveBeenCalledWith([
        expect.objectContaining({
          id: 'person-1',
          name: 'John Updated',
          dateOfBirth: '1980-01-01',
          sex: Sex.M
        }),
        mockPeople[1]
      ])
    })
  })

  it('allows deleting a person', async () => {
    render(<PeopleManager people={mockPeople} onUpdatePeople={mockOnUpdatePeople} />)
    
    // Click delete button for first person
    fireEvent.click(screen.getByLabelText('Delete John Doe'))
    
    // Confirm deletion
    fireEvent.click(screen.getByText('Confirm'))
    
    await waitFor(() => {
      expect(mockOnUpdatePeople).toHaveBeenCalledWith([mockPeople[1]])
    })
  })

  it('calculates and displays age correctly', () => {
    render(<PeopleManager people={mockPeople} onUpdatePeople={mockOnUpdatePeople} />)
    
    const currentYear = new Date().getFullYear()
    const johnAge = currentYear - 1980
    const janeAge = currentYear - 1985
    
    expect(screen.getByTestId('age-person-1')).toHaveTextContent(`Age: ${johnAge}`)
    expect(screen.getByTestId('age-person-2')).toHaveTextContent(`Age: ${janeAge}`)
  })

  it('shows summary statistics correctly', () => {
    render(<PeopleManager people={mockPeople} onUpdatePeople={mockOnUpdatePeople} />)
    
    expect(screen.getByTestId('summary-total')).toHaveTextContent('2')
    expect(screen.getByTestId('summary-total')).toHaveTextContent('Total People')
    
    expect(screen.getByTestId('summary-male')).toHaveTextContent('1')
    expect(screen.getByTestId('summary-male')).toHaveTextContent('Male')
    
    expect(screen.getByTestId('summary-female')).toHaveTextContent('1')
    expect(screen.getByTestId('summary-female')).toHaveTextContent('Female')
    
    expect(screen.getByTestId('summary-avg-age')).toHaveTextContent('Avg Age')
  })

  it('handles empty people list in summary', () => {
    render(<PeopleManager people={[]} onUpdatePeople={mockOnUpdatePeople} />)
    
    // Should show the empty state instead of summary when no people
    expect(screen.getByText('No people added yet')).toBeInTheDocument()
    expect(screen.queryByText('Summary')).not.toBeInTheDocument()
  })

  it('disables add button when editing', () => {
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

