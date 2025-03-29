import { AgentBase, AgentExecutionResult } from './agentBase';
import { AgentType, AgentStatus } from '@shared/schema';
import { storage } from '../storage';
import { logger } from '../utils/logger';

interface DebugParams {
  code: string;
  language: string;
  errorMessage?: string;
  debugType: 'syntax' | 'runtime' | 'logic' | 'performance';
}

export class DebugAgent extends AgentBase {
  constructor(id: number) {
    super(id, 'Debug Agent', AgentType.DEBUG);
  }

  // Get the methods this agent can perform
  getMethods(): string[] {
    return [
      'findSyntaxErrors',
      'debugRuntimeErrors',
      'analyzeLogicIssues',
      'optimizePerformance',
      'securityAudit'
    ];
  }

  // Main processing method
  async process(input: string, context?: Record<string, any>): Promise<AgentExecutionResult> {
    try {
      await this.logActivity('Processing debug task', { input: input.substring(0, 100) });
      
      // Parse the input to determine the debug task
      if (input.includes('syntax') || input.includes('compile')) {
        return this.findSyntaxErrors(input, context);
      } else if (input.includes('runtime') || input.includes('exception')) {
        return this.debugRuntimeErrors(input, context);
      } else if (input.includes('logic') || input.includes('algorithm')) {
        return this.analyzeLogicIssues(input, context);
      } else if (input.includes('performance') || input.includes('optimize')) {
        return this.optimizePerformance(input, context);
      } else if (input.includes('security') || input.includes('vulnerability')) {
        return this.securityAudit(input, context);
      } else {
        // Default to general debug
        return this.debugRuntimeErrors(input, context);
      }
    } catch (error) {
      logger.error(`Debug agent error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return {
        success: false,
        output: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred in Debug Agent'
      };
    }
  }

  // Find syntax errors
  private async findSyntaxErrors(input: string, context?: Record<string, any>): Promise<AgentExecutionResult> {
    await this.logActivity('Finding syntax errors');
    return this.executeInThread(input, {
      ...context,
      debugTask: 'syntax'
    });
  }

  // Debug runtime errors
  private async debugRuntimeErrors(input: string, context?: Record<string, any>): Promise<AgentExecutionResult> {
    await this.logActivity('Debugging runtime errors');
    return this.executeInThread(input, {
      ...context,
      debugTask: 'runtime'
    });
  }

  // Analyze logic issues
  private async analyzeLogicIssues(input: string, context?: Record<string, any>): Promise<AgentExecutionResult> {
    await this.logActivity('Analyzing logic issues');
    return this.executeInThread(input, {
      ...context,
      debugTask: 'logic'
    });
  }

  // Optimize code performance
  private async optimizePerformance(input: string, context?: Record<string, any>): Promise<AgentExecutionResult> {
    await this.logActivity('Optimizing code performance');
    return this.executeInThread(input, {
      ...context,
      debugTask: 'performance'
    });
  }

  // Perform security audit
  private async securityAudit(input: string, context?: Record<string, any>): Promise<AgentExecutionResult> {
    await this.logActivity('Performing security audit');
    return this.executeInThread(input, {
      ...context,
      debugTask: 'security'
    });
  }
}
