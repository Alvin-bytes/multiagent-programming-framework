/**
 * UI Test Utility
 * 
 * Provides a set of testing utilities for UI components and API endpoints
 */

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

class UITestUtility {
  private results: TestResult[] = [];
  
  /**
   * Clears the test results
   */
  clearResults() {
    this.results = [];
  }
  
  /**
   * Gets testing summary
   */
  displayResults(): TestSummary {
    const passedTests = this.results.filter(r => r.status === 'success').length;
    const warningTests = this.results.filter(r => r.status === 'warning').length;
    const failedTests = this.results.filter(r => r.status === 'error').length;
    
    return {
      totalTests: this.results.length,
      passedTests,
      warningTests,
      failedTests,
      detailedResults: [...this.results]
    };
  }
  
  /**
   * Generic test element function
   */
  async testElement(
    elementName: string, 
    testFunction: () => boolean, 
    errorMessage: string = 'Element test failed'
  ): Promise<boolean> {
    try {
      const result = testFunction();
      
      if (result) {
        this.results.push({
          elementName,
          status: 'success',
          message: 'Test passed',
          timestamp: new Date()
        });
        return true;
      } else {
        this.results.push({
          elementName,
          status: 'error',
          message: errorMessage,
          timestamp: new Date()
        });
        return false;
      }
    } catch (error) {
      this.results.push({
        elementName,
        status: 'error',
        message: error instanceof Error ? error.message : String(error),
        timestamp: new Date()
      });
      return false;
    }
  }
  
  /**
   * Tests if an element exists in the DOM
   */
  async testElementExists(
    selector: string, 
    elementName: string
  ): Promise<boolean> {
    return this.testElement(
      elementName, 
      () => {
        // Parse selector for :contains pseudo-selector
        if (selector.includes(':contains(')) {
          const [baseSelector, textMatch] = selector.split(':contains(');
          const text = textMatch.replace(/['")]$/, '').replace(/^['"]/,'');
          
          const elements = document.querySelectorAll(baseSelector);
          return Array.from(elements).some(el => 
            el.textContent && el.textContent.includes(text)
          );
        } else {
          return document.querySelector(selector) !== null;
        }
      },
      `Element "${elementName}" (${selector}) not found in the DOM`
    );
  }
  
  /**
   * Tests element content
   */
  async testElementContent(
    selector: string, 
    elementName: string,
    expectedContent: string
  ): Promise<boolean> {
    return this.testElement(
      elementName, 
      () => {
        const element = document.querySelector(selector);
        return element !== null && 
               element.textContent !== null && 
               element.textContent.includes(expectedContent);
      },
      `Element "${elementName}" (${selector}) does not contain expected content: "${expectedContent}"`
    );
  }
  
  /**
   * Tests element click functionality
   */
  async testElementClick(
    selector: string, 
    elementName: string
  ): Promise<boolean> {
    return this.testElement(
      elementName, 
      () => {
        // Parse selector for :contains pseudo-selector
        let element: Element | null = null;
        
        if (selector.includes(':contains(')) {
          const [baseSelector, textMatch] = selector.split(':contains(');
          const text = textMatch.replace(/['")]$/, '').replace(/^['"]/,'');
          
          const elements = document.querySelectorAll(baseSelector);
          element = Array.from(elements).find(el => 
            el.textContent && el.textContent.includes(text)
          ) || null;
        } else {
          element = document.querySelector(selector);
        }
        
        if (!element) return false;
        
        // Check if element is clickable
        const isClickable = 
          element.tagName === 'BUTTON' || 
          element.tagName === 'A' || 
          element.hasAttribute('role') && 
            ['button', 'link', 'tab'].includes(element.getAttribute('role') || '') ||
          element.hasAttribute('onClick') ||
          window.getComputedStyle(element).cursor === 'pointer';
        
        return isClickable;
      },
      `Element "${elementName}" (${selector}) is not clickable or does not exist`
    );
  }
  
  /**
   * Tests form element functionality
   */
  async testFormElement(
    selector: string, 
    elementName: string
  ): Promise<boolean> {
    return this.testElement(
      elementName, 
      () => {
        const element = document.querySelector(selector) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null;
        
        if (!element) return false;
        
        // Check if element is a form control
        const isFormControl = 
          element.tagName === 'INPUT' || 
          element.tagName === 'TEXTAREA' || 
          element.tagName === 'SELECT';
        
        // Check if element is enabled
        const isEnabled = !element.disabled;
        
        return isFormControl && isEnabled;
      },
      `Form element "${elementName}" (${selector}) is not a valid form control or is disabled`
    );
  }
  
  /**
   * Tests API endpoint
   */
  async testAPIEndpoint(
    endpoint: string, 
    endpointName: string
  ): Promise<boolean> {
    try {
      const response = await fetch(endpoint);
      
      if (response.ok) {
        this.results.push({
          elementName: endpointName,
          status: 'success',
          message: `API endpoint ${endpoint} is healthy (status: ${response.status})`,
          timestamp: new Date()
        });
        return true;
      } else {
        this.results.push({
          elementName: endpointName,
          status: 'warning',
          message: `API endpoint ${endpoint} returned status ${response.status}`,
          timestamp: new Date()
        });
        return false;
      }
    } catch (error) {
      this.results.push({
        elementName: endpointName,
        status: 'error',
        message: `API endpoint ${endpoint} failed with error: ${error instanceof Error ? error.message : String(error)}`,
        timestamp: new Date()
      });
      return false;
    }
  }
  
  /**
   * Tests WebSocket connection
   */
  async testWebSocketConnection(): Promise<boolean> {
    return new Promise(resolve => {
      try {
        // Get the protocol and host
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws`;
        
        // Create WebSocket connection
        const socket = new WebSocket(wsUrl);
        
        // Set timeout for connection attempts
        const timeout = setTimeout(() => {
          this.results.push({
            elementName: 'WebSocket Connection',
            status: 'error',
            message: 'WebSocket connection timed out after 5 seconds',
            timestamp: new Date()
          });
          
          if (socket.readyState === WebSocket.CONNECTING) {
            socket.close();
          }
          
          resolve(false);
        }, 5000);
        
        // Success handler
        socket.addEventListener('open', () => {
          clearTimeout(timeout);
          
          this.results.push({
            elementName: 'WebSocket Connection',
            status: 'success',
            message: 'WebSocket connection established successfully',
            timestamp: new Date()
          });
          
          // Send a test message
          socket.send(JSON.stringify({ type: 'test', data: 'Testing connection' }));
          
          // Close the connection after a short delay
          setTimeout(() => {
            socket.close();
            resolve(true);
          }, 500);
        });
        
        // Error handler
        socket.addEventListener('error', (event) => {
          clearTimeout(timeout);
          
          console.error('WebSocket error:', event);
          
          this.results.push({
            elementName: 'WebSocket Connection',
            status: 'error',
            message: 'WebSocket connection failed with error',
            timestamp: new Date()
          });
          
          resolve(false);
        });
      } catch (error) {
        this.results.push({
          elementName: 'WebSocket Connection',
          status: 'error',
          message: `WebSocket connection failed with error: ${error instanceof Error ? error.message : String(error)}`,
          timestamp: new Date()
        });
        
        resolve(false);
      }
    });
  }
}

export const uiTestUtility = new UITestUtility();
export default uiTestUtility;