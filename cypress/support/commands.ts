/// <reference types="cypress" />
/// <reference types="cypress-axe" />

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to login or set up authentication state
       */
      login(): Chainable<void>
      
      /**
       * Custom command to clear IndexedDB data
       */
      clearIndexedDB(): Chainable<void>
      
      /**
       * Custom command to seed test data
       */
      seedTestData(): Chainable<void>
      
      /**
       * Custom command to check accessibility
       */
      checkA11y(): Chainable<void>
      
      /**
       * Custom command to navigate to specific app section
       */
      navigateToSection(section: string): Chainable<void>
      
      /**
       * Custom command to create a test person
       */
      createTestPerson(name: string, dob: string, sex: 'M' | 'F'): Chainable<void>
      
      /**
       * Custom command to create a test asset
       */
      createTestAsset(name: string, type: string, value: number): Chainable<void>
    }
  }
}

Cypress.Commands.add('login', () => {
  // Since this is a client-side app with no authentication,
  // this command can be used to set up initial state
  cy.visit('/')
  cy.get('[data-cy="app-loaded"]', { timeout: 10000 }).should('exist')
})

Cypress.Commands.add('clearIndexedDB', () => {
  cy.window().then((win) => {
    const deleteDB = win.indexedDB.deleteDatabase('FinancialPlannerDB')
    deleteDB.onsuccess = () => {
      console.log('IndexedDB cleared')
    }
  })
})

Cypress.Commands.add('seedTestData', () => {
  cy.clearIndexedDB()
  cy.visit('/')
  cy.wait(1000) // Allow app to initialize
})

Cypress.Commands.add('checkA11y', () => {
  cy.injectAxe()
  cy.checkA11y()
})

Cypress.Commands.add('navigateToSection', (section: string) => {
  cy.get(`[aria-label="Navigate to ${section} section"]`).click()
  cy.url().should('include', '#')
})

Cypress.Commands.add('createTestPerson', (name: string, dob: string, sex: 'M' | 'F') => {
  cy.navigateToSection('People')
  cy.get('[data-cy="add-person-btn"]').click()
  
  if (name) {
    cy.get('#name').type(name)
  }
  cy.get('#dateOfBirth').type(dob)
  cy.get('#sex').select(sex)
  
  cy.get('button[type="submit"]').click()
  cy.get('[data-cy="person-card"]').should('contain', name || 'Person')
})

Cypress.Commands.add('createTestAsset', (name: string, type: string, value: number) => {
  cy.navigateToSection('Assets')
  cy.get('[data-cy="add-asset-btn"]').click()
  
  cy.get('#name').type(name)
  cy.get('#type').select(type)
  cy.get('#currentValue').type(value.toString())
  cy.get('[data-cy="owner-checkbox"]').first().check()
  
  cy.get('button[type="submit"]').click()
  cy.get('[data-cy="asset-card"]').should('contain', name)
})

export {}
