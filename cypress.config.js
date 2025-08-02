const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    // Base URL for the application under test
    baseUrl: 'https://app.ramp.com',
    
    // API base URL for backend testing
    env: {
      apiBaseUrl: 'https://demoqa.com',
      // Environment variables for different test environments
      testTimeout: 30000,
      retryAttempts: 2
    },
    
    // Test configuration
    viewportWidth: 1920,
    viewportHeight: 1080,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    
    // Video and screenshot configuration
    video: false,
    screenshotOnRunFailure: true,
    
    // Retry configuration
    retries: {
      runMode: 2,
      openMode: 0
    },
    
    // Test file patterns
    specPattern: 'cypress/e2e/**/*.cy.js',
    supportFile: 'cypress/support/e2e.js',
    
    setupNodeEvents(on, config) {
      // Node event listeners for plugins and custom tasks
      
      // Custom task for logging
      on('task', {
        log(message) {
          console.log(message)
          return null
        },
        
        // Custom task for generating test data
        generateTestData() {
          return {
            timestamp: new Date().toISOString(),
            randomEmail: `test_${Date.now()}@example.com`,
            randomString: Math.random().toString(36).substring(7)
          }
        }
      })
      
      // Browser launch options
      on('before:browser:launch', (browser = {}, launchOptions) => {
        if (browser.name === 'chrome') {
          // Add Chrome flags for better testing
          launchOptions.args.push('--disable-dev-shm-usage')
          launchOptions.args.push('--no-sandbox')
        }
        return launchOptions
      })
      
      return config
    },
  },
  
  // Component testing configuration (if needed in future)
  component: {
    devServer: {
      framework: 'create-react-app',
      bundler: 'webpack',
    },
  },
})