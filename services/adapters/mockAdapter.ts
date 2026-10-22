
import { BaseProviderAdapter, AIRequest, AIResponse } from './baseAdapter';
import { ProviderConfig } from '../orchestrationConfig';

export class MockProviderAdapter extends BaseProviderAdapter {
  constructor(config: ProviderConfig) {
    super(config);
  }

  async execute(request: AIRequest): Promise<AIResponse> {
    // Simulate network latency
    const latency = Math.random() * 500 + 100;
    await new Promise(resolve => setTimeout(resolve, latency));

    // Simulate random failures for demo
    if (Math.random() < 0.1) {
      throw new Error(`[${this.config.name}] Random network error`);
    }

    if (request.taskType === 'analysis' && Math.random() < 0.05) {
      throw new Error(`[${this.config.name}] JSON Schema validation failed`);
    }

    return {
      text: `Generated response from ${this.config.name} for task ${request.taskType}`,
      usage: { prompt_tokens: 100, completion_tokens: 200 }
    };
  }
}
