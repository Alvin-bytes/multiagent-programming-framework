/**
 * Enhanced Test Runner Script
 * 
 * This script runs the tests directly without requiring the UI and provides detailed output
 */

import { dashboardTests } from './DashboardTests';
import { agentOnboardingTests } from './AgentOnboardingTests';
import axios from 'axios';

// Define test result interfaces
interface TestResult {
  elementName: string;
  status: 'success' | 'warning' | 'error';
  message: string;
  timestamp: Date;
}

interface TestSummary {
  totalTests: number;
  passedTests: number;
  warningTests: number;
  failedTests: number;
  detailedResults: TestResult[];
}

// Helper function to test API endpoints
async function testApiEndpoint(endpoint: string): Promise<TestResult> {
  try {
    const baseUrl = 'http://localhost:5000';
    const response = await axios.get(`${baseUrl}${endpoint}`);
    
    return {
      elementName: `API Endpoint: ${endpoint}`,
      status: response.status >= 200 && response.status < 300 ? 'success' : 'error',
      message: `Status: ${response.status}, Data received: ${JSON.stringify(response.data).slice(0, 50)}...`,
      timestamp: new Date()
    };
  } catch (error) {
    return {
      elementName: `API Endpoint: ${endpoint}`,
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date()
    };
  }
}

// Run all API tests
async function runApiTests(): Promise<TestSummary> {
  console.log('Running API endpoint tests...');
  const endpoints = [
    '/api/health',
    '/api/agents',
    '/api/stats',
    '/api/activities',
    '/api/thread-stats',
    '/api/system-knowledge'
  ];
  
  const results: TestResult[] = [];
  
  for (const endpoint of endpoints) {
    const result = await testApiEndpoint(endpoint);
    results.push(result);
    console.log(`  - ${endpoint}: ${result.status}`);
  }
  
  const summary: TestSummary = {
    totalTests: results.length,
    passedTests: results.filter(r => r.status === 'success').length,
    warningTests: results.filter(r => r.status === 'warning').length,
    failedTests: results.filter(r => r.status === 'error').length,
    detailedResults: results
  };
  
  return summary;
}

// Create mock DOM environment
function setupMockEnvironment() {
  // Mock document object
  (global as any).document = {
    querySelector: () => null,
    querySelectorAll: () => [],
    getElementById: () => null,
    createElement: () => ({
      setAttribute: () => {},
      style: {},
      appendChild: () => {},
      classList: {
        add: () => {},
        remove: () => {},
        contains: () => false
      }
    }),
    body: {
      appendChild: () => {},
      classList: {
        add: () => {},
        remove: () => {}
      }
    }
  };
  
  // Mock window object
  (global as any).window = {
    location: {
      protocol: 'http:',
      host: 'localhost:5000',
      href: 'http://localhost:5000/',
      pathname: '/'
    },
    addEventListener: () => {},
    removeEventListener: () => {},
    history: {
      pushState: () => {}
    },
    setTimeout: setTimeout,
    clearTimeout: clearTimeout
  };
  
  // Mock additional browser APIs
  (global as any).fetch = (url: string) => {
    return Promise.resolve({
      json: () => Promise.resolve({ success: true }),
      ok: true,
      status: 200
    });
  };
  
  (global as any).localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
  };
  
  console.log('Mock browser environment set up');
}

// Main test execution function
async function runTests() {
  console.log('===================================');
  console.log('Starting comprehensive test execution...');
  console.log('===================================');
  
  try {
    // Setup mock environment
    setupMockEnvironment();
    
    // Run API tests (these can run without DOM)
    const apiResults = await runApiTests();
    
    // Run dashboard tests with mocked environment
    console.log('\nRunning dashboard UI tests...');
    let dashboardResults: TestSummary;
    
    try {
      dashboardResults = await dashboardTests.runAllTests();
      console.log(`  - Dashboard tests completed: ${dashboardResults.passedTests}/${dashboardResults.totalTests} passed`);
    } catch (error) {
      console.error('Error in dashboard tests:', error);
      dashboardResults = {
        totalTests: 1,
        passedTests: 0,
        warningTests: 0,
        failedTests: 1,
        detailedResults: [{
          elementName: 'Dashboard Test Suite',
          status: 'error',
          message: error instanceof Error ? error.message : 'Unknown dashboard test error',
          timestamp: new Date()
        }]
      };
    }
    
    // Run onboarding tests with mocked environment
    console.log('\nRunning onboarding UI tests...');
    let onboardingResults: TestSummary;
    
    try {
      onboardingResults = await agentOnboardingTests.runAllTests();
      console.log(`  - Onboarding tests completed: ${onboardingResults.passedTests}/${onboardingResults.totalTests} passed`);
    } catch (error) {
      console.error('Error in onboarding tests:', error);
      onboardingResults = {
        totalTests: 1,
        passedTests: 0,
        warningTests: 0,
        failedTests: 1,
        detailedResults: [{
          elementName: 'Onboarding Test Suite',
          status: 'error',
          message: error instanceof Error ? error.message : 'Unknown onboarding test error',
          timestamp: new Date()
        }]
      };
    }
    
    // Combine all test results
    const combinedResults: TestSummary = {
      totalTests: apiResults.totalTests + dashboardResults.totalTests + onboardingResults.totalTests,
      passedTests: apiResults.passedTests + dashboardResults.passedTests + onboardingResults.passedTests,
      warningTests: apiResults.warningTests + dashboardResults.warningTests + onboardingResults.warningTests,
      failedTests: apiResults.failedTests + dashboardResults.failedTests + onboardingResults.failedTests,
      detailedResults: [
        ...apiResults.detailedResults,
        ...dashboardResults.detailedResults,
        ...onboardingResults.detailedResults
      ]
    };
    
    // Print test summary
    console.log('\n===================================');
    console.log('TEST EXECUTION SUMMARY');
    console.log('===================================');
    console.log(`Total Tests: ${combinedResults.totalTests}`);
    console.log(`Passed: ${combinedResults.passedTests} (${Math.round(combinedResults.passedTests / combinedResults.totalTests * 100)}%)`);
    console.log(`Warnings: ${combinedResults.warningTests}`);
    console.log(`Failed: ${combinedResults.failedTests}`);
    console.log('-----------------------------------');
    console.log('Test Category Results:');
    console.log(`- API Tests: ${apiResults.passedTests}/${apiResults.totalTests} passed`);
    console.log(`- Dashboard UI: ${dashboardResults.passedTests}/${dashboardResults.totalTests} passed`);
    console.log(`- Onboarding UI: ${onboardingResults.passedTests}/${onboardingResults.totalTests} passed`);
    console.log('-----------------------------------');
    
    // Detailed results for failed tests
    if (combinedResults.failedTests > 0) {
      console.log('\nFailed Tests:');
      combinedResults.detailedResults
        .filter(result => result.status === 'error')
        .forEach(result => {
          console.log(`- ${result.elementName}: ${result.message}`);
        });
    }
    
    console.log('\n===================================');
    console.log('Test execution complete!');
    console.log('===================================');
    
    return combinedResults;
  } catch (error) {
    console.error('Fatal error running tests:', error);
    return {
      totalTests: 0,
      passedTests: 0,
      warningTests: 0,
      failedTests: 0,
      detailedResults: []
    };
  }
}

// Run tests
runTests()
  .then(() => {
    console.log('Test script execution finished');
  })
  .catch(err => {
    console.error('Unexpected error in test script:', err);
  });