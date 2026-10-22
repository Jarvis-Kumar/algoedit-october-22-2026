
import { ProviderConfig, OrchestrationWeights, DEFAULT_WEIGHTS } from './orchestrationConfig';
import { healthMonitor, ProviderHealth } from './providerHealthMonitor';

export interface ProviderScore {
  performanceScore: number;
  reliabilityScore: number;
  costScore: number;
  qualityScore: number;
  finalScore: number;
}

export class ProviderRankingEngine {
  private weights: OrchestrationWeights = DEFAULT_WEIGHTS;

  setWeights(newWeights: Partial<OrchestrationWeights>) {
    this.weights = { ...this.weights, ...newWeights };
  }

  scoreProvider(provider: ProviderConfig, taskType: string): ProviderScore {
    const health = healthMonitor.getHealth(provider.id);

    // 1. Performance Score (based on latency)
    // Lower latency is better. Assume 2000ms is "slow" (0 score) and 100ms is "fast" (100 score)
    const performanceScore = Math.max(0, Math.min(100, 100 - (health.avgLatency / 20)));

    // 2. Reliability Score (based on success rate)
    const reliabilityScore = health.successRate * 100;

    // 3. Cost Score (lower cost is better)
    // Assume $0.10 per 1k is "expensive" (0 score) and $0.00 is "cheap" (100 score)
    const costScore = Math.max(0, Math.min(100, 100 - (provider.costPer1kTokens * 1000)));

    // 4. Quality Score (provider base quality + task compatibility)
    const compatibility = provider.taskCompatibility[taskType] || 50;
    const qualityScore = (provider.qualityScore * 0.7) + (compatibility * 0.3);

    // Final Score Calculation
    const finalScore = 
      (this.weights.performanceWeight * performanceScore) +
      (this.weights.reliabilityWeight * reliabilityScore) +
      (this.weights.costWeight * costScore) +
      (this.weights.qualityWeight * qualityScore);

    const score: ProviderScore = {
      performanceScore,
      reliabilityScore,
      costScore,
      qualityScore,
      finalScore
    };

    console.log(`[RankingEngine] Decision Log:`, {
      providerId: provider.id,
      taskType,
      metrics: {
        latency: health.avgLatency,
        successRate: health.successRate,
        cost: provider.costPer1kTokens,
        baseQuality: provider.qualityScore
      },
      scores: score,
      weights: this.weights
    });
    return score;
  }

  rankProviders(providers: ProviderConfig[], taskType: string): { provider: ProviderConfig; score: ProviderScore }[] {
    return providers
      .filter(p => healthMonitor.isAvailable(p.id))
      .map(p => ({
        provider: p,
        score: this.scoreProvider(p, taskType)
      }))
      .sort((a, b) => b.score.finalScore - a.score.finalScore);
  }
}

export const rankingEngine = new ProviderRankingEngine();
