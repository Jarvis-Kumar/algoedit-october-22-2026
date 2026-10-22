



import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import ActionButton from './ActionButton';
import { fileToBase64, fileToDataUrl } from '../utils/fileUtils';
// FIX: Updated import for PreloadedAssetState to use the shared types file.
import { PreloadedAssetState, StudioTab, Asset, Page, OnNavigateType } from '../types';
import PromptEnhancerToggle from './PromptEnhancerToggle';
import ImageUpload from './ImageUpload';
import ResultDisplay from './ResultDisplay';
import SendToBar from './SendToBar';
import { AI_TOKEN_COSTS } from '../constants';
import { urlToFile } from '../utils/urlToFile';
import { falService } from '../services/falService';

interface QuickTool {
    name: string;
    prompt: string;
    modelId: string;
    icon: React.JSX.Element;
}

const detailedBackgroundRemovalPrompt = `Remove the background from this image. Keep only the main subject.`;

const quickTools: QuickTool[] = [
    { name: 'Remove BG', prompt: detailedBackgroundRemovalPrompt, modelId: 'fal-ai/lama', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg> },
    { name: 'Upscale 4K', prompt: 'Upscale to 4K', modelId: 'fal-ai/crystal-upscaler', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg> },
    { name: 'Enhance Face', prompt: 'Enhance faces', modelId: 'fal-ai/face-enhancement', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
    { name: 'Restore', prompt: 'Restore photo', modelId: 'fal-ai/photo-restoration', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 16h4m10 0h4M4 4h16v16H4z" /></svg> }
];

interface ImageEditorProps {
    onNavigate: OnNavigateType;
    onMediaGenerated: (name: string, type: Asset['type'], size: number, url: string) => void;
    requireSignIn: () => boolean;
    userTokens: number;
    hasTokens: (amount: number) => boolean;
    deductTokens: (amount: number) => boolean;
    initialSourceImageUrl?: string;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ 
    onNavigate, 
    onMediaGenerated, 
    requireSignIn, 
    userTokens, 
    hasTokens,
    deductTokens,
    initialSourceImageUrl
}) => {
    const [sourceFile, setSourceFile] = useState<File | null>(null);
    const [prompt, setPrompt] = useState('');
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const cost = AI_TOKEN_COSTS.IMAGE_EDIT;

    useEffect(() => {
        if (initialSourceImageUrl) {
            const loadInitial = async () => {
                try {
                    const file = await urlToFile(initialSourceImageUrl, `source-${Date.now()}.jpg`);
                    setSourceFile(file);
                } catch (e) {
                    console.error("Failed to load initial source image", e);
                    setError("Could not load the provided image.");
                }
            };
            loadInitial();
        }
    }, [initialSourceImageUrl]);

    const handleEdit = async (editPrompt: string, modelId: string = 'fal-ai/qwen/image-edit') => {
        if (!sourceFile) {
            setError('Please upload an image to edit.');
            return;
        }
        if (!editPrompt) {
            setError('Please provide an editing instruction.');
            return;
        }
        if (!hasTokens(cost)) {
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const base64Data = await fileToBase64(sourceFile);
            const mimeType = sourceFile.type;
            
            // Call Fal.ai Service
            const newImageUrl = await falService.generateImage(editPrompt, modelId, {
                image_url: base64Data,
            });

            // Deduct tokens ONLY after successful AI response
            deductTokens(cost);

            setResultUrl(newImageUrl);

            const head = `data:${mimeType};base64,`;
            const sizeInBytes = Math.round((newImageUrl.length - head.length) * 3 / 4);
            onMediaGenerated(editPrompt, 'image', sizeInBytes, newImageUrl);

        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleQuickTool = (toolPrompt: string, modelId: string) => {
        setPrompt(toolPrompt);
        handleEdit(toolPrompt, modelId);
    };

    return (
        <div className="p-4 md:p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            <div className="flex flex-col space-y-4">
                
                <div className="glass-panel p-3 rounded-xl border-white/5 bg-white/[0.01]">
                    <ImageUpload
                        onFileSelect={(file) => {
                            setSourceFile(file);
                            setResultUrl(null); // Clear previous result on new image
                        }}
                        title="Upload Image"
                        file={sourceFile}
                        compact={true}
                    />
                </div>
                
                <div className="space-y-2">
                    <label htmlFor="edit-prompt" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                        Custom Edit Prompt
                    </label>
                    <textarea
                        id="edit-prompt"
                        rows={2}
                        className="w-full bg-white/[0.02] border border-white/10 rounded-xl text-xs text-slate-200 placeholder:text-slate-600 font-mono leading-relaxed p-3 resize-none focus:outline-none focus:border-[#8DB8CC]/50 focus:ring-1 focus:ring-[#8DB8CC]/50"
                        placeholder="e.g., 'add a futuristic city in the background' or 'make it a charcoal drawing'"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                    />
                    <ActionButton
                        onClick={() => handleEdit(prompt)}
                        disabled={!sourceFile || !prompt || isLoading || (userTokens > 0 && userTokens < cost)}
                        isLoading={isLoading}
                        text={isLoading ? 'Applying...' : `Apply Custom Edit`}
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-7.88 7.88-2.828-2.828 7.88-7.88zM3 14.172V17h2.828l7.88-7.88-2.828-2.828L3 14.172z" /></svg>}
                    />
                    <div className="mt-1 flex justify-between px-0.5">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                            {userTokens > 0 ? `Cost: ${cost} Tokens` : 'Sign in to generate'}
                        </span>
                    </div>
                </div>

                <div className="space-y-2 pt-1">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Quick Engines</h3>
                    <div className="grid grid-cols-4 gap-2">
                        {quickTools.map(tool => (
                            <button 
                                key={tool.name} 
                                onClick={() => handleQuickTool(tool.prompt, tool.modelId)}
                                disabled={!sourceFile || isLoading || (userTokens > 0 && userTokens < cost)}
                                className="flex flex-col items-center justify-center p-2.5 bg-[#10161B] border border-[#26313A] hover:border-[#AFC3CF]/40 hover:bg-[#1A2229] rounded-xl text-center text-white transition-all duration-200 disabled:opacity-20 disabled:cursor-not-allowed group cursor-pointer"
                                title={userTokens > 0 && userTokens < cost ? "You need tokens to generate" : ""}
                            >
                                <div className="text-[#8DB8CC] group-hover:text-white mb-1 transition-colors">{React.cloneElement(tool.icon, { className: 'h-4 w-4' })}</div>
                                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-300 group-hover:text-white transition-colors">{tool.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            
            <div className="flex items-center justify-center bg-[#050810]/40 border border-white/5 rounded-2xl min-h-[500px] lg:min-h-[550px] relative overflow-hidden">
                {isLoading && <div className="w-10 h-10 border-4 border-dashed rounded-full animate-spin border-[#8DB8CC]"></div>}
                {error && <p className="text-red-400 p-4 text-center text-xs font-mono">{error}</p>}
                {!isLoading && !resultUrl && !sourceFile && (
                    <p className="text-slate-500 text-xs font-mono uppercase tracking-widest">Awaiting source image...</p>
                )}
                 {!isLoading && !resultUrl && sourceFile && (
                    <img src={URL.createObjectURL(sourceFile)} alt="Source" className="max-w-full max-h-[500px] object-contain rounded-xl p-2" />
                 )}
                {resultUrl && (
                    <div className="w-full h-full flex flex-col justify-between p-2">
                        <ResultDisplay mediaUrl={resultUrl} mediaType="image" prompt={prompt} requireSignIn={requireSignIn} />
                        <div className="p-2 mt-2">
                            <SendToBar imageUrl={resultUrl} onNavigate={onNavigate} actions={['edit', 'asSource', 'asStyle', 'toBatch']} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImageEditor;