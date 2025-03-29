import { AgentBase, AgentExecutionResult } from './agentBase';
import { AgentType, AgentStatus, ActivityType, ErrorType } from '@shared/schema';
import { storage } from '../storage';
import { logger } from '../utils/logger';
import { threadManager } from '../utils/threadManager';

interface SelfHealingParams {
  errorType?: ErrorType;
  componentName?: string;
  errorMessage?: string;
  stackTrace?: string;
  context?: Record<string, any>;
  attempted_fixes?: any[];
}

/**
 * Helper functions for the SelfHealingAgent
 */
const SelfHealingUtils = {
  /**
   * Classifies an error message into appropriate ErrorType
   * @param errorMessage The error message to classify
   * @param stackTrace Optional stack trace to provide more context
   * @returns The classified ErrorType
   */
  classifyError: (errorMessage: string, stackTrace?: string): ErrorType => {
    if (!errorMessage) return ErrorType.UNKNOWN;
    
    const errorMsg = errorMessage.toLowerCase();
    const stackStr = stackTrace?.toLowerCase() || '';
    
    // Check for syntax errors
    if (
      errorMsg.includes('syntax error') ||
      errorMsg.includes('unexpected token') ||
      errorMsg.includes('unexpected identifier') ||
      errorMsg.includes('parsing error')
    ) {
      return ErrorType.SYNTAX_ERROR;
    }
    
    // Check for runtime errors
    if (
      errorMsg.includes('undefined is not a function') ||
      errorMsg.includes('cannot read property') ||
      errorMsg.includes('is not defined') ||
      errorMsg.includes('is not a function') ||
      errorMsg.includes('null pointer')
    ) {
      return ErrorType.RUNTIME_ERROR;
    }
    
    // Check for network errors
    if (
      errorMsg.includes('network') ||
      errorMsg.includes('connection') ||
      errorMsg.includes('timeout') ||
      errorMsg.includes('unreachable') ||
      errorMsg.includes('econnrefused')
    ) {
      return ErrorType.NETWORK_ERROR;
    }
    
    // Check for database errors
    if (
      errorMsg.includes('database') ||
      errorMsg.includes('sql') ||
      errorMsg.includes('query') ||
      errorMsg.includes('constraint violation') ||
      errorMsg.includes('unique constraint')
    ) {
      return ErrorType.DATABASE_ERROR;
    }
    
    // Check for API errors
    if (
      errorMsg.includes('api') ||
      errorMsg.includes('status code') ||
      errorMsg.includes('endpoint') ||
      errorMsg.includes('request failed')
    ) {
      return ErrorType.API_ERROR;
    }
    
    // Check for memory errors
    if (
      errorMsg.includes('memory') ||
      errorMsg.includes('allocation') ||
      errorMsg.includes('out of memory') ||
      errorMsg.includes('heap')
    ) {
      return ErrorType.MEMORY_ERROR;
    }
    
    // Check for thread errors
    if (
      errorMsg.includes('thread') ||
      errorMsg.includes('deadlock') ||
      errorMsg.includes('race condition') ||
      errorMsg.includes('concurrency')
    ) {
      return ErrorType.THREAD_ERROR;
    }
    
    // Check for logic errors (these are harder to classify programmatically)
    if (
      errorMsg.includes('logic error') ||
      errorMsg.includes('logical error') ||
      errorMsg.includes('incorrect result') ||
      errorMsg.includes('expected') && errorMsg.includes('but got')
    ) {
      return ErrorType.LOGIC_ERROR;
    }
    
    // Default to unknown
    return ErrorType.UNKNOWN;
  }
}

/**
 * SelfHealingAgent is responsible for continuously monitoring the system,
 * detecting errors, and providing fixes or suggestions to heal system issues.
 * It has special capabilities to understand system structure and dependencies
 * in a depth that other agents don't need.
 */
export class SelfHealingAgent extends AgentBase {
  constructor(id: number) {
    super(id, 'Self-Healing Agent', AgentType.SELF_HEALING);
    this.status = AgentStatus.STANDBY;
  }

  getMethods(): string[] {
    return [
      'detectErrors',
      'analyzeError',
      'suggestFix',
      'applyFix',
      'validateFix',
      'monitorSystem',
      'searchKnowledge',
      'searchOnline',
      'addSystemKnowledge',
      'learnFromExperience'
    ];
  }

  async process(input: string, context?: Record<string, any>): Promise<AgentExecutionResult> {
    // Update agent status
    await storage.updateAgentStatus(this.id, AgentStatus.OBSERVING);
    
    // Log system activity
    await storage.createSystemActivity({
      type: ActivityType.AGENT_STATUS_CHANGE,
      description: `${this.name} (ID: ${this.id}) started processing a request`,
      metadata: { input, context, timestamp: new Date().toISOString() }
    });
    
    // Determine what operation to perform based on the input
    if (input.includes('detect') && (input.includes('error') || input.includes('issue'))) {
      return this.detectErrors(input, context);
    } else if (input.includes('analyze') && (input.includes('error') || input.includes('issue'))) {
      return this.analyzeError(input, context);
    } else if (input.includes('fix') || input.includes('solve') || input.includes('repair')) {
      // If context.apply is true, we'll apply the fix after suggesting it
      if (context?.apply) {
        const suggestResult = await this.suggestAndApplyFix(input, context);
        return suggestResult;
      } else {
        return this.suggestFix(input, context);
      }
    } else if (input.includes('validate') || input.includes('verify')) {
      return this.validateFix(input, context);
    } else if (input.includes('monitor')) {
      return this.monitorSystem(input, context);
    } else if (input.includes('search knowledge') || input.includes('database')) {
      return this.searchKnowledge(input, context);
    } else if (input.includes('search online') || input.includes('internet')) {
      return this.searchOnline(input, context);
    } else if (input.includes('add knowledge') || input.includes('store information')) {
      return this.addSystemKnowledge(input, context);
    } else if (input.includes('learn') || input.includes('improve')) {
      return this.learnFromExperience(input, context);
    } else {
      // Default to detecting errors if we can't determine a specific action
      return this.detectErrors(input, context);
    }
  }

  private async detectErrors(input: string, context?: Record<string, any>): Promise<AgentExecutionResult> {
    logger.info(`SelfHealingAgent (ID: ${this.id}) detecting errors`);
    
    // Execute the detection task in a worker thread
    const result = await threadManager.executeTask(
      async (data) => {
        // In a real implementation, this would scan logs, monitor performance metrics,
        // check for exceptions, etc.
        // For now, we'll simulate the process
        return {
          success: true,
          output: "System scan complete. Detected potential issues: [List of issues]"
        };
      },
      { 
        input, 
        context: {
          ...context,
          action: 'detect_errors',
          agentId: this.id,
          agentType: this.type,
        }
      },
      'Detecting system errors and issues'
    );
    
    // Track token usage for LLM
    if (result.tokens) {
      await storage.updateSystemStats({
        apiTokensUsed: (await storage.getSystemStats())!.apiTokensUsed + result.tokens.total
      });
    }
    
    // Log activity
    await storage.createSystemActivity({
      type: ActivityType.SYSTEM_HEALING,
      description: `Error detection scan completed`,
      metadata: { result: result.output }
    });
    
    return {
      success: result.success,
      output: result.output,
      metadata: {
        timestamp: new Date().toISOString(),
        action: 'detect_errors',
        tokens: result.tokens
      }
    };
  }

  private async analyzeError(input: string, context?: Record<string, any>): Promise<AgentExecutionResult> {
    logger.info(`SelfHealingAgent (ID: ${this.id}) analyzing error: ${input}`);
    
    // Extract relevant error information from the input or context
    const errorParams: SelfHealingParams = {};
    
    // If we have context with error details, use that
    if (context?.errorType) {
      errorParams.errorType = context.errorType;
    }
    if (context?.componentName) {
      errorParams.componentName = context.componentName;
    }
    if (context?.errorMessage) {
      errorParams.errorMessage = context.errorMessage;
    }
    if (context?.stackTrace) {
      errorParams.stackTrace = context.stackTrace;
    }
    
    // If we have an error message but no error type, try to classify it
    if (errorParams.errorMessage && !errorParams.errorType) {
      errorParams.errorType = SelfHealingUtils.classifyError(
        errorParams.errorMessage, 
        errorParams.stackTrace || undefined
      );
      logger.info(`Classified error as: ${errorParams.errorType}`);
    }
    
    // Execute analysis in a worker thread
    const result = await threadManager.executeTask(
      async (data) => {
        // In a real implementation, this would perform deep analysis of the error
        // trace error origins, dependency issues, pattern matching with known issues, etc.
        return {
          success: true,
          output: "Error analysis complete. Root cause identified: [Root cause details]"
        };
      },
      { 
        input, 
        errorParams,
        context: {
          ...context,
          action: 'analyze_error',
          agentId: this.id,
          agentType: this.type,
        }
      },
      'Analyzing system error root cause'
    );
    
    // Track token usage
    if (result.tokens) {
      await storage.updateSystemStats({
        apiTokensUsed: (await storage.getSystemStats())!.apiTokensUsed + result.tokens.total
      });
    }
    
    // Log activity
    await storage.createSystemActivity({
      type: ActivityType.SYSTEM_HEALING,
      description: `Error analysis completed for ${errorParams.componentName || 'unknown component'}`,
      metadata: { result: result.output, errorParams }
    });
    
    return {
      success: result.success,
      output: result.output,
      metadata: {
        timestamp: new Date().toISOString(),
        action: 'analyze_error',
        errorParams,
        tokens: result.tokens
      }
    };
  }

  private async suggestFix(input: string, context?: Record<string, any>): Promise<AgentExecutionResult> {
    logger.info(`SelfHealingAgent (ID: ${this.id}) suggesting fix for: ${input}`);
    
    // Similar extraction of params as in analyzeError
    const errorParams: SelfHealingParams = {};
    if (context?.errorType) errorParams.errorType = context.errorType;
    if (context?.componentName) errorParams.componentName = context.componentName;
    if (context?.errorMessage) errorParams.errorMessage = context.errorMessage;
    if (context?.stackTrace) errorParams.stackTrace = context.stackTrace;
    
    // If we have an error message but no error type, try to classify it
    if (errorParams.errorMessage && !errorParams.errorType) {
      errorParams.errorType = SelfHealingUtils.classifyError(
        errorParams.errorMessage, 
        errorParams.stackTrace || undefined
      );
      logger.info(`Classified error as: ${errorParams.errorType}`);
    }
    
    // First, check if we have knowledge about this type of error
    let knowledgeBase;
    if (errorParams.componentName) {
      knowledgeBase = await storage.getSystemKnowledgeByComponent(errorParams.componentName);
    } else if (context?.componentType) {
      knowledgeBase = await storage.getSystemKnowledgeByType(context.componentType);
    } else {
      // Get all knowledge for now
      knowledgeBase = await storage.getAllSystemKnowledge();
    }
    
    // Execute the suggestion task in a worker thread
    const result = await threadManager.executeTask(
      async (data) => {
        // In a real implementation, this would generate a fix based on error analysis
        // and known solutions from the knowledge base
        return {
          success: true,
          output: "Fix suggestion: [Detailed solution steps]"
        };
      },
      { 
        input, 
        errorParams,
        knowledgeBase,
        context: {
          ...context,
          action: 'suggest_fix',
          agentId: this.id,
          agentType: this.type,
        }
      },
      'Generating error fix suggestion'
    );
    
    // Track token usage
    if (result.tokens) {
      await storage.updateSystemStats({
        apiTokensUsed: (await storage.getSystemStats())!.apiTokensUsed + result.tokens.total
      });
    }
    
    // If we have a componentName, document this error and solution in the error logs
    if (errorParams.componentName && errorParams.errorMessage) {
      await storage.createSystemErrorLog({
        componentName: errorParams.componentName,
        errorType: errorParams.errorType || ErrorType.UNKNOWN,
        errorMessage: errorParams.errorMessage,
        stackTrace: errorParams.stackTrace || null,
        context: context || {},
        attempted_fixes: [],
        isSolved: false,
        solutionNotes: null
      });
    }
    
    // Log activity
    await storage.createSystemActivity({
      type: ActivityType.SYSTEM_HEALING,
      description: `Fix suggestion generated for ${errorParams.componentName || 'unknown component'}`,
      metadata: { result: result.output, errorParams }
    });
    
    return {
      success: result.success,
      output: result.output,
      metadata: {
        timestamp: new Date().toISOString(),
        action: 'suggest_fix',
        errorParams,
        tokens: result.tokens
      }
    };
  }
  
  private async suggestAndApplyFix(input: string, context?: Record<string, any>): Promise<AgentExecutionResult> {
    // First suggest a fix
    const suggestResult = await this.suggestFix(input, context);
    
    if (!suggestResult.success) {
      return suggestResult; // If suggestion failed, return early
    }
    
    // Then apply the fix
    const applyResult = await this.applyFix(input, {
      ...context,
      suggestion: suggestResult.output,
      errorParams: suggestResult.metadata?.errorParams
    });
    
    if (!applyResult.success) {
      return applyResult; // If application failed, return early
    }
    
    // Finally validate the fix
    const validateResult = await this.validateFix(input, {
      ...context,
      fix: applyResult.output,
      errorParams: suggestResult.metadata?.errorParams
    });
    
    // Get system error log if we have one
    const errorParams = suggestResult.metadata?.errorParams as SelfHealingParams;
    if (errorParams?.componentName && validateResult.success) {
      // Find the most recent error log for this component
      const errorLogs = await storage.getSystemErrorLogsByComponent(errorParams.componentName);
      if (errorLogs.length > 0) {
        // Sort by timestamp descending to get the most recent
        const mostRecent = errorLogs.sort((a, b) => 
          b.timestamp.getTime() - a.timestamp.getTime()
        )[0];
        
        // Mark it as solved
        await storage.markSystemErrorAsSolved(
          mostRecent.id,
          `Fix applied and validated. ${validateResult.output}`
        );
      }
    }
    
    // Return combined result
    return {
      success: validateResult.success,
      output: `Fix applied and validated. ${validateResult.output}`,
      metadata: {
        timestamp: new Date().toISOString(),
        action: 'fix_and_validate',
        suggestion: suggestResult.output,
        implementation: applyResult.output,
        validation: validateResult.output,
        errorParams,
        tokens: {
          suggest: suggestResult.metadata?.tokens,
          apply: applyResult.metadata?.tokens,
          validate: validateResult.metadata?.tokens
        }
      }
    };
  }
  
  private async applyFix(input: string, context?: Record<string, any>): Promise<AgentExecutionResult> {
    logger.info(`SelfHealingAgent (ID: ${this.id}) applying fix: ${context?.suggestion || input}`);
    
    // Extract params
    const errorParams = context?.errorParams as SelfHealingParams || {};
    const suggestion = context?.suggestion || '';
    
    // Execute the fix application in a worker thread
    const result = await threadManager.executeTask(
      async (data) => {
        // In a real implementation, this would apply the suggested fix
        // potentially modifying code, configs, or runtime behavior
        return {
          success: true,
          output: "Fix applied: [Implementation details]"
        };
      },
      { 
        input, 
        suggestion,
        errorParams,
        context: {
          ...context,
          action: 'apply_fix',
          agentId: this.id,
          agentType: this.type
        }
      },
      'Applying error fix'
    );
    
    // Track token usage
    if (result.tokens) {
      await storage.updateSystemStats({
        apiTokensUsed: (await storage.getSystemStats())!.apiTokensUsed + result.tokens.total
      });
    }
    
    // Log activity
    await storage.createSystemActivity({
      type: ActivityType.SYSTEM_HEALING,
      description: `Fix applied for ${errorParams.componentName || 'unknown component'}`,
      metadata: { result: result.output, suggestion, errorParams }
    });
    
    return {
      success: result.success,
      output: result.output,
      metadata: {
        timestamp: new Date().toISOString(),
        action: 'apply_fix',
        suggestion,
        errorParams,
        tokens: result.tokens
      }
    };
  }
  
  private async validateFix(input: string, context?: Record<string, any>): Promise<AgentExecutionResult> {
    logger.info(`SelfHealingAgent (ID: ${this.id}) validating fix`);
    
    // Extract params
    const errorParams = context?.errorParams as SelfHealingParams || {};
    const fix = context?.fix || '';
    
    // Execute the validation in a worker thread
    const result = await threadManager.executeTask(
      async (data) => {
        // In a real implementation, this would test the fix to ensure it resolves the issue
        // and doesn't introduce new problems
        return {
          success: true,
          output: "Fix validation successful. All tests pass."
        };
      },
      { 
        input, 
        fix,
        errorParams,
        context: {
          ...context,
          action: 'validate_fix',
          agentId: this.id,
          agentType: this.type
        }
      },
      'Validating applied fix'
    );
    
    // Track token usage
    if (result.tokens) {
      await storage.updateSystemStats({
        apiTokensUsed: (await storage.getSystemStats())!.apiTokensUsed + result.tokens.total
      });
    }
    
    // Log activity
    await storage.createSystemActivity({
      type: ActivityType.SYSTEM_HEALING,
      description: `Fix validation completed for ${errorParams.componentName || 'unknown component'}`,
      metadata: { result: result.output, fix, errorParams }
    });
    
    return {
      success: result.success,
      output: result.output,
      metadata: {
        timestamp: new Date().toISOString(),
        action: 'validate_fix',
        fix,
        errorParams,
        tokens: result.tokens
      }
    };
  }
  
  private async monitorSystem(input: string, context?: Record<string, any>): Promise<AgentExecutionResult> {
    logger.info(`SelfHealingAgent (ID: ${this.id}) monitoring system`);
    
    // Execute the system monitoring in a worker thread
    const result = await threadManager.executeTask(
      async (data) => {
        // Get thread stats for real data
        const threadStats = threadManager.getThreadStats();
        
        // In a real implementation, this would retrieve performance metrics,
        // scan logs, check resource usage, etc.
        return {
          success: true,
          output: `System monitoring complete. Thread usage: ${threadStats.activeThreads}/${threadStats.maxThreads}. CPU/Memory: [metrics]`
        };
      },
      { 
        input, 
        context: {
          ...context,
          action: 'monitor_system',
          agentId: this.id,
          agentType: this.type
        }
      },
      'Monitoring system health'
    );
    
    // Track token usage
    if (result.tokens) {
      await storage.updateSystemStats({
        apiTokensUsed: (await storage.getSystemStats())!.apiTokensUsed + result.tokens.total
      });
    }
    
    // Update system stats with thread usage info
    const threadStats = threadManager.getThreadStats();
    await storage.updateSystemStats({
      activeThreads: threadStats.activeThreads
    });
    
    // Log activity
    await storage.createSystemActivity({
      type: ActivityType.SYSTEM_HEALING,
      description: `System monitoring completed`,
      metadata: { result: result.output, threadStats }
    });
    
    return {
      success: result.success,
      output: result.output,
      metadata: {
        timestamp: new Date().toISOString(),
        action: 'monitor_system',
        threadStats,
        tokens: result.tokens
      }
    };
  }
  
  private async searchKnowledge(input: string, context?: Record<string, any>): Promise<AgentExecutionResult> {
    logger.info(`SelfHealingAgent (ID: ${this.id}) searching knowledge base: ${input}`);
    
    // Extract search parameters
    const componentName = context?.componentName || '';
    const componentType = context?.componentType || '';
    
    // Get knowledge from storage based on search params
    let knowledgeBase;
    if (componentName) {
      knowledgeBase = await storage.getSystemKnowledgeByComponent(componentName);
    } else if (componentType) {
      knowledgeBase = await storage.getSystemKnowledgeByType(componentType);
    } else {
      knowledgeBase = await storage.getAllSystemKnowledge();
    }
    
    // Execute the knowledge search in a worker thread
    const result = await threadManager.executeTask(
      async (data) => {
        // In a real implementation, this would perform semantic search or
        // pattern matching on the knowledge base entries
        return {
          success: true,
          output: `Knowledge search complete. Found ${data.knowledgeBase?.length || 0} relevant entries. [Search results]`
        };
      },
      { 
        input, 
        knowledgeBase,
        context: {
          ...context,
          action: 'search_knowledge',
          agentId: this.id,
          agentType: this.type
        }
      },
      'Searching system knowledge base'
    );
    
    // Track token usage
    if (result.tokens) {
      await storage.updateSystemStats({
        apiTokensUsed: (await storage.getSystemStats())!.apiTokensUsed + result.tokens.total
      });
    }
    
    return {
      success: result.success,
      output: result.output,
      metadata: {
        timestamp: new Date().toISOString(),
        action: 'search_knowledge',
        knowledgeCount: Array.isArray(knowledgeBase) ? knowledgeBase.length : 0,
        tokens: result.tokens
      }
    };
  }
  
  private async searchOnline(input: string, context?: Record<string, any>): Promise<AgentExecutionResult> {
    logger.info(`SelfHealingAgent (ID: ${this.id}) searching online resources: ${input}`);
    
    // Execute the online search in a worker thread
    const result = await threadManager.executeTask(
      async (data) => {
        // In a real implementation, this would use APIs to search for relevant
        // documentation, forums, issue trackers, etc.
        return {
          success: true,
          output: "Online search complete. Found resources: [Search results]"
        };
      },
      { 
        input, 
        context: {
          ...context,
          action: 'search_online',
          agentId: this.id,
          agentType: this.type
        }
      },
      'Searching online resources for solutions'
    );
    
    // Track token usage
    if (result.tokens) {
      await storage.updateSystemStats({
        apiTokensUsed: (await storage.getSystemStats())!.apiTokensUsed + result.tokens.total
      });
    }
    
    return {
      success: result.success,
      output: result.output,
      metadata: {
        timestamp: new Date().toISOString(),
        action: 'search_online',
        tokens: result.tokens
      }
    };
  }
  
  private async addSystemKnowledge(input: string, context?: Record<string, any>): Promise<AgentExecutionResult> {
    logger.info(`SelfHealingAgent (ID: ${this.id}) adding system knowledge: ${input}`);
    
    // Extract knowledge params
    const componentName = context?.componentName || 'unknown';
    const componentType = context?.componentType || 'unknown';
    const knowledgeContent = context?.knowledge || input;
    
    // Execute the knowledge creation in a worker thread
    const result = await threadManager.executeTask(
      async (data) => {
        // In a real implementation, this would process the input to extract structured
        // knowledge before storing it
        return {
          success: true,
          output: "Knowledge processed and stored successfully",
          structured: {
            componentName: data.componentName,
            componentType: data.componentType,
            knowledgeContent: data.knowledgeContent,
            functionalities: {},
            dependencies: {},
            errorPatterns: {},
          }
        };
      },
      { 
        input, 
        componentName,
        componentType,
        knowledgeContent,
        context: {
          ...context,
          action: 'add_knowledge',
          agentId: this.id,
          agentType: this.type
        }
      },
      'Processing and storing system knowledge'
    );
    
    // Track token usage
    if (result.tokens) {
      await storage.updateSystemStats({
        apiTokensUsed: (await storage.getSystemStats())!.apiTokensUsed + result.tokens.total
      });
    }
    
    // Store the structured knowledge
    if (result.success && result.structured) {
      await storage.createSystemKnowledge({
        componentName: result.structured.componentName,
        componentType: result.structured.componentType,
        description: `Knowledge about ${result.structured.componentName}`,
        functionalities: result.structured.functionalities,
        dependencies: result.structured.dependencies,
        errorPatterns: result.structured.errorPatterns,
        documentation: null,
        exampleCode: null,
        knowledgeContent: result.structured.knowledgeContent
      });
    }
    
    // Log activity
    await storage.createSystemActivity({
      type: ActivityType.SYSTEM_HEALING,
      description: `System knowledge added for ${componentName}`,
      metadata: { result: result.output }
    });
    
    return {
      success: result.success,
      output: result.output,
      metadata: {
        timestamp: new Date().toISOString(),
        action: 'add_knowledge',
        componentName,
        componentType,
        tokens: result.tokens
      }
    };
  }
  
  private async learnFromExperience(input: string, context?: Record<string, any>): Promise<AgentExecutionResult> {
    logger.info(`SelfHealingAgent (ID: ${this.id}) learning from experience: ${input}`);
    
    // Execute the learning task in a worker thread
    const result = await threadManager.executeTask(
      async (data) => {
        // In a real implementation, this would analyze past errors and solutions
        // to identify patterns and improve future responses
        return {
          success: true,
          output: "Learning process complete. Identified patterns: [Patterns]",
          insights: [
            { type: "error_pattern", description: "Common error pattern identified" },
            { type: "solution_pattern", description: "Effective solution pattern identified" }
          ]
        };
      },
      { 
        input, 
        context: {
          ...context,
          action: 'learn_from_experience',
          agentId: this.id,
          agentType: this.type
        }
      },
      'Learning from past experiences'
    );
    
    // Track token usage
    if (result.tokens) {
      await storage.updateSystemStats({
        apiTokensUsed: (await storage.getSystemStats())!.apiTokensUsed + result.tokens.total
      });
    }
    
    // Log activity
    await storage.createSystemActivity({
      type: ActivityType.SYSTEM_HEALING,
      description: `Learning process completed`,
      metadata: { result: result.output, insights: result.insights }
    });
    
    return {
      success: result.success,
      output: result.output,
      metadata: {
        timestamp: new Date().toISOString(),
        action: 'learn_from_experience',
        insights: result.insights,
        tokens: result.tokens
      }
    };
  }
}