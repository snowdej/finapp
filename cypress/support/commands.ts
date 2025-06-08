/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      clearIndexedDB(): Chainable<void>
      tab(): Chainable<JQuery<HTMLElement>>
    }
  }
}

// Custom command to clear IndexedDB
Cypress.Commands.add('clearIndexedDB', () => {
  cy.window().then((win) => {
    return new Promise((resolve) => {
      const deleteReq = win.indexedDB.deleteDatabase('FinancialPlannerDB')
      deleteReq.onsuccess = () => resolve(undefined)
      deleteReq.onerror = () => resolve(undefined)
    })
  })
})

// Custom command for keyboard navigation
Cypress.Commands.add('tab', { prevSubject: 'optional' }, (subject) => {
  return cy.wrap(subject).trigger('keydown', { key: 'Tab' })
})

export {}
