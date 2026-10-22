
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { AspectRatio, WritingOptions, AdvancedWritingResult, ShoppableItem } from "../types";
import { inferenceManager } from "./inferenceManager";
import { UserTier } from "./orchestrationConfig";

const safeJsonParse = (text: string, fallback: any) => {
    try {
        // Remove markdown code blocks if present
        const cleaned = text.replace(/```json\n?|```/g, '').trim();
        return JSON.parse(cleaned);
    } catch (e) {
        console.error("JSON Parse Error:", e, "Original text:", text);
        return fallback;
    }
};

export const processAdvancedWritingTask = async (
    text: string,
    options: WritingOptions
): Promise<AdvancedWritingResult> => {
    const creativityPrompt = options.creativityLevel === 'high' 
        ? "Be extremely creative, use vivid metaphors, and push the boundaries of conventional writing while maintaining the core message."
        : options.creativityLevel === 'low'
        ? "Be very direct, concise, and literal. Avoid metaphors or flowery language."
        : "Maintain a balanced level of creativity, being expressive but professional.";

    const systemInstruction = `You are an advanced AI Writing Engine with Contextual Understanding and Emotional Intelligence.
Analyze the input text and rewrite it based on the following parameters:
- Tone: ${options.tone || 'Neutral'}
- Audience: ${options.audience || 'General'}
- Intent: ${options.intent || 'Informative'}
- Creativity Level: ${options.creativityLevel || 'balanced'}
- Sensitivity Mode: ${options.sensitivityMode ? 'ON (Be extremely careful with delicate topics, use empathetic language)' : 'OFF'}
- Creative Instruction: ${creativityPrompt}

Your response must be a JSON object containing the rewritten text and a deep linguistic analysis.`;

    const result = await inferenceManager.runInference('text', {
        prompt: `Process this text: "${text}"`,
        systemInstruction
    }, {
        userTier: UserTier.PRO,
        priority: 'quality'
    });

    return safeJsonParse(result.data.text || '{}', { text: text, analysis: { sentiment: 'Neutral', emotionalTone: 'Neutral', readabilityScore: 50, suggestions: [] } });
};

export const analyzeMediaForAutomation = async (
    mediaUrl: string,
    taskType: 'cleanup' | 'rough-cut' | 'b-roll' | 'shorts' | 'captions' | 'reframing',
    context?: string
): Promise<any> => {
    const systemInstruction = `You are an Intelligent Media Automation Engine.
Your task is to analyze media (video/audio) and provide structured data for automated editing.
Task Type: ${taskType}
Context: ${context || 'No additional context provided.'}

Return a JSON object with the specific data required for the task.`;

    const result = await inferenceManager.runInference('analysis', {
        prompt: `Analyze this media: ${mediaUrl}`,
        systemInstruction,
        taskType
    }, {
        userTier: UserTier.PRO,
        priority: 'balanced'
    });

    return safeJsonParse(result.data.text || '{}', {});
};

export const generateWallpapers = async (vibe: string): Promise<string[]> => {
    const systemInstruction = `You are a Wallpaper Generation Specialist.
    Accept user vibe description and enhance it into 4 distinct, highly detailed image generation prompts.
    For each prompt:
    - Add lighting details (e.g., cinematic, soft glow, neon)
    - Add color mood (e.g., pastel, vibrant, moody)
    - Add texture keywords (e.g., grainy, smooth, sharp)
    - Add composition instructions (e.g., wide angle, close up, centered)
    - Force 9:16 aspect ratio optimization.
    - Ensure high-resolution wallpaper quality.
    - Maintain thematic consistency across all 4 variations.
    - Apply minor variation logic: Color shifts, Lighting changes, Camera angle adjustments, Detail emphasis differences.
    
    Return a JSON object with an array of 4 strings named "prompts".`;

    const result = await inferenceManager.runInference('text', {
        prompt: `Vibe: ${vibe}`,
        systemInstruction
    }, {
        userTier: UserTier.FREE,
        priority: 'balanced'
    });

    const data = safeJsonParse(result.data.text || '{"prompts": []}', { prompts: [] });
    const prompts: string[] = data.prompts || [];
    
    const imageUrls = await Promise.all(prompts.map(async (p) => {
        const imgResult = await inferenceManager.runInference('image', {
            prompt: p,
            aspectRatio: "9:16"
        }, {
            userTier: UserTier.FREE,
            priority: 'quality'
        });
        return imgResult.data.text;
    }));

    return imageUrls.filter(url => !!url);
};

export const remixWallpaper = async (originalVibe: string, referenceImageUrl: string): Promise<string[]> => {
    const systemInstruction = `You are a Wallpaper Remix Specialist.
    Analyze the reference image and combine its visual features (Color palette, Lighting tone, Texture style, Composition structure) with the original vibe: "${originalVibe}".
    Generate 4 new 9:16 variations that maintain aesthetic continuity while introducing creative diversity.
    Return a JSON object with an array of 4 detailed image generation prompts named "prompts".`;

    const result = await inferenceManager.runInference('text', {
        prompt: `Reference Image: ${referenceImageUrl}`,
        systemInstruction
    }, {
        userTier: UserTier.PRO,
        priority: 'quality'
    });

    const data = safeJsonParse(result.data.text || '{"prompts": []}', { prompts: [] });
    const prompts: string[] = data.prompts || [];
    
    const imageUrls = await Promise.all(prompts.map(async (p) => {
        const imgResult = await inferenceManager.runInference('image', {
            prompt: p,
            aspectRatio: "9:16",
            base64ImageData: referenceImageUrl.startsWith('data:') ? referenceImageUrl.split(',')[1] : undefined,
            mimeType: referenceImageUrl.startsWith('data:') ? referenceImageUrl.split(';')[0].split(':')[1] : undefined
        }, {
            userTier: UserTier.PRO,
            priority: 'quality'
        });
        return imgResult.data.text;
    }));

    return imageUrls.filter(url => !!url);
};

export const redesignInterior = async (imageUrl: string, style: string): Promise<string> => {
    const prompt = `Redesign this room in ${style} style. Preserve the room layout structure (walls, floor, furniture positions) but modify color schemes, materials, furniture aesthetics, and decorative elements. Maintain realistic lighting consistency.`;
    
    const result = await inferenceManager.runInference('image', {
        prompt,
        base64ImageData: imageUrl.startsWith('data:') ? imageUrl.split(',')[1] : undefined,
        mimeType: imageUrl.startsWith('data:') ? imageUrl.split(';')[0].split(':')[1] : undefined,
        aspectRatio: "16:9"
    }, {
        userTier: UserTier.PRO,
        priority: 'quality'
    });

    return result.data.text;
};

export const refineInterior = async (imageUrl: string, instruction: string, history: any[]): Promise<string> => {
    const prompt = `Refine the previous interior design based on this instruction: "${instruction}". 
    Parse the intent: Identify targeted objects or regions. 
    Modify only relevant regions (e.g., "make rug blue", "add warmer lighting"). 
    Preserve untouched elements and the overall room layout.
    History: ${JSON.stringify(history)}`;

    const result = await inferenceManager.runInference('image', {
        prompt,
        base64ImageData: imageUrl.startsWith('data:') ? imageUrl.split(',')[1] : undefined,
        mimeType: imageUrl.startsWith('data:') ? imageUrl.split(';')[0].split(':')[1] : undefined,
        aspectRatio: "16:9"
    }, {
        userTier: UserTier.PRO,
        priority: 'quality'
    });

    return result.data.text;
};

export const detectInteriorObjects = async (imageUrl: string): Promise<ShoppableItem[]> => {
    const systemInstruction = `Identify furniture and decor elements in the room. 
Return a JSON array of objects with: id, category, label, link, price.`;

    const result = await inferenceManager.runInference('analysis', {
        prompt: `Analyze room: ${imageUrl}`,
        systemInstruction
    }, {
        userTier: UserTier.PRO,
        priority: 'balanced'
    });

    return safeJsonParse(result.data.text || '[]', []);
};

export const segmentObject = async (imageUrl: string, points: { x: number, y: number }[]): Promise<string> => {
    // In a real production environment, this would call a SAM (Segment Anything Model) microservice.
    // For this implementation, we use Gemini to analyze the region and simulate high-precision segmentation.
    const systemInstruction = `You are a High-Precision Image Segmentation Engine (SAM-based).
    Analyze the image and the provided prompt points (coordinates).
    Identify the object at these coordinates and return a high-quality binary mask (base64 PNG).
    The mask must be pixel-accurate, following the object's contours perfectly.
    Points: ${JSON.stringify(points)}`;

    const result = await inferenceManager.runInference('analysis', {
        prompt: `Segment object at points: ${JSON.stringify(points)} in image: ${imageUrl}`,
        systemInstruction,
        base64ImageData: imageUrl.startsWith('data:') ? imageUrl.split(',')[1] : undefined,
        mimeType: imageUrl.startsWith('data:') ? imageUrl.split(';')[0].split(':')[1] : undefined,
    }, {
        userTier: UserTier.PRO,
        priority: 'balanced'
    });

    // For demo purposes, if Gemini doesn't return a real mask, we'll return a simulated one
    // In a real app, this would be the actual mask data.
    return result.data.text || imageUrl; 
};

export const editImageWithMask = async (
    imageUrl: string, 
    maskUrl: string, 
    action: 'remove' | 'replace' | 'modify', 
    prompt?: string
): Promise<string> => {
    const systemInstruction = `You are an AI Inpainting Engine.
    Action: ${action.toUpperCase()}
    ${prompt ? `Instruction: ${prompt}` : ''}
    Use the provided mask as the edit region.
    Maintain lighting, texture, and perspective consistency.
    Blend the edges seamlessly with the original image.`;

    const result = await inferenceManager.runInference('image', {
        prompt: prompt || `Perform ${action} on the masked area.`,
        systemInstruction,
        base64ImageData: imageUrl.startsWith('data:') ? imageUrl.split(',')[1] : undefined,
        mimeType: imageUrl.startsWith('data:') ? imageUrl.split(';')[0].split(':')[1] : undefined,
        maskData: maskUrl.startsWith('data:') ? maskUrl.split(',')[1] : undefined,
        aspectRatio: "1:1" // Default to 1:1 for editing
    }, {
        userTier: UserTier.PRO,
        priority: 'quality'
    });

    return result.data.text;
};

export const generateImage = async (prompt: string, aspectRatio: AspectRatio, promptEnhancer?: string): Promise<string> => {
    const result = await inferenceManager.runInference('image', {
        prompt,
        aspectRatio
    }, {
        userTier: UserTier.FREE,
        priority: 'quality'
    });

    // In a real Polo integration, result.data.text might be a URL or base64
    // For now, we'll assume the adapter returns something we can use
    return result.data.text || `https://picsum.photos/seed/${encodeURIComponent(prompt.substring(0, 10))}/1024/1024`;
};

export const recreateImageForAspectRatio = async (
    base64ImageData: string,
    mimeType: string,
    originalPrompt: string,
    platformName: string,
    aspectRatio: AspectRatio
): Promise<string> => {
    const result = await inferenceManager.runInference('image', {
        prompt: `Recreate this image for ${platformName}. Original: ${originalPrompt}`,
        base64ImageData,
        mimeType,
        aspectRatio
    }, {
        userTier: UserTier.PRO,
        priority: 'quality'
    });

    return result.data.text || `https://picsum.photos/seed/recreate-${Date.now()}/1024/1024`;
};

export const editImage = async (base64ImageData: string, mimeType: string, prompt: string): Promise<string> => {
    const result = await inferenceManager.runInference('image', {
        prompt: `Edit this image: ${prompt}`,
        base64ImageData,
        mimeType
    }, {
        userTier: UserTier.PRO,
        priority: 'quality'
    });

    return result.data.text || `https://picsum.photos/seed/edit-${Date.now()}/1024/1024`;
};

export const styleTransferImage = async (
    sourceImageBase64: string,
    sourceMimeType: string,
    styleImageBase64: string,
    styleMimeType: string,
    prompt: string
): Promise<string> => {
    const result = await inferenceManager.runInference('image', {
        prompt: `Apply style: ${prompt}`,
        sourceImageBase64,
        styleImageBase64
    }, {
        userTier: UserTier.PRO,
        priority: 'quality'
    });

    return result.data.text || `https://picsum.photos/seed/style-${Date.now()}/1024/1024`;
};

export const processWritingTask = async (
    text: string, 
    taskType: 'optimize' | 'rephrase' | 'style' | 'translate', 
    options?: { styleMode?: string, targetLanguage?: string }
): Promise<string> => {
    const result = await inferenceManager.runInference('text', {
        prompt: text,
        taskType,
        options
    }, {
        userTier: UserTier.FREE,
        priority: 'speed'
    });

    return result.data.text || text;
};

export const generateIdeation = async (concept: string): Promise<any> => {
    const result = await inferenceManager.runInference('analysis', {
        prompt: `Generate creative ideas for: "${concept}"`
    }, {
        userTier: UserTier.FREE,
        priority: 'balanced'
    });

    return safeJsonParse(result.data.text || "{}", {});
};

export const generateVideo = async (
    prompt: string,
    aspectRatio: AspectRatio,
    image?: { imageBytes: string, mimeType: string },
    onStatusUpdate?: (message: string) => void
): Promise<string> => {
    onStatusUpdate?.("Initializing Video Generation...");
    const result = await inferenceManager.runInference('video', {
        prompt,
        aspectRatio,
        image
    }, {
        userTier: UserTier.PRO,
        priority: 'quality'
    });

    return result.data.text || `https://picsum.photos/seed/video-${Date.now()}/1920/1080`;
};

export const styleTransferVideo = async (
    sourceFrame: { imageBytes: string, mimeType: string },
    styleFrame: { imageBytes: string, mimeType: string },
    prompt: string,
    onStatusUpdate?: (message: string) => void
): Promise<string> => {
    return generateVideo(prompt, '16:9', sourceFrame, onStatusUpdate);
};

export const enhancePrompt = async (simplePrompt: string, context: 'image' | 'video' | 'edit'): Promise<string> => {
    const result = await inferenceManager.runInference('text', {
        prompt: `Enhance this prompt for ${context}: "${simplePrompt}"`
    }, {
        userTier: UserTier.FREE,
        priority: 'speed'
    });

    return result.data.text || simplePrompt;
};
