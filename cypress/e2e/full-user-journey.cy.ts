describe('Complete User Journey', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.clearIndexedDB() // Custom command to clear data
  })

  it('completes a full financial planning workflow', () => {
    // 1. Start on dashboard
    cy.contains('Welcome to Your Financial Dashboard').should('be.visible')
    cy.contains('No people added yet').should('be.visible')

    // 2. Add a person
    cy.get('[aria-label="Navigate to People section"]').click()
    cy.contains('Add Your First Person').click()
    
    cy.get('[data-testid="person-name"]').type('John Doe')
    cy.get('[data-testid="person-dob"]').type('1980-01-15')
    cy.get('[data-testid="person-sex"]').select('M')
    cy.contains('Add Person').click()

    cy.contains('John Doe').should('be.visible')
    cy.contains('44 years old').should('be.visible') // Approximate age

    // 3. Add an asset
    cy.get('[aria-label="Navigate to Assets section"]').click()
    cy.contains('Add Your First Asset').click()

    cy.get('[data-testid="asset-name"]').type('My ISA')
    cy.get('[data-testid="asset-type"]').select('ISA')
    cy.get('[data-testid="asset-value"]').type('25000')
    cy.get('[data-testid="owner-john-doe"]').check()
    cy.contains('Add Asset').click()

    cy.contains('My ISA').should('be.visible')
    cy.contains('£25,000').should('be.visible')

    // 4. Add income
    cy.get('[aria-label="Navigate to Income section"]').click()
    cy.contains('Add Income').click()

    cy.get('[data-testid="income-name"]').type('Salary')
    cy.get('[data-testid="income-amount"]').type('5000')
    cy.get('[data-testid="income-frequency"]').select('monthly')
    cy.get('[data-testid="income-start-year"]').type('2024')
    cy.get('[data-testid="owner-john-doe"]').check()
    cy.contains('Add Income').click()

    cy.contains('Salary').should('be.visible')
    cy.contains('£5,000 per month').should('be.visible')

    // 5. Add commitment
    cy.get('[aria-label="Navigate to Commitments section"]').click()
    cy.contains('Add Commitment').click()

    cy.get('[data-testid="commitment-name"]').type('Rent')
    cy.get('[data-testid="commitment-amount"]').type('1500')
    cy.get('[data-testid="commitment-frequency"]').select('monthly')
    cy.get('[data-testid="commitment-start-year"]').type('2024')
    cy.get('[data-testid="owner-john-doe"]').check()
    cy.contains('Add Commitment').click()

    cy.contains('Rent').should('be.visible')
    cy.contains('£1,500 per month').should('be.visible')

    // 6. View projections
    cy.get('[aria-label="Navigate to Projections section"]').click()
    cy.contains('Financial Projections').should('be.visible')
    
    // Should show projection data
    cy.contains('Net Worth').should('be.visible')
    cy.contains('Cash Flow').should('be.visible')

    // Check charts are rendered
    cy.get('[data-testid="net-worth-chart"]').should('be.visible')
    cy.get('[data-testid="cash-flow-chart"]').should('be.visible')

    // 7. Create a scenario
    cy.get('[aria-label="Navigate to Scenarios section"]').click()
    cy.contains('Add Scenario').click()

    cy.get('[data-testid="scenario-name"]').type('Conservative Growth')
    cy.get('[data-testid="scenario-description"]').type('Lower growth assumptions')
    cy.get('[data-testid="inflation-rate"]').clear().type('2.0')
    cy.contains('Create Scenario').click()

    cy.contains('Conservative Growth').should('be.visible')

    // 8. Check timeline
    cy.get('[aria-label="Navigate to Timeline section"]').click()
    cy.contains('Change Timeline').should('be.visible')
    
    // Should show recorded changes
    cy.contains('Added person: John Doe').should('be.visible')
    cy.contains('Added asset: My ISA').should('be.visible')
    cy.contains('Added income: Salary').should('be.visible')

    // 9. Export data
    cy.get('[aria-label="Navigate to Settings section"]').click()
    cy.contains('Export Current Plan').click()
    
    // File download should trigger (we can't fully test this in Cypress)
    cy.get('[data-testid="export-success"]').should('be.visible')

    // 10. Return to dashboard and verify summary
    cy.get('[aria-label="Navigate to Dashboard section"]').click()
    cy.contains('1').should('be.visible') // People count
    cy.contains('£25,000').should('be.visible') // Asset value
    cy.contains('£60,000').should('be.visible') // Annual income
  })

  it('handles edit and delete operations correctly', () => {
    // Setup initial data
    cy.get('[aria-label="Navigate to People section"]').click()
    cy.contains('Add Your First Person').click()
    cy.get('[data-testid="person-name"]').type('Test Person')
    cy.get('[data-testid="person-dob"]').type('1990-01-01')
    cy.get('[data-testid="person-sex"]').select('F')
    cy.contains('Add Person').click()

    // Edit person
    cy.get('[aria-label="Edit Test Person"]').click()
    cy.get('[data-testid="person-name"]').clear().type('Updated Person')
    cy.contains('Save').click()
    cy.contains('Updated Person').should('be.visible')

    // Delete person with confirmation
    cy.get('[aria-label="Delete Updated Person"]').click()
    cy.contains('Are you sure you want to delete').should('be.visible')
    cy.contains('Delete').click()
    cy.contains('No people added yet').should('be.visible')
  })

  it('supports keyboard navigation throughout the app', () => {
    // Tab through navigation
    cy.get('body').tab()
    cy.focused().should('contain', 'Skip to main content')
    
    cy.get('body').tab()
    cy.focused().should('contain', 'Skip to navigation')
    
    // Navigate using keyboard
    cy.get('[aria-label="Navigate to People section"]').focus().type('{enter}')
    cy.contains('People').should('be.visible')
    
    // Tab through the page
    cy.get('body').tab()
    cy.focused().should('be.visible')
  })

  it('maintains data consistency across browser refresh', () => {
    // Add some data
    cy.get('[aria-label="Navigate to People section"]').click()
    cy.contains('Add Your First Person').click()
    cy.get('[data-testid="person-name"]').type('Persistent Person')
    cy.get('[data-testid="person-dob"]').type('1985-06-15')
    cy.get('[data-testid="person-sex"]').select('M')
    cy.contains('Add Person').click()

    // Refresh the page
    cy.reload()

    // Data should still be there
    cy.get('[aria-label="Navigate to People section"]').click()
    cy.contains('Persistent Person').should('be.visible')
  })
})
