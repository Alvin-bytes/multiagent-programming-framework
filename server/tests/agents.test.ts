import { DesignAgent } from '../agents/designAgent';
import { CodingAgent } from '../agents/codingAgent';
import { SupervisionAgent } from '../agents/supervisionAgent';
import { DebugAgent } from '../agents/debugAgent';
import { AgentType, AgentStatus } from '@shared/schema';
import { storage } from '../storage';

// Mock the storage implementation
jest.mock('../storage', () => ({
  storage: {
    getAgent: jest.fn(),
    updateAgentStatus: jest.fn(),
    getAllAgents: jest.fn(),
    createSystemActivity: jest.fn(),
    getSystemStats: jest.fn().mockResolvedValue({ apiTokensUsed: 0 }),
    updateSystemStats: jest.fn()
  }
}));

// Mock the logger
jest.mock('../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn()
  }
}));

// Mock thread manager
jest.mock('../utils/threadManager', () => ({
  threadManager: {
    executeTask: jest.fn().mockImplementation(async (taskFunction, data, taskDescription) => {
      return {
        success: true,
        output: `Mock output for: ${data.input}`,
        tokens: {
          input: data.input.length,
          output: data.input.length * 2,
          total: data.input.length * 3
        }
      };
    }),
    getThreadStats: jest.fn().mockReturnValue({
      activeThreads: 1,
      maxThreads: 8,
      availableThreads: 7
    })
  }
}));

describe('Agent Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('DesignAgent', () => {
    let designAgent: DesignAgent;

    beforeEach(() => {
      designAgent = new DesignAgent(1);
    });

    test('should initialize with correct properties', () => {
      expect(designAgent.id).toBe(1);
      expect(designAgent.name).toBe('Design Agent');
      expect(designAgent.type).toBe(AgentType.DESIGN);
      expect(designAgent.status).toBe(AgentStatus.STANDBY);
      expect(designAgent.isActive).toBe(true);
    });

    test('should process UI design request', async () => {
      const result = await designAgent.process('Create a UI design for a weather app');
      
      expect(result.success).toBe(true);
      expect(result.output).toContain('Mock output');
      expect(storage.updateAgentStatus).toHaveBeenCalledWith(1, AgentStatus.ACTIVE);
      expect(storage.createSystemActivity).toHaveBeenCalled();
    });

    test('should return methods', () => {
      const methods = designAgent.getMethods();
      expect(methods).toContain('createUiDesign');
      expect(methods).toContain('evaluateDesign');
    });
  });

  describe('CodingAgent', () => {
    let codingAgent: CodingAgent;

    beforeEach(() => {
      codingAgent = new CodingAgent(2);
    });

    test('should initialize with correct properties', () => {
      expect(codingAgent.id).toBe(2);
      expect(codingAgent.name).toBe('Coding Agent');
      expect(codingAgent.type).toBe(AgentType.CODING);
    });

    test('should process code generation request', async () => {
      const result = await codingAgent.process('Generate a JavaScript function to fetch weather data');
      
      expect(result.success).toBe(true);
      expect(result.output).toContain('Mock output');
      expect(storage.updateAgentStatus).toHaveBeenCalledWith(2, AgentStatus.ACTIVE);
    });
  });

  describe('SupervisionAgent', () => {
    let supervisionAgent: SupervisionAgent;

    beforeEach(() => {
      supervisionAgent = new SupervisionAgent(3);
    });

    test('should initialize with correct properties', () => {
      expect(supervisionAgent.id).toBe(3);
      expect(supervisionAgent.name).toBe('Supervision Agent');
      expect(supervisionAgent.type).toBe(AgentType.SUPERVISION);
    });

    test('should process requirement analysis request', async () => {
      const result = await supervisionAgent.process('Analyze requirements for a weather app');
      
      expect(result.success).toBe(true);
      expect(result.output).toContain('Mock output');
      expect(storage.updateAgentStatus).toHaveBeenCalledWith(3, AgentStatus.OBSERVING);
    });
  });

  describe('DebugAgent', () => {
    let debugAgent: DebugAgent;

    beforeEach(() => {
      debugAgent = new DebugAgent(4);
    });

    test('should initialize with correct properties', () => {
      expect(debugAgent.id).toBe(4);
      expect(debugAgent.name).toBe('Debug Agent');
      expect(debugAgent.type).toBe(AgentType.DEBUG);
    });

    test('should process debugging request', async () => {
      const result = await debugAgent.process('Debug this JavaScript code: function getData() { cosole.log("test"); }');
      
      expect(result.success).toBe(true);
      expect(result.output).toContain('Mock output');
      expect(storage.updateAgentStatus).toHaveBeenCalledWith(4, AgentStatus.ACTIVE);
    });
  });
});
