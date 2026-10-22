
/**
 * Fal.ai API Service
 * Handles communication with the backend Fal.ai proxy.
 */

import { AspectRatio } from '../types';

export type FalModelId = 
  | 'fal-ai/flux/kontext'
  | 'fal-ai/flux/fill'
  | 'fal-ai/flux/dev/ip-adapter'
  | 'fal-ai/flux/pro'
  | 'fal-ai/flux/lora'
  | 'fal-ai/qwen/image-edit'
  | 'fal-ai/qwen/image-max'
  | 'fal-ai/seedream'
  | 'fal-ai/seedream/v4'
  | 'fal-ai/seedream/5.0-lite-edit'
  | 'fal-ai/nano-banana/pro'
  | 'fal-ai/nano-banana/2-edit'
  | 'fal-ai/firered/image-edit'
  | 'fal-ai/stable-diffusion'
  | 'fal-ai/sdxl'
  | 'fal-ai/controlnet'
  | 'fal-ai/ip-adapter'
  | 'fal-ai/lora'
  | 'fal-ai/visual-style-prompting'
  | 'fal-ai/gfpgan'
  | 'fal-ai/real-esrgan'
  | 'fal-ai/seedvr'
  | 'fal-ai/deep-rescale'
  | 'fal-ai/swinir'
  | 'fal-ai/photo-restoration'
  | 'fal-ai/face-enhancement'
  | 'fal-ai/crystal-upscaler'
  | 'fal-ai/lama'
  | 'fal-ai/kling-video'
  | 'fal-ai/kling-video/v3'
  | 'fal-ai/wan-video'
  | 'fal-ai/sora/remix'
  | 'fal-ai/sora/v2-pro'
  | 'fal-ai/veo/v3.1'
  | 'fal-ai/luma-dream-machine'
  | string;

export interface FalInput {
  prompt?: string;
  image_url?: string;
  video_url?: string;
  aspect_ratio?: AspectRatio | string;
  num_images?: number;
  enable_safety_checker?: boolean;
  seed?: number;
  [key: string]: any;
}

export interface FalResponse {
  images?: Array<{ url: string; width: number; height: number }>;
  video?: { url: string };
  image?: { url: string };
  [key: string]: any;
}

class FalService {
  private static instance: FalService;
  private activeRequests: Set<string> = new Set();

  private constructor() {}

  public static getInstance(): FalService {
    if (!FalService.instance) {
      FalService.instance = new FalService();
    }
    return FalService.instance;
  }

  /**
   * Generates content using a Fal.ai model via the backend proxy.
   */
  public async generate(modelId: FalModelId, input: FalInput): Promise<FalResponse> {
    const requestId = JSON.stringify({ modelId, input });
    
    if (this.activeRequests.has(requestId)) {
      throw new Error('A duplicate request is already in progress.');
    }

    this.activeRequests.add(requestId);

    try {
      console.log(`[FalService] Calling model: ${modelId}`, input);
      
      const response = await fetch('/api/ai/fal-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ modelId, input }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API request failed with status ${response.status}`);
      }

      const result = await response.json();
      console.log(`[FalService] Success for ${modelId}:`, result);
      return result;
    } catch (error: any) {
      console.error(`[FalService] Error for ${modelId}:`, error);
      throw error;
    } finally {
      this.activeRequests.delete(requestId);
    }
  }

  /**
   * Helper for image generation
   */
  public async generateImage(prompt: string, modelId: FalModelId = 'fal-ai/flux/pro', options: Partial<FalInput> = {}): Promise<string> {
    const response = await this.generate(modelId, {
      prompt,
      ...options
    });

    if (response.images && response.images.length > 0) {
      return response.images[0].url;
    }
    if (response.image) {
      return response.image.url;
    }
    
    throw new Error('No image URL found in the response');
  }

  /**
   * Helper for video generation
   */
  public async generateVideo(prompt: string, modelId: FalModelId = 'fal-ai/luma-dream-machine', options: Partial<FalInput> = {}): Promise<string> {
    const response = await this.generate(modelId, {
      prompt,
      ...options
    });

    if (response.video) {
      return response.video.url;
    }
    
    throw new Error('No video URL found in the response');
  }
}

export const falService = FalService.getInstance();
