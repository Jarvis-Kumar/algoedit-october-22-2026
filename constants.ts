
import { AspectRatio, UserPlan } from './types';
import { TokenPricing } from './services/tokenPricingConfig';

export const STRIPE_PUBLISHABLE_KEY = 'pk_test_51SL2HZGyE50mhpXRAMXKbxXyytcy5iCoeowqe89V4FLhXjBccOwJwkDadZ7P2hhottvvKRoky0gvUlSGohx08sAo00vECsIeHR';
export const GOOGLE_CLIENT_ID = '217465651095-9ja1u5qrlljbj958elvsv16e71a0sllr.apps.googleusercontent.com';

export const NUM_FRAMES_FOR_EDIT = 5;

export const ASPECT_RATIOS: AspectRatio[] = ["1:1", "16:9", "9:16", "4:3", "3:4"];

export const STORAGE_LIMITS: Record<UserPlan, number> = {
    creator: 15 * 1024 * 1024 * 1024,   
    pro: 100 * 1024 * 1024 * 1024,    
    enterprise: 1024 * 1024 * 1024 * 1024 
};

export const POLO_AI_TOKEN_COSTS = {
    'Stability AI': 8,
    'Midjourney': 10,
    'Runway': 20,
    'Kling': 22,
    'Google Veo': 25,
    'Polo AI': 12,
};

export const SIGNUP_BONUS_TOKENS = 30; // 30 tokens welcome bonus
export const REFERRAL_BONUS_TOKENS = 30; // Increased from 25


export const AI_TOKEN_COSTS = {
    IMAGE_GENERATION: TokenPricing.features.imageGeneration,
    IMAGE_EDIT: TokenPricing.features.imageEdit,
    IMAGE_STYLE_TRANSFER: TokenPricing.features.imageStyleTransfer,
    VIDEO_GENERATION: TokenPricing.features.videoGeneration,
    VIDEO_STYLE_TRANSFER: TokenPricing.features.videoStyleTransfer,
    VIDEO_EDIT: TokenPricing.features.videoEdit,
    IDEATION: TokenPricing.features.ideation,
    BATCH_EDIT_PER_IMAGE: TokenPricing.features.batchEditPerFile,
    DATASET_GENERATION: TokenPricing.features.datasetGeneration,
    AUTO_VERSIONING_PER_IMAGE: TokenPricing.features.autoVersioningPerFile,
    TEXT_OPTIMIZATION: TokenPricing.features.textOptimization,
    TEXT_REPHRASE: TokenPricing.features.textRephrase,
    STYLE_ADAPTATION: TokenPricing.features.styleAdaptation,
    MULTI_LANGUAGE_EDIT: TokenPricing.features.multiLanguageEdit,
};
