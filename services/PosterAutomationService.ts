
import { falService, FalModelId } from './falService';
import { AspectRatio } from '../types';

export interface PosterLayer {
    id: string;
    type: 'image' | 'text' | 'logo' | 'background';
    content: string; // URL for images, text for text layers
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    opacity: number;
    zIndex: number;
    style?: any;
}

export interface PosterLayout {
    width: number;
    height: number;
    aspectRatio: AspectRatio;
    layers: PosterLayer[];
}

export class PosterAutomationService {
    /**
     * Orchestrates multiple AI models to generate a poster layout.
     */
    static async generatePoster(
        prompt: string,
        assets: { url: string; type: 'product' | 'logo' | 'human' | 'reference' }[],
        aspectRatio: AspectRatio = "16:9"
    ): Promise<PosterLayout> {
        console.log("[PosterService] Starting orchestration for prompt:", prompt);
        
        // 1. Stage: Subject Extraction & Understanding
        // In a real scenario, we'd call a segmentation model for each asset
        const processedAssets = await Promise.all(assets.map(async (asset) => {
            if (asset.type === 'product' || asset.type === 'human') {
                // Mocking segmentation, but theoretically calling fal-ai/flux/fill or similar background removal
                return { ...asset, processedUrl: asset.url };
            }
            return { ...asset, processedUrl: asset.url };
        }));

        // 2. Stage: Background Generation
        // Use Flux Pro to generate a background matching the prompt style
        const bgPrompt = `High quality background for ${prompt}, professional studio lighting, 4k, cinematic.`;
        const backgroundUrl = await falService.generateImage(bgPrompt, 'fal-ai/flux/pro', { aspect_ratio: aspectRatio });

        // 3. Stage: Layout Planning (Intelligence)
        // This would be a specialized layout LLM call or heuristic
        // For now, we simulate a professional composition
        const layers: PosterLayer[] = [
            {
                id: 'bg-1',
                type: 'background',
                content: backgroundUrl,
                x: 0,
                y: 0,
                width: 100,
                height: 100,
                rotation: 0,
                opacity: 1,
                zIndex: 0
            }
        ];

        // Place subject assets
        processedAssets.forEach((asset, index) => {
            if (asset.type === 'product' || asset.type === 'human') {
                layers.push({
                    id: `asset-${index}`,
                    type: 'image',
                    content: asset.processedUrl,
                    x: 25 + index * 10,
                    y: 25,
                    width: 50,
                    height: 50,
                    rotation: 0,
                    opacity: 1,
                    zIndex: 10 + index
                });
            } else if (asset.type === 'logo') {
                layers.push({
                    id: `logo-${index}`,
                    type: 'logo',
                    content: asset.processedUrl,
                    x: 5,
                    y: 5,
                    width: 15,
                    height: 15,
                    rotation: 0,
                    opacity: 1,
                    zIndex: 50
                });
            }
        });

        // Add Headline Text
        layers.push({
            id: 'text-title',
            type: 'text',
            content: 'NEURAL_SYNTHESIS',
            x: 50,
            y: 80,
            width: 80,
            height: 10,
            rotation: 0,
            opacity: 1,
            zIndex: 100,
            style: {
                fontSize: 48,
                fontWeight: '900',
                fill: '#ffffff',
                fontFamily: 'Inter',
                textAlign: 'center'
            }
        });

        return {
            width: 1920,
            height: 1080,
            aspectRatio,
            layers
        };
    }

    /**
     * Refines a specific layer or region using a refinement prompt.
     */
    static async refineLayout(
        currentLayout: PosterLayout,
        refinementPrompt: string
    ): Promise<PosterLayout> {
        // In a real system, this would use Qwen Image Edit or similar
        console.log("[PosterService] Refining layout with prompt:", refinementPrompt);
        
        // Example: If prompt says "move product left", we adjust coordinate
        if (refinementPrompt.toLowerCase().includes('left')) {
            currentLayout.layers = currentLayout.layers.map(l => 
                l.type === 'image' ? { ...l, x: Math.max(0, l.x - 10) } : l
            );
        }

        return { ...currentLayout };
    }
}
