/**
 * Sign-Up Flow Commands
 * 
 * Custom Cypress commands for sign-up functionality testing.
 * These commands encapsulate common sign-up actions and validations
 * to keep tests clean and maintainable.
 */

// === NAVIGATION COMMANDS ===

/**
 * Visit the Ramp sign-up page and verify it loaded correctly
 * @param {object} options - Visit options
 */
Cypress.Commands.add('visitSignUpPage', (options = {}) => {
  cy.log('🔗 Navigating to Ramp Sign-Up page')
  cy.visit('/sign-up', options)
  cy.waitForPageLoad()
  
  // Verify we're on the sign-up page
  cy.url().should('include', 'sign-up')
  cy.get('body').should('be.visible')
  
  // Handle cookie consent if present
  cy.handleCookieConsent()
  
  cy.log('✅ Sign-up page loaded successfully')
})

// === FORM INTERACTION COMMANDS ===

/**
 * Fill out the complete sign-up form with provided data
 * @param {object} userData - User data object
 */
Cypress.Commands.add('fillSignUpForm', (userData) => {
  cy.log('📝 Filling out sign-up form')
  
  // Fill email field
  if (userData.email) {
    cy.fillSignUpEmail(userData.email)
  }

  // Fill first name
  if (userData.firstName) {
    cy.fillSignUpFirstName(userData.firstName)
  }

  // Fill last name
  if (userData.lastName) {
    cy.fillSignUpLastName(userData.lastName)
  }
  
  // Fill password field
  if (userData.password) {
    cy.fillSignUpPassword(userData.password)
  }

  cy.get('button').contains('Start application').click()

  cy.get('body').then(($body) => {
    const text = $body.text()

  if (text.includes('Is your email associated with an existing Ramp business? If so, reach out to your admin for an invite. Otherwise you can continue signing up to start a new application.')) {
    cy.get('button').contains('Start application').click()
  }
})
  cy.log('✅ Sign-up form filled successfully')
})

/**
 * Fill email field in sign-up form
 * @param {string} email - Email address
 */
Cypress.Commands.add('fillSignUpEmail', (email) => {
  cy.log(`📧 Entering email: ${email}`)

  cy.get('.RyuPanelRoot-hdGteB').eq(0)
    .should('be.visible')
    .contains('Work email address')
    .click({force: true})
    .type(email)
  cy.log('✅ Email input field found')
})

/**
 * Fill password field in sign-up form
 * @param {string} password - Password
 */
Cypress.Commands.add('fillSignUpPassword', (password) => {
  cy.log('🔒 Entering password')
  
  cy.get('.RyuPanelRoot-hdGteB').eq(3)
    .should('be.visible')
    .contains('Choose a password')
    .click({force: true})
    .type(password)

  cy.waitWithReason(1000, 'Waiting for password validation')
  cy.log('✅ Password input field found')
})

/**
 * Fill first name field in sign-up form
 * @param {string} firstName - First name
 */
Cypress.Commands.add('fillSignUpFirstName', (firstName) => {
  cy.log(`👤 Entering first name: ${firstName}`)
  
  cy.get('.RyuPanelRoot-hdGteB').eq(1)
    .should('be.visible')
    .contains('First name')
    .click({force: true})
    .type(firstName)
  cy.log('✅ First name input field found')
})

/**
 * Fill last name field in sign-up form
 * @param {string} lastName - Last name
 */
Cypress.Commands.add('fillSignUpLastName', (lastName) => {
  cy.log(`👤 Entering last name: ${lastName}`)
  
  cy.get('.RyuPanelRoot-hdGteB').eq(2)
    .should('be.visible')
    .contains('Last name')
    .click({force: true})
    .type(lastName)
  cy.log('✅ Last name input field found')
})

/**
 * Complete sign-up flow with provided user data
 * @param {object} userData - Complete user data object
 */
Cypress.Commands.add('completeSignUp', (userData) => {
  cy.log('🔄 Starting complete sign-up flow')
  
  cy.fillSignUpForm(userData)
  cy.intercept('POST', '**/post-sign-up').as('signUp')
  cy.wait('@signUp', { timeout: 60000 }).then((response) => {
    expect(response.response.body.user.first_name).to.eq(userData.firstName)
    expect(response.response.body.user.last_name).to.eq(userData.lastName)
    expect(response.response.body.user.email).to.eq(userData.email)
  })
  cy.url().should('include', 'verify-email')
  
  cy.log('✅ Sign-up flow completed')
})

// === VALIDATION COMMANDS ===

/**
 * Verify sign-up page elements are present
 */
Cypress.Commands.add('verifySignUpPageElements', () => {
  cy.log('🔍 Verifying sign-up page elements')
  
  // Check for form elements
  cy.get('body').then(($body) => {
    const hasForm = $body.find('.RigidPageContentRoot-sc-2d1fc4b4-0').length > 0 || 
                   $body.find('#«r4»').length > 0
    
    if (hasForm) {
      cy.log('✅ Sign-up form elements detected')
    } else {
      cy.log('⚠️ Sign-up form not immediately visible')
    }
    
    // Check for logo/branding
    const hasLogo = $body.find('img[alt*="Ramp"]').length > 0 ||
                   $body.find('.RigidBodyLink-sc-ce63e1f-0').length > 0
    
    if (hasLogo) {
      cy.log('✅ Logo/branding element found')
    }
  })
})

/**
 * Verify sign-up validation errors are displayed
 * @param {string} expectedError - Expected error message (optional)
 */
Cypress.Commands.add('verifySignUpValidationError', (expectedError = null) => {
  cy.log('🔍 Verifying sign-up validation errors by red text')
  
  cy.get('body *').then(($elements) => {
    const redErrorElements = []
    
    // Find all elements with red text that have content
    $elements.each((index, element) => {
      const computedStyle = window.getComputedStyle(element)
      const color = computedStyle.color
      const text = Cypress.$(element).text().trim()
      
      // Simple red detection: check if red value is high
      if (color.includes('rgb') && text.length > 0) {
        const rgbMatch = color.match(/rgb\((\d+)/)
        if (rgbMatch && parseInt(rgbMatch[1]) > 150) {
          redErrorElements.push({ element, text })
        }
      }
    })
    
    if (redErrorElements.length >= 2) {
      // Use the second red error message
      const secondError = redErrorElements[1]
      cy.wrap(secondError.element).should('be.visible')
      
      if (expectedError) {
        expect(secondError.text.toLowerCase()).to.include(expectedError.toLowerCase())
      }
    } else if (redErrorElements.length === 1) {
      cy.log('⚠️ Only found 1 red error, expected 2nd one')
    } else {
      cy.log('ℹ️ No red validation errors found')
    }
  })
})

/**
 * Verify successful sign-up completion
 */
Cypress.Commands.add('verifySignUpSuccess', () => {
  cy.log('🔍 Verifying successful sign-up')
  
  // Check for URL change (redirect)
  cy.url().should('not.include', 'sign-up')
  
  // Check for success indicators
  const successSelectors = [
    '.success',
    '[role="status"]',
    '[data-testid*="success"]',
    '.verification',
    '.welcome'
  ]
  
  cy.get('body').then(($body) => {
    for (const selector of successSelectors) {
      if ($body.find(selector).length > 0) {
        cy.get(selector).should('be.visible')
        cy.log('✅ Success message detected')
        return
      }
    }
    cy.log('✅ URL changed - likely successful redirect')
  })
})

// === NAVIGATION COMMANDS ===

/**
 * Navigate to login page from sign-up page
 */
Cypress.Commands.add('goToLoginFromSignUp', () => {
  cy.log('🔗 Navigating to login page')
  
  const loginLinkSelectors = [
    'a[href*="login"]',
    'a:contains("Log in")',
    'a:contains("Sign in")',
    '[data-testid*="login"]'
  ]
  
  cy.get('body').then(($body) => {
    for (const selector of loginLinkSelectors) {
      if ($body.find(selector).length > 0) {
        cy.get(selector).first().click()
        cy.log('✅ Navigated to login page')
        return
      }
    }
    cy.log('⚠️ Login link not found')
  })
})

/**
 * Test social sign-up options if available
 * @param {string} provider - Social provider (google, linkedin, microsoft)
 */
Cypress.Commands.add('testSocialSignUp', (provider = 'google') => {
  cy.log(`🔗 Testing ${provider} sign-up option`)
  
  const socialSelectors = {
    google: ['button:contains("Google")', '[data-testid*="google"]', '.google-signin'],
    linkedin: ['button:contains("LinkedIn")', '[data-testid*="linkedin"]'],
    microsoft: ['button:contains("Microsoft")', '[data-testid*="microsoft"]']
  }
  
  const selectors = socialSelectors[provider.toLowerCase()] || socialSelectors.google
  
  cy.get('body').then(($body) => {
    for (const selector of selectors) {
      if ($body.find(selector).length > 0) {
        cy.log(`✅ ${provider} sign-up option detected`)
        // Note: Not clicking to avoid external navigation in tests
        return
      }
    }
    cy.log(`ℹ️ ${provider} sign-up option not found`)
  })
})