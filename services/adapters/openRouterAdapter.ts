import { BaseProviderAdapter, AIRequest, AIResponse } from './baseAdapter';
import { config } from '../config';
import crypto from 'crypto';
import { Redis } from 'ioredis';

// Usage Analytics tracking structure
export interface OpenRouterAnalytics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  cacheHits: number;
  totalPromptTokens: number;
  totalCompletionTokens: number;
  averageLatencyMs: number;
  latencySamplesCount: number;
}

export const openRouterAnalytics: OpenRouterAnalytics = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  cacheHits: 0,
  totalPromptTokens: 0,
  totalCompletionTokens: 0,
  averageLatencyMs: 0,
  latencySamplesCount: 0,
};

export class OpenRouterAdapter extends BaseProviderAdapter {
  private static activeRequests = new Map<string, Promise<AIResponse>>();
  private redisClient: Redis | null = null;

  constructor(config: any) {
    super(config);
    
    // Connect to Upstash Redis if URL is set & configured
    if (config.redis?.url && !config.redis?.useMockRedis) {
      try {
        this.redisClient = new Redis(config.redis.url);
        this.redisClient.on('error', (err) => {
          console.error('[OpenRouterAdapter] Redis cache error:', err);
        });
      } catch (err) {
        console.error('[OpenRouterAdapter] Failed to initialize Redis cache client:', err);
      }
    }
  }

  /**
   * Helper to hash properties for caching and request deduplication keys
   */
  private generateRequestKey(request: AIRequest): string {
    const rawString = JSON.stringify({
      prompt: request.prompt,
      systemInstruction: request.input?.systemInstruction || '',
      taskType: request.taskType,
      modelId: this.config.id,
      inputOptions: request.input?.options || ''
    });
    return crypto.createHash('sha256').update(rawString).digest('hex');
  }

  /**
   * Safe retrieval from cache
   */
  private async getCachedResponse(key: string): Promise<AIResponse | null> {
    const cacheKey = `openrouter:cache:${key}`;
    try {
      if (this.redisClient) {
        const cached = await this.redisClient.get(cacheKey);
        if (cached) {
          openRouterAnalytics.cacheHits++;
          return JSON.parse(cached);
        }
      } else {
        // Fallback to memory cache
        const globalCache = (globalThis as any).__openRouterMemoryCache || {};
        if (globalCache[key]) {
          const entry = globalCache[key];
          if (entry.expiresAt > Date.now()) {
            openRouterAnalytics.cacheHits++;
            return entry.response;
          } else {
            delete globalCache[key];
          }
        }
      }
    } catch (err) {
      console.warn('[OpenRouterAdapter] Cache retrieval error:', err);
    }
    return null;
  }

  /**
   * Safe save to cache
   */
  private async saveToCache(key: string, response: AIResponse): Promise<void> {
    const cacheKey = `openrouter:cache:${key}`;
    const TTL_SECONDS = 3600; // 1 hour
    try {
      if (this.redisClient) {
        await this.redisClient.setex(cacheKey, TTL_SECONDS, JSON.stringify(response));
      } else {
        // Fallback to memory cache
        if (!(globalThis as any).__openRouterMemoryCache) {
          (globalThis as any).__openRouterMemoryCache = {};
        }
        (globalThis as any).__openRouterMemoryCache[key] = {
          response,
          expiresAt: Date.now() + TTL_SECONDS * 1000
        };
      }
    } catch (err) {
      console.warn('[OpenRouterAdapter] Cache saving error:', err);
    }
  }

  async execute(request: AIRequest): Promise<AIResponse> {
    openRouterAnalytics.totalRequests++;
    
    const requestKey = this.generateRequestKey(request);

    // 1. Check Deduplication / In-flight list first
    if (OpenRouterAdapter.activeRequests.has(requestKey)) {
      console.log('[OpenRouterAdapter] Deduplicating identical request currently in-flight.');
      return OpenRouterAdapter.activeRequests.get(requestKey)!;
    }

    // 2. Wrap execution with deduplication promise
    const executionPromise = this.performExecute(request, requestKey);
    OpenRouterAdapter.activeRequests.set(requestKey, executionPromise);

    try {
      const response = await executionPromise;
      return response;
    } finally {
      OpenRouterAdapter.activeRequests.delete(requestKey);
    }
  }

  private async performExecute(request: AIRequest, requestKey: string): Promise<AIResponse> {
    // 3. Cache Check
    const cached = await this.getCachedResponse(requestKey);
    if (cached) {
      console.log('[OpenRouterAdapter] Cache Hit achieved for OpenRouter request.');
      return cached;
    }

    // 4. API Key Verification
    const openRouterKey = config.openrouter?.apiKey;
    if (!openRouterKey) {
      throw new Error('OPENROUTER_API_KEY is not configured.');
    }

    // 5. Select deepseek model mapping
    // DeepSeek V3 is "deepseek/deepseek-chat"
    // DeepSeek V4 (R1) is "deepseek/deepseek-r1"
    let modelId = 'deepseek/deepseek-chat';
    if (this.config.id === 'deepseek-v4') {
      modelId = 'deepseek/deepseek-r1';
    }

    console.log(`[OpenRouterAdapter] Submitting inquiry to OpenRouter model: ${modelId}`);

    const messages: any[] = [];
    
    // Inject systemInstruction if present
    if (request.input?.systemInstruction) {
      messages.push({
        role: 'system',
        content: request.input.systemInstruction
      });
    }

    messages.push({
      role: 'user',
      content: request.prompt
    });

    const startTime = Date.now();
    let attempts = 0;
    const maxAttempts = 3;
    let lastError: any = null;

    // Implement prompt content token caps / limits
    // We enforce max completion token limit here
    const maxTokens = request.input?.max_tokens || 4000;

    while (attempts < maxAttempts) {
      attempts++;
      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openRouterKey}`,
            'HTTP-Referer': 'https://ai.studio/build',
            'X-Title': 'AlgoEdit Media Studio',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: modelId,
            messages: messages,
            max_tokens: maxTokens,
            temperature: 0.7,
          })
        });

        if (!response.ok) {
          const textError = await response.text();
          throw new Error(`OpenRouter HTTP ${response.status}: ${textError}`);
        }

        const payload = await response.json() as any;
        const completionText = payload.choices?.[0]?.message?.content || '';
        const usage = payload.usage || { prompt_tokens: 0, completion_tokens: 0 };

        // Record Success analytics
        openRouterAnalytics.successfulRequests++;
        openRouterAnalytics.totalPromptTokens += usage.prompt_tokens;
        openRouterAnalytics.totalCompletionTokens += usage.completion_tokens;
        
        const latency = Date.now() - startTime;
        const count = openRouterAnalytics.latencySamplesCount;
        openRouterAnalytics.averageLatencyMs = 
          (openRouterAnalytics.averageLatencyMs * count + latency) / (count + 1);
        openRouterAnalytics.latencySamplesCount++;

        const responseObj: AIResponse = {
          text: completionText,
          usage: {
            prompt_tokens: usage.prompt_tokens,
            completion_tokens: usage.completion_tokens
          }
        };

        // 6. Save in cache
        await this.saveToCache(requestKey, responseObj);

        return responseObj;

      } catch (err: any) {
        lastError = err;
        console.warn(`[OpenRouterAdapter] Attempt ${attempts} failed:`, err.message);
        
        // Linear Wait / backoff limit handling
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
        }
      }
    }

    // Log the Failure
    openRouterAnalytics.failedRequests++;
    throw new Error(`OpenRouter failed after ${maxAttempts} attempts. Error: ${lastError?.message || 'unknown'}`);
  }
}
