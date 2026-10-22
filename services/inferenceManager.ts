
import { ProviderConfig, UserTier } from './orchestrationConfig';
import { modelRouter } from './modelRouter';
import { healthMonitor } from './providerHealthMonitor';
import { AIRequestOptions } from './costOptimizer';
import { AdapterFactory } from './adapters/adapterFactory';
import { AIRequest } from './adapters/baseAdapter';

export interface FailoverEvent {
  originalProvider: string;
  fallbackProvider: string;
  reason: string;
  timestamp: Date;
}

export interface InferenceResult {
  providerId: string;
  data: any;
  latency: number;
  attempts: number;
}

class InferenceManager {
  private readonly MAX_ATTEMPTS = 3;

  async runInference(taskType: "text" | "image" | "video" | "analysis", payload: any, options: AIRequestOptions): Promise<InferenceResult> {
    let attempts = 0;
    let lastError: Error | null = null;
    let currentProvider: ProviderConfig | null = null;

    while (attempts < this.MAX_ATTEMPTS) {
      attempts++;
      
      try {
        // 1. Route to best provider
        // Attempt 1: Get best initial provider
        // Attempt 2: Retry same provider (don't call route)
        // Attempt 3: Get next best provider (call route again)
        if (attempts === 1 || attempts === 3) {
          currentProvider = modelRouter.route(taskType, options);
        }
        
        if (!currentProvider) throw new Error("No provider selected");

        console.log(`[InferenceManager] Attempt ${attempts}: Using ${currentProvider.id}`);
        
        const startTime = Date.now();
        
        // 2. Execute via Adapter
        const adapter = AdapterFactory.createAdapter(currentProvider);
        const request: AIRequest = {
          prompt: payload.prompt || (typeof payload === 'string' ? payload : ''),
          taskType: taskType,
          priority: options.priority || 'balanced',
          userTier: options.userTier,
          costSensitivity: options.costSensitivity,
          input: payload,
          stream: false,
          base64ImageData: payload.base64ImageData,
          maskData: payload.maskData,
          mimeType: payload.mimeType,
          aspectRatio: payload.aspectRatio
        };

        const data = await adapter.execute(request);
        
        const latency = Date.now() - startTime;
        
        // 3. Record success
        healthMonitor.recordMetrics(currentProvider.id, true, latency);
        
        return {
          providerId: currentProvider.id,
          data,
          latency,
          attempts
        };

      } catch (error: any) {
        lastError = error;
        const latency = 0; 
        
        if (currentProvider) {
          console.error(`[InferenceManager] Attempt ${attempts} failed for ${currentProvider.id}: ${error.message}`);
          
          // 4. Record failure
          const isValidationError = error.message.includes('validation') || error.message.includes('schema');
          const isStreamingError = error.message.includes('stream') || error.message.includes('interrupted');
          
          healthMonitor.recordMetrics(currentProvider.id, false, latency, {
            validationError: isValidationError,
            streamingError: isStreamingError
          });
          
          // Log failover event if it's not the last attempt
          if (attempts < this.MAX_ATTEMPTS) {
            const nextProvider = this.peekNextProvider(taskType, options, currentProvider.id);
            this.logFailover({
              originalProvider: currentProvider.id,
              fallbackProvider: (attempts === 1) ? currentProvider.id : (nextProvider?.id || 'none'),
              reason: error.message,
              timestamp: new Date()
            });
          }
        }
        
        // Exponential backoff for retry
        if (attempts < this.MAX_ATTEMPTS) {
           await new Promise(resolve => setTimeout(resolve, 500 * attempts));
        }
      }
    }

    // 5. All attempts failed
    this.triggerAlert("CRITICAL_INFERENCE_FAILURE", { taskType, lastError: lastError?.message });
    throw new Error(`Inference failed after ${this.MAX_ATTEMPTS} attempts. Last error: ${lastError?.message}`);
  }

  private peekNextProvider(taskType: string, options: AIRequestOptions, currentId: string): ProviderConfig | null {
    try {
      // This is a bit hacky for a peek, but works for logging
      const providers = modelRouter.getAllProviders();
      const ranked = providers
        .filter(p => p.id !== currentId && healthMonitor.isAvailable(p.id))
        .map(p => p.id);
      return providers.find(p => p.id === ranked[0]) || null;
    } catch {
      return null;
    }
  }

  private logFailover(event: FailoverEvent) {
    console.warn(`[Failover] ${event.originalProvider} -> ${event.fallbackProvider} | Reason: ${event.reason}`);
  }

  private triggerAlert(type: string, data: any) {
    console.error(`[ALERT] ${type}:`, data);
    // In production, this would send to Sentry, Slack, PagerDuty, etc.
  }
}

export const inferenceManager = new InferenceManager();
