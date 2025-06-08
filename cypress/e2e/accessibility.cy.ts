describe('Accessibility Tests', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.injectAxe() // Inject axe-core for accessibility testing
  })

  it('has no accessibility violations on main pages', () => {
    // Test dashboard
    cy.checkA11y()

    // Test people page
    cy.get('[aria-label="Navigate to People section"]').click()
    cy.checkA11y()

    // Test assets page
    cy.get('[aria-label="Navigate to Assets section"]').click()
    cy.checkA11y()

    // Test income page
    cy.get('[aria-label="Navigate to Income section"]').click()
    cy.checkA11y()

    // Test projections page
    cy.get('[aria-label="Navigate to Projections section"]').click()
    cy.checkA11y()
  })

  it('supports keyboard navigation', () => {
    // Skip links should work
    cy.get('body').tab()
    cy.focused().should('contain', 'Skip to main content')
    cy.focused().type('{enter}')
    cy.focused().should('have.attr', 'id', 'main-content')

    // Navigation should work with keyboard
    cy.get('[aria-label="Navigate to People section"]').focus().type('{enter}')
    cy.url().should('not.contain', '#')
    cy.contains('People').should('be.visible')
  })

  it('has proper focus management in forms', () => {
    cy.get('[aria-label="Navigate to People section"]').click()
    cy.contains('Add Your First Person').click()

    // First field should be focused
    cy.focused().should('have.attr', 'id', 'name')

    // Tab through form fields
    cy.focused().tab()
    cy.focused().should('have.attr', 'id', 'dateOfBirth')

    cy.focused().tab()
    cy.focused().should('have.attr', 'id', 'sex')
  })

  it('announces dynamic content changes', () => {
    // Check for live region
    cy.get('[aria-live="polite"]').should('exist')

    // Navigate and check announcements
    cy.get('[aria-label="Navigate to People section"]').click()
    cy.get('[aria-live="polite"]').should('contain', 'Navigated to People section')
  })

  it('has proper color contrast', () => {
    // Test in both light and dark modes
    cy.checkA11y(null, {
      rules: {
        'color-contrast': { enabled: true }
      }
    })

    // Switch to dark mode
    cy.get('[aria-label*="Switch to dark mode"]').click()
    cy.checkA11y(null, {
      rules: {
        'color-contrast': { enabled: true }
      }
    })
  })

  it('has proper heading hierarchy', () => {
    cy.checkA11y(null, {
      rules: {
        'heading-order': { enabled: true }
      }
    })

    // Check each page has proper headings
    const pages = [
      'People', 'Assets', 'Income', 'Commitments', 
      'Events', 'Scenarios', 'Projections', 'Timeline'
    ]

    pages.forEach(page => {
      cy.get(`[aria-label="Navigate to ${page} section"]`).click()
      cy.get('h1, h2, h3, h4, h5, h6').should('exist')
      cy.checkA11y(null, {
        rules: {
          'heading-order': { enabled: true }
        }
      })
    })
  })
})
