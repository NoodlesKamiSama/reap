// ***********************************************************
// This file is processed and loaded automatically before your test files.
// It's a great place to put global configuration and behavior that modifies Cypress.
// You can change the location of this file or turn off automatically serving support files
// with the 'supportFile' configuration option.
// ***********************************************************

// Import custom commands for enhanced testing capabilities
import './commands'

// Global configuration for better test stability and debugging
Cypress.on('uncaught:exception', (err, runnable) => {
  // Prevent Cypress from failing tests on uncaught exceptions
  // This is particularly useful for third-party scripts or analytics
  // Return false to prevent the error from failing the test
  if (err.message.includes('ResizeObserver loop limit exceeded')) {
    return false
  }
  if (err.message.includes('Script error')) {
    return false
  }
  // Log the error for debugging purposes
  cy.log('Uncaught exception:', err.message)
  return false
})

// Global before hook for test setup
beforeEach(() => {
  // Clear cookies and local storage before each test for clean state
  cy.clearCookies()
  cy.clearLocalStorage()
  
  // Add custom headers if needed for API testing
  cy.intercept('**', (req) => {
    req.headers['x-test-run'] = 'cypress-automation'
  })
})

// Global after hook for cleanup
afterEach(function() {
  // Take screenshot on test failure for debugging
  if (this.currentTest.state === 'failed') {
    cy.screenshot(`failed-${this.currentTest.title}`)
  }
})

// Custom global configurations
Cypress.Commands.add('setupTestEnvironment', () => {
  // Common setup that can be called at the beginning of test suites
  cy.log('Setting up test environment')
  
  // Disable service workers if they interfere with testing
  if (window.navigator && navigator.serviceWorker) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => {
        registration.unregister()
      })
    })
  }
})

// Global constants for test data
Cypress.env('TEST_DATA', {
  validEmail: 'test@example.com',
  invalidEmail: 'invalid-email',
  testPassword: 'TestPassword123!',
  weakPassword: '123',
  firstName: 'John',
  lastName: 'Doe'
})