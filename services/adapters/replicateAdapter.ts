
import { BaseProviderAdapter, AIRequest, AIResponse } from './baseAdapter';
import * as fal from "@fal-ai/serverless-client";
import { config } from '../config';

export class ReplicateAdapter extends BaseProviderAdapter {
  constructor(config: any) {
    super(config);
  }

  async execute(request: AIRequest): Promise<AIResponse> {
    console.log(`[ReplicateAdapter via Fal.ai] Executing ${request.taskType} via ${this.config.name}`);
    
    const falKey = config.fal.apiKey || process.env.FAL_KEY;
    if (!falKey) {
      throw new Error("FAL_KEY is not configured.");
    }
    
    fal.config({ credentials: falKey });

    let modelId = "fal-ai/flux/pro";
    let input: any = { prompt: request.prompt };

    switch (this.config.id) {
      case 'flux':
        modelId = "fal-ai/flux/pro";
        input = {
          prompt: request.prompt,
          image_size: "square_hd"
        };
        break;
      case 'realesrgan':
        modelId = "fal-ai/real-esrgan";
        input = {
          image_url: request.base64ImageData || request.input?.image,
          scale: 4
        };
        break;
      case 'gfpgan':
        modelId = "fal-ai/gfpgan";
        input = {
          image_url: request.base64ImageData || request.input?.image,
          upscale: 2
        };
        break;
      case 'sam':
        modelId = "fal-ai/lama";
        input = {
          image_url: request.base64ImageData || request.input?.image,
          prompt: request.prompt || "isolated subject"
        };
        break;
      default:
        console.warn(`[ReplicateAdapter via Fal.ai] Unknown model ID ${this.config.id}, defaulting to fal-ai/flux/pro`);
    }

    const result = await fal.subscribe(modelId, { input }) as any;

    const outputUrl = result.images?.[0]?.url || result.image?.url || result.output_url || result.url;
    if (!outputUrl) {
      throw new Error(`Execution failed: No output URL returned for model key ${this.config.id}`);
    }

    return {
      text: outputUrl,
      usage: { prompt_tokens: 0, completion_tokens: 0 }
    };
  }
}

