
export type GenStatus = 'idle' | 'loading' | 'success' | 'error';

export interface AIServiceResponse {
    status: 'success' | 'error';
    url?: string;
    message?: string;
    tokensUsed: number;
}

export class MockAIService {
    static async generateImage(prompt: string, model: string = 'flux'): Promise<AIServiceResponse> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const randomId = Math.floor(Math.random() * 1000);
                resolve({
                    status: 'success',
                    url: `https://picsum.photos/seed/${randomId}/1024/1024`,
                    tokensUsed: 5,
                    message: `Image generated successfully using ${model}.`
                });
            }, 3000);
        });
    }

    static async generateVideo(prompt: string, model: string = 'kling'): Promise<AIServiceResponse> {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    status: 'success',
                    url: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
                    tokensUsed: 25,
                    message: `Video generated successfully using ${model}.`
                });
            }, 5000);
        });
    }

    static async aiEdit(image: string, instruction: string): Promise<AIServiceResponse> {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    status: 'success',
                    url: image, // in mock we just return same image
                    tokensUsed: 10,
                    message: "Image edited successfully."
                });
            }, 2500);
        });
    }

    static async getPersonalityInsights(history: any[]): Promise<string> {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve("You lean towards cinematic, high-contrast imagery with a futuristic aesthetic. You value efficiency and precise control over lighting.");
            }, 2000);
        });
    }
}
