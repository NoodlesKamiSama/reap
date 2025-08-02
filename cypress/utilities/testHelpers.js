/**
 * Test Utility Functions
 * 
 * This file contains reusable utility functions for test data generation,
 * common validations, and helper methods used across multiple test files.
 */

/**
 * Generate random test data for various purposes
 */
class TestDataGenerator {
  
  /**
   * Generate a unique email address for testing
   * @param {string} prefix - Prefix for the email
   * @param {string} domain - Domain for the email (default: example.com)
   * @returns {string} Generated email address
   */
  static generateUniqueEmail(prefix = 'test', domain = 'example.com') {
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(7)
    return `${prefix}+${timestamp}+${randomString}@${domain}`
  }

  /**
   * Generate a secure password meeting API requirements
   * API Requirements: uppercase, lowercase, digit, special char, non-alphanumeric, 8+ chars
   * @param {number} length - Password length (default: 12)
   * @param {object} options - Password generation options
   * @returns {string} Generated password
   */
  static generateSecurePassword(length = 12, options = {}) {
    // Use a simple, predictable pattern that definitely meets all requirements
    const timestamp = Date.now().toString().slice(-4) // 4 digits
    const randomSuffix = Math.random().toString(36).substring(2, 4) // 2 lowercase letters
    
    // Build password with explicit pattern: Uppercase + lowercase + digits + special + more chars
    let password = 'Test' + // Uppercase + lowercase
                   timestamp + // 4 digits  
                   '!' + // Special character
                   randomSuffix // More lowercase
    
    // Ensure minimum length by adding more characters if needed
    while (password.length < Math.max(8, length)) {
      password += 'a' + Math.floor(Math.random() * 10) + '!'
    }
    
    // Trim to exact length if too long
    if (password.length > length && length > 8) {
      password = password.substring(0, length)
    }
    
    return password
  }

  /**
   * Generate random company name
   * @returns {string} Generated company name
   */
  static generateCompanyName() {
    const prefixes = ['Tech', 'Global', 'Digital', 'Smart', 'Innovation', 'Future', 'Advanced']
    const suffixes = ['Solutions', 'Systems', 'Corp', 'Ltd', 'Inc', 'Technologies', 'Enterprises']
    
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)]
    
    return `${prefix} ${suffix}`
  }

  /**
   * Generate random phone number
   * @param {string} format - Phone number format (default: US)
   * @returns {string} Generated phone number
   */
  static generatePhoneNumber(format = 'US') {
    switch (format) {
      case 'US':
        return `+1-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`
      case 'UK':
        return `+44-${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 900000) + 100000}`
      default:
        return `+1-555-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`
    }
  }

  /**
   * Generate test user data object
   * @param {object} overrides - Override specific fields
   * @returns {object} Complete user data object
   */
  static generateUserData(overrides = {}) {
    const firstName = overrides.firstName || 'TestUser'
    const lastName = overrides.lastName || 'Automated'
    
    return {
      email: this.generateUniqueEmail(),
      password: this.generateSecurePassword(),
      confirmPassword: null, // Will be set to match password
      firstName: firstName,
      lastName: lastName,
      companyName: this.generateCompanyName(),
      phone: this.generatePhoneNumber(),
      ...overrides
    }
  }
}


/**
 * API testing helper functions
 */
class ApiHelpers {
  
  /**
   * Validate API response structure
   * @param {object} response - API response object
   * @param {object} expectedStructure - Expected response structure
   * @returns {boolean} True if response matches expected structure
   */
  static validateResponseStructure(response, expectedStructure) {
    if (!response || typeof response !== 'object') {
      return false
    }

    for (const key in expectedStructure) {
      if (expectedStructure.hasOwnProperty(key)) {
        if (!(key in response)) {
          return false
        }
        
        const expectedType = expectedStructure[key]
        const actualType = typeof response[key]
        
        if (expectedType !== 'any' && actualType !== expectedType) {
          return false
        }
      }
    }

    return true
  }

  /**
   * Generate API test data for user creation
   * @param {object} overrides - Override specific fields
   * @returns {object} API user data
   */
  static generateApiUserData(overrides = {}) {
    return {
      userName: `testUser+${Date.now()}+${Math.random().toString(36).substring(7)}`,
      password: TestDataGenerator.generateSecurePassword(),
      ...overrides
    }
  }

  /**
   * Create malformed request data for negative testing
   * @param {string} type - Type of malformed data
   * @returns {object} Malformed request data
   */
  static createMalformedData(type) {
    const templates = {
      emptyObject: {},
      nullValues: { userName: null, password: null },
      invalidTypes: { userName: 12345, password: true },
      missingUserName: { password: 'ValidPassword123!' },
      missingPassword: { userName: 'validUser' },
      emptyStrings: { userName: '', password: '' },
      tooLong: { 
        userName: 'a'.repeat(1000), 
        password: 'b'.repeat(1000) 
      },
      specialChars: { 
        userName: '<script>alert("xss")</script>', 
        password: 'DROP TABLE users;' 
      }
    }

    return templates[type] || templates.emptyObject
  }
}

/**
 * Browser and UI testing helpers
 */
class BrowserHelpers {
  
  /**
   * Wait for element to be stable (not moving)
   * @param {string} selector - Element selector
   * @param {number} timeout - Timeout in milliseconds
   * @param {number} checkInterval - Check interval in milliseconds
   */
  static waitForElementStability(selector, timeout = 5000, checkInterval = 100) {
    let previousRect = null
    const startTime = Date.now()

    const checkStability = () => {
      if (Date.now() - startTime > timeout) {
        throw new Error(`Element ${selector} did not stabilize within ${timeout}ms`)
      }

      cy.get(selector).then($el => {
        const currentRect = $el[0].getBoundingClientRect()
        
        if (previousRect && 
            previousRect.top === currentRect.top && 
            previousRect.left === currentRect.left &&
            previousRect.width === currentRect.width &&
            previousRect.height === currentRect.height) {
          return true
        }
        
        previousRect = currentRect
        cy.wait(checkInterval)
        checkStability()
      })
    }

    checkStability()
  }

  /**
   * Take screenshot with custom naming
   * @param {string} testName - Test name for screenshot
   * @param {string} stepName - Step name for screenshot
   */
  static takeScreenshot(testName, stepName) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const screenshotName = `${testName}_${stepName}_${timestamp}`
    cy.screenshot(screenshotName)
  }

  /**
   * Check if element is visible in viewport
   * @param {string} selector - Element selector
   * @returns {boolean} True if element is in viewport
   */
  static isElementInViewport(selector) {
    cy.get(selector).then($el => {
      const rect = $el[0].getBoundingClientRect()
      const isInViewport = (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
      )
      
      cy.wrap(isInViewport).as('isInViewport')
    })
  }

  /**
   * Simulate slow network conditions
   */
  static simulateSlowNetwork() {
    cy.intercept('**', (req) => {
      req.reply((res) => {
        // Add delay to simulate slow network
        return new Promise(resolve => {
          setTimeout(() => resolve(res), 2000)
        })
      })
    })
  }

  /**
   * Simulate network failure
   * @param {string} endpoint - Endpoint to fail
   */
  static simulateNetworkFailure(endpoint = '**') {
    cy.intercept(endpoint, { forceNetworkError: true })
  }
}



// Export all helper classes
export {
  TestDataGenerator,
  ApiHelpers,
  BrowserHelpers
}