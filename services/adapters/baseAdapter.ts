
import { ProviderConfig, UserTier } from '../orchestrationConfig';

export interface AIRequest {
  prompt: string;
  taskType: "text" | "image" | "video" | "analysis";
  priority: "speed" | "quality" | "cost" | "balanced";
  userTier: "free" | "pro" | "enterprise" | UserTier;
  costSensitivity?: "low" | "medium" | "high";
  input?: any;
  stream?: boolean;
  base64ImageData?: string;
  maskData?: string;
  mimeType?: string;
  aspectRatio?: string;
}

export interface AIResponse {
  text: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
  };
}

export abstract class BaseProviderAdapter {
  constructor(protected config: ProviderConfig) {}

  abstract execute(request: AIRequest): Promise<AIResponse>;
}
