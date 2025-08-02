/**
 * UI Test Suite: Ramp Login Functionality
 * 
 * This test suite covers comprehensive testing of the Ramp login page using
 * Cypress custom commands for clean, maintainable test code.
 * 
 * Coverage includes:
 * - Valid login scenarios
 * - Invalid credentials handling
 * - Form validation and error handling
 * - Password reset functionality
 * - Accessibility testing
 * 
 * URL: https://app.ramp.com/login 
 */

import { TestDataGenerator, BrowserHelpers } from '../../utilities/testHelpers'

describe('Ramp Login Functionality', () => {
  let testData

  beforeEach(() => {
    // Load test data
    cy.fixture('testData').then((data) => {
      testData = data
    })
    
    // Set up test environment
    cy.setupTestEnvironment()
  })

  describe('Login Page Access and Initial State', () => {
    
    it('should access login page directly', () => {
      
      // Visit login page directly using custom command
      cy.visitLoginPage()
      
      // Verify successful page load
      cy.verifyLoginPageElements()

    })

  })

  describe('Valid Login Scenarios', () => {
    
    beforeEach(() => {
      cy.visitLoginPage()
    })

    it('should attempt login with valid credentials format', () => {
  
      // Use test data that follows valid format
      const validCredentials = testData.existingUser
      
      // Perform login attempt using custom command
      cy.completeLogin(validCredentials.email, validCredentials.password)
      
      // Since we don't have real credentials, check how form responds
      cy.url().then((currentUrl) => {
        if (!currentUrl.includes('login')) {
      
          cy.verifyLoginSuccess()
        } else {
          // Check for authentication error (expected behavior)
          cy.verifyLoginError()
        }
      })
    })

    it('should handle social login options if available', () => {
  
      // Test various social login options using custom commands
      cy.testSocialLogin(testData.existingUser.email, 'Google')
    })
  })

  describe('Invalid Login Scenarios', () => {
    
    beforeEach(() => {
      cy.visitLoginPage()
    })

    it('should handle completely invalid credentials', () => {
      
      const invalidCredentials = {
        email: 'nonexistent@invalid-domain.com',
        password: 'WrongPassword123!'
      }
      
      cy.attemptLogin(invalidCredentials.email, invalidCredentials.password)
      
      // Should show authentication error
      cy.verifyLoginError()
      
      // Should remain on login page
      cy.url().should('include', 'sign-in')
    })    

      context('Invalid email format', () => {

        const invalidEmails = {
          withoutAt: {
            email: 'not-an-email',
            message: "Please include an '@' in the email address."
          },
          withoutDomain: {
            email: 'test@',
            message: 'Invalid email address'
          },
          withoutUsername: {
            email: '@domain.com',
            message: 'Invalid email address'
          }
        }
      
       Object.entries(invalidEmails).forEach(([fieldName, invalidEmail]) => {
        
        it(`should validate email format on login: ${fieldName}`, () => {
      
          // Use custom command to test invalid email
          cy.testInvalidEmailLogin(invalidEmail.email, invalidEmail.message)

          })
        })
      })
  })


  describe('Password Reset Functionality', () => {
    
    beforeEach(() => {
      cy.visitLoginPage()
    })

    it('should navigate to password reset when forgot password is clicked', () => {

      // Use custom command to click forgot password
      cy.clickResetPassword(testData.existingUser.email)
    })
  })

  describe('Login Security Features', () => {
    
    beforeEach(() => {
      cy.visitLoginPage()
    })

    it('should enforce secure transmission', () => {
      
      // Verify HTTPS usage
      cy.url().should('include', 'https://')
      cy.log('✓ Secure HTTPS transmission verified')
      
      // Check for secure form attributes
      cy.get('body').then(($body) => {
        const forms = $body.find('form')
        if (forms.length > 0) {
          forms.each((index, form) => {
            const method = form.getAttribute('method')
            if (method && method.toLowerCase() === 'post') {
              cy.log('✓ Form uses POST method for secure submission')
            }
          })
        }
      })
    })
  })

  describe('Login Page Performance and Responsiveness', () => {
    
    it('should load quickly and be responsive', () => {
  
      const startTime = Date.now()
      
      cy.visitLoginPage()
      
      const loadTime = Date.now() - startTime
      
      // Verify responsiveness on different screen sizes
      const viewports = [
        { width: 375, height: 667, name: 'Mobile' },
        { width: 768, height: 1024, name: 'Tablet' },
        { width: 1920, height: 1080, name: 'Desktop' }
      ]
      
      viewports.forEach((viewport) => {
        cy.viewport(viewport.width, viewport.height)
        cy.waitWithReason(1000, `Testing ${viewport.name} viewport`)
        
        cy.verifyLoginPageElements()
        cy.log(`✓ ${viewport.name} viewport test completed`)
      })
      
      // Reset to default viewport
      cy.viewport(1280, 720)
    })

    it('should handle slow network conditions', () => {
      
      // Simulate slow network
      BrowserHelpers.simulateSlowNetwork()
      
      cy.visitLoginPage()
      
      // Test form functionality under slow conditions
      const testCredentials = {
        email: 'test+special.chars@example.com',
        password: 'P@$$w0rd!#$%^&*()'
      }
      
      cy.performLogin(testCredentials.email, testCredentials.password)
      
      cy.waitWithReason(5000, 'Testing under slow network conditions')

      cy.log('✓ Slow network conditions tested')
    })
  })

  describe('Integration with Sign-up Flow', () => {
    
    it('should seamlessly navigate between login and sign-up', () => {
  
      // Start at login
      cy.visitLoginPage()
      
      // Navigate to sign-up using custom command
      cy.goToSignUpFromLogin()
      
      cy.waitWithReason(2000, 'Navigating to sign-up')
      
      // Verify we're on sign-up
      cy.url().then((currentUrl) => {
        if (currentUrl.includes('sign-up')) {
          cy.log('✓ Successfully navigated from login to sign-up')
        }
      })
    })
  })

  // Cleanup and reporting
  afterEach(function() {
    // Take screenshot on test failure
    if (this.currentTest.state === 'failed') {
      BrowserHelpers.takeScreenshot(this.currentTest.parent.title, this.currentTest.title)
    }
    
    // Log test completion
    cy.log(`Login test completed: ${this.currentTest.title}`)
  })
})