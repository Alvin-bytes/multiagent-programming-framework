import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';
import { storage } from '../storage';
import { threadManager } from '../utils/threadManager';
import { AgentType, AgentStatus, ActivityType } from '@shared/schema';

export interface AgentExecutionResult {
  success: boolean;
  output: string;
  tokens?: {
    input: number;
    output: number;
    total: number;
  };
  error?: string;
  metadata?: Record<string, any>;
}

export abstract class AgentBase {
  id: number;
  name: string;
  type: AgentType;
  status: AgentStatus;
  isActive: boolean;

  constructor(id: number, name: string, type: AgentType) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.status = AgentStatus.STANDBY;
    this.isActive = true;
  }

  // Abstract methods that must be implemented by derived classes
  abstract process(input: string, context?: Record<string, any>): Promise<AgentExecutionResult>;
  abstract getMethods(): string[];

  // Set agent status
  async setStatus(status: AgentStatus): Promise<void> {
    const previousStatus = this.status;
    this.status = status;

    await storage.updateAgentStatus(this.id, status);
    
    // Log status change
    await storage.createSystemActivity({
      type: ActivityType.AGENT_STATUS_CHANGE,
      description: `Agent ${this.name} status changed from ${previousStatus} to ${status}`,
      metadata: { agentId: this.id, previousStatus, newStatus: status }
    });

    logger.info(`Agent ${this.name} status changed: ${previousStatus} -> ${status}`);
  }

  // Log agent activity
  async logActivity(message: string, metadata?: Record<string, any>): Promise<void> {
    const fullMetadata = {
      agentId: this.id,
      agentType: this.type,
      ...(metadata || {})
    };

    logger.debug(`[${this.name}] ${message}`);
    
    await storage.createSystemActivity({
      type: this.type,
      description: `[${this.name}] ${message}`,
      metadata: fullMetadata
    });
  }

  // Execute the agent in a separate thread
  async executeInThread(
    input: string, 
    context?: Record<string, any>
  ): Promise<AgentExecutionResult> {
    try {
      // First update status to active
      await this.setStatus(AgentStatus.ACTIVE);
      
      // Define the function to be executed in the worker thread
      const taskFunction = `
        async function(data) {
          const { input, context } = data;
          
          // This is a simplified version that would be replaced with actual LLM calls
          // in a real implementation that has access to the LLM APIs
          
          // Simulate processing time
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Return simulated result
          return {
            success: true,
            output: "Processed: " + input,
            tokens: {
              input: input.length,
              output: input.length * 2,
              total: input.length * 3
            },
            metadata: {
              timestamp: new Date().toISOString(),
              action: 'process'
            }
          };
        }
      `;
      
      // Execute in a separate thread
      const result = await threadManager.executeTask<AgentExecutionResult>(
        taskFunction,
        { input, context },
        `${this.name} processing: ${input.substring(0, 50)}${input.length > 50 ? '...' : ''}`
      );
      
      // Update API token usage in system stats
      if (result.tokens) {
        const currentStats = await storage.getSystemStats();
        if (currentStats) {
          await storage.updateSystemStats({
            apiTokensUsed: (currentStats.apiTokensUsed || 0) + result.tokens.total
          });
        }
      }
      
      // Set status back to idle
      await this.setStatus(AgentStatus.IDLE);
      
      return result;
    } catch (error) {
      // Set status to error
      await this.setStatus(AgentStatus.ERROR);
      
      // Log the error
      logger.error(`Error in ${this.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // Return error result
      return {
        success: false,
        output: '',
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          timestamp: new Date().toISOString(),
          action: 'error_handler',
          errorType: error instanceof Error ? error.constructor.name : 'Unknown'
        }
      };
    }
  }
}
