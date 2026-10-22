import { BaseProviderAdapter, AIRequest, AIResponse } from './baseAdapter';
import { GoogleGenAI } from '@google/genai';
import { config } from '../config';

export class GeminiAdapter extends BaseProviderAdapter {
  private aiClient: GoogleGenAI | null = null;

  private getClient(): GoogleGenAI | null {
    if (!this.aiClient) {
      const apiKey = process.env.GEMINI_API_KEY || config.fal?.apiKey || '';
      if (apiKey) {
        this.aiClient = new GoogleGenAI({ apiKey });
      }
    }
    return this.aiClient;
  }

  async execute(request: AIRequest): Promise<AIResponse> {
    const apiKey = process.env.GEMINI_API_KEY;
    
    // Model strictly pinned to Gemini 1.5 Flash as requested
    const model = 'gemini-1.5-flash';

    console.log(`[GeminiAdapter] Routing request using model: ${model}`);

    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        
        let contents: any = request.prompt;

        // Support multimodal input if base64 image data is attached
        if (request.base64ImageData) {
          const mimeType = request.mimeType || 'image/jpeg';
          contents = [
            { text: request.prompt },
            {
              inlineData: {
                data: request.base64ImageData,
                mimeType: mimeType
              }
            }
          ];
        }

        const systemInstruction = request.input?.systemInstruction;

        const response = await ai.models.generateContent({
          model: model,
          contents: contents,
          config: systemInstruction ? { systemInstruction } : undefined
        });

        const textOutput = response.text || '';
        
        return {
          text: textOutput,
          usage: {
            prompt_tokens: response.usageMetadata?.promptTokenCount || 0,
            completion_tokens: response.usageMetadata?.candidatesTokenCount || 0
          }
        };
      } catch (err: any) {
        console.error('[GeminiAdapter] API call error:', err.message || err);
        throw new Error(`Gemini 1.5 Flash processing failed: ${err.message || 'Unknown error'}`);
      }
    }

    // Fallback if API key is not yet set in environment
    console.warn('[GeminiAdapter] GEMINI_API_KEY not configured. Returning simulated Gemini response.');
    return {
      text: `[Gemini 1.5 Flash Output] Processed prompt: "${request.prompt}". Configure GEMINI_API_KEY in environment or Settings to get real live Gemini outputs.`,
      usage: {
        prompt_tokens: request.prompt.length / 4,
        completion_tokens: 30
      }
    };
  }
}
