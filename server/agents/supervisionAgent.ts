import { AgentBase, AgentExecutionResult } from './agentBase';
import { AgentType, AgentStatus } from '@shared/schema';
import { storage } from '../storage';
import { logger } from '../utils/logger';

interface SupervisionParams {
  taskId?: number;
  projectId?: number;
  analysisType: 'requirements' | 'coordination' | 'review' | 'planning';
}

export class SupervisionAgent extends AgentBase {
  constructor(id: number) {
    super(id, 'Supervision Agent', AgentType.SUPERVISION);
  }

  // Get the methods this agent can perform
  getMethods(): string[] {
    return [
      'analyzeRequirements',
      'coordinateAgents',
      'reviewProgress',
      'createProjectPlan'
    ];
  }

  // Main processing method
  async process(input: string, context?: Record<string, any>): Promise<AgentExecutionResult> {
    try {
      await this.logActivity('Processing supervision task', { input: input.substring(0, 100) });
      
      // Parse the input to determine the supervision task
      if (input.includes('requirements') || input.includes('analyze')) {
        return this.analyzeRequirements(input, context);
      } else if (input.includes('coordinate') || input.includes('manage')) {
        return this.coordinateAgents(input, context);
      } else if (input.includes('review') || input.includes('evaluate')) {
        return this.reviewProgress(input, context);
      } else {
        // Default to project planning
        return this.createProjectPlan(input, context);
      }
    } catch (error) {
      logger.error(`Supervision agent error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return {
        success: false,
        output: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred in Supervision Agent'
      };
    }
  }

  // Analyze project requirements
  private async analyzeRequirements(input: string, context?: Record<string, any>): Promise<AgentExecutionResult> {
    try {
      await this.logActivity('Analyzing requirements');
      
      // Set status to observing since we're analyzing
      await this.setStatus(AgentStatus.OBSERVING);
      
      // Import the LLM service
      const { llmService } = await import('../services/llmService');
      
      // Create a system prompt for the LLM
      const systemPrompt = `You are a requirements analysis AI assistant that helps identify and clarify software requirements.
      Analyze the user's request and identify:
      1. Functional requirements
      2. Non-functional requirements
      3. Technical constraints
      4. Potential ambiguities or missing information
      5. Recommended clarifying questions
      
      Provide a comprehensive analysis in a structured format.`;
      
      // Call the LLM service
      const llmResponse = await llmService.callLLM({
        prompt: input,
        system: systemPrompt,
        temperature: 0.5,
        maxTokens: 1500
      });
      
      // Return the result
      return {
        success: true,
        output: llmResponse.text,
        tokens: {
          input: llmResponse.usage.inputTokens,
          output: llmResponse.usage.outputTokens,
          total: llmResponse.usage.totalTokens
        }
      };
    } catch (error) {
      // Log the error
      logger.error(`Error in analyzeRequirements: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // Return error result
      return {
        success: false,
        output: 'Failed to analyze requirements due to an error.',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    } finally {
      // Set status back to idle when complete
      await this.setStatus(AgentStatus.IDLE);
    }
  }

  // Coordinate other agents
  private async coordinateAgents(input: string, context?: Record<string, any>): Promise<AgentExecutionResult> {
    try {
      await this.logActivity('Coordinating agents');
      
      // Get all agents to coordinate
      const agents = await storage.getAllAgents();
      
      // Import the LLM service
      const { llmService } = await import('../services/llmService');
      
      // Create a system prompt for the LLM
      const systemPrompt = `You are a coordination AI assistant that helps orchestrate multiple specialized agents.
      The following agents are available:
      ${agents.map(a => `- ${a.name} (${a.type}): Status=${a.status}`).join('\n')}
      
      Based on the user's request, determine which agents should be activated and in what sequence.
      Consider dependencies between tasks and the current status of each agent.
      Provide a detailed coordination plan with clear reasoning.`;
      
      // Call the LLM service
      const llmResponse = await llmService.callLLM({
        prompt: input,
        system: systemPrompt,
        temperature: 0.4,
        maxTokens: 1000
      });
      
      // Return the result
      return {
        success: true,
        output: llmResponse.text,
        tokens: {
          input: llmResponse.usage.inputTokens,
          output: llmResponse.usage.outputTokens,
          total: llmResponse.usage.totalTokens
        }
      };
    } catch (error) {
      // Log the error
      logger.error(`Error in coordinateAgents: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // Return error result
      return {
        success: false,
        output: 'Failed to coordinate agents due to an error.',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    } finally {
      // Set status back to idle when complete
      await this.setStatus(AgentStatus.IDLE);
    }
  }

  // Review progress
  private async reviewProgress(input: string, context?: Record<string, any>): Promise<AgentExecutionResult> {
    try {
      await this.logActivity('Reviewing progress');
      
      // Get the latest system activities to review progress
      const recentActivities = await storage.getRecentSystemActivities(20);
      
      // Import the LLM service
      const { llmService } = await import('../services/llmService');
      
      // Create a system prompt for the LLM
      const systemPrompt = `You are a progress monitoring AI assistant that helps track and evaluate project progress.
      The following are the most recent system activities:
      ${recentActivities.map(a => `- ${new Date(a.createdAt || new Date()).toISOString()}: ${a.description}`).join('\n')}
      
      Based on these activities and the user's input, provide an assessment of:
      1. Current progress status
      2. Potential bottlenecks or issues
      3. Recommendations for next steps
      
      Be objective and provide actionable insights.`;
      
      // Call the LLM service
      const llmResponse = await llmService.callLLM({
        prompt: input,
        system: systemPrompt,
        temperature: 0.3,
        maxTokens: 1200
      });
      
      // Return the result
      return {
        success: true,
        output: llmResponse.text,
        tokens: {
          input: llmResponse.usage.inputTokens,
          output: llmResponse.usage.outputTokens,
          total: llmResponse.usage.totalTokens
        }
      };
    } catch (error) {
      // Log the error
      logger.error(`Error in reviewProgress: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // Return error result
      return {
        success: false,
        output: 'Failed to review progress due to an error.',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    } finally {
      // Set status back to idle when complete
      await this.setStatus(AgentStatus.IDLE);
    }
  }

  // Create project plan
  private async createProjectPlan(input: string, context?: Record<string, any>): Promise<AgentExecutionResult> {
    try {
      await this.logActivity('Creating project plan');
      
      // Import the LLM service
      const { llmService } = await import('../services/llmService');
      
      // Create a system prompt for the LLM
      const systemPrompt = `You are a project management AI assistant that helps create detailed project plans for software development. 
      Analyze the user's request and break it down into well-defined tasks, milestones, and implementation details.
      Structure your response in a clear, organized manner with sections for:
      1. Project Overview
      2. Requirements Analysis
      3. Technical Architecture
      4. Implementation Plan
      5. Timeline and Milestones
      
      Be specific and detailed in your recommendations.`;
      
      // Call the LLM service
      const llmResponse = await llmService.callLLM({
        prompt: input,
        system: systemPrompt,
        temperature: 0.7,
        maxTokens: 2000
      });
      
      // Return the result
      return {
        success: true,
        output: llmResponse.text,
        tokens: {
          input: llmResponse.usage.inputTokens,
          output: llmResponse.usage.outputTokens,
          total: llmResponse.usage.totalTokens
        }
      };
    } catch (error) {
      // Log the error
      logger.error(`Error in createProjectPlan: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // Return error result
      return {
        success: false,
        output: 'Failed to create project plan due to an error.',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    } finally {
      // Set status back to idle when complete
      await this.setStatus(AgentStatus.IDLE);
    }
  }
}
