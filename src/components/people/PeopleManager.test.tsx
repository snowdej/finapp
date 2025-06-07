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
  })

  it('allows adding a new person', async () => {
    render(<PeopleManager people={[]} onUpdatePeople={mockOnUpdatePeople} />)
    
    fireEvent.click(screen.getByText('Add Person'))
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'New Person' } })
    fireEvent.change(screen.getByLabelText(/date of birth/i), { target: { value: '1990-01-01' } })
    fireEvent.change(screen.getByLabelText(/sex/i), { target: { value: 'M' } })
    
    fireEvent.click(screen.getByText('Save'))
    
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

  it('validates required fields', async () => {
    render(<PeopleManager people={[]} onUpdatePeople={mockOnUpdatePeople} />)
    
    fireEvent.click(screen.getByText('Add Person'))
    fireEvent.click(screen.getByText('Save'))
    
    await waitFor(() => {
      expect(screen.getByText(/date of birth is required/i)).toBeInTheDocument()
      expect(screen.getByText(/sex is required/i)).toBeInTheDocument()
    })
    
    expect(mockOnUpdatePeople).not.toHaveBeenCalled()
  })

  it('auto-generates name if blank', async () => {
    render(<PeopleManager people={[]} onUpdatePeople={mockOnUpdatePeople} />)
    
    fireEvent.click(screen.getByText('Add Person'))
    
    // Fill required fields but leave name blank
    fireEvent.change(screen.getByLabelText(/date of birth/i), { target: { value: '1990-01-01' } })
    fireEvent.change(screen.getByLabelText(/sex/i), { target: { value: 'M' } })
    
    fireEvent.click(screen.getByText('Save'))
    
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

  it('allows editing an existing person', async () => {
    render(<PeopleManager people={mockPeople} onUpdatePeople={mockOnUpdatePeople} />)
    
    // Click edit button for first person
    const editButtons = screen.getAllByText('Edit')
    fireEvent.click(editButtons[0])
    
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
    const deleteButtons = screen.getAllByText('Delete')
    fireEvent.click(deleteButtons[0])
    
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
    
    // Use a more flexible text matcher that handles the space
    expect(screen.getByText((content, element) => {
      return element?.textContent === `Age: ${johnAge}`
    })).toBeInTheDocument()
    
    expect(screen.getByText((content, element) => {
      return element?.textContent === `Age: ${janeAge}`
    })).toBeInTheDocument()
  })
})
