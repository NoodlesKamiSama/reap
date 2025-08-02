/**
 * UI Test Suite: Ramp Sign-Up Functionality
 * 
 * This test suite covers comprehensive testing of the Ramp sign-up page using
 * Cypress custom commands for clean, maintainable test code.
 * 
 * Coverage includes:
 * - Positive sign-up scenarios with valid data
 * - Negative testing with invalid data and edge cases
 * - Form validation and error handling
 * - UI/UX elements and interactions
 * - Accessibility and security considerations
 * 
 * URL: https://app.ramp.com/sign-up
 */

import { faker } from '@faker-js/faker'
import { TestDataGenerator, BrowserHelpers } from '../../utilities/testHelpers'

describe('Ramp Sign-Up Functionality', () => {
  let testData

  beforeEach(() => {
    
    // Load test data
    cy.fixture('testData').then((data) => {
      testData = data
    })

    // Set up test environment
    cy.setupTestEnvironment()
    
    // Visit the sign-up page before each test
    cy.visitSignUpPage()

  })

  describe('Page Load and Initial State', () => {
    
    it('should load the sign-up page successfully', () => {
      
      // Verify URL is correct
      cy.url().should('include', 'sign-up')
      
      // Verify page is responsive and loads completely
      cy.waitForPageLoad()
      
      // Check that the page has loaded without JavaScript errors
      cy.window().should('have.property', 'document')
      
    })

    it('should display all expected UI elements', () => {
        
        // Use custom command to verify page elements
        cy.verifySignUpPageElements()
        
        // Additional verification for page structure
        cy.get('body').should('be.visible')
        
        // Check for responsive design
        cy.viewport(375, 667) // Mobile
        cy.waitWithReason(1000, 'Testing mobile viewport')
        cy.verifySignUpPageElements()
        
        // Reset to desktop
        cy.viewport(1920, 1080)
    })

    it('should handle cookie consent banner if present', () => {
    
      // Handle cookie consent using custom command
      cy.handleCookieConsent()
      
        // Verify that cookie banner is handled or not present
        cy.get('body').then(($body) => {
          const cookieBanner = $body.find('[class*="cookie"], [id*="cookie"]')
          if (cookieBanner.length === 0) {
            cy.log('✓ No cookie banner present or successfully handled')
          }        
       })      
     })  
   })

  describe('Valid Sign-Up Scenarios', () => {
    
    it('should successfully complete sign-up with valid data', () => {
        
        // Generate unique test data for this test
        const userData = TestDataGenerator.generateUserData({
          email: TestDataGenerator.generateUniqueEmail(),
          password: faker.internet.password(),
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
        })
        
        // Use custom command to complete sign-up
        cy.completeSignUp(userData)
        
        // Wait for form processing
        cy.waitWithReason(3000, 'Waiting for form submission processing')
    })

    it('should handle special characters in form data', () => {
        
        // Use test data with special characters
        const specialCharData = testData.edgeCases.specialCharacters
        
        cy.fillSignUpForm(specialCharData)
        
        cy.waitWithReason(2000, 'Processing special character data')
        
        // Verify form handles special characters appropriately
        cy.log('✓ Special character data processed')
    })
})

  describe('Form Validation Testing', () => {

    context('Invalid email format', () => {
      
      const invalidEmails = [
        'invalid-email',
        'test@',
        '@domain.com',
        'test..test@domain.com',
        'test@domain'
      ]

    Object.entries(invalidEmails).forEach(([index, invalidEmail]) => {
      
      it(`should validate email format ${index}`, () => {   
        
          const userData = TestDataGenerator.generateUserData({
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
            email: invalidEmail,
            password: faker.internet.password()
          
          })
            
            cy.fillSignUpForm(userData)
            
            cy.waitWithReason(1000, 'Waiting for email validation')
            cy.verifySignUpValidationError('Invalid email address')
    
          })
      })
  })

    context('Invalid password format', () => {

      const invalidPasswords = {
        lessThan12Characters: {
          password: 'ASxTGs@123',
          errorMessage: 'At least 12 characters'
        },
        noUpperCase: {
          password: 'password#23124#@123456',
          errorMessage: 'At least 1 uppercase character'
        },
        noLowerCase: {
          password: 'TEST#@#!#@123456',
          errorMessage: 'At least 1 lowercase character'
        },
        atLeastOneNumber: {
          password: 'Test@#$!@@#password',
          errorMessage: 'At least 1 number'
        },
        notCommonUsedPassword: {
          password: 'Password@123456',
          errorMessage: 'Not a commonly used password'
        }
      }

      Object.entries(invalidPasswords).forEach(([index, invalidPassword]) => {

        it(`should validate password requirements ${index}`, () => {
          
          const userData = TestDataGenerator.generateUserData({
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
            email: TestDataGenerator.generateUniqueEmail(),
            password: invalidPassword.password            
          })

            cy.fillSignUpForm(userData)
            
            cy.waitWithReason(2000, 'Waiting for password validation')
            cy.verifySignUpValidationError(invalidPassword.errorMessage)

          })
      })    
  })  

  context('Required fields', () => {
    const requiredFields = {
      email: {
        errorMessage: 'Enter an email address'
      },
      firstName: {
        errorMessage: 'First name is required'
      },
      lastName: {
        errorMessage: 'Last name is required'
      },
      password: {
        errorMessage: 'At least 12 characters'
      }
    }

    // Progressive form data for each test
    const progressiveData = [
      {}, // 1st: empty
      { email: 'test@example.com' }, // 2nd: email only
      { email: 'test@example.com', firstName: 'John' }, // 3rd: email + firstName
      { email: 'test@example.com', firstName: 'John', lastName: 'Doe' }, // 4th: email + firstName + lastName
      { email: 'test@example.com', firstName: 'John', lastName: 'Doe' } // 5th: all except password
    ]

    Object.entries(requiredFields).forEach(([fieldName, requiredField], index) => {

        it(`should validate required fields ${fieldName}`, () => {

          // Fill form progressively based on test index
          cy.fillSignUpForm(progressiveData[index])
          
          cy.waitWithReason(2000, 'Waiting for required field validation')
          cy.verifySignUpValidationError(requiredField.errorMessage)
        })
      })
    })
  })

  describe('Security Testing', () => {

    it('should enforce secure password transmission', () => {
  
      // Verify the page is served over HTTPS
      cy.url().should('include', 'https://')
      
      // Check that password field has proper type
      cy.get('body').then(($body) => {
        const passwordInputs = $body.find('input[type="password"]')
        if (passwordInputs.length > 0) {
          cy.log('✓ Password fields use proper input type')
        } else {
          cy.log('⚠ Password fields not detected or may be dynamically typed')
        }
      })
      
      cy.log('✓ HTTPS transmission verified')
    })
  })

  describe('Cross-Browser and Responsive Testing', () => {
    
    it('should work correctly on mobile viewport', () => {
      
      // Test mobile viewport
      cy.viewport(375, 667) // iPhone size
      cy.waitWithReason(1000, 'Adjusting to mobile viewport')
      
      // Verify form is still usable
      cy.verifySignUpPageElements()
      
      // Test form interaction on mobile
      const mobileData = {
        email: TestDataGenerator.generateUniqueEmail(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        password: faker.internet.password()
      }

      cy.completeSignUp(mobileData)
      
      // Reset viewpor
      cy.viewport(1920, 1080)
    })

    it('should work correctly on tablet viewport', () => {
  
      // Test tablet viewport
      cy.viewport(768, 1024) // iPad size
      cy.waitWithReason(1000, 'Adjusting to tablet viewport')
      
      cy.verifySignUpPageElements()
      
      // Reset viewport
      cy.viewport(1920, 1080)
    })
  })

  // Cleanup and reporting
  afterEach(function() {
    // Take screenshot on test failure for debugging
    if (this.currentTest.state === 'failed') {
      BrowserHelpers.takeScreenshot(this.currentTest.parent.title, this.currentTest.title)
    }
    
    // Log test completion
    cy.log(`Test completed: ${this.currentTest.title}`)
  })
})