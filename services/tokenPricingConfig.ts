
/**
 * Centralized Token Pricing Configuration
 * Rebalanced for advanced features and increased complexity.
 */

export const TokenPricing = {
  // Core AI Modules / Studios
  studios: {
    synthesize: {
      swift: 6,    // +1 (prev 5)
      pro: 10,     // +2 (prev 8)
      photo: 12,   // +2 (prev 10)
      cinematic: 27 // +2 (prev 25)
    },
    compose: {
      base: 6,     // +1 (prev 5)
      advanced: 9  // +2 (prev 7)
    },
    refine: {
      base: 4,     // +1 (prev 3)
      pro: 6       // +2 (prev 4)
    },
    style: {
      base: 5,     // +1 (prev 4)
      premium: 10  // +2 (prev 8)
    },
    automate: {
      base: 4,     // +1 (prev 3)
      batch: 17    // +2 (prev 15)
    },
    nexus: {
      base: 3      // +1 (prev 2)
    }
  },

  // Feature-specific costs (aligned with AI_TOKEN_COSTS in constants.ts)
  features: {
    imageGeneration: 6,        // +1
    imageEdit: 4,              // +1
    imageStyleTransfer: 5,     // +1
    videoGeneration: 27,       // +2
    videoStyleTransfer: 27,    // +2
    videoEdit: 17,             // +2
    ideation: 3,               // +1
    batchEditPerFile: 4,       // +1
    datasetGeneration: 6,      // +1
    autoVersioningPerFile: 3,  // +1
    textOptimization: 3,       // +1
    textRephrase: 2,           // +1
    styleAdaptation: 3,        // +1
    multiLanguageEdit: 4,      // +1
    writingAssistant: 6,       // +1
    imageEnhancer: 4,          // +1
    imageRestore: 6,           // +1
    auraFx: 10,                // +2 (prev 8)
    playground: 6,             // +1 (prev 5)
    lensEffects: 6,            // +1 (prev 5)
    videoUpscale: 17,          // +2 (prev 15)
    shortsMaker: 17,           // +2 (prev 15)
    captionEngine: 6,          // +1 (prev 5)
    gtaFilter: 10,             // +2 (prev 8)
    smartDrawToEdit: 10,
  }
};

// Helper to get cost based on model tier
export const getModelCost = (baseCost: number, tier: 'swift' | 'pro' | 'photo' | 'cinematic') => {
  const multipliers = {
    swift: 1,
    pro: 1.5,
    photo: 2,
    cinematic: 2
  };
  
  const cost = Math.round(baseCost * multipliers[tier]);
  
  // Ensure minimum increment of +1 or +2 as per requirement
  // This is a bit complex to enforce strictly via multiplier, 
  // so we'll rely on the baseCost being increased.
  return cost;
};
