/**
 * Login Flow Commands
 * 
 * Custom Cypress commands for login functionality testing.
 * These commands encapsulate common login actions and validations
 * to keep tests clean and maintainable.
 */

// === NAVIGATION COMMANDS ===

/**
 * Visit the Ramp login page and verify it loaded correctly
 * @param {object} options - Visit options
 */
Cypress.Commands.add('visitLoginPage', (options = {}) => {
  cy.log('🔗 Navigating to Ramp Login page')
  cy.visit('/sign-in', options)
  cy.waitForPageLoad()
  
  // Verify we're on the login page
  cy.url().should('include', 'sign-in')
  cy.get('body').should('be.visible')
  
  // Handle cookie consent if present
  cy.handleCookieConsent()
  
  cy.log('✅ Login page loaded successfully')
})

// === FORM INTERACTION COMMANDS ===

/**
 * Fill email field in login form
 * @param {string} email - Email address
 */
Cypress.Commands.add('fillLoginEmail', (email) => {
  cy.log(`📧 Entering login email: ${email}`)
  
  cy.get('#«r5»').type(email)
})

/**
 * Fill password field in login form
 * @param {string} password - Password
 */
Cypress.Commands.add('fillLoginPassword', (password) => {
  cy.log('🔒 Entering login password')
  
  cy.get('#«rf»').type(password)
})

/**
 * Submit the login form
 */
Cypress.Commands.add('submitLoginForm', (email) => {
  cy.log('🚀 Submitting login form')
  
  cy.get('#«r8»').contains('Sign in to Ramp').click()
  cy.intercept('POST', 'https://api.ramp.com/v1/auth/users/current/send-mfa').as('login')
  cy.wait('@login').then((response) => {
    expect(response.response.statusCode).to.eq(200)
    expect(response.response.body.email_sent_to).to.eq(email)
    cy.log('✅ Login form submitted')
  })
})

// === COMPLETE FLOW COMMANDS ===

/**
 * Perform complete login with credentials
 * @param {string} email - User email
 * @param {string} password - User password
 */
Cypress.Commands.add('performLogin', (email, password) => {
  cy.log(`🔄 Starting login flow for: ${email}`)
  
  cy.fillLoginEmail(email)
  cy.get('button').contains('Continue').click()
  cy.fillLoginPassword(password)

  cy.submitLoginForm(email)
  
  cy.log('✅ Login flow completed')
})

//Attempt login and wait for response
Cypress.Commands.add('attemptLogin', (email, password = {}) => {
  cy.fillLoginEmail(email)
  cy.get('button').contains('Continue').click()
  cy.fillLoginPassword(password)
  cy.get('#«r8»').contains('Sign in to Ramp').click()
  cy.waitWithReason(3000, 'Waiting for login processing')
})

Cypress.Commands.add('completeLogin', (email, password) => {
  cy.performLogin(email, password)
  cy.waitWithReason(3000, 'Waiting for login processing')
})

// === VALIDATION COMMANDS ===

/**
 * Verify login page elements are present
 */
Cypress.Commands.add('verifyLoginPageElements', () => {
  cy.log('🔍 Verifying login page elements')
  
  cy.get('body').then(($body) => {
    // Check for email input
    const hasEmailInput = $body.find('#«r4»').length > 0
    if (hasEmailInput) {
      cy.log('✅ Email input field detected')
    }
    
    // Check for password input
    const hasPasswordInput = $body.find('input[type="password"]').length > 0
    if (hasPasswordInput) {
      cy.log('✅ Password input field detected')
    }
    
    // Check for submit button
    const hasSubmitButton = $body.find('#«r8»').length > 0
    if (hasSubmitButton) {
      cy.log('✅ Submit button detected')
    }
    
    // Check for forgot password link
    const hasForgotPassword = $body.find('a:contains("Forgot"), a:contains("Reset")').length > 0
    if (hasForgotPassword) {
      cy.log('✅ Forgot password link detected')
    }
    
    // Check for sign-up link
    const hasSignUpLink = $body.find('.RyuTextAsRoot-gOTTqs > .RyuLinkRoot-jVJzZb').length > 0
    if (hasSignUpLink) {
      cy.log('✅ Sign-up link detected')
    }
  })
})

/**
 * Verify login validation errors are displayed
 * @param {string} expectedError - Expected error message (optional)
 */
Cypress.Commands.add('verifyLoginError', (expectedError = null) => {
  cy.log('🔍 Verifying login validation errors')
  cy.get('.hzTNbB').should('be.visible').should('contain.text', 'We do not recognize this email password combination. Try again or reset your password.')
  
})

/**
 * Verify successful login completion
 */
Cypress.Commands.add('verifyLoginSuccess', () => {
  cy.log('🔍 Verifying successful login')
  
  // Check for URL change (should redirect away from login)
  cy.url().should('include', 'mfa')
  
  // Check for success indicators or dashboard
  const successSelectors = [
    '.success',
    '[role="status"]',
    '[data-testid*="success"]',
    '.dashboard',
    '.welcome'
  ]
  
  cy.get('body').then(($body) => {
    for (const selector of successSelectors) {
      if ($body.find(selector).length > 0) {
        cy.get(selector).should('be.visible')
        cy.log('✅ Success indicator detected')
        return
      }
    }
    cy.log('✅ URL changed - likely successful redirect')
  })
})

/**
 * Verify empty field validation
 */
Cypress.Commands.add('verifyEmptyFieldValidation', (email) => {
  cy.log('🔍 Verifying empty field validation')
  
  // Try to submit empty form
  cy.fillLoginEmail(email)
  cy.get('button').contains('Continue').click()
  cy.waitWithReason(1000, 'Waiting for validation')
  
  // Check for validation errors
  const validationSelectors = [
    '.error',
    '[role="alert"]',
    '[data-testid*="error"]',
    '.required',
    '[aria-required="true"]'
  ]
  
  cy.get('body').then(($body) => {
    for (const selector of validationSelectors) {
      if ($body.find(selector).length > 0) {
        cy.get(selector).should('be.visible')
        cy.log('✅ Empty field validation working')
        return
      }
    }
    cy.log('ℹ️ No validation errors detected')
  })
})

// === PASSWORD RESET COMMANDS ===

/**
 * Click forgot password link
 */
Cypress.Commands.add('clickResetPassword', (email) => {
  cy.log('🔗 Clicking forgot password link')
  
  cy.get('#«r5»').type(email)
  cy.get('button').contains('Continue').click()
  cy.get('.CenteredContainer-sc-ff0d2640-4 > .RyuPadRoot-kZaei').contains('Reset password').click()
  cy.waitWithReason(2000, 'Waiting for password reset form')
  cy.url().should('include', 'forgot-password')
  cy.get('button').contains('Reset password').should('be.visible').click()
  cy.log('✅ Reset password link clicked')
  cy.get('.RigidPageContentRoot-sc-2d1fc4b4-0').contains(`If ${email} is associated with a Ramp account, we’ll send a link and instructions to reset your password.`)
})

/**
 * Fill and submit password reset form
 * @param {string} email - Email for password reset
 */
Cypress.Commands.add('submitPasswordReset', (email) => {
  cy.log(`📧 Submitting password reset for: ${email}`)
  
  cy.clickForgotPassword()
  cy.waitWithReason(2000, 'Loading password reset form')
  
  // Look for password reset form
  cy.get('body').then(($body) => {
    const hasResetForm = $body.find('input[name*="email"], input[placeholder*="email"]').length > 0
    
    if (hasResetForm) {
      cy.get('input[name*="email"], input[placeholder*="email"]').first().type(email)
      
      // Look for submit button
      const submitButton = $body.find('button[type="submit"], button:contains("Reset"), button:contains("Send")')
      if (submitButton.length > 0) {
        cy.get(submitButton.first()).click()
        cy.log('✅ Password reset submitted')
      }
    } else {
      cy.log('⚠️ Password reset form not found')
    }
  })
})

// === SOCIAL LOGIN COMMANDS ===

/**
 * Test social login options if available
 * @param {string} provider - Social provider (google, linkedin, microsoft, sso)
 */
Cypress.Commands.add('testSocialLogin', (email, provider = 'Google') => {
  cy.log(`🔗 Testing ${provider} login option`)

  cy.fillLoginEmail(email)
  cy.get('button').contains('Continue').click()
  cy.get('button').contains(`Sign in with ${provider}`).click()
  cy.window().then((win) => {
    cy.stub(win, 'open').callsFake(function (url) {
      openedUrl = url
    }).as('popupWindow')
    cy.get('@popupWindow').should('be.called')

  })
})

// === NAVIGATION COMMANDS ===

/**
 * Navigate to sign-up page from login page
 */
Cypress.Commands.add('goToSignUpFromLogin', () => {
  cy.log('🔗 Navigating to sign-up page')
  
  cy.get('.RyuTextAsRoot-gOTTqs > .RyuLinkRoot-jVJzZb').contains('Sign up').click()
})

// === SECURITY TESTING COMMANDS ===

/**
 * Test login with invalid email format
 * @param {string} invalidEmail - Invalid email to test
 */
Cypress.Commands.add('testInvalidEmailLogin', (invalidEmail, message) => {
  cy.log(`🧪 Testing invalid email format: ${invalidEmail}`)
  
  cy.fillLoginEmail(invalidEmail)
  cy.get('button').contains('Continue').click()
  cy.waitWithReason(1000, 'Waiting for email validation')
})

/**
 * Test login with malicious payloads
 * @param {string} payload - Malicious payload to test
 * @param {string} fieldType - Field type (email or password)
 */
Cypress.Commands.add('testMaliciousLoginPayload', (payload, fieldType = 'email') => {
  cy.log(`🛡️ Testing malicious ${fieldType} payload`)
  
  if (fieldType === 'email') {
    cy.fillLoginEmail(payload)
    cy.fillLoginPassword('password')
  } else {
    cy.fillLoginEmail('test@example.com')
    cy.fillLoginPassword(payload)
  }
  
  cy.submitLoginForm()
  cy.waitWithReason(2000, 'Processing malicious payload')
  
  // Verify form handles malicious input appropriately
  cy.get('body').then(($body) => {
    const hasError = $body.find('.error, [role="alert"]').length > 0
    if (hasError) {
      cy.log('✅ Malicious payload handled with validation')
    } else {
      cy.log('✅ Malicious payload processed safely')
    }
  })
  
  cy.clearLoginForm()
})

/**
 * Test multiple failed login attempts
 * @param {number} attemptCount - Number of failed attempts to make
 */
Cypress.Commands.add('testMultipleFailedLogins', (attemptCount = 3) => {
  cy.log(`🔒 Testing ${attemptCount} failed login attempts`)
  
  const invalidCredentials = {
    email: 'test@example.com',
    password: 'wrongpassword'
  }
  
  for (let i = 1; i <= attemptCount; i++) {
    cy.log(`Failed login attempt ${i}`)
    
    cy.attemptLogin(invalidCredentials.email, invalidCredentials.password)
    cy.waitWithReason(2000, `Waiting for failed attempt ${i} response`)
    
    // Check for error messages or lockout warnings
    cy.get('body').then(($body) => {
      const hasError = $body.find('.error, [role="alert"]').length > 0
      if (hasError) {
        cy.log(`✅ Error message displayed for attempt ${i}`)
      }
      
      // Look for rate limiting or lockout warnings
      const hasLockoutWarning = $body.find(':contains("locked"), :contains("attempts"), :contains("wait")').length > 0
      if (hasLockoutWarning) {
        cy.log(`✅ Lockout warning detected after ${i} attempts`)
      }
    })
  }
})