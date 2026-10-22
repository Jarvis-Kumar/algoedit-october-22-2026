
export type StudioTab = 
  | 'edit' 
  | 'generate-image' 
  | 'style-transfer-image' 
  | 'edit-video'
  | 'generate-video' 
  | 'style-transfer-video'
  | 'batch-edit'
  | 'ideation'
  | 'writing-assistant'
  | 'automation'
  | 'wallpaper'
  | 'interior'
  | 'poster-automation'
  | 'neural-editing';

export type Page =
  | 'home'
  | 'pricing'
  | 'signin'
  | 'studio' 
  | 'features-overview'
  | 'why-choose-us'
  | 'token-system'
  | 'growth-dashboard'
  | 'public-showcase'
  | 'creator-profile'
  | 'creator-leaderboard'
  | 'team-management'
  | 'ai-models'
  | 'possibilities'
  | 'ultra-fast-processing'
  | 'r2-storage'
  | 'razorpay-billing'
  | 'email-testing'
  | 'data-request'
  | 'terms-and-conditions'
  | 'legal-center'
  | 'legal'
  | 'privacy-policy'
  | 'cookie-policy'
  | 'security-policy'
  | 'copyright-policy'
  | 'refund-policy'
  | 'digital-license'
  | 'acceptable-use'
  | 'community-guidelines'
  | 'ai-usage-policy'
  | 'creator-guidelines';

export type FeaturePageId = 
  | 'home-main'
  | 'explore'
  | 'projects'
  | 'ai-models'
  | 'possibilities'
  | 'ultra-fast-processing'
  | 'pro-effects'
  | 'fun-effects'
  | 'photo-effects'
  | 'ai-tools'
  | 'app-page'
  | 'api-page'
  | 'image-studio'
  | 'video-studio'
  | 'avatar-studio'
  | 'shorts-studio'
  | 'ai-creator-suite'
  | 'ai-image-generator'
  | 'ai-video-generator'
  | 'ai-editing-suite'
  | 'ai-design-studio'
  | 'ai-thumbnail-maker'
  | 'ai-template-hub'
  | 'adaptive-design'
  | 'interactive-editing'
  | 'ai-education-suite'
  | 'ai-tutor'
  | 'homework-helper'
  | 'diagram-creator'
  | 'quiz-generator'
  | 'visual-learning'
  | 'ai-model-hub'
  | 'all-ai-models'
  | 'image-creator'
  | 'video-creator'
  | 'image-editor'
  | 'effects-studio'
  | 'lora-studio'
  | 'face-swap'
  | 'background-remover'
  | 'green-screen'
  | 'sketch-to-image'
  | 'image-upscaler'
  | 'photo-restoration'
  | 'photo-colorizer'
  | 'magic-eraser'
  | 'image-expand'
  | 'object-replace'
  | 'canvas-expand'
  | 'prompt-builder'
  | 'product-studio'
  | 'logo-creator'
  | 'interior-designer'
  | 'character-creator'
  | 'anime-creator'
  | 'pixel-studio'
  | 'cinematic-fx'
  | 'light-studio'
  | 'world-builder'
  | 'scene-creator'
  | 'landscape-studio'
  | 'motion-fx'
  | 'video-enhancer'
  | 'video-upscaler'
  | 'lip-sync-studio'
  | 'voice-clone'
  | 'voice-generator'
  | 'speech-transcriber'
  | 'thumbnail-creator'
  | 'poster-creator'
  | 'social-studio'
  | 'background-creator'
  | 'depth-creator'
  | '3d-creator'
  | 'animation-studio'
  | 'smart-reframe'
  | 'my-projects'
  | 'my-templates'
  | 'favorites'
  | 'image-generator'
  | 'background-remover-image'
  | 'object-remover-image'
  | 'image-enhancer'
  | 'upscale-2k'
  | 'upscale-4k'
  | 'style-transfer'
  | 'replace-background'
  | 'replace-object'
  | 'face-restore-image'
  | 'color-correction'
  | 'lighting-fix'
  | 'anime-convert'
  | 'sketch-to-photo'
  | 'pencil-sketch-convert'
  | 'batch-edit'
  | 'ideation'
  | 'video-generator'
  | 'video-editor'
  | 'video-background-removal'
  | 'video-upscale'
  | 'slow-motion'
  | 'speed-ramp'
  | 'lip-sync-fix'
  | 'motion-retarget'
  | 'video-color-grade'
  | 'video-cleanup'
  | 'style-transfer-video'
  | 'writing-assistant'
  | 'contextual-optimization'
  | 'intelligent-rephrasing'
  | 'style-adaptation'
  | 'multi-language-edit'
  | 'talking-avatar'
  | 'lip-sync-avatar'
  | '3d-avatar-maker'
  | 'cartoon-avatar'
  | 'corporate-avatar'
  | 'auto-shorts-maker'
  | 'auto-caption-generator'
  | 'tiktok-style-edits'
  | 'reels-enhancer'
  | 'shorts-cut-detection'
  | 'ai-gta-filter'
  | 'ai-jojo-filter'
  | 'comic-filter'
  | 'neon-filter'
  | 'pixel-filter'
  | 'manga-shadows'
  | 'glitch-fx'
  | 'image-restore'
  | 'video-restore'
  | 'noise-removal'
  | 'denoiser-remaster'
  | 'super-resolution'
  | 'multi-model-render'
  | '4k-video-generator'
  | 'ultra-enhance'
  | 'raw-image-processor'
  | 'cartoonify'
  | 'old-age-filter'
  | 'baby-filter'
  | 'zombie-filter'
  | 'cartoon-video'
  | 'ai-dance-generator'
  | 'anime-video-enhancer'
  | 'music-beat-sync'
  | 'bollywood-style'
  | 'hollywood-cinematic'
  | 'vaporwave'
  | 'retro-vhs'
  | 'meme-generator'
  | 'sticker-maker'
  | 'comic-panel-generator'
  | 'prompt-to-image'
  | 'concept-art'
  | 'logo-generator'
  | 'poster-creator'
  | 'prompt-to-video'
  | 'scene-generator'
  | 'character-animation'
  | 'talking-portrait'
  | 'realistic'
  | 'anime'
  | '3d'
  | 'watercolor'
  | 'oil-painting'
  | 'anime-character'
  | 'game-character'
  | 'mascot-character'
  | '3d-character'
  | 'image-to-animation-gen'
  | 'video-to-animation-gen'
  | 'motion-animation'
  | 'digital-dance'
  | 'background-remover-util'
  | 'upscaler-util'
  | 'enhancer-util'
  | 'denoiser-util'
  | 'face-restore-util'
  | 'text-clean-up'
  | 'subtitle-remover'
  | 'object-remover-util'
  | 'image-to-animation-util'
  | 'video-to-animation-util'
  | 'workspace-creations'
  | 'workspace-projects'
  | 'workspace-history'
  | 'workspace-settings'
  | 'account-profile'
  | 'account-billing'
  | 'account-upgrade'
  | 'account-tokens'
  | 'video-batch-editor'
  | 'automation-studio'
  | 'poster-automation'
  | 'neural-editing'
  | 'movie-studio'
  | 'agent-labs'
  | 'innovation-hub'
  | 'wallpaper-generator'
  | 'interior-redesign'
  | 'smart-draw-to-edit'
  | 'public-showcase'
  | 'creator-leaderboard'
  | 'creator-profile'
  | 'growth-dashboard'
  | 'team-management';

export interface PreloadedAssetState {
    sourceImageUrl?: string;
    styleImageUrl?: string;
    prompt?: string;
    batchImages?: string[];
    sourceVideoUrl?: string;
    styleVideoUrl?: string;
    batchVideos?: string[];
    initialText?: string;
    videoLength?: string;
    resolution?: string;
    aspectRatio?: AspectRatio;
    [key: string]: any;
}

export type AspectRatio = "1:1" | "16:9" | "9:16" | "4:3" | "3:4";

export interface GenerateImageResult {
    url: string;
    alt: string;
}

export type UserPlan = 'creator' | 'pro' | 'enterprise';

export interface Member {
  id: string;
  name: string;
  email: string;
  role: ProjectRole;
  avatarUrl?: string;
}

export type ProjectRole = 'Owner' | 'Admin' | 'Editor' | 'Viewer' | 'Head' | 'Team Member';

export interface Organization {
  id: string;
  name: string;
  ownerId: string;
  workspaces: string[]; // IDs
}

export interface Workspace {
  id: string;
  orgId: string;
  name: string;
  projects: string[]; // IDs
  members: { userId: string; role: ProjectRole; isBetterPerformer?: boolean }[];
}

export interface ProjectVersion {
  id: string;
  projectId: string;
  versionNumber: number;
  timestamp: number;
  authorId: string;
  authorName: string;
  changeSummary: string;
  state: any; // Complete design state snapshot
}

export interface ActivityLog {
  id: string;
  projectId: string;
  userId: string;
  userName: string;
  timestamp: number;
  type: 'edit' | 'generate' | 'restore' | 'comment' | 'join' | 'leave';
  elementId?: string;
  description: string;
  beforeState?: any;
  afterState?: any;
}

export interface CollaboratorPresence {
  userId: string;
  userName: string;
  cursor: { x: number; y: number };
  activeElementId?: string;
  lastActive: number;
  color: string;
}

export interface Team {
  id: string;
  name: string;
  members: Member[];
}

export interface Project {
  id: string;
  workspaceId: string;
  name: string;
  lastUpdate: string;
  members: Member[];
  versionHistory: ProjectVersion[];
  activityLogs: ActivityLog[];
  currentState: any;
  assets?: Asset[];
  status?: 'active' | 'draft' | 'archived';
  thumbnail?: string;
  createdAt?: number;
  updatedAt?: number;
  ownerId?: string;
}

export interface Template {
  id: string;
  name: string;
  ownerId: string;
  toolId: string;
  config: any;
  createdAt: number;
}

export interface Favorite {
  id: string;
  itemId: string;
  type: 'tool' | 'project' | 'template' | 'model';
  userId: string;
  createdAt: number;
}

export interface Asset {
  id: number;
  name: string;
  type: 'image' | 'video' | 'preset' | 'document';
  size: number; 
  createdAt: number; 
  url: string; 
}

export type CreatorTier = 'Explorer' | 'Creator' | 'Pro' | 'Visionary';

export interface Notification {
  id: string;
  title: string;
  desc: string;
  time: string;
  icon: 'zap' | 'sparkles' | 'user' | 'bell';
  read: boolean;
}

export interface User {
  uid?: string;
  name: string;
  email: string;
  username?: string;
  picture: string;
  notifications?: Notification[];
  tokens: number;
  walletBalanceUSD: number;
  bonusesReceived?: {
    signup?: boolean;
    referral?: boolean;
    foundingMember?: boolean;
  };
  achievements?: Achievement[];
  referralCode?: string;
  referralCount?: number;
  shareCount?: number;
  streakCount?: number;
  lastActiveDate?: string;
  personalityInsights?: string;
  userTier?: UserPlan;
  creatorTier?: CreatorTier;
  paypalSubscriptionId?: string;
  subscriptionStatus?: string;
  subscriptionPlan?: string;
  creditBalance?: number;
  creatorLevel?: number;
  creatorExp?: number;
  followers?: string[]; // array of emails
  following?: string[]; // array of emails
  preferences?: {
    theme: 'dark' | 'light' | 'amoled';
    notifications: boolean;
    privacy: 'public' | 'private';
    language: string;
  };
  stats?: {
    totalGenerations: number;
    totalProjects: number;
    stylesUsed: string[];
    totalLikes: number;
    totalViews: number;
  };
  joinedAt?: number;
  bio?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
  savedCard?: {
    cardBrand: string;
    lastFour: string;
    expDate: string;
    cardholderName: string;
    country: string;
    zip: string;
  };
  consentEnabled?: boolean;
}

export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    unlockedAt: number;
    category: 'usage' | 'social' | 'quality';
}

export interface GrowthMetric {
    label: string;
    value: string | number;
    change: number; // percentage
    trend: 'up' | 'down' | 'neutral';
}

export interface AiCreatedStyle {
  id: number;
  url:string;
  prompt: string;
  createdAt: number;
}

export interface ImageAdjustments {
  brightness: number;
  contrast: number;
  saturate: number;
  blur: number;
  rotate: number;
  filter: 'none' | 'grayscale' | 'sepia' | 'invert';
}

export interface VideoAdjustments {
  brightness: number;
  contrast: number;
  saturate: number;
  filter: 'none' | 'grayscale' | 'sepia' | 'invert';
}

export interface AuthorProfile {
  name: string;
  profileUrl: string;
  avatarUrl: string;
  followers: number;
  totalPresets: number;
  location: string;
  status: string;
  bio: string;
  email: string;
}

export type PresetType = 'Image Style' | 'Video Filter' | 'Color Grade' | 'Sound Effect' | 'Animation' | 'Effect' | 'Texture' | 'LUT' | 'Lighting' | 'Motion';
export type PresetUseCase = 'Editing' | 'Design' | 'Animation' | 'Audio Production' | 'General' | '3D Rendering';
export type PresetLicense = 'Personal Use' | 'Commercial Use' | 'Premium License';
export type ModelSource = 'Stability AI' | 'Runway' | 'Kling' | 'Midjourney' | 'Google Veo' | 'Polo AI';
export type Currency = 'INR' | 'USD';


export interface MarketplaceItem {
  id: number;
  name: string;
  author: AuthorProfile;
  description: string;
  imageUrl: string;
  type: 'preset' | 'effect';
  presetType?: PresetType;
  useCase?: PresetUseCase;
  tags?: string[];
  price?: number; 
  priceINR?: number; 
  priceUSD?: number; 
  license?: PresetLicense;
  rating?: number;
  downloads?: number;
  fileUrl?: string; 
  isStock?: boolean; 
  modelSource?: ModelSource;
}

export interface Review {
  id: number;
  username: string;
  rating: number;
  comment: string;
}

export interface PresetAsset {
  url: string;
  prompt: string;
  modelSource: ModelSource;
  presetType: PresetType;
  mediaType: 'image' | 'video';
}

export type TransactionType = 'signup_bonus' | 'purchase' | 'usage' | 'referral_bonus';

export interface TokenTransaction {
  id: number;
  timestamp: string;
  type: TransactionType;
  amount: number;
  description: string;
  balanceAfter: number;
}

export interface PresetTransaction {
  id: number;
  presetId: number;
  presetName: string;
  buyerId: string;
  creatorId: string;
  amount: number;
  currency: Currency;
  platformFee: number;
  creatorEarnings: number;
  timestamp: string;
}

export type OnNavigateType = (page: Page | FeaturePageId, arg1?: any, arg2?: any) => void;

export interface WritingOptions {
    tone?: string;
    audience?: string;
    intent?: string;
    creativityLevel?: 'low' | 'balanced' | 'high';
    styleMode?: string;
    targetLanguage?: string;
    sensitivityMode?: boolean;
}

export interface WritingSuggestion {
    original: string;
    suggestion: string;
    explanation: string;
    type: 'redundancy' | 'logic' | 'consistency' | 'tone' | 'grammar';
}

export interface WritingAnalysis {
    sentiment: string;
    emotionalTone: string;
    readabilityScore: number;
    suggestions: WritingSuggestion[];
}

export interface AdvancedWritingResult {
    text: string;
    analysis: WritingAnalysis;
}

export interface AutomationTask {
    id: string;
    type: 'filler-removal' | 'silence-removal' | 'eye-contact' | 'face-smoothing' | 'green-screen' | 'rough-cut' | 'b-roll' | 'scene-detection' | 'short-form' | 'captioning' | 'reframing' | 'batch-process' | 'workflow-macro' | 'style-memory' | 'smart-resize' | 'prompt-edit' | 'copilot-suggestion';
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress: number;
    result?: any;
}

export interface WorkflowMacro {
  id: string;
  name: string;
  description: string;
  steps: AutomationTask['type'][];
  createdAt: number;
}

export interface BrandStyle {
  id: string;
  name: string;
  colors: string[];
  typography: string;
  layoutStyle: string;
  logoUrl?: string;
}

export interface AutomationStudioState {
    tasks: AutomationTask[];
    timeline: TimelineClip[];
    brollSuggestions: BrollSuggestion[];
    captions: CaptionSegment[];
    macros: WorkflowMacro[];
    brandStyles: BrandStyle[];
    activeMacroId?: string;
    isRecording: boolean;
    recordedSteps: AutomationTask['type'][];
}
export interface TimelineClip {
    id: string;
    startTime: number;
    endTime: number;
    sourceUrl: string;
    importance: number;
    emotion?: string;
    transcript?: string;
}

export interface BrollSuggestion {
    id: string;
    timestamp: number;
    keyword: string;
    suggestedUrl: string;
    type: 'video' | 'image' | 'graphic';
}

export interface CaptionSegment {
    id: string;
    startTime: number;
    endTime: number;
    text: string;
    speaker?: string;
}

export interface AutomationStudioState {
    tasks: AutomationTask[];
    timeline: TimelineClip[];
    brollSuggestions: BrollSuggestion[];
    captions: CaptionSegment[];
}

export interface WallpaperVariation {
    id: string;
    url: string;
    vibe: string;
    seed: number;
}

export interface InteriorStyle {
    id: string;
    name: string;
    description: string;
    previewUrl?: string;
}

export interface ShoppableItem {
    id: string;
    category: string;
    label: string;
    link: string;
    price?: string;
}

export interface InteriorDesignState {
    originalImageUrl: string;
    redesignedImageUrl?: string;
    selectedStyle?: string;
    shoppableItems: ShoppableItem[];
    history: { role: 'user' | 'model', text: string }[];
}
