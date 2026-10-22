
import { ProviderConfig, UserTier } from './orchestrationConfig';
import { costOptimizer, AIRequestOptions } from './costOptimizer';
import { rankingEngine } from './providerRankingEngine';
import { healthMonitor } from './providerHealthMonitor';

// Provider Registry
const PROVIDER_REGISTRY: ProviderConfig[] = [
  {
    id: 'stable-diffusion',
    name: 'Stability Diffusion Core',
    baseUrl: 'https://api.stability.ai/v1',
    costPer1kTokens: 0.01,
    qualityScore: 92,
    taskCompatibility: { 'image_generation': 95, 'image_editing': 90 },
    supportsStreaming: false,
    allowedTiers: [UserTier.FREE, UserTier.PRO, UserTier.ENTERPRISE]
  },
  {
    id: 'flux',
    name: 'Pro Imaging Engine',
    baseUrl: 'https://api.flux.ai/v1',
    costPer1kTokens: 0.02,
    qualityScore: 96,
    taskCompatibility: { 'image_generation': 98 },
    supportsStreaming: false,
    allowedTiers: [UserTier.PRO, UserTier.ENTERPRISE]
  },
  {
    id: 'dalle-3',
    name: 'Creative Canvas AI',
    baseUrl: 'https://api.openai.com/v1',
    costPer1kTokens: 0.04,
    qualityScore: 94,
    taskCompatibility: { 'image_generation': 95 },
    supportsStreaming: false,
    allowedTiers: [UserTier.PRO, UserTier.ENTERPRISE]
  },
  {
    id: 'realesrgan',
    name: 'Neural Upscaler',
    baseUrl: 'https://api.replicate.com/v1',
    costPer1kTokens: 0.005,
    qualityScore: 90,
    taskCompatibility: { 'upscale': 98 },
    supportsStreaming: false,
    allowedTiers: [UserTier.FREE, UserTier.PRO, UserTier.ENTERPRISE]
  },
  {
    id: 'gfpgan',
    name: 'Portrait Restorer',
    baseUrl: 'https://api.replicate.com/v1',
    costPer1kTokens: 0.005,
    qualityScore: 90,
    taskCompatibility: { 'face_restore': 98 },
    supportsStreaming: false,
    allowedTiers: [UserTier.FREE, UserTier.PRO, UserTier.ENTERPRISE]
  },
  {
    id: 'sam',
    name: 'Intelligent Segmenter',
    baseUrl: 'https://api.replicate.com/v1',
    costPer1kTokens: 0.002,
    qualityScore: 95,
    taskCompatibility: { 'background_removal': 98 },
    supportsStreaming: false,
    allowedTiers: [UserTier.FREE, UserTier.PRO, UserTier.ENTERPRISE]
  },
  {
    id: 'runway',
    name: 'Motion Studio Pro',
    baseUrl: 'https://api.runwayml.com/v1',
    costPer1kTokens: 0.05,
    qualityScore: 95,
    taskCompatibility: { 'video_generation': 98, 'video_editing': 95 },
    supportsStreaming: false,
    allowedTiers: [UserTier.PRO, UserTier.ENTERPRISE]
  },
  {
    id: 'pika',
    name: 'Cinematic Flow AI',
    baseUrl: 'https://api.pika.art/v1',
    costPer1kTokens: 0.04,
    qualityScore: 92,
    taskCompatibility: { 'video_generation': 94 },
    supportsStreaming: false,
    allowedTiers: [UserTier.PRO, UserTier.ENTERPRISE]
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Google Gemini 1.5 Flash',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    costPer1kTokens: 0.000075,
    qualityScore: 98,
    taskCompatibility: { 'text': 99, 'analysis': 99, 'prompt_expansion': 99 },
    supportsStreaming: true,
    allowedTiers: [UserTier.FREE, UserTier.PRO, UserTier.ENTERPRISE]
  },
  {
    id: 'deepseek-v3',
    name: 'DeepSeek V3 (Reasoning & Code)',
    baseUrl: 'https://openrouter.ai/api/v1',
    costPer1kTokens: 0.00014,
    qualityScore: 96,
    taskCompatibility: { 'text': 95, 'analysis': 94 },
    supportsStreaming: true,
    allowedTiers: [UserTier.FREE, UserTier.PRO, UserTier.ENTERPRISE]
  },
  {
    id: 'deepseek-v4',
    name: 'DeepSeek R1/V4 (Advanced Reasoning)',
    baseUrl: 'https://openrouter.ai/api/v1',
    costPer1kTokens: 0.0023,
    qualityScore: 99,
    taskCompatibility: { 'text': 99, 'analysis': 98 },
    supportsStreaming: true,
    allowedTiers: [UserTier.PRO, UserTier.ENTERPRISE]
  }
];

export class ModelRouter {
  selectModel(taskType: string, userPreference?: string): string {
    if (taskType === "image_generation") {
      if (userPreference === "realistic") return "stable-diffusion";
      if (userPreference === "artistic") return "flux";
      if (userPreference === "safe") return "dalle-3";
      if (userPreference === "fast") return "stable-diffusion";
      return "stable-diffusion";
    }

    if (taskType === "video_generation") return "runway";
    if (taskType === "video_editing") return "runway";
    if (taskType === "face_restore") return "gfpgan";
    if (taskType === "upscale") return "realesrgan";
    if (taskType === "background_removal") return "sam";
    
    // Default text, analysis, and reasoning tasks to Gemini 1.5 Flash for optimum performance & efficiency
    if (taskType === "text" || taskType === "analysis" || taskType === "prompt_expansion") {
      return "gemini-1.5-flash";
    }

    return "gemini-1.5-flash";
  }

  route(taskType: string, options: AIRequestOptions): ProviderConfig {
    console.log(`[ModelRouter] Routing request for ${taskType}...`);
    
    // Use selectModel logic if intent is provided in options
    const preferredId = this.selectModel(taskType, (options as any).userPreference);
    const preferred = PROVIDER_REGISTRY.find(p => p.id === preferredId);
    
    if (preferred && healthMonitor.isAvailable(preferred.id)) {
      console.log(`[ModelRouter] Selected preferred ${preferred.id} based on intent`);
      return preferred;
    }

    // Fallback to standard routing
    const eligibleProviders = costOptimizer.applyCostPolicy(PROVIDER_REGISTRY, options);
    
    if (eligibleProviders.length === 0) {
      throw new Error("No eligible providers found for the given criteria.");
    }

    // 2. Rank based on performance, reliability, cost, and quality
    const ranked = rankingEngine.rankProviders(eligibleProviders, taskType);
    
    if (ranked.length === 0) {
      throw new Error("All eligible providers are currently unhealthy.");
    }

    const best = ranked[0];
    console.log(`[ModelRouter] Selected ${best.provider.id} (Score: ${best.score.finalScore.toFixed(2)})`);
    
    return best.provider;
  }

  getAllProviders(): ProviderConfig[] {
    return PROVIDER_REGISTRY;
  }
}

export const modelRouter = new ModelRouter();
