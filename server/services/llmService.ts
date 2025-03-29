import { groqService } from './groqService';
import { phidataService } from './phidataService';
import { logger } from '../utils/logger';

// LLM Provider type
export enum LLMProvider {
  GROQ = 'groq',
  PHIDATA = 'phidata'
}

// Interface for LLM request parameters
export interface LLMRequestParams {
  prompt: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  stopSequences?: string[];
  system?: string;
  provider?: LLMProvider;
}

// Interface for LLM response
export interface LLMResponse {
  text: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
}

// LLM service abstraction
export class LLMService {
  private defaultProvider: LLMProvider;

  constructor() {
    // Set default provider
    this.defaultProvider = LLMProvider.GROQ;
    logger.info(`LLM service initialized with default provider: ${this.defaultProvider}`);
  }

  // Call the appropriate LLM service based on provider
  async callLLM(params: LLMRequestParams): Promise<LLMResponse> {
    try {
      const provider = params.provider || this.defaultProvider;
      
      // Call the appropriate service
      if (provider === LLMProvider.GROQ) {
        return await groqService.callLLM(params);
      } else if (provider === LLMProvider.PHIDATA) {
        return await phidataService.callLLM(params);
      } else {
        throw new Error(`Unsupported LLM provider: ${provider}`);
      }
    } catch (error) {
      logger.error(`LLM service error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  // Switch default provider
  setDefaultProvider(provider: LLMProvider) {
    this.defaultProvider = provider;
    logger.info(`Default LLM provider changed to: ${provider}`);
  }

  // Get currently configured default provider
  getDefaultProvider(): LLMProvider {
    return this.defaultProvider;
  }
}

// Create singleton instance
export const llmService = new LLMService();