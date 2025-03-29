import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { AgentType, AgentStatus, ActivityType, ErrorType, SystemKnowledge, SystemErrorLog } from '@shared/schema';
import { SelfHealingAgent } from '../agents/selfHealingAgent';
import { storage } from '../storage';
import { threadManager } from '../utils/threadManager';

// Mock dependencies
jest.mock('../storage');
jest.mock('../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn()
  }
}));
jest.mock('../utils/threadManager');

describe('SelfHealingAgent', () => {
  let agent: SelfHealingAgent;
  let mockTaskResult: any;
  
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Create a new self-healing agent for each test
    agent = new SelfHealingAgent(1);
    
    // Setup default mock responses
    mockTaskResult = {
      success: true,
      output: 'Test output',
      tokens: {
        prompt: 100,
        completion: 50,
        total: 150
      }
    };
    
    // Mock threadManager.executeTask
    (threadManager.executeTask as jest.Mock).mockResolvedValue(mockTaskResult);
    
    // Mock storage methods
    (storage.updateAgentStatus as jest.Mock).mockResolvedValue({ id: 1 });
    (storage.createSystemActivity as jest.Mock).mockResolvedValue({ id: 1 });
    (storage.getSystemStats as jest.Mock).mockResolvedValue({
      id: 1,
      apiTokensUsed: 0,
      apiTokensLimit: 10000
    });
    (storage.updateSystemStats as jest.Mock).mockResolvedValue({
      id: 1,
      apiTokensUsed: 150,
      apiTokensLimit: 10000
    });
    
    // Mock knowledge-related methods
    const mockKnowledge: SystemKnowledge = {
      id: 1,
      componentName: 'test-component',
      componentType: 'test-type',
      description: 'Test knowledge',
      functionalities: {},
      dependencies: {},
      errorPatterns: {},
      documentation: null,
      exampleCode: null,
      createdAt: new Date(),
      lastUpdated: new Date()
    };
    (storage.getSystemKnowledgeByComponent as jest.Mock).mockResolvedValue(mockKnowledge);
    (storage.getSystemKnowledgeByType as jest.Mock).mockResolvedValue([mockKnowledge]);
    (storage.getAllSystemKnowledge as jest.Mock).mockResolvedValue([mockKnowledge]);
    (storage.createSystemKnowledge as jest.Mock).mockResolvedValue(mockKnowledge);
    
    // Mock error-related methods
    const mockErrorLog: SystemErrorLog = {
      id: 1,
      componentName: 'test-component',
      errorType: ErrorType.RUNTIME_ERROR,
      errorMessage: 'Test error',
      stackTrace: 'Test stack trace',
      context: {},
      attempted_fixes: [],
      isSolved: false,
      solutionNotes: null,
      timestamp: new Date()
    };
    (storage.getSystemErrorLogsByComponent as jest.Mock).mockResolvedValue([mockErrorLog]);
    (storage.createSystemErrorLog as jest.Mock).mockResolvedValue(mockErrorLog);
    (storage.markSystemErrorAsSolved as jest.Mock).mockResolvedValue({
      ...mockErrorLog,
      isSolved: true,
      solutionNotes: 'Fixed'
    });
  });
  
  it('should be initialized with correct values', () => {
    expect(agent.id).toBe(1);
    expect(agent.name).toBe('Self-Healing Agent');
    expect(agent.type).toBe(AgentType.SELF_HEALING);
    expect(agent.status).toBe(AgentStatus.STANDBY);
  });
  
  it('should return the list of supported methods', () => {
    const methods = agent.getMethods();
    expect(methods).toContain('detectErrors');
    expect(methods).toContain('analyzeError');
    expect(methods).toContain('suggestFix');
    expect(methods).toContain('applyFix');
    expect(methods).toContain('validateFix');
    expect(methods).toContain('monitorSystem');
    expect(methods).toContain('searchKnowledge');
    expect(methods).toContain('searchOnline');
    expect(methods).toContain('addSystemKnowledge');
    expect(methods).toContain('learnFromExperience');
  });
  
  it('should detect errors when asked to', async () => {
    const result = await agent.process('detect errors in the system');
    
    expect(storage.updateAgentStatus).toHaveBeenCalledWith(1, AgentStatus.OBSERVING);
    expect(storage.createSystemActivity).toHaveBeenCalled();
    expect(threadManager.executeTask).toHaveBeenCalled();
    expect(storage.updateSystemStats).toHaveBeenCalled();
    
    expect(result.success).toBe(true);
    expect(result.output).toBe('Test output');
    expect(result.metadata).toHaveProperty('action', 'detect_errors');
  });
  
  it('should analyze errors when asked to', async () => {
    const result = await agent.process('analyze error in component X', {
      componentName: 'test-component',
      errorMessage: 'Test error'
    });
    
    expect(storage.updateAgentStatus).toHaveBeenCalledWith(1, AgentStatus.OBSERVING);
    expect(storage.createSystemActivity).toHaveBeenCalled();
    expect(threadManager.executeTask).toHaveBeenCalled();
    expect(storage.updateSystemStats).toHaveBeenCalled();
    
    expect(result.success).toBe(true);
    expect(result.output).toBe('Test output');
    expect(result.metadata).toHaveProperty('action', 'analyze_error');
  });
  
  it('should suggest fixes when asked to', async () => {
    const result = await agent.process('suggest fix for error in component X', {
      componentName: 'test-component',
      errorMessage: 'Test error',
      errorType: ErrorType.RUNTIME_ERROR
    });
    
    expect(storage.updateAgentStatus).toHaveBeenCalledWith(1, AgentStatus.OBSERVING);
    expect(storage.createSystemActivity).toHaveBeenCalled();
    expect(threadManager.executeTask).toHaveBeenCalled();
    expect(storage.updateSystemStats).toHaveBeenCalled();
    expect(storage.createSystemErrorLog).toHaveBeenCalled();
    
    expect(result.success).toBe(true);
    expect(result.output).toBe('Test output');
    expect(result.metadata).toHaveProperty('action', 'suggest_fix');
  });
  
  it('should suggest and apply fix when asked to with apply context', async () => {
    // Override the mock for this test
    (threadManager.executeTask as jest.Mock)
      .mockResolvedValueOnce({ // suggestFix result
        success: true,
        output: 'Suggested fix: do XYZ',
        tokens: { total: 50 }
      })
      .mockResolvedValueOnce({ // applyFix result
        success: true,
        output: 'Applied fix successfully',
        tokens: { total: 50 }
      })
      .mockResolvedValueOnce({ // validateFix result
        success: true,
        output: 'Fix validated successfully',
        tokens: { total: 50 }
      });
      
    const result = await agent.process('fix error in component X', {
      componentName: 'test-component',
      errorMessage: 'Test error',
      errorType: ErrorType.RUNTIME_ERROR,
      apply: true
    });
    
    expect(storage.updateAgentStatus).toHaveBeenCalledWith(1, AgentStatus.OBSERVING);
    expect(storage.createSystemActivity).toHaveBeenCalledTimes(4); // Initial + 3 operations
    expect(threadManager.executeTask).toHaveBeenCalledTimes(3); // For each operation
    expect(storage.updateSystemStats).toHaveBeenCalledTimes(3); // For each operation
    expect(storage.createSystemErrorLog).toHaveBeenCalled();
    expect(storage.getSystemErrorLogsByComponent).toHaveBeenCalled();
    expect(storage.markSystemErrorAsSolved).toHaveBeenCalled();
    
    expect(result.success).toBe(true);
    expect(result.output).toContain('Fix applied and validated');
    expect(result.metadata).toHaveProperty('action', 'fix_and_validate');
  });
  
  it('should monitor system when asked to', async () => {
    // Override threadManager mock for this test
    (threadManager.getThreadStats as jest.Mock).mockReturnValue({
      activeThreads: 2,
      maxThreads: 8,
      availableThreads: 6
    });
    
    const result = await agent.process('monitor system status');
    
    expect(storage.updateAgentStatus).toHaveBeenCalledWith(1, AgentStatus.OBSERVING);
    expect(storage.createSystemActivity).toHaveBeenCalled();
    expect(threadManager.executeTask).toHaveBeenCalled();
    expect(threadManager.getThreadStats).toHaveBeenCalled();
    expect(storage.updateSystemStats).toHaveBeenCalled();
    
    expect(result.success).toBe(true);
    expect(result.output).toBe('Test output');
    expect(result.metadata).toHaveProperty('action', 'monitor_system');
    expect(result.metadata).toHaveProperty('threadStats');
  });
  
  it('should search knowledge base when asked to', async () => {
    const result = await agent.process('search knowledge for component X', {
      componentName: 'test-component'
    });
    
    expect(storage.updateAgentStatus).toHaveBeenCalledWith(1, AgentStatus.OBSERVING);
    expect(storage.createSystemActivity).toHaveBeenCalled();
    expect(storage.getSystemKnowledgeByComponent).toHaveBeenCalled();
    expect(threadManager.executeTask).toHaveBeenCalled();
    expect(storage.updateSystemStats).toHaveBeenCalled();
    
    expect(result.success).toBe(true);
    expect(result.output).toBe('Test output');
    expect(result.metadata).toHaveProperty('action', 'search_knowledge');
  });
  
  it('should add system knowledge when asked to', async () => {
    // Override threadManager mock for this test
    (threadManager.executeTask as jest.Mock).mockResolvedValue({
      success: true,
      output: 'Knowledge added successfully',
      tokens: { total: 50 },
      structured: {
        componentName: 'test-component',
        componentType: 'test-type',
        knowledgeContent: 'This is test knowledge',
        functionalities: {},
        dependencies: {},
        errorPatterns: {}
      }
    });
    
    const result = await agent.process('add knowledge about component X', {
      componentName: 'test-component',
      componentType: 'test-type',
      knowledge: 'This is test knowledge'
    });
    
    expect(storage.updateAgentStatus).toHaveBeenCalledWith(1, AgentStatus.OBSERVING);
    expect(storage.createSystemActivity).toHaveBeenCalled();
    expect(threadManager.executeTask).toHaveBeenCalled();
    expect(storage.createSystemKnowledge).toHaveBeenCalled();
    expect(storage.updateSystemStats).toHaveBeenCalled();
    
    expect(result.success).toBe(true);
    expect(result.output).toBe('Knowledge added successfully');
    expect(result.metadata).toHaveProperty('action', 'add_knowledge');
  });
});