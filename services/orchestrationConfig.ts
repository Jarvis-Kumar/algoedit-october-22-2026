
export enum UserTier {
  FREE = 'FREE',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE'
}

export interface ProviderConfig {
  id: string;
  name: string;
  baseUrl: string;
  costPer1kTokens: number;
  qualityScore: number; // 0-100
  taskCompatibility: Record<string, number>; // taskType -> score 0-100
  supportsStreaming: boolean;
  allowedTiers: UserTier[];
}

export interface OrchestrationWeights {
  performanceWeight: number;
  reliabilityWeight: number;
  costWeight: number;
  qualityWeight: number;
}

export const DEFAULT_WEIGHTS: OrchestrationWeights = {
  performanceWeight: 0.25,
  reliabilityWeight: 0.3,
  costWeight: 0.2,
  qualityWeight: 0.25,
};

export const HEALTH_THRESHOLD = {
  DEGRADED_SUCCESS_RATE: 0.9,
  CRITICAL_CONSECUTIVE_FAILURES: 3,
};

export const COST_POLICY = {
  monthlyBudgetLimit: 1000, // USD
  freeTierMaxCostPerRequest: 0.01,
  proTierMaxCostPerRequest: 0.05,
};
