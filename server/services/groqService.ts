import axios from 'axios';
import { logger } from '../utils/logger';
import { LLMRequestParams, LLMResponse } from './llmService';

class GroqService {
  private apiKey: string | undefined;
  private baseUrl: string = 'https://api.groq.com/openai/v1';
  private model: string = 'llama-3.3-70b-versatile';

  constructor() {
    // Get API key from environment variables
    this.apiKey = process.env.GROQ_API_KEY;
    
    if (!this.apiKey) {
      logger.warn('GROQ_API_KEY environment variable is not set. Groq LLM service will not work.');
    } else {
      logger.info('Groq LLM service initialized');
    }
  }

  async callLLM(params: LLMRequestParams): Promise<LLMResponse> {
    try {
      if (!this.apiKey) {
        throw new Error('GROQ_API_KEY environment variable is not set. Please set it to use Groq services.');
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

      // Make request to Groq API
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
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
          inputTokens: result.usage.prompt_tokens,
          outputTokens: result.usage.completion_tokens,
          totalTokens: result.usage.total_tokens
        }
      };

      return llmResponse;
    } catch (error) {
      // Log the error details
      if (axios.isAxiosError(error)) {
        logger.error(`Groq API error: ${error.message}`);
        if (error.response) {
          logger.error(`Response status: ${error.response.status}`);
          logger.error(`Response data: ${JSON.stringify(error.response.data)}`);
        }
      } else {
        logger.error(`Groq service error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      
      // Rethrow for handling upstream
      throw error;
    }
  }
}

// Create singleton instance
export const groqService = new GroqService();