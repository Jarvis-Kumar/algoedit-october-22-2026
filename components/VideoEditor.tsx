
import React, { useState, useEffect, useRef } from 'react';
import VideoUpload from './VideoUpload';
import ResultDisplay from './ResultDisplay';
import ActionButton from './ActionButton';
import { extractFramesFromVideo } from '../utils/fileUtils';
import { Asset, User } from '../types';
import { AI_TOKEN_COSTS } from '../constants';
import { urlToFile } from '../utils/urlToFile';

interface QuickTool {
    name: string;
    prompt: string;
    icon: React.JSX.Element;
}

const quickTools: QuickTool[] = [
    { name: 'Stabilize', prompt: 'Stabilize the footage, removing camera shake and making it smooth.', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h6M9 14h6m-6-8h6M5 10h.01M5 14h.01M5 18h.01M19 10h.01M19 14h.01M19 18h.01M5 6h.01M19 6h.01" /></svg> },
    { name: 'Upscale 4K', prompt: 'Upscale video to 4k resolution, enhance details, improve sharpness and clarity.', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg> },
    { name: 'Slow-Mo', prompt: 'Convert this video to cinematic 60fps slow motion, interpolating frames for smoothness.', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    { name: 'Color Grade', prompt: 'Apply a professional, cinematic color grade to this video with deep teal and orange tones.', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg> },
    { name: 'Remove BG', prompt: 'Perfectly remove the background from this video, leaving only the main subject against a transparent background. The output should be a video file with an alpha channel.', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg> },
];

interface VideoEditorProps {
    onMediaGenerated: (name: string, type: Asset['type'], size: number, url: string) => void;
    requireSignIn: () => boolean;
    user: User | null;
    userTokens: number;
    hasTokens: (amount: number) => boolean;
    deductTokens: (amount: number) => boolean;
    initialVideoUrl?: string;
}

const VideoEditor: React.FC<VideoEditorProps> = ({ onMediaGenerated, requireSignIn, user, userTokens, hasTokens, deductTokens, initialVideoUrl }) => {
    const [sourceVideoFile, setSourceVideoFile] = useState<File | null>(null);
    const [prompt, setPrompt] = useState('');
    
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const cost = AI_TOKEN_COSTS.VIDEO_EDIT;

    useEffect(() => {
        if (initialVideoUrl) {
            const loadInitialVideo = async () => {
                try {
                    const file = await urlToFile(initialVideoUrl, `initial-video-${Date.now()}.mp4`);
                    setSourceVideoFile(file);
                } catch (e) {
                    console.error("Failed to load initial video", e);
                    setError("Could not load the provided video.");
                }
            };
            loadInitialVideo();
        }
    }, [initialVideoUrl]);
    
    const handleEdit = async (editPrompt: string) => {
        if (!sourceVideoFile) {
            alert("Please upload a source video.");
            return;
        }
        if (!editPrompt) {
            alert("Please enter a prompt or select a quick tool.");
            return;
        }
        
        if (!hasTokens(cost)) {
            return;
        }

        setIsLoading(true);
        setError(null);
        setLoadingMessage('Preparing video for AI...');

        try {
            const frames = await extractFramesFromVideo(sourceVideoFile, 1);
            if (frames.length === 0) {
                throw new Error("Could not extract a starting frame from the video.");
            }

            const imagePayload = { imageBytes: frames[0], mimeType: 'image/jpeg' };
            
            setLoadingMessage('Generating edited video...');
            const response = await fetch('/api/ai/video-generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: editPrompt, aspectRatio: '16:9', image: imagePayload, userId: user?.email })
            });

            if (!response.ok) throw new Error("Edit failed");
            const resultData = await response.json();
            const videoUrl = resultData.url;
            
            // Deduct tokens ONLY after successful AI response
            deductTokens(cost);

            const headResponse = await fetch(videoUrl);
            const blob = await headResponse.blob();
            onMediaGenerated(editPrompt, 'video', blob.size, videoUrl);
            
            setResultUrl(videoUrl);

        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'An error occurred during generation.';
            setError(`Video Edit Failed: ${errorMessage}`);
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuickTool = (toolPrompt: string) => {
        setPrompt(toolPrompt);
        handleEdit(toolPrompt);
    };

    const sourceUrl = sourceVideoFile ? URL.createObjectURL(sourceVideoFile) : null;

    return (
        <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="flex flex-col space-y-6">
                <h2 className="text-2xl font-bold text-white">AI Video Editor</h2>
                <p className="text-gray-400">Upload a video and use AI to edit it with simple text commands or powerful one-click tools.</p>
                
                <VideoUpload 
                    onFileSelect={(file) => {
                        setSourceVideoFile(file);
                        setResultUrl(null); // Clear previous result
                    }}
                    title="Upload Video"
                />
                
                 <div>
                    <label htmlFor="edit-prompt-video" className="block text-sm font-medium text-gray-300 mb-2">
                        Custom Edit Prompt
                    </label>
                    <textarea
                        id="edit-prompt-video"
                        rows={3}
                        className="w-full rounded-md shadow-sm sm:text-sm p-3 ai-textarea"
                        placeholder="e.g., 'Change the setting to a futuristic neon city' or 'make this a black and white film noir'"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                    />
                    <ActionButton
                        onClick={() => handleEdit(prompt)}
                        disabled={!sourceVideoFile || !prompt || isLoading || (userTokens > 0 && userTokens < cost)}
                        isLoading={isLoading}
                        text={isLoading ? 'Applying...' : `Apply Custom Edit • ${cost} Tokens`}
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-7.88 7.88-2.828-2.828 7.88-7.88zM3 14.172V17h2.828l7.88-7.88-2.828-2.828L3 14.172z" /></svg>}
                    />
                    <div className="mt-2 flex justify-between px-1">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                            {userTokens > 0 ? `Cost: ${cost} Tokens` : 'Sign in to generate'}
                        </span>
                    </div>
                </div>
                
                 <div>
                    <h3 className="text-lg font-semibold text-gray-200 mb-3">Quick Tools</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {quickTools.map(tool => (
                            <button 
                                key={tool.name} 
                                onClick={() => handleQuickTool(tool.prompt)}
                                disabled={!sourceVideoFile || isLoading || (userTokens > 0 && userTokens < cost)}
                                className="flex flex-col items-center justify-center p-3 bg-[#10161B] border border-[#26313A] hover:border-[#AFC3CF]/40 hover:bg-[#1A2229] rounded-xl text-center text-white transition-all duration-200 disabled:opacity-20 disabled:cursor-not-allowed group cursor-pointer"
                                title={userTokens > 0 && userTokens < cost ? "You need tokens to generate" : ""}
                            >
                                <div className="text-[#8DB8CC] group-hover:text-white transition-colors">{tool.icon}</div>
                                <span className="mt-2 text-xs font-semibold text-slate-200 group-hover:text-white transition-colors">{tool.name}</span>
                                <span className="text-[10px] text-[#AFC3CF] font-mono font-bold mt-1">{cost} Tokens</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex flex-col items-center justify-center bg-[#050810]/40 border border-white/5 rounded-2xl min-h-[90vh]">
                {isLoading && (
                    <div className="flex flex-col items-center justify-center p-8">
                        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-[#8DB8CC]"></div>
                        <p className="mt-4 text-center text-gray-300">{loadingMessage || 'Processing...'}</p>
                    </div>
                )}
                {error && <p className="text-red-400 text-center">{error}</p>}
                {!isLoading && !resultUrl && !sourceUrl && (
                    <p className="text-gray-500">Your edited video will appear here</p>
                )}
                {(!isLoading && !resultUrl && sourceUrl) && (
                    <video src={sourceUrl} controls loop className="max-w-full max-h-[85vh] rounded-lg" />
                )}
                {resultUrl && !isLoading && (
                    <div className="w-full">
                       <ResultDisplay mediaUrl={resultUrl} mediaType="video" prompt={prompt} requireSignIn={requireSignIn} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default VideoEditor;
