
import { UserTier, COST_POLICY, ProviderConfig } from './orchestrationConfig';

export interface CostPolicyConfig {
  monthlyBudgetLimit: number;
  freeTierMaxCostPerRequest: number;
  proTierMaxCostPerRequest: number;
}

export interface AIRequestOptions {
  userTier: UserTier;
  costSensitivity?: 'low' | 'medium' | 'high';
  priority?: 'speed' | 'quality' | 'cost' | 'balanced';
  monthlyTokenUsage?: number;
}

class CostOptimizer {
  private config: CostPolicyConfig = COST_POLICY;

  applyCostPolicy(providers: ProviderConfig[], options: AIRequestOptions): ProviderConfig[] {
    let filtered = providers.filter(p => p.allowedTiers.includes(options.userTier));

    // 1. Budget Protection
    if (options.monthlyTokenUsage && options.monthlyTokenUsage > this.config.monthlyBudgetLimit * 1000000) {
      console.warn("[CostOptimizer] Monthly budget threshold crossed. Favoring low-cost models.");
      // In a real system, we might adjust weights here, but for filtering:
      const medianCost = this.getMedianCost(filtered);
      filtered = filtered.filter(p => p.costPer1kTokens <= medianCost);
    }

    // 2. Tier-based Cost Caps
    if (options.userTier === UserTier.FREE) {
      filtered = filtered.filter(p => p.costPer1kTokens <= this.config.freeTierMaxCostPerRequest);
    } else if (options.userTier === UserTier.PRO) {
      filtered = filtered.filter(p => p.costPer1kTokens <= this.config.proTierMaxCostPerRequest);
    }

    // 3. Cost Sensitivity
    if (options.costSensitivity === 'high') {
      const minCost = Math.min(...filtered.map(p => p.costPer1kTokens));
      // Keep only providers within 20% of the minimum cost
      filtered = filtered.filter(p => p.costPer1kTokens <= minCost * 1.2);
    }

    // 4. Priority Overrides
    if (options.priority === 'quality') {
      // Ensure we don't filter out high-quality models unless they violate hard tier caps
      // This is more about weighting in the ranking engine, but we can ensure at least one high-quality model remains
    }

    console.log(`[CostOptimizer] Filtered ${providers.length} -> ${filtered.length} providers for tier ${options.userTier}`);
    return filtered;
  }

  private getMedianCost(providers: ProviderConfig[]): number {
    if (providers.length === 0) return 0;
    const costs = providers.map(p => p.costPer1kTokens).sort((a, b) => a - b);
    return costs[Math.floor(costs.length / 2)];
  }
}

export const costOptimizer = new CostOptimizer();
