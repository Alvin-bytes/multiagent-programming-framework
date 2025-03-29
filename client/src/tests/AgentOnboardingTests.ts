/**
 * Agent Onboarding Tests
 * 
 * Comprehensive tests for the Agent Onboarding flow
 */

import { uiTestUtility } from './UITestUtility';

export const agentOnboardingTests = {
  /**
   * Test main onboarding layout
   */
  async testOnboardingLayout() {
    await uiTestUtility.testElementExists('.min-h-screen', 'Onboarding Container');
    await uiTestUtility.testElementExists('div.card, .card', 'Onboarding Card');
    await uiTestUtility.testElementExists('.card-header, .card-title', 'Onboarding Title');
    await uiTestUtility.testElementContent('.card-title', 'Onboarding Title Text', 'Intelligent Agent Onboarding');
    await uiTestUtility.testElementExists('.progress', 'Progress Indicator');
  },
  
  /**
   * Test onboarding steps
   */
  async testOnboardingSteps() {
    // Test welcome screen (step 1)
    await uiTestUtility.testElementExists('h3:contains("Welcome to the Multi-Agent Programming Framework")', 'Welcome Heading');
    await uiTestUtility.testElementExists('.card.bg-gradient-to-br', 'Feature Cards');
    await uiTestUtility.testElementExists('button:contains("Continue"), button:contains("Next")', 'Continue Button');
    
    // Test continue button functionality
    const continueButton = document.querySelector('button:contains("Continue"), button:contains("Next")') as HTMLElement;
    if (continueButton) {
      await uiTestUtility.testElement(
        'Continue Button Click',
        () => {
          continueButton.click();
          // Check if we moved to step 2
          return document.querySelector('h3:contains("LLM Provider Configuration")') !== null;
        },
        'Continue button did not advance to step 2'
      );
    }
  },
  
  /**
   * Test API key configuration
   */
  async testApiKeyConfiguration() {
    // Ensure we're on step 2
    if (!document.querySelector('h3:contains("LLM Provider Configuration")')) {
      // Try to navigate to step 2
      const continueButton = document.querySelector('button:contains("Continue"), button:contains("Next")') as HTMLElement;
      if (continueButton) {
        continueButton.click();
      }
    }
    
    await uiTestUtility.testElementExists('#groq-api-key', 'Groq API Key Input');
    await uiTestUtility.testElementExists('#phidata-api-key', 'Phidata API Key Input');
    await uiTestUtility.testElementExists('button:contains("Configure API Keys")', 'Configure API Keys Button');
    
    // Test input fields
    await uiTestUtility.testFormElement('#groq-api-key', 'Groq API Key Input Field');
    await uiTestUtility.testFormElement('#phidata-api-key', 'Phidata API Key Input Field');
    
    // Test API key configuration button
    const configButton = document.querySelector('button:contains("Configure API Keys")') as HTMLElement;
    if (configButton) {
      await uiTestUtility.testElement(
        'API Key Configuration Button Click',
        () => {
          configButton.click();
          // Check if success message appears
          return document.querySelector('.bg-green-50, .text-green-600, .text-green-400') !== null;
        },
        'API Key configuration button did not trigger success confirmation'
      );
    }
    
    // Test continue to next step
    const nextButton = document.querySelector('button:contains("Continue"), button:contains("Next")') as HTMLElement;
    if (nextButton) {
      await uiTestUtility.testElement(
        'Continue to Agent Configuration',
        () => {
          nextButton.click();
          // Check if we moved to step 3
          return document.querySelector('h3:contains("Agent Configuration")') !== null;
        },
        'Next button did not advance to Agent Configuration step'
      );
    }
  },
  
  /**
   * Test agent configuration step
   */
  async testAgentConfigurationStep() {
    // Ensure we're on step 3
    if (!document.querySelector('h3:contains("Agent Configuration")')) {
      // Try to navigate to step 3
      const buttons = document.querySelectorAll('button:contains("Continue"), button:contains("Next")');
      if (buttons.length >= 2) {
        (buttons[0] as HTMLElement).click();
        (buttons[1] as HTMLElement).click();
      }
    }
    
    // Test tabs existence
    await uiTestUtility.testElementExists('[role="tablist"]', 'Agent Tabs List');
    await uiTestUtility.testElementExists('[role="tab"]:contains("Design")', 'Design Agent Tab');
    await uiTestUtility.testElementExists('[role="tab"]:contains("Coding")', 'Coding Agent Tab');
    await uiTestUtility.testElementExists('[role="tab"]:contains("Debug")', 'Debug Agent Tab');
    await uiTestUtility.testElementExists('[role="tab"]:contains("Supervision")', 'Supervision Agent Tab');
    await uiTestUtility.testElementExists('[role="tab"]:contains("Self-Healing")', 'Self-Healing Agent Tab');
    
    // Test tab content
    const agentTypes = ['design', 'coding', 'debug', 'supervision', 'selfHealing'];
    
    for (const agentType of agentTypes) {
      // Click on the tab
      const tabSelector = `[role="tab"]:contains("${agentType === 'selfHealing' ? 'Self-Healing' : agentType}")`;
      const tab = document.querySelector(tabSelector) as HTMLElement;
      
      if (tab) {
        await uiTestUtility.testElement(
          `${agentType} Tab Click`,
          () => {
            tab.click();
            return true;
          },
          `Failed to click ${agentType} tab`
        );
        
        // Check for tab content
        await uiTestUtility.testElement(
          `${agentType} Tab Content`,
          () => {
            // Look for agent configuration form elements
            const rangeInputs = document.querySelectorAll('input[type="range"]');
            const configSection = document.querySelector(`[role="tabpanel"][id*="${agentType}"]`);
            
            return rangeInputs.length > 0 || configSection !== null;
          },
          `${agentType} agent configuration tab content not properly loaded`
        );
        
        // Test the configure button
        const configureButton = document.querySelector(
          `[role="tabpanel"] button:contains("Configure ${agentType === 'selfHealing' ? 'Self-Healing' : agentType} Agent")`
        ) as HTMLElement;
        
        if (configureButton) {
          await uiTestUtility.testElement(
            `${agentType} Agent Configure Button`,
            () => {
              configureButton.click();
              return true;
            },
            `Failed to click configure button for ${agentType} agent`
          );
        }
      }
    }
    
    // Test continue to next step
    const nextButton = document.querySelector('button:contains("Continue"), button:contains("Next")') as HTMLElement;
    if (nextButton) {
      await uiTestUtility.testElement(
        'Continue to Final Step',
        () => {
          nextButton.click();
          // Check if we moved to step 4
          return document.querySelector('h3:contains("Advanced Settings")') !== null || 
                 document.querySelector('h3:contains("Confirmation")') !== null;
        },
        'Next button did not advance to the final step'
      );
    }
  },
  
  /**
   * Test final step and completion
   */
  async testCompletionStep() {
    // Test complete button
    const completeButton = document.querySelector('button:contains("Complete"), button:contains("Finish")') as HTMLElement;
    
    if (completeButton) {
      await uiTestUtility.testElement(
        'Complete Onboarding Button',
        () => completeButton !== null,
        'Complete onboarding button not found'
      );
      
      // Test button click (don't actually click it as it would navigate away)
      await uiTestUtility.testElement(
        'Complete Button Clickable',
        () => {
          return completeButton.tagName === 'BUTTON' || 
                 completeButton.getAttribute('role') === 'button' ||
                 Boolean(completeButton.onclick);
        },
        'Complete button is not properly configured as clickable'
      );
    }
  },
  
  /**
   * Run all agent onboarding tests
   */
  async runAllTests() {
    uiTestUtility.clearResults();
    
    console.log('Starting Agent Onboarding tests...');
    
    // Run all tests
    await this.testOnboardingLayout();
    await this.testOnboardingSteps();
    await this.testApiKeyConfiguration();
    await this.testAgentConfigurationStep();
    await this.testCompletionStep();
    
    // Display results
    return uiTestUtility.displayResults();
  }
};

export default agentOnboardingTests;