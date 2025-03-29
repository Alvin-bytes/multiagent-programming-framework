/**
 * Dashboard UI Tests
 * 
 * Comprehensive tests for the Dashboard UI components and tabs
 */

import { uiTestUtility } from './UITestUtility';

export const dashboardTests = {
  /**
   * Test main layout elements
   */
  async testMainLayout() {
    await uiTestUtility.testElementExists('header', 'Header');
    await uiTestUtility.testElementExists('aside', 'Sidebar');
    await uiTestUtility.testElementExists('#user-interaction-panel', 'User Interaction Panel');
    await uiTestUtility.testElementExists('#system-activity-panel', 'System Activity Panel');
    await uiTestUtility.testElementExists('#split-panels', 'Split Panels Container');
  },
  
  /**
   * Test navigation tabs
   */
  async testNavigationTabs() {
    // Test main tabs
    await uiTestUtility.testElementExists('button:contains("Main Interface")', 'Main Interface Tab');
    await uiTestUtility.testElementExists('button:contains("Documentation")', 'Documentation Tab');
    await uiTestUtility.testElementExists('a:contains("Agent Configuration")', 'Agent Configuration Tab Link');
    await uiTestUtility.testElementExists('button:contains("Project Files")', 'Project Files Tab');
    
    // Check clickability
    await uiTestUtility.testElementClick('button:contains("Main Interface")', 'Main Interface Tab Click');
    await uiTestUtility.testElementClick('button:contains("Documentation")', 'Documentation Tab Click');
    await uiTestUtility.testElementClick('a:contains("Agent Configuration")', 'Agent Configuration Tab Link Click');
    await uiTestUtility.testElementClick('button:contains("Project Files")', 'Project Files Tab Click');
  },
  
  /**
   * Test sidebar elements
   */
  async testSidebar() {
    await uiTestUtility.testElementExists('.AgentStatus', 'Agent Status Component');
    await uiTestUtility.testElementExists('.SystemStats', 'System Stats Component');
    await uiTestUtility.testElementExists('.QuickActions', 'Quick Actions Component');
  },
  
  /**
   * Test agent status section
   */
  async testAgentStatus() {
    // Test agent status elements
    await uiTestUtility.testElementExists('.AgentStatus h3', 'Agent Status Heading');
    await uiTestUtility.testElementContent('.AgentStatus h3', 'Agent Status Heading Text', 'Agent Status');
    
    // Test if agent list is populated
    await uiTestUtility.testElement(
      'Agent Status List',
      () => {
        const agentItems = document.querySelectorAll('.AgentStatus li, .AgentStatus .agent-item');
        return agentItems.length >= 4; // At least 4 agents
      },
      'Agent status list has fewer than expected agents'
    );
  },
  
  /**
   * Test system stats section
   */
  async testSystemStats() {
    await uiTestUtility.testElementExists('.SystemStats h3, .SystemStats .card-title', 'System Stats Heading');
    await uiTestUtility.testElementExists('.SystemStats .stat-item, .SystemStats .stat', 'System Stats Items');
    
    // Test if stats are populated
    await uiTestUtility.testElement(
      'System Stats Values',
      () => {
        const statItems = document.querySelectorAll('.SystemStats .stat-value, .SystemStats .value');
        // Check if at least one stat has a non-empty value
        return Array.from(statItems).some(item => item.textContent && item.textContent.trim() !== '');
      },
      'System stats values are not properly populated'
    );
  },
  
  /**
   * Test quick actions section
   */
  async testQuickActions() {
    await uiTestUtility.testElementExists('.QuickActions h3, .QuickActions .card-title', 'Quick Actions Heading');
    await uiTestUtility.testElementExists('.QuickActions button, .QuickActions .action-button', 'Quick Action Buttons');
    
    // Test if action buttons are clickable
    const actionButtons = document.querySelectorAll('.QuickActions button, .QuickActions .action-button');
    for (let i = 0; i < actionButtons.length; i++) {
      const button = actionButtons[i] as HTMLElement;
      await uiTestUtility.testElement(
        `Quick Action Button ${i+1}`,
        () => {
          return button.tagName === 'BUTTON' || 
                 button.getAttribute('role') === 'button' ||
                 Boolean(button.onclick);
        },
        `Quick action button ${i+1} is not properly configured as clickable`
      );
    }
  },
  
  /**
   * Test user interaction panel
   */
  async testUserInteraction() {
    await uiTestUtility.testElementExists('#user-interaction-panel .chat-container, #user-interaction-panel .messages', 'Message Container');
    await uiTestUtility.testElementExists('#user-interaction-panel form, #user-interaction-panel .input-container', 'Message Input Form');
    await uiTestUtility.testElementExists('#user-interaction-panel textarea, #user-interaction-panel input[type="text"]', 'Message Input Field');
    await uiTestUtility.testElementExists('#user-interaction-panel button[type="submit"], #user-interaction-panel .send-button', 'Send Message Button');
    
    // Test if input field is enabled
    await uiTestUtility.testFormElement(
      '#user-interaction-panel textarea, #user-interaction-panel input[type="text"]',
      'Message Input Field Enabled'
    );
    
    // Test if send button is clickable
    await uiTestUtility.testElementClick(
      '#user-interaction-panel button[type="submit"], #user-interaction-panel .send-button',
      'Send Message Button Clickable'
    );
  },
  
  /**
   * Test system activity panel
   */
  async testSystemActivity() {
    await uiTestUtility.testElementExists('.SystemActivity, #system-activity-panel .activities', 'System Activity Component');
    await uiTestUtility.testElementExists('.SystemActivity .activity-list, #system-activity-panel .activity-items', 'Activity List Container');
  },
  
  /**
   * Test agent decision visualization
   */
  async testAgentDecisionVisualization() {
    await uiTestUtility.testElementExists('.AgentDecisionVisualization', 'Agent Decision Visualization Component');
    
    // Test tabs in visualization
    await uiTestUtility.testElementExists('.AgentDecisionVisualization button:contains("Tree"), .AgentDecisionVisualization [role="tab"]:contains("Tree")', 'Tree View Tab');
    await uiTestUtility.testElementExists('.AgentDecisionVisualization button:contains("Timeline"), .AgentDecisionVisualization [role="tab"]:contains("Timeline")', 'Timeline View Tab');
    await uiTestUtility.testElementExists('.AgentDecisionVisualization button:contains("Network"), .AgentDecisionVisualization [role="tab"]:contains("Network")', 'Network View Tab');
    
    // Test tab functionality
    await uiTestUtility.testElementClick(
      '.AgentDecisionVisualization button:contains("Tree"), .AgentDecisionVisualization [role="tab"]:contains("Tree")',
      'Tree View Tab Clickable'
    );
    await uiTestUtility.testElementClick(
      '.AgentDecisionVisualization button:contains("Timeline"), .AgentDecisionVisualization [role="tab"]:contains("Timeline")',
      'Timeline View Tab Clickable'
    );
    await uiTestUtility.testElementClick(
      '.AgentDecisionVisualization button:contains("Network"), .AgentDecisionVisualization [role="tab"]:contains("Network")',
      'Network View Tab Clickable'
    );
  },
  
  /**
   * Test tabs content loading
   */
  async testTabsContentLoading() {
    // Find all tab buttons
    const tabButtons = document.querySelectorAll('button[role="tab"], [role="tab"]');
    
    for (let i = 0; i < tabButtons.length; i++) {
      const tabButton = tabButtons[i] as HTMLElement;
      
      await uiTestUtility.testElement(
        `Tab Button ${i+1} (${tabButton.textContent?.trim() || 'Unnamed'})`,
        () => {
          tabButton.click();
          
          // Check if there's a corresponding tab panel
          const tabId = tabButton.getAttribute('id');
          const controls = tabButton.getAttribute('aria-controls');
          
          if (controls) {
            const tabPanel = document.getElementById(controls);
            return tabPanel !== null;
          } else if (tabId) {
            // Try to find associated panel based on naming convention
            const possiblePanelId = tabId.replace('-tab', '-panel');
            const tabPanel = document.getElementById(possiblePanelId);
            return tabPanel !== null;
          }
          
          return false;
        },
        `Tab button ${i+1} (${tabButton.textContent?.trim() || 'Unnamed'}) does not properly control a tab panel`
      );
    }
  },
  
  /**
   * Test Documentation tab
   */
  async testDocumentationTab() {
    // Click on Documentation tab first
    const docTab = document.querySelector('button:contains("Documentation")') as HTMLElement;
    if (docTab) {
      docTab.click();
      
      // Give some time for content to load
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Look for documentation content
      await uiTestUtility.testElement(
        'Documentation Content',
        () => {
          // Look for typical documentation elements
          const docElements = document.querySelectorAll(
            '.documentation h1, .documentation h2, .documentation-content, .doc-section'
          );
          return docElements.length > 0;
        },
        'Documentation tab content not properly loaded or missing'
      );
    } else {
      await uiTestUtility.testElement(
        'Documentation Tab Existence',
        () => false,
        'Documentation tab button not found in the DOM'
      );
    }
  },
  
  /**
   * Test Project Files tab
   */
  async testProjectFilesTab() {
    // Click on Project Files tab first
    const filesTab = document.querySelector('button:contains("Project Files")') as HTMLElement;
    if (filesTab) {
      filesTab.click();
      
      // Give some time for content to load
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Look for file explorer elements
      await uiTestUtility.testElement(
        'Project Files Content',
        () => {
          // Look for typical file explorer elements
          const fileElements = document.querySelectorAll(
            '.file-explorer, .project-files, .file-tree, .file-list, .folder-list'
          );
          return fileElements.length > 0;
        },
        'Project Files tab content not properly loaded or missing'
      );
    } else {
      await uiTestUtility.testElement(
        'Project Files Tab Existence',
        () => false,
        'Project Files tab button not found in the DOM'
      );
    }
  },
  
  /**
   * Test API endpoints
   */
  async testApiEndpoints() {
    await uiTestUtility.testAPIEndpoint('/api/health', 'Health Check');
    await uiTestUtility.testAPIEndpoint('/api/agents', 'Agents List');
    await uiTestUtility.testAPIEndpoint('/api/stats', 'System Stats');
    await uiTestUtility.testAPIEndpoint('/api/activities', 'System Activities');
    await uiTestUtility.testAPIEndpoint('/api/thread-stats', 'Thread Statistics');
  },
  
  /**
   * Test WebSocket connection
   */
  async testWebSocket() {
    await uiTestUtility.testWebSocketConnection();
  },
  
  /**
   * Run all dashboard tests
   */
  async runAllTests() {
    uiTestUtility.clearResults();
    
    console.log('Starting Dashboard UI tests...');
    
    // Run all tests
    await this.testMainLayout();
    await this.testNavigationTabs();
    await this.testSidebar();
    await this.testAgentStatus();
    await this.testSystemStats();
    await this.testQuickActions();
    await this.testUserInteraction();
    await this.testSystemActivity();
    await this.testAgentDecisionVisualization();
    await this.testTabsContentLoading();
    await this.testDocumentationTab();
    await this.testProjectFilesTab();
    await this.testApiEndpoints();
    await this.testWebSocket();
    
    // Display results
    return uiTestUtility.displayResults();
  }
};

export default dashboardTests;