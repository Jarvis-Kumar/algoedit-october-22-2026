
import { ProviderConfig } from '../orchestrationConfig';
import { BaseProviderAdapter } from './baseAdapter';
import { PoloProviderAdapter } from './poloProviderAdapter';
import { MockProviderAdapter } from './mockAdapter';
import { OpenAIAdapter } from './openaiAdapter';
import { StabilityAIAdapter } from './stabilityAIAdapter';
import { ReplicateAdapter } from './replicateAdapter';
import { RunwayAdapter } from './runwayAdapter';
import { PikaAdapter } from './pikaAdapter';
import { OpenRouterAdapter } from './openRouterAdapter';
import { GeminiAdapter } from './geminiAdapter';

export class AdapterFactory {
  static createAdapter(config: ProviderConfig): BaseProviderAdapter {
    switch (config.id) {
      case 'gemini-1.5-flash':
        return new GeminiAdapter(config);
      case 'polo-ai':
        return new PoloProviderAdapter(config);
      case 'deepseek-v3':
      case 'deepseek-v4':
        return new OpenRouterAdapter(config);
      case 'dalle-3':
        return new OpenAIAdapter(config);
      case 'stable-diffusion':
        return new StabilityAIAdapter(config);
      case 'flux':
        // Flux often uses Replicate or a dedicated API, assuming Replicate for now
        return new ReplicateAdapter(config);
      case 'realesrgan':
      case 'gfpgan':
      case 'sam':
        return new ReplicateAdapter(config);
      case 'runway':
        return new RunwayAdapter(config);
      case 'pika':
        return new PikaAdapter(config);
      default:
        return new MockProviderAdapter(config);
    }
  }
}
