import { Worker } from 'worker_threads';
import { logger } from './logger';
import { storage } from '../storage';
import { ActivityType } from '@shared/schema';

// ThreadManager class for handling thread allocation and execution
export class ThreadManager {
  private maxThreads: number;
  private activeThreads: number;

  constructor() {
    // Get max threads from environment variable or use 8 as default
    this.maxThreads = parseInt(process.env.MAX_THREADS || '8', 10);
    this.activeThreads = 0;
    
    // Log initialization
    logger.info(`Thread manager initialized with ${this.maxThreads} max threads`);
  }

  // Execute a task in a worker thread
  async executeTask<T>(
    taskFunction: string,
    data: any,
    taskDescription: string
  ): Promise<T> {
    try {
      // Check if we can allocate a new thread
      if (this.activeThreads >= this.maxThreads) {
        logger.warn(`Thread limit reached: ${this.activeThreads}/${this.maxThreads}`);
        throw new Error('Thread limit reached. Try again later.');
      }

      // Increment active threads counter
      this.activeThreads++;
      
      // Log thread allocation
      logger.debug(`Allocating thread for ${taskDescription}. Active threads: ${this.activeThreads}/${this.maxThreads}`);
      
      // Update system stats
      await storage.updateSystemStats({ activeThreads: this.activeThreads });
      
      // Log system activity
      await storage.createSystemActivity({
        type: ActivityType.THREAD_ALLOCATION,
        description: `Thread allocated for: ${taskDescription}`,
        metadata: { activeThreads: this.activeThreads, maxThreads: this.maxThreads }
      });

      // Create a simple implementation that doesn't use threads for now
      // Just execute the function directly
      try {
        // For taskFunction that's a string containing function declaration,
        // we need to extract the function body and create a proper function
        const functionBody = taskFunction.trim();
        // Handle async function declarations properly
        if (functionBody.startsWith('async function')) {
          // Extract the function body between { and the last }
          const bodyStart = functionBody.indexOf('{') + 1;
          const bodyEnd = functionBody.lastIndexOf('}');
          if (bodyStart > 0 && bodyEnd > bodyStart) {
            const actualBody = functionBody.substring(bodyStart, bodyEnd);
            const evalFunction = new Function('data', `
              return (async function(data) {
                ${actualBody}
              })(data);
            `);
            const result = await evalFunction(data);
            return result as T;
          }
        }
        
        // Fallback to simpler evaluation for regular functions
        const evalFunction = new Function('data', `
          return (${taskFunction})(data);
        `);
        const result = await evalFunction(data);
        return result as T;
      } catch (error) {
        logger.error(`Function evaluation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        throw error;
      }
    } catch (error) {
      logger.error(`Thread execution error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    } finally {
      // Decrement active threads counter
      this.activeThreads--;
      
      // Update system stats
      await storage.updateSystemStats({ activeThreads: this.activeThreads });
      
      logger.debug(`Thread released. Active threads: ${this.activeThreads}/${this.maxThreads}`);
    }
  }

  // Get current thread usage statistics
  getThreadStats() {
    return {
      activeThreads: this.activeThreads,
      maxThreads: this.maxThreads,
      availableThreads: this.maxThreads - this.activeThreads
    };
  }

  // Clean up resources
  async shutdown() {
    try {
      // Nothing to clean up in this simplified implementation
      logger.info('Thread manager shut down successfully');
    } catch (error) {
      logger.error(`Error shutting down thread manager: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Create a singleton instance
export const threadManager = new ThreadManager();
