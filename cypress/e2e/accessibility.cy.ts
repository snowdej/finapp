describe('Accessibility Tests', () => {
  beforeEach(() => {
    cy.seedTestData()
  })

  it('meets WCAG accessibility standards on all main pages', () => {
    // Dashboard
    cy.visit('/')
    cy.checkA11y()
    
    // People page
    cy.navigateToSection('People')
    cy.checkA11y()
    
    // Add person form
    cy.get('[data-cy="add-person-btn"]').click()
    cy.checkA11y()
    
    // Assets page
    cy.navigateToSection('Assets')
    cy.checkA11y()
    
    // Income page  
    cy.navigateToSection('Income')
    cy.checkA11y()
    
    // Commitments page
    cy.navigateToSection('Commitments')
    cy.checkA11y()
    
    // Events page
    cy.navigateToSection('Events')
    cy.checkA11y()
    
    // Scenarios page
    cy.navigateToSection('Scenarios')
    cy.checkA11y()
    
    // Projections page
    cy.navigateToSection('Projections')
    cy.checkA11y()
    
    // Timeline page
    cy.navigateToSection('Timeline')
    cy.checkA11y()
    
    // Settings page
    cy.navigateToSection('Settings')
    cy.checkA11y()
  })

  it('supports screen reader navigation', () => {
    cy.visit('/')
    
    // Check for proper heading hierarchy
    cy.get('h1').should('have.length', 1)
    cy.get('h1').should('contain', 'Financial Projection Tool')
    
    // Check for main landmarks
    cy.get('main[role="main"]').should('exist')
    cy.get('nav[role="navigation"]').should('exist')
    cy.get('header').should('exist')
    
    // Check for skip links
    cy.get('a[href="#main-content"]').should('exist')
    cy.get('a[href="#navigation"]').should('exist')
    
    // Check ARIA labels on navigation
    cy.get('[aria-label="Main navigation"]').should('exist')
    cy.get('[aria-current="page"]').should('exist')
  })

  it('provides proper focus management', () => {
    cy.visit('/')
    
    // Test focus trap in modals/dialogs
    cy.navigateToSection('People')
    cy.get('[data-cy="add-person-btn"]').click()
    
    // Focus should be on first form field
    cy.focused().should('have.attr', 'id', 'name')
    
    // Tab through form
    cy.focused().tab()
    cy.focused().should('have.attr', 'id', 'dateOfBirth')
    
    cy.focused().tab()
    cy.focused().should('have.attr', 'id', 'sex')
    
    // Tab to submit button
    cy.focused().tab()
    cy.focused().should('contain', 'Add Person')
    
    // Tab to cancel button
    cy.focused().tab()
    cy.focused().should('contain', 'Cancel')
    
    // Escape should close form
    cy.get('body').type('{esc}')
    cy.get('[data-cy="add-person-btn"]').should('be.visible')
  })

  it('provides proper error announcements', () => {
    cy.visit('/')
    
    // Create screen reader announcements div
    cy.window().then((win) => {
      const announcer = win.document.createElement('div')
      announcer.setAttribute('aria-live', 'polite')
      announcer.setAttribute('aria-atomic', 'true')
      announcer.className = 'sr-only'
      announcer.id = 'screen-reader-announcements'
      win.document.body.appendChild(announcer)
    })
    
    cy.navigateToSection('People')
    cy.get('[data-cy="add-person-btn"]').click()
    
    // Try to submit invalid form
    cy.get('button[type="submit"]').click()
    
    // Check for error messages with proper ARIA
    cy.get('[data-cy="validation-error"]').should('have.attr', 'role', 'alert')
    cy.get('[data-cy="validation-error"]').should('be.visible')
  })

  it('supports keyboard-only navigation', () => {
    cy.visit('/')
    
    // Navigate using only keyboard
    cy.get('body').tab() // Skip link
    cy.focused().tab()   // Skip link 2
    cy.focused().tab()   // Theme toggle
    cy.focused().tab()   // First nav item
    
    // Navigate through sidebar using arrow keys and enter
    cy.get('[aria-label="Navigate to People section"]').focus()
    cy.focused().type('{enter}')
    
    // Should navigate to people section
    cy.get('h2').should('contain', 'People')
    
    // Continue keyboard navigation
    cy.focused().tab() // Add person button
    cy.focused().type('{enter}')
    
    // Should open add person form
    cy.get('#name').should('be.focused')
  })

  it('provides adequate color contrast', () => {
    cy.visit('/')
    
    // Check both light and dark modes
    cy.get('[aria-label*="Switch to dark mode"]').click()
    cy.checkA11y()
    
    cy.get('[aria-label*="Switch to light mode"]').click()
    cy.checkA11y()
  })

  it('supports high contrast mode', () => {
    cy.visit('/')
    
    // Simulate high contrast mode
    cy.window().then((win) => {
      win.document.documentElement.style.setProperty('--color-scheme', 'high-contrast')
    })
    
    // Verify elements are still visible and accessible
    cy.get('h1').should('be.visible')
    cy.get('[aria-label="Main navigation"]').should('be.visible')
    cy.get('button').should('be.visible')
  })

  it('provides proper table accessibility', () => {
    // Add test data first
    cy.createTestPerson('Test User', '1990-01-01', 'M')
    cy.createTestAsset('Test Asset', 'ISA', 10000)
    
    cy.navigateToSection('Projections')
    
    // Check table accessibility
    cy.get('table').should('have.attr', 'role', 'table')
    cy.get('thead').should('have.attr', 'role', 'rowgroup')
    cy.get('tbody').should('have.attr', 'role', 'rowgroup')
    cy.get('th').should('have.attr', 'role', 'columnheader')
    cy.get('td').should('have.attr', 'role', 'gridcell')
    
    // Check for table caption
    cy.get('caption').should('exist')
    
    // Check sortable headers have proper ARIA
    cy.get('th[aria-sort]').should('exist')
    cy.get('th[aria-sort]').first().should('have.attr', 'aria-sort', 'none')
    
    // Test sorting accessibility
    cy.get('th[aria-sort]').first().click()
    cy.get('th[aria-sort]').first().should('have.attr', 'aria-sort', 'ascending')
  })
})
