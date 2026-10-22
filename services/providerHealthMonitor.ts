
import { HEALTH_THRESHOLD } from './orchestrationConfig';

export type ProviderStatus = "healthy" | "degraded" | "critical";

export interface ProviderHealth {
  successRate: number;
  avgLatency: number;
  failureCount: number;
  consecutiveFailures: number;
  validationFailures: number;
  streamingInterruptions: number;
  healthScore: number;
  status: ProviderStatus;
  lastUpdated: Date;
}

class ProviderHealthMonitor {
  private healthMap: Map<string, ProviderHealth> = new Map();
  private requestHistory: Map<string, { success: boolean; latency: number; validationError?: boolean; streamingError?: boolean }[]> = new Map();
  private readonly WINDOW_SIZE = 100;

  getHealth(providerId: string): ProviderHealth {
    if (!this.healthMap.has(providerId)) {
      this.healthMap.set(providerId, {
        successRate: 1.0,
        avgLatency: 0,
        failureCount: 0,
        consecutiveFailures: 0,
        validationFailures: 0,
        streamingInterruptions: 0,
        healthScore: 100,
        status: "healthy",
        lastUpdated: new Date(),
      });
    }
    return this.healthMap.get(providerId)!;
  }

  recordMetrics(providerId: string, success: boolean, latency: number, options?: { validationError?: boolean; streamingError?: boolean }) {
    const history = this.requestHistory.get(providerId) || [];
    history.push({ success, latency, ...options });
    if (history.length > this.WINDOW_SIZE) {
      history.shift();
    }
    this.requestHistory.set(providerId, history);

    const health = this.getHealth(providerId);
    
    // Update metrics based on history
    const successfulRequests = history.filter(h => h.success).length;
    health.successRate = successfulRequests / history.length;
    health.avgLatency = history.reduce((acc, h) => acc + h.latency, 0) / history.length;
    
    if (options?.validationError) health.validationFailures++;
    if (options?.streamingError) health.streamingInterruptions++;

    // Update failure counts
    if (!success) {
      health.failureCount++;
      health.consecutiveFailures++;
    } else {
      health.consecutiveFailures = 0;
    }

    // Calculate health score
    // healthScore = (successRateWeight × successRate) - (latencyPenalty × avgLatency) - (failurePenalty × failureCount)
    const successRateWeight = 100;
    const latencyPenalty = 0.05; // 50ms = 2.5 points penalty
    const failurePenalty = 5;
    const validationPenalty = 2;
    const streamingPenalty = 5;

    health.healthScore = Math.max(0, 
      (successRateWeight * health.successRate) - 
      (latencyPenalty * health.avgLatency) - 
      (failurePenalty * health.consecutiveFailures) -
      (validationPenalty * health.validationFailures) -
      (streamingPenalty * health.streamingInterruptions)
    );

    // Update status based on thresholds
    if (health.successRate < HEALTH_THRESHOLD.DEGRADED_SUCCESS_RATE || health.consecutiveFailures >= 1) {
      health.status = "degraded";
    }
    if (health.consecutiveFailures >= HEALTH_THRESHOLD.CRITICAL_CONSECUTIVE_FAILURES) {
      health.status = "critical";
    }
    if (health.successRate >= HEALTH_THRESHOLD.DEGRADED_SUCCESS_RATE && health.consecutiveFailures === 0) {
      health.status = "healthy";
    }

    health.lastUpdated = new Date();
    this.healthMap.set(providerId, health);

    console.log(`[HealthMonitor] Updated ${providerId}: Score=${health.healthScore.toFixed(2)}, Status=${health.status}`);
  }

  isAvailable(providerId: string): boolean {
    const health = this.getHealth(providerId);
    return health.status !== "critical";
  }
}

export const healthMonitor = new ProviderHealthMonitor();
