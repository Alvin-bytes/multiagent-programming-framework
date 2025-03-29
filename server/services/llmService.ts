import { logger } from '../utils/logger';
import axios from 'axios';

export enum LLMProvider {
  GROQ = 'groq',
  PHIDATA = 'phidata'
}

export interface LLMRequestParams {
  prompt: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  stopSequences?: string[];
  system?: string;
  provider?: LLMProvider;
  skipCache?: boolean; // Optional parameter to skip cache for this request
}

export interface LLMResponse {
  text: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  cached?: boolean; // Flag to indicate if response was from cache
}

interface CacheEntry {
  response: LLMResponse;
  timestamp: number;
  expiresAt: number;
}

export class LLMService {
  private defaultProvider: LLMProvider;
  private cache: Map<string, CacheEntry>;
  private cacheTTL: number; // Time-to-live in milliseconds
  private maxCacheSize: number;
  private cacheHits: number;
  private cacheMisses: number;
  private requestsInFlight: Map<string, Promise<LLMResponse>>;

  constructor() {
    this.defaultProvider = process.env.GROQ_API_KEY 
      ? LLMProvider.GROQ 
      : (process.env.PHIDATA_API_KEY ? LLMProvider.PHIDATA : LLMProvider.GROQ);
    this.cache = new Map();
    this.cacheTTL = 5 * 60 * 1000; // Default 5 minutes
    this.maxCacheSize = 100; // Default 100 entries
    this.cacheHits = 0;
    this.cacheMisses = 0;
    this.requestsInFlight = new Map();
    
    // Run periodic cache cleanup
    setInterval(() => this.pruneCache(), 60000); // Clean every minute
    
    logger.info(`LLM Service initialized with default provider: ${this.defaultProvider}`);
  }

  private generateCacheKey(params: LLMRequestParams): string {
    // Create a deterministic key based on request parameters
    const { prompt, temperature = 0.7, maxTokens, topP, stopSequences, system, provider } = params;
    
    const key = JSON.stringify({
      prompt,
      temperature,
      maxTokens,
      topP,
      stopSequences,
      system,
      provider: provider || this.defaultProvider
    });
    
    return key;
  }

  private pruneCache(): void {
    const now = Date.now();
    let expiredCount = 0;
    
    // Remove expired entries
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt < now) {
        this.cache.delete(key);
        expiredCount++;
      }
    }
    
    // If still over max size, remove oldest entries
    if (this.cache.size > this.maxCacheSize) {
      const entriesToDelete = this.cache.size - this.maxCacheSize;
      const entries = Array.from(this.cache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp)
        .slice(0, entriesToDelete);
      
      for (const [key] of entries) {
        this.cache.delete(key);
      }
      
      logger.debug(`Pruned cache: ${expiredCount} expired entries and ${entriesToDelete} oldest entries removed`);
    } else if (expiredCount > 0) {
      logger.debug(`Pruned cache: ${expiredCount} expired entries removed`);
    }
  }

  async callLLM(params: LLMRequestParams): Promise<LLMResponse> {
    // Skip cache if explicitly requested
    if (params.skipCache) {
      return this._fetchFromProvider(params);
    }
    
    const cacheKey = this.generateCacheKey(params);
    
    // Check if we have a cached response
    const cachedEntry = this.cache.get(cacheKey);
    if (cachedEntry && cachedEntry.expiresAt > Date.now()) {
      this.cacheHits++;
      logger.debug(`LLM cache hit: ${params.prompt.substring(0, 30)}...`);
      
      // Return cached response with cached flag
      return {
        ...cachedEntry.response,
        cached: true
      };
    }
    
    // If there's already a request in flight for this key, wait for it
    if (this.requestsInFlight.has(cacheKey)) {
      logger.debug(`Reusing in-flight LLM request: ${params.prompt.substring(0, 30)}...`);
      return this.requestsInFlight.get(cacheKey)!;
    }
    
    // Record cache miss
    this.cacheMisses++;
    
    // Create a new request and store the promise
    const requestPromise = this._fetchFromProvider(params)
      .then(response => {
        // Cache the response
        const now = Date.now();
        this.cache.set(cacheKey, {
          response,
          timestamp: now,
          expiresAt: now + this.cacheTTL
        });
        
        // Prune cache if needed
        if (this.cache.size > this.maxCacheSize) {
          this.pruneCache();
        }
        
        // Remove from in-flight requests
        this.requestsInFlight.delete(cacheKey);
        
        return response;
      })
      .catch(error => {
        // Remove from in-flight requests on error too
        this.requestsInFlight.delete(cacheKey);
        throw error;
      });
    
    // Store the promise for potential reuse
    this.requestsInFlight.set(cacheKey, requestPromise);
    
    return requestPromise;
  }

  private async _fetchFromProvider(params: LLMRequestParams): Promise<LLMResponse> {
    const provider = params.provider || this.defaultProvider;
    
    try {
      logger.debug(`Fetching LLM response from ${provider}: ${params.prompt.substring(0, 30)}...`);
      
      // Choose the appropriate provider
      switch (provider) {
        case LLMProvider.GROQ:
          // TODO: Implement Groq API
          // Use Groq's client to make the request
          return {
            text: `Response from Groq (${params.prompt.substring(0, 20)}...)`,
            usage: {
              inputTokens: params.prompt.length / 4,  // Approximation
              outputTokens: 50,  // Placeholder
              totalTokens: params.prompt.length / 4 + 50
            }
          };
        
        case LLMProvider.PHIDATA:
          // TODO: Implement Phidata API
          // Use Phidata's client to make the request
          return {
            text: `Response from Phidata (${params.prompt.substring(0, 20)}...)`,
            usage: {
              inputTokens: params.prompt.length / 4,  // Approximation
              outputTokens: 50,  // Placeholder
              totalTokens: params.prompt.length / 4 + 50
            }
          };
          
        default:
          throw new Error(`Unsupported LLM provider: ${provider}`);
      }
    } catch (error) {
      logger.error(`Error calling LLM provider ${provider}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  clearCache(): void {
    this.cache.clear();
    this.cacheHits = 0;
    this.cacheMisses = 0;
    logger.info('LLM cache cleared');
  }
  
  setCacheSettings(ttlInSeconds: number, maxSize?: number): void {
    this.cacheTTL = ttlInSeconds * 1000;
    
    if (maxSize !== undefined) {
      this.maxCacheSize = maxSize;
    }
    
    logger.info(`LLM cache settings updated: TTL=${ttlInSeconds}s, maxSize=${this.maxCacheSize}`);
    
    // Prune cache with new settings
    this.pruneCache();
  }
  
  getCacheMetrics(): { size: number, hitRate: number } {
    const totalRequests = this.cacheHits + this.cacheMisses;
    const hitRate = totalRequests > 0 ? this.cacheHits / totalRequests : 0;
    
    return {
      size: this.cache.size,
      hitRate
    };
  }
  
  setDefaultProvider(provider: LLMProvider) {
    this.defaultProvider = provider;
    logger.info(`Default LLM provider set to: ${provider}`);
  }
  
  getDefaultProvider(): LLMProvider {
    return this.defaultProvider;
  }
}

export const llmService = new LLMService();