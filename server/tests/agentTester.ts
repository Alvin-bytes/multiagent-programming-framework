import { logger } from "../utils/logger";
import { 
  dbStorage as storage
} from "../databaseStorage";
import { 
  AgentType, 
  AgentStatus, 
  TaskStatus, 
  MessageType, 
  MemoryType, 
  ComponentType 
} from "@shared/schema";
import { CodingAgent } from "../agents/codingAgent";
import { DebugAgent } from "../agents/debugAgent";
import { DesignAgent } from "../agents/designAgent";
import { SupervisionAgent } from "../agents/supervisionAgent";

/**
 * AgentTester - A class to run comprehensive tests for each agent type
 * simulating a real project creation workflow
 */
export class AgentTester {
  private testProjectId: number | null = null;
  private designAgentId: number | null = null;
  private codingAgentId: number | null = null;
  private debugAgentId: number | null = null;
  private supervisionAgentId: number | null = null;
  private designTaskId: number | null = null;
  private codingTaskId: number | null = null;
  private debugTaskId: number | null = null;
  private supervisionTaskId: number | null = null;
  private testUserId: number | null = null;
  
  private designAgent: DesignAgent | null = null;
  private codingAgent: CodingAgent | null = null;
  private debugAgent: DebugAgent | null = null;
  private supervisionAgent: SupervisionAgent | null = null;

  constructor() {}

  /**
   * Setup test environment
   */
  async setup() {
    logger.info('Setting up agent test environment');
    
    // Create a test user first and store the ID
    try {
      // Check if user exists
      let testUser = await storage.getUserByUsername('testuser');
      if (!testUser) {
        testUser = await storage.createUser({
          username: 'testuser',
          password: 'password123'
        });
        logger.info(`Created test user with ID: ${testUser.id}`);
      }
      this.testUserId = testUser.id;
      logger.info(`Using test user with ID: ${this.testUserId}`);
    } catch (error) {
      logger.warn(`Error checking/creating user: ${error}`);
      throw new Error(`Failed to create test user: ${error}`);
    }
    
    // Create a test project
    const project = await storage.createProject({
      name: "Test Project",
      description: "A test project for agent functionality"
    });
    this.testProjectId = project.id;
    logger.info(`Created test project with ID: ${this.testProjectId}`);
    
    // Get agent IDs or create agents if they don't exist
    const agents = await storage.getAllAgents();
    
    // Check for existing agents
    for (const agent of agents) {
      switch (agent.type) {
        case AgentType.DESIGN:
          this.designAgentId = agent.id;
          break;
        case AgentType.CODING:
          this.codingAgentId = agent.id;
          break;
        case AgentType.DEBUG:
          this.debugAgentId = agent.id;
          break;
        case AgentType.SUPERVISION:
          this.supervisionAgentId = agent.id;
          break;
      }
    }
    
    // Create any missing agents
    if (!this.designAgentId) {
      const designAgent = await storage.createAgent({
        name: 'Design Agent',
        type: AgentType.DESIGN,
        status: AgentStatus.STANDBY,
        isActive: true
      });
      this.designAgentId = designAgent.id;
      logger.info(`Created Design Agent with ID: ${this.designAgentId}`);
    }
    
    if (!this.codingAgentId) {
      const codingAgent = await storage.createAgent({
        name: 'Coding Agent',
        type: AgentType.CODING,
        status: AgentStatus.STANDBY,
        isActive: true
      });
      this.codingAgentId = codingAgent.id;
      logger.info(`Created Coding Agent with ID: ${this.codingAgentId}`);
    }
    
    if (!this.debugAgentId) {
      const debugAgent = await storage.createAgent({
        name: 'Debug Agent',
        type: AgentType.DEBUG,
        status: AgentStatus.STANDBY,
        isActive: true
      });
      this.debugAgentId = debugAgent.id;
      logger.info(`Created Debug Agent with ID: ${this.debugAgentId}`);
    }
    
    if (!this.supervisionAgentId) {
      const supervisionAgent = await storage.createAgent({
        name: 'Supervision Agent',
        type: AgentType.SUPERVISION,
        status: AgentStatus.STANDBY,
        isActive: true
      });
      this.supervisionAgentId = supervisionAgent.id;
      logger.info(`Created Supervision Agent with ID: ${this.supervisionAgentId}`);
    }
    
    // Initialize agent instances
    this.designAgent = new DesignAgent(this.designAgentId);
    this.codingAgent = new CodingAgent(this.codingAgentId);
    this.debugAgent = new DebugAgent(this.debugAgentId);
    this.supervisionAgent = new SupervisionAgent(this.supervisionAgentId);
    
    // Create tasks for each agent
    const designTask = await storage.createTask({
      projectId: this.testProjectId,
      description: "Design a weather app UI",
      status: TaskStatus.PENDING
    });
    this.designTaskId = designTask.id;
    
    const codingTask = await storage.createTask({
      projectId: this.testProjectId,
      description: "Implement the weather app frontend logic",
      status: TaskStatus.PENDING
    });
    this.codingTaskId = codingTask.id;
    
    const debugTask = await storage.createTask({
      projectId: this.testProjectId,
      description: "Fix bug in temperature display",
      status: TaskStatus.PENDING
    });
    this.debugTaskId = debugTask.id;
    
    const supervisionTask = await storage.createTask({
      projectId: this.testProjectId,
      description: "Coordinate the weather app development",
      status: TaskStatus.PENDING
    });
    this.supervisionTaskId = supervisionTask.id;
    
    logger.info('Test environment setup completed');
  }

  /**
   * Test the Design Agent
   */
  async testDesignAgent() {
    if (!this.designAgent || !this.designTaskId || !this.testProjectId) {
      throw new Error('Design agent test setup is incomplete');
    }
    
    logger.info('Starting Design Agent test');
    
    // Create initial message
    await storage.createMessage({
      taskId: this.designTaskId,
      agentId: null,
      userId: this.testUserId,
      content: "I need a weather app with a clean UI that shows current temperature, forecast for the next 5 days, and weather conditions.",
      type: MessageType.USER
    });
    
    // Update task status
    await storage.updateTaskStatus(this.designTaskId, TaskStatus.IN_PROGRESS);
    
    // Create a memory for the design agent
    await storage.createAgentMemory({
      agentId: this.designAgentId!,
      projectId: this.testProjectId,
      type: MemoryType.LONG_TERM,
      content: "User prefers clean, minimalist designs with high contrast for readability",
      importance: 8
    });
    
    // Process the design request
    const result = await this.designAgent.process(
      "Create a UI design for a weather app with the following requirements: show current temperature, forecast for the next 5 days, and weather conditions.",
      { taskId: this.designTaskId }
    );
    
    // Create project components based on design
    if (result.success) {
      // Record the agent response
      await storage.createMessage({
        taskId: this.designTaskId,
        agentId: this.designAgentId,
        userId: null,
        content: result.output,
        type: MessageType.AGENT
      });
      
      // Create UI components
      const headerComponent = await storage.createProjectComponent({
        projectId: this.testProjectId,
        name: "Header Component",
        type: ComponentType.UI,
        description: "App header with location selector and settings button",
        metadata: { designRequirements: "Clean, minimal design with high contrast" }
      });
      
      const forecastComponent = await storage.createProjectComponent({
        projectId: this.testProjectId,
        name: "Forecast Component",
        type: ComponentType.UI,
        description: "5-day forecast display with daily temperatures and conditions",
        metadata: { designRequirements: "Card-based layout with weather icons" }
      });
      
      const currentWeatherComponent = await storage.createProjectComponent({
        projectId: this.testProjectId,
        name: "Current Weather Component",
        type: ComponentType.UI,
        description: "Large display of current temperature and conditions",
        metadata: { designRequirements: "Prominent temperature display with weather animation" }
      });
      
      // Create component relationships
      await storage.createComponentRelationship({
        sourceComponentId: headerComponent.id,
        targetComponentId: currentWeatherComponent.id,
        relationshipType: "contains",
        description: "Header is parent component containing current weather display"
      });
      
      await storage.createComponentRelationship({
        sourceComponentId: headerComponent.id,
        targetComponentId: forecastComponent.id,
        relationshipType: "contains",
        description: "Header is parent component containing forecast display"
      });
      
      // Update task status
      await storage.updateTaskStatus(this.designTaskId, TaskStatus.COMPLETED);
      logger.info('Design Agent test completed successfully');
    } else {
      logger.error(`Design Agent test failed: ${result.error}`);
      await storage.updateTaskStatus(this.designTaskId, TaskStatus.FAILED);
      throw new Error(`Design Agent test failed: ${result.error}`);
    }
    
    return result;
  }

  /**
   * Test the Coding Agent
   */
  async testCodingAgent() {
    if (!this.codingAgent || !this.codingTaskId || !this.testProjectId) {
      throw new Error('Coding agent test setup is incomplete');
    }
    
    logger.info('Starting Coding Agent test');
    
    // Create initial message
    await storage.createMessage({
      taskId: this.codingTaskId,
      agentId: null,
      userId: this.testUserId,
      content: "Implement a React component for the weather app that fetches and displays weather data.",
      type: MessageType.USER
    });
    
    // Update task status
    await storage.updateTaskStatus(this.codingTaskId, TaskStatus.IN_PROGRESS);
    
    // Create a memory for the coding agent
    await storage.createAgentMemory({
      agentId: this.codingAgentId!,
      projectId: this.testProjectId,
      type: MemoryType.PROCEDURAL,
      content: "Weather API requires API key in the headers and uses metric units by default",
      importance: 7
    });
    
    // Process the coding request
    const result = await this.codingAgent.process(
      "Create a React component to fetch and display weather data from a weather API. The component should show current temperature and a 5-day forecast.",
      { taskId: this.codingTaskId }
    );
    
    // Create project components based on implementation
    if (result.success) {
      // Record the agent response
      await storage.createMessage({
        taskId: this.codingTaskId,
        agentId: this.codingAgentId,
        userId: null,
        content: result.output,
        type: MessageType.AGENT
      });
      
      // Create code components
      const weatherApiComponent = await storage.createProjectComponent({
        projectId: this.testProjectId,
        name: "Weather API Service",
        type: ComponentType.API,
        path: "src/services/weatherApi.js",
        description: "Service for fetching weather data from external API",
        metadata: { language: "JavaScript", framework: "React" }
      });
      
      const weatherComponentLogic = await storage.createProjectComponent({
        projectId: this.testProjectId,
        name: "Weather Component Logic",
        type: ComponentType.LOGIC,
        path: "src/components/Weather/index.jsx",
        description: "Implementation of weather display component",
        metadata: { language: "JavaScript", framework: "React" }
      });
      
      const weatherComponentStyles = await storage.createProjectComponent({
        projectId: this.testProjectId,
        name: "Weather Component Styles",
        type: ComponentType.UI,
        path: "src/components/Weather/styles.css",
        description: "Styling for weather display component",
        metadata: { language: "CSS" }
      });
      
      // Create component relationships
      await storage.createComponentRelationship({
        sourceComponentId: weatherComponentLogic.id,
        targetComponentId: weatherApiComponent.id,
        relationshipType: "imports",
        description: "Weather component uses the weather API service"
      });
      
      await storage.createComponentRelationship({
        sourceComponentId: weatherComponentLogic.id,
        targetComponentId: weatherComponentStyles.id,
        relationshipType: "imports",
        description: "Weather component imports its styling"
      });
      
      // Update task status
      await storage.updateTaskStatus(this.codingTaskId, TaskStatus.COMPLETED);
      logger.info('Coding Agent test completed successfully');
    } else {
      logger.error(`Coding Agent test failed: ${result.error}`);
      await storage.updateTaskStatus(this.codingTaskId, TaskStatus.FAILED);
      throw new Error(`Coding Agent test failed: ${result.error}`);
    }
    
    return result;
  }

  /**
   * Test the Debug Agent
   */
  async testDebugAgent() {
    if (!this.debugAgent || !this.debugTaskId || !this.testProjectId) {
      throw new Error('Debug agent test setup is incomplete');
    }
    
    logger.info('Starting Debug Agent test');
    
    // Create initial message
    await storage.createMessage({
      taskId: this.debugTaskId,
      agentId: null,
      userId: this.testUserId,
      content: "The temperature isn't displaying correctly. It always shows 0°C regardless of the API response.",
      type: MessageType.USER
    });
    
    // Update task status
    await storage.updateTaskStatus(this.debugTaskId, TaskStatus.IN_PROGRESS);
    
    // Create a memory for the debug agent
    await storage.createAgentMemory({
      agentId: this.debugAgentId!,
      projectId: this.testProjectId,
      type: MemoryType.EPISODIC,
      content: "There was a similar temperature display issue in a previous project caused by unit conversion errors",
      importance: 6
    });
    
    // Process the debug request
    const result = await this.debugAgent.process(
      `Debug the following React component that displays temperatures incorrectly:
      
      function WeatherDisplay({ data }) {
        const [temperature, setTemperature] = useState(0);
        
        useEffect(() => {
          if (data && data.current) {
            // Problem might be here
            setTemperature(data.current.temp);
          }
        }, []);
        
        return (
          <div className="weather-display">
            <h2>Current Temperature</h2>
            <p className="temperature">{temperature}°C</p>
          </div>
        );
      }`,
      { taskId: this.debugTaskId }
    );
    
    if (result.success) {
      // Record the agent response
      await storage.createMessage({
        taskId: this.debugTaskId,
        agentId: this.debugAgentId,
        userId: null,
        content: result.output,
        type: MessageType.AGENT
      });
      
      // Update the component to reflect the fix
      const components = await storage.getProjectComponentsByProject(this.testProjectId);
      const weatherComponent = components.find(c => c.name === "Weather Component Logic");
      
      if (weatherComponent) {
        await storage.updateProjectComponent(weatherComponent.id, {
          description: "Implementation of weather display component with temperature bug fixed",
          metadata: { 
            language: "JavaScript", 
            framework: "React",
            bugFixed: "Fixed temperature display issue by properly handling dependency array in useEffect"
          }
        });
      }
      
      // Update task status
      await storage.updateTaskStatus(this.debugTaskId, TaskStatus.COMPLETED);
      logger.info('Debug Agent test completed successfully');
    } else {
      logger.error(`Debug Agent test failed: ${result.error}`);
      await storage.updateTaskStatus(this.debugTaskId, TaskStatus.FAILED);
      throw new Error(`Debug Agent test failed: ${result.error}`);
    }
    
    return result;
  }

  /**
   * Test the Supervision Agent
   */
  async testSupervisionAgent() {
    if (!this.supervisionAgent || !this.supervisionTaskId || !this.testProjectId) {
      throw new Error('Supervision agent test setup is incomplete');
    }
    
    logger.info('Starting Supervision Agent test');
    
    // Create initial message
    await storage.createMessage({
      taskId: this.supervisionTaskId,
      agentId: null,
      userId: this.testUserId,
      content: "Coordinate the development of the weather app by analyzing requirements and assigning tasks to the appropriate agents.",
      type: MessageType.USER
    });
    
    // Update task status
    await storage.updateTaskStatus(this.supervisionTaskId, TaskStatus.IN_PROGRESS);
    
    // Create a memory for the supervision agent
    await storage.createAgentMemory({
      agentId: this.supervisionAgentId!,
      projectId: this.testProjectId,
      type: MemoryType.LONG_TERM,
      content: "Project timeline requires the design phase to be completed before implementation begins",
      importance: 9
    });
    
    // Process the supervision request
    const result = await this.supervisionAgent.process(
      "Analyze the requirements for a weather app project, create a development plan, and coordinate the agents to implement it efficiently.",
      { 
        taskId: this.supervisionTaskId, 
        projectId: this.testProjectId 
      }
    );
    
    if (result.success) {
      // Record the agent response
      await storage.createMessage({
        taskId: this.supervisionTaskId,
        agentId: this.supervisionAgentId,
        userId: null,
        content: result.output,
        type: MessageType.AGENT
      });
      
      // Create project management components
      const projectPlanComponent = await storage.createProjectComponent({
        projectId: this.testProjectId,
        name: "Project Plan",
        type: ComponentType.UTILITY,
        description: "Development plan and timeline for the weather app project",
        metadata: { 
          phases: [
            { name: "Design", duration: "2 days", assignedTo: "Design Agent" },
            { name: "Implementation", duration: "5 days", assignedTo: "Coding Agent" },
            { name: "Testing and Debugging", duration: "3 days", assignedTo: "Debug Agent" },
            { name: "Review", duration: "1 day", assignedTo: "Supervision Agent" }
          ] 
        }
      });
      
      const requirementsComponent = await storage.createProjectComponent({
        projectId: this.testProjectId,
        name: "Requirements Spec",
        type: ComponentType.UTILITY,
        description: "Detailed requirements specification for the weather app",
        metadata: { 
          functional: [
            "Display current temperature and conditions",
            "Show 5-day forecast with daily high/low temps",
            "Allow location search or GPS-based location",
            "Show weather alerts if applicable"
          ],
          nonFunctional: [
            "Load within 2 seconds",
            "Work offline with cached data",
            "Support dark/light mode",
            "Be accessible (WCAG 2.1 compliant)"
          ]
        }
      });
      
      // Create component relationships
      await storage.createComponentRelationship({
        sourceComponentId: projectPlanComponent.id,
        targetComponentId: requirementsComponent.id,
        relationshipType: "references",
        description: "Project plan is based on requirements specification"
      });
      
      // Update task status
      await storage.updateTaskStatus(this.supervisionTaskId, TaskStatus.COMPLETED);
      logger.info('Supervision Agent test completed successfully');
    } else {
      logger.error(`Supervision Agent test failed: ${result.error}`);
      await storage.updateTaskStatus(this.supervisionTaskId, TaskStatus.FAILED);
      throw new Error(`Supervision Agent test failed: ${result.error}`);
    }
    
    return result;
  }

  /**
   * Run all agent tests
   */
  async runAllTests() {
    logger.info('Starting comprehensive agent tests');
    
    try {
      await this.setup();
      
      // Run supervision test first
      logger.info('--- Testing Supervision Agent ---');
      const supervisionResult = await this.testSupervisionAgent();
      logger.info(`Supervision Agent test ${supervisionResult.success ? 'passed' : 'failed'}`);
      
      // Then design agent
      logger.info('--- Testing Design Agent ---');
      const designResult = await this.testDesignAgent();
      logger.info(`Design Agent test ${designResult.success ? 'passed' : 'failed'}`);
      
      // Then coding agent
      logger.info('--- Testing Coding Agent ---');
      const codingResult = await this.testCodingAgent();
      logger.info(`Coding Agent test ${codingResult.success ? 'passed' : 'failed'}`);
      
      // Finally debug agent
      logger.info('--- Testing Debug Agent ---');
      const debugResult = await this.testDebugAgent();
      logger.info(`Debug Agent test ${debugResult.success ? 'passed' : 'failed'}`);
      
      // Calculate overall test summary
      const allResults = [supervisionResult, designResult, codingResult, debugResult];
      const passedTests = allResults.filter(r => r.success).length;
      
      logger.info(`\n--- Test Summary ---`);
      logger.info(`Total tests: ${allResults.length}`);
      logger.info(`Passed: ${passedTests}`);
      logger.info(`Failed: ${allResults.length - passedTests}`);
      logger.info(`Success rate: ${Math.round((passedTests / allResults.length) * 100)}%`);
      
      // Add final memory after tests
      if (this.supervisionAgentId && this.testProjectId) {
        await storage.createAgentMemory({
          agentId: this.supervisionAgentId,
          projectId: this.testProjectId,
          type: MemoryType.EPISODIC,
          content: `Completed agent testing with ${passedTests}/${allResults.length} successful tests. Project components and structure have been created.`,
          importance: 10
        });
      }
      
      return {
        success: passedTests === allResults.length,
        results: {
          supervision: supervisionResult.success,
          design: designResult.success,
          coding: codingResult.success,
          debug: debugResult.success
        }
      };
      
    } catch (error) {
      logger.error(`Test execution failed: ${error}`);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Clean up test data
   */
  async cleanup() {
    // In a real implementation, we might want to clean up the test data
    // But for this test, we'll keep the data for inspection
    logger.info('Test data preserved for inspection');
  }
}

// Export singleton instance
export const agentTester = new AgentTester();