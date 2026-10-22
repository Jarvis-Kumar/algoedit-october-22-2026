import React, { useState, useEffect } from 'react';
import VideoUpload from './VideoUpload';
import ResultDisplay from './ResultDisplay';
import ActionButton from './ActionButton';
import LoadingSpinner from './LoadingSpinner';
import { Asset } from '../types';
import { extractFramesFromVideo } from '../utils/fileUtils';
import { AI_TOKEN_COSTS } from '../constants';
import { urlToFile } from '../utils/urlToFile';

interface VideoStyleTransferProps {
    onMediaGenerated: (name: string, type: Asset['type'], size: number, url: string) => void;
    requireSignIn: () => boolean;
    userTokens: number;
    deductTokens: (amount: number) => boolean;
    initialSourceVideoUrl?: string;
    initialStyleVideoUrl?: string;
}

const VideoStyleTransfer: React.FC<VideoStyleTransferProps> = ({ 
    onMediaGenerated, 
    requireSignIn, 
    userTokens, 
    deductTokens,
    initialSourceVideoUrl,
    initialStyleVideoUrl
}) => {
    const [sourceVideoFile, setSourceVideoFile] = useState<File | null>(null);
    const [styleVideoFile, setStyleVideoFile] = useState<File | null>(null);
    const [prompt, setPrompt] = useState<string>('');
    
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [resultVideoUrl, setResultVideoUrl] = useState<string | null>(null);
    const cost = AI_TOKEN_COSTS.VIDEO_STYLE_TRANSFER;

    useEffect(() => {
        if (initialSourceVideoUrl) {
            const loadInitialSource = async () => {
                try {
                    const file = await urlToFile(initialSourceVideoUrl, `source-video-${Date.now()}.mp4`);
                    setSourceVideoFile(file);
                } catch (e) {
                    console.error("Failed to load initial source video", e);
                }
            };
            loadInitialSource();
        }
    }, [initialSourceVideoUrl]);
    
    useEffect(() => {
        if (initialStyleVideoUrl) {
            const loadInitialStyle = async () => {
                try {
                    const file = await urlToFile(initialStyleVideoUrl, `style-video-${Date.now()}.mp4`);
                    setStyleVideoFile(file);
                } catch (e) {
                    console.error("Failed to load initial style video", e);
                }
            };
            loadInitialStyle();
        }
    }, [initialStyleVideoUrl]);


    const handleGenerate = async () => {
        if (!sourceVideoFile || !styleVideoFile) {
            setError("Please upload both a source and a style video.");
            return;
        }
        
        if (!deductTokens(cost)) {
            return;
        }

        setIsLoading(true);
        setError(null);
        setResultVideoUrl(null);

        try {
            setLoadingMessage('Extracting key frames for AI analysis...');
            const [sourceFrames, styleFrames] = await Promise.all([
                extractFramesFromVideo(sourceVideoFile, 1),
                extractFramesFromVideo(styleVideoFile, 1),
            ]);

            if (sourceFrames.length === 0 || styleFrames.length === 0) {
                throw new Error("Could not extract frames from one or both videos. Please try different files.");
            }

            const sourceFrame = { imageBytes: sourceFrames[0], mimeType: 'image/jpeg' };
            const styleFrame = { imageBytes: styleFrames[0], mimeType: 'image/jpeg' };

            setLoadingMessage('Generating stylized video...');
            const genResponse = await fetch('/api/ai/video-style-transfer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sourceFrame, styleFrame, prompt })
            });

            if (!genResponse.ok) throw new Error("Style transfer failed");
            const resultData = await genResponse.json();
            const videoUrl = resultData.url;
            
            setResultVideoUrl(videoUrl);
            
            const headResponse = await fetch(videoUrl);
            const blob = await headResponse.blob();
            onMediaGenerated(prompt || 'stylized-video', 'video', blob.size, videoUrl);

        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'An error occurred during generation.';
            setError(`Video Style Transfer Failed: ${errorMessage}`);
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="flex flex-col space-y-6">
                <h2 className="text-2xl font-bold text-white">AI Video Style Transfer</h2>
                <p className="text-gray-400">
                    Upload a source video for content and a reference video for style. The AI will use the first frame of each to generate a new stylized video.
                </p>
                
                <VideoUpload onFileSelect={setSourceVideoFile} title="1. Upload Source Video (Content)" />
                <VideoUpload onFileSelect={setStyleVideoFile} title="2. Upload Reference Video (Style)" />
                
                 <div className="mb-6 p-4 bg-[#10161B] border border-[#26313A] rounded-xl flex items-start gap-3 shadow-md">
                    <div className="flex-shrink-0 pt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#8DB8CC]" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                    </div>
                    <div>
                        <h4 className="font-semibold text-white">Model Requirement</h4>
                        <p className="text-sm text-[#AFC3CF] mt-1">
                            This feature uses a model that generates video in a <strong>16:9 cinematic aspect ratio</strong>, regardless of the source video formats.
                        </p>
                    </div>
                </div>
                
                <div>
                    <label htmlFor="style-prompt" className="block text-sm font-medium text-gray-300">
                        3. Add instructions (Optional)
                    </label>
                    <textarea
                        id="style-prompt"
                        name="style-prompt"
                        rows={3}
                        className="mt-1 block w-full rounded-md shadow-sm sm:text-sm ai-textarea p-3"
                        placeholder="e.g., 'make it look like a 90s anime'"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                    />
                </div>
                
                <div className="flex items-center space-x-3">
                    <ActionButton 
                        onClick={handleGenerate}
                        disabled={!sourceVideoFile || !styleVideoFile || isLoading || userTokens < cost}
                        isLoading={isLoading}
                        text={isLoading ? 'Transferring...' : `Transfer Style • ${cost} Tokens`}
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M17.135 9.336c0-1.428-1.03-2.618-2.378-2.903.13-.312.203-.648.203-1.003 0-1.282-.835-2.355-1.957-2.735-.01-.004-.021-.007-.032-.01C12.013 1.01 10.15 0 8 0 5.85 0 3.987 1.01 3.03 2.685c-.01.003-.021-.006-.032-.01C1.876 3.078 1.04 4.15 1.04 5.43c0 .355.073.69.203 1.003C.265 6.718.225 7.908.225 9.336c0 1.954.83 3.69 2.052 4.935.305.305.62.59.945.855L3 17.5h14l-.222-2.375c.325-.265.64-.55.945-.855C16.305 13.025 17.135 11.29 17.135 9.336zM8 2c1.31 0 2.5.64 3.25 1.75.24.35.38.74.38 1.15 0 1.1-.9 2-2 2h-3.25C5.45 6.9 4.55 6 4.55 4.9c0-.41.14-.8.38-1.15C5.5 2.64 6.69 2 8 2z" /></svg>}
                    />
                </div>
            </div>
            <div className="flex flex-col items-center justify-center bg-gray-900/50 rounded-lg min-h-[600px]">
                {isLoading && <LoadingSpinner message={loadingMessage} />}
                {error && !isLoading && (
                    <div className="p-6 text-center text-red-400 bg-red-900/30 rounded-lg">
                         <h3 className="font-bold text-lg mb-2">Generation Failed</h3>
                         <p className="text-sm">{error}</p>
                    </div>
                )}
                {!isLoading && !resultVideoUrl && !error && (
                    <p className="text-gray-500">Your stylized video will appear here</p>
                )}
                {resultVideoUrl && (
                    <div className="w-full">
                        <ResultDisplay mediaUrl={resultVideoUrl} mediaType="video" prompt={prompt || "stylized-video"} requireSignIn={requireSignIn} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default VideoStyleTransfer;