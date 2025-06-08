describe('Full User Journey - Financial Planning Tool', () => {
  beforeEach(() => {
    cy.seedTestData()
  })

  it('completes a full financial planning workflow', () => {
    // 1. Visit the application
    cy.visit('/')
    cy.get('h1').should('contain', 'Financial Projection Tool')
    
    // 2. Verify dashboard is displayed
    cy.get('h2').should('contain', 'Welcome to Your Financial Dashboard')
    cy.get('[data-cy="feature-cards"]').should('be.visible')
    
    // 3. Add people to the plan
    cy.navigateToSection('People')
    cy.get('h2').should('contain', 'People')
    
    // Add first person (adult)
    cy.createTestPerson('John Doe', '1980-01-15', 'M')
    
    // Add second person (spouse)
    cy.createTestPerson('Jane Doe', '1982-05-20', 'F')
    
    // Add child
    cy.createTestPerson('Child Doe', '2010-08-10', 'M')
    
    // Verify people are listed
    cy.get('[data-cy="person-card"]').should('have.length', 3)
    cy.get('[data-cy="person-card"]').first().should('contain', 'John Doe')
    
    // 4. Add assets
    cy.navigateToSection('Assets')
    cy.get('h2').should('contain', 'Assets')
    
    // Add ISA
    cy.createTestAsset('My ISA', 'ISA', 25000)
    
    // Add SIPP
    cy.createTestAsset('Pension Fund', 'SIPP', 150000)
    
    // Add Property
    cy.createTestAsset('Family Home', 'Property', 450000)
    
    // Verify assets are listed
    cy.get('[data-cy="asset-card"]').should('have.length', 3)
    
    // 5. Add income sources
    cy.navigateToSection('Income')
    cy.get('h2').should('contain', 'Income')
    
    cy.get('[data-cy="add-income-btn"]').click()
    cy.get('#name').type('Salary - John')
    cy.get('#amount').type('60000')
    cy.get('#frequency').select('annually')
    cy.get('#startYear').type('2024')
    cy.get('[data-cy="owner-checkbox"]').first().check()
    cy.get('button[type="submit"]').click()
    
    // Verify income is added
    cy.get('[data-cy="income-card"]').should('contain', 'Salary - John')
    
    // 6. Add commitments
    cy.navigateToSection('Commitments')
    cy.get('h2').should('contain', 'Commitments')
    
    cy.get('[data-cy="add-commitment-btn"]').click()
    cy.get('#name').type('Mortgage Payment')
    cy.get('#amount').type('2500')
    cy.get('#frequency').select('monthly')
    cy.get('#startYear').type('2024')
    cy.get('#endYear').type('2044')
    cy.get('[data-cy="owner-checkbox"]').first().check()
    cy.get('button[type="submit"]').click()
    
    // Verify commitment is added
    cy.get('[data-cy="commitment-card"]').should('contain', 'Mortgage Payment')
    
    // 7. Add events
    cy.navigateToSection('Events')
    cy.get('h2').should('contain', 'Events')
    
    cy.get('[data-cy="add-event-btn"]').click()
    cy.get('#name').type('Inheritance')
    cy.get('#year').type('2030')
    cy.get('#amount').type('100000')
    cy.get('#type').select('income')
    cy.get('button[type="submit"]').click()
    
    // Verify event is added
    cy.get('[data-cy="event-card"]').should('contain', 'Inheritance')
    
    // 8. View projections
    cy.navigateToSection('Projections')
    cy.get('h2').should('contain', 'Financial Projections')
    
    // Check that projections are calculated and displayed
    cy.get('[data-cy="projection-table"]').should('be.visible')
    cy.get('[data-cy="projection-charts"]').should('be.visible')
    
    // Verify table has data
    cy.get('[data-cy="projection-table"] tbody tr').should('have.length.greaterThan', 0)
    
    // 9. Check scenarios
    cy.navigateToSection('Scenarios')
    cy.get('h2').should('contain', 'Scenarios')
    
    // Base scenario should exist
    cy.get('[data-cy="scenario-card"]').should('contain', 'Base Scenario')
    
    // Create new scenario
    cy.get('[data-cy="create-scenario-btn"]').click()
    cy.get('#name').type('Optimistic Scenario')
    cy.get('#description').type('Higher growth rates scenario')
    cy.get('button[type="submit"]').click()
    
    // Verify new scenario is created
    cy.get('[data-cy="scenario-card"]').should('have.length', 2)
    
    // 10. View timeline
    cy.navigateToSection('Timeline')
    cy.get('h2').should('contain', 'Change Timeline')
    
    // Should show change history
    cy.get('[data-cy="timeline-entry"]').should('have.length.greaterThan', 0)
    
    // 11. Export data
    cy.navigateToSection('Settings')
    cy.get('[data-cy="export-btn"]').click()
    
    // Should trigger download (we can't verify file download in Cypress easily,
    // but we can verify the button works)
    cy.get('[data-cy="export-success"]').should('be.visible')
    
    // 12. Return to dashboard and verify summary
    cy.navigateToSection('Dashboard')
    
    // Summary should reflect added data
    cy.get('[data-cy="summary-people"]').should('contain', '3')
    cy.get('[data-cy="summary-assets"]').should('contain', '3')
    cy.get('[data-cy="summary-income"]').should('contain', '1')
  })

  it('handles error scenarios gracefully', () => {
    cy.visit('/')
    
    // Try to add invalid person
    cy.navigateToSection('People')
    cy.get('[data-cy="add-person-btn"]').click()
    
    // Submit without required fields
    cy.get('button[type="submit"]').click()
    
    // Should show validation errors
    cy.get('[data-cy="validation-error"]').should('be.visible')
    cy.get('[data-cy="validation-error"]').should('contain', 'Date of birth is required')
    
    // Cancel form
    cy.get('button[type="button"]').contains('Cancel').click()
    
    // Should return to list view
    cy.get('[data-cy="add-person-btn"]').should('be.visible')
  })

  it('maintains data persistence across page reloads', () => {
    cy.visit('/')
    
    // Add test data
    cy.createTestPerson('Test User', '1990-01-01', 'M')
    
    // Reload page
    cy.reload()
    
    // Verify data persists
    cy.navigateToSection('People')
    cy.get('[data-cy="person-card"]').should('contain', 'Test User')
  })

  it('supports keyboard navigation', () => {
    cy.visit('/')
    
    // Test skip links
    cy.get('body').tab()
    cy.focused().should('contain', 'Skip to main content')
    
    // Navigate to main content
    cy.focused().type('{enter}')
    cy.focused().should('have.attr', 'id', 'main-content')
    
    // Navigate through sidebar
    cy.get('[aria-label="Navigate to People section"]').focus()
    cy.focused().type('{enter}')
    cy.url().should('contain', '#')
  })
})
