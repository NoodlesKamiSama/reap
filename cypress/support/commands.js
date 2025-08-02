// ***********************************************
// Custom Cypress Commands for Enhanced Testing
// This file contains reusable commands for both UI and API testing
// ***********************************************

// Import flow-based commands
import './shareds/signup'
import './shareds/login'

// === UI TESTING COMMANDS ===

/**
 * Custom command to wait for page load completion
 * Useful for SPAs that load content dynamically
 */
Cypress.Commands.add('waitForPageLoad', () => {
  cy.window().should('have.property', 'document')
  cy.document().should('have.property', 'readyState', 'complete')
  // Wait for any pending network requests
  cy.intercept('**').as('anyRequest')
  cy.wait(1000) // Allow time for any immediate requests
})

/**
 * Custom command to handle cookie consent banners
 * Common pattern in modern web applications
 */
Cypress.Commands.add('handleCookieConsent', () => {
  cy.get('body').then(($body) => {
    // Check for common cookie consent patterns
    const cookieSelectors = [
      '[data-testid*="cookie"]',
      '[class*="cookie"]',
      '[id*="cookie"]',
      'button:contains("Accept")',
      'button:contains("Allow")',
      'button:contains("Agree")'
    ]
    
    cookieSelectors.forEach(selector => {
      if ($body.find(selector).length > 0) {
        cy.get(selector).first().click({ force: true })
      }
    })
  })
})

// === API TESTING COMMANDS ===

/**
 * Custom command for API requests with enhanced error handling and logging
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
 * @param {string} endpoint - API endpoint
 * @param {object} options - Request options (body, headers, etc.)
 */
Cypress.Commands.add('apiRequest', (method, endpoint, options = {}) => {
  const baseUrl = Cypress.env('apiBaseUrl')
  const url = `${baseUrl}${endpoint}`
  
  // Default headers for API requests
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'User-Agent': 'Cypress-Test-Runner'
  }
  
  const requestOptions = {
    method: method.toUpperCase(),
    url: url,
    headers: { ...defaultHeaders, ...options.headers },
    failOnStatusCode: false, // Handle status codes manually for better error reporting
    ...options
  }
  
  // Log the request for debugging
  cy.log(`API ${method.toUpperCase()} Request:`, url)
  if (options.body) {
    cy.log('Request Body:', JSON.stringify(options.body, null, 2))
  }
  
  return cy.request(requestOptions).then((response) => {
    // Log the response for debugging  
    cy.log(`API Response Status: ${response.status}`)
    cy.log('Response Body:', JSON.stringify(response.body, null, 2))
    
    // Return the response as a Cypress wrapped object to maintain chainability
    return cy.wrap(response)
  })
})

/**
 * Custom command to validate API response structure
 * @param {object} response - Cypress response object
 * @param {object} expectedSchema - Expected response schema
 */
Cypress.Commands.add('validateResponseSchema', (response, expectedSchema) => {
  expect(response).to.have.property('status')
  expect(response).to.have.property('body')
  
  if (expectedSchema.status) {
    expect(response.status).to.equal(expectedSchema.status)
  }
  
  if (expectedSchema.properties) {
    Object.keys(expectedSchema.properties).forEach(property => {
      expect(response.body).to.have.property(property)
    })
  }
  
  if (expectedSchema.requiredFields) {
    expectedSchema.requiredFields.forEach(field => {
      expect(response.body).to.have.property(field)
      expect(response.body[field]).to.not.be.null
      expect(response.body[field]).to.not.be.undefined
    })
  }
})

/**
 * Custom command for testing API rate limiting
 * @param {string} endpoint - API endpoint to test
 * @param {number} requestCount - Number of requests to send
 * @param {number} timeWindow - Time window in milliseconds
 * @param {string} method - HTTP method (default: POST)
 */
Cypress.Commands.add('testRateLimit', (endpoint, requestCount = 10, timeWindow = 1000, method = 'POST') => {
  const responses = []
  
  // For POST requests, generate unique user data for each request
  for (let i = 0; i < requestCount; i++) {
    if (method === 'POST' && endpoint.includes('/user')) {
      // Generate unique user data for user creation endpoint
      const userData = {
        userName: `rateLimit_${Date.now()}_${i}`,
        password: `RateTest${i}123!`
      }
      
      cy.apiRequest('POST', endpoint, { body: userData }).then((response) => {
        responses.push(response)
        cy.log(`Rate limit request ${i + 1} - Status: ${response.status}`)
      })
    } else {
      // For other methods, make simple requests
      cy.apiRequest(method, endpoint).then((response) => {
        responses.push(response)
        cy.log(`Rate limit request ${i + 1} - Status: ${response.status}`)
      })
    }
  }
  
  return cy.then(() => {
    const rateLimitedResponses = responses.filter(response => 
      response.status === 429 || response.status === 503
    )
    
    cy.log(`Rate limit test: ${rateLimitedResponses.length}/${requestCount} requests were rate limited`)
    return cy.wrap(responses)
  })
})

// === UTILITY COMMANDS ===

/**
 * Custom command to add delay with logging
 * Better than cy.wait() as it provides context
 * @param {number} ms - Milliseconds to wait
 * @param {string} reason - Reason for the delay
 */
Cypress.Commands.add('waitWithReason', (ms, reason = 'Generic delay') => {
  cy.log(`Waiting ${ms}ms: ${reason}`)
  cy.wait(ms)
})

