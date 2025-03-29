import axios from 'axios';
import { GroqService, groqService } from '../services/groqService';
import { PhidataService, phidataService } from '../services/phidataService';
import { storage } from '../storage';
import { ActivityType } from '@shared/schema';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock the storage implementation
jest.mock('../storage', () => ({
  storage: {
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

describe('LLM Services Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GroqService', () => {
    test('should initialize with correct properties', () => {
      expect(groqService).toBeInstanceOf(GroqService);
    });

    test('should call LLM and process response', async () => {
      // Mock axios response
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          choices: [
            {
              message: {
                content: 'This is a test response from Groq API'
              }
            }
          ],
          usage: {
            prompt_tokens: 10,
            completion_tokens: 20,
            total_tokens: 30
          }
        }
      });

      const result = await groqService.callLLM({
        prompt: 'Test prompt',
        system: 'You are a helpful assistant'
      });

      // Verify axios was called correctly
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          messages: [
            { role: 'system', content: 'You are a helpful assistant' },
            { role: 'user', content: 'Test prompt' }
          ],
          model: expect.any(String)
        }),
        expect.any(Object)
      );

      // Verify result
      expect(result.text).toBe('This is a test response from Groq API');
      expect(result.usage).toEqual({
        inputTokens: 10,
        outputTokens: 20,
        totalTokens: 30
      });

      // Verify storage calls
      expect(storage.createSystemActivity).toHaveBeenCalledWith(
        expect.objectContaining({
          type: ActivityType.API_CALL,
          description: 'Groq API call'
        })
      );

      expect(storage.updateSystemStats).toHaveBeenCalledWith(
        expect.objectContaining({
          apiTokensUsed: 30
        })
      );
    });

    test('should handle errors', async () => {
      // Mock axios error
      const error = new Error('API error');
      mockedAxios.post.mockRejectedValueOnce(error);

      // Expect the call to throw
      await expect(groqService.callLLM({ prompt: 'Test prompt' })).rejects.toThrow();

      // Verify error logging
      expect(storage.createSystemActivity).toHaveBeenCalledWith(
        expect.objectContaining({
          type: ActivityType.SYSTEM_ERROR,
          description: 'Groq API error'
        })
      );
    });
  });

  describe('PhidataService', () => {
    test('should initialize with correct properties', () => {
      expect(phidataService).toBeInstanceOf(PhidataService);
    });

    test('should call LLM and process response', async () => {
      // Mock axios response
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          choices: [
            {
              message: {
                content: 'This is a test response from Phidata API'
              }
            }
          ],
          usage: {
            prompt_tokens: 15,
            completion_tokens: 25,
            total_tokens: 40
          }
        }
      });

      const result = await phidataService.callLLM({
        prompt: 'Test prompt for Phidata',
        temperature: 0.5
      });

      // Verify axios was called correctly
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          messages: [
            { role: 'user', content: 'Test prompt for Phidata' }
          ],
          temperature: 0.5,
          model: expect.any(String)
        }),
        expect.any(Object)
      );

      // Verify result
      expect(result.text).toBe('This is a test response from Phidata API');
      expect(result.usage).toEqual({
        inputTokens: 15,
        outputTokens: 25,
        totalTokens: 40
      });

      // Verify storage calls
      expect(storage.createSystemActivity).toHaveBeenCalledWith(
        expect.objectContaining({
          type: ActivityType.API_CALL,
          description: 'Phidata API call'
        })
      );
    });

    test('should handle errors', async () => {
      // Mock axios error
      const error = new Error('API error');
      mockedAxios.post.mockRejectedValueOnce(error);

      // Expect the call to throw
      await expect(phidataService.callLLM({ prompt: 'Test prompt' })).rejects.toThrow();

      // Verify error logging
      expect(storage.createSystemActivity).toHaveBeenCalledWith(
        expect.objectContaining({
          type: ActivityType.SYSTEM_ERROR,
          description: 'Phidata API error'
        })
      );
    });
  });
});
