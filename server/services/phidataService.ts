import axios from 'axios';
import { logger } from '../utils/logger';
import { LLMRequestParams, LLMResponse } from './llmService';

class PhiDataService {
  private apiKey: string | undefined;
  private baseUrl: string = 'https://api.phidata.com/v1';
  private model: string = 'claude-3-5-sonnet';

  constructor() {
    // Get API key from environment variables
    this.apiKey = process.env.PHIDATA_API_KEY;
    
    if (!this.apiKey) {
      logger.warn('PHIDATA_API_KEY environment variable is not set. Phidata LLM service will not work.');
    } else {
      logger.info('Phidata LLM service initialized');
    }
  }

  async callLLM(params: LLMRequestParams): Promise<LLMResponse> {
    try {
      if (!this.apiKey) {
        throw new Error('PHIDATA_API_KEY environment variable is not set. Please set it to use Phidata services.');
      }

      // Prepare messages array
      const messages = [];
      
      // Add system message if provided
      if (params.system) {
        messages.push({
          role: 'system',
          content: params.system
        });
      }
      
      // Add user message (the prompt)
      messages.push({
        role: 'user',
        content: params.prompt
      });

      // Make request to Phidata API
      const response = await axios.post(
        `${this.baseUrl}/completions`,
        {
          model: this.model,
          messages: messages,
          temperature: params.temperature || 0.7,
          max_tokens: params.maxTokens || 1024,
          top_p: params.topP || 1.0,
          stop: params.stopSequences || null
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Extract and format the response
      const result = response.data;
      const llmResponse: LLMResponse = {
        text: result.choices[0].message.content,
        usage: {
          inputTokens: result.usage.prompt_tokens || 0,
          outputTokens: result.usage.completion_tokens || 0,
          totalTokens: result.usage.total_tokens || 0
        }
      };

      return llmResponse;
    } catch (error) {
      // Log the error details
      if (axios.isAxiosError(error)) {
        logger.error(`Phidata API error: ${error.message}`);
        if (error.response) {
          logger.error(`Response status: ${error.response.status}`);
          logger.error(`Response data: ${JSON.stringify(error.response.data)}`);
        }
      } else {
        logger.error(`Phidata service error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      
      // Rethrow for handling upstream
      throw error;
    }
  }
}

// Create singleton instance
export const phidataService = new PhiDataService();