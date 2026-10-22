





import React, { useState, useEffect } from 'react';
import ImageUpload from './ImageUpload';
import ResultDisplay from './ResultDisplay';
import ActionButton from './ActionButton';
import { fileToBase64 } from '../utils/fileUtils';
import { urlToFile } from '../utils/urlToFile';
// import MarketplaceModal from './MarketplaceModal';
import SendToBar from './SendToBar';
// FIX: Updated import for PreloadedAssetState to use the shared types file.
import { Page, StudioTab, Asset, MarketplaceItem, Currency, PreloadedAssetState, OnNavigateType } from '../types';
import { AI_TOKEN_COSTS } from '../constants';

interface ImageStyleTransferProps {
    initialSourceImageUrl?: string;
    initialStyleImageUrl?: string;
    likedPresets: Set<number>;
    followedAuthors: Set<string>;
    onToggleLike: (id: number) => void;
    onToggleFollow: (author: string) => void;
    onNavigate: OnNavigateType;
    onMediaGenerated: (name: string, type: Asset['type'], size: number, url: string) => void;
    requireSignIn: () => boolean;
    allPresets: MarketplaceItem[];
    userTokens: number;
    deductTokens: (amount: number) => boolean;
    purchasedPresets: Set<number>;
    onPurchasePreset: (item: MarketplaceItem) => void;
    onStripePurchase: (item: MarketplaceItem) => void;
    currency: Currency;
}

const ImageStyleTransfer: React.FC<ImageStyleTransferProps> = ({ 
    initialSourceImageUrl,
    initialStyleImageUrl,
    likedPresets,
    followedAuthors,
    onToggleLike,
    onToggleFollow,
    onNavigate,
    onMediaGenerated,
    requireSignIn,
    allPresets,
    userTokens,
    deductTokens,
    purchasedPresets,
    onPurchasePreset,
    onStripePurchase,
    currency,
}) => {
    const [sourceFile, setSourceFile] = useState<File | null>(null);
    const [styleFile, setStyleFile] = useState<File | null>(null);
    const [prompt, setPrompt] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isMarketplaceOpen, setIsMarketplaceOpen] = useState(false);

    const [history, setHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState<number>(-1);
    const resultImageUrl = history[historyIndex] ?? null;
    const cost = AI_TOKEN_COSTS.IMAGE_STYLE_TRANSFER;
    
    useEffect(() => {
        const loadInitialSource = async () => {
            if (initialSourceImageUrl) {
                try {
                    const filename = initialSourceImageUrl.split('/').pop()?.split('?')[0] || 'source.jpg';
                    const file = await urlToFile(initialSourceImageUrl, filename);
                    setSourceFile(file);
                } catch(e) {
                    console.error("Failed to load initial source image:", e);
                    setError("Could not load the selected source image.");
                }
            }
        };
        loadInitialSource();
    }, [initialSourceImageUrl]);
    
    useEffect(() => {
        const loadInitialStyle = async () => {
            if (initialStyleImageUrl) {
                try {
                    const filename = initialStyleImageUrl.split('/').pop()?.split('?')[0] || 'preset.jpg';
                    const file = await urlToFile(initialStyleImageUrl, filename);
                    setStyleFile(file);
                } catch(e) {
                    console.error("Failed to load initial style image:", e);
                    setError("Could not load the selected preset image from the marketplace.");
                }
            }
        };
        loadInitialStyle();
    }, [initialStyleImageUrl]);

    const getMimeType = (file: File) => file.type;

    const handleGenerate = async () => {
        if (!sourceFile || !styleFile) {
            setError("Please upload both a source and a style image.");
            return;
        }
        if (!deductTokens(cost)) {
            return;
        }
        setIsLoading(true);
        setError(null);

        try {
            const [sourceBase64, styleBase64] = await Promise.all([
                fileToBase64(sourceFile),
                fileToBase64(styleFile)
            ]);
            
            const sourceMimeType = getMimeType(sourceFile);
            const styleMimeType = getMimeType(styleFile);

            const response = await fetch('/api/ai/image-style-transfer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    sourceImageBase64: sourceBase64, 
                    sourceMimeType, 
                    styleImageBase64: styleBase64, 
                    styleMimeType, 
                    prompt 
                })
            });

            if (!response.ok) throw new Error("Style transfer failed");
            const resultData = await response.json();
            const result = resultData.url;
            
            const newHistory = [...history.slice(0, historyIndex + 1), result];
            setHistory(newHistory);
            setHistoryIndex(newHistory.length - 1);
            
            const head = `data:${sourceMimeType};base64,`;
            const sizeInBytes = Math.round((result.length - head.length) * 3 / 4);
            onMediaGenerated(prompt || "stylized-image", 'image', sizeInBytes, result);

        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectPreset = async (imageUrl: string) => {
        setIsMarketplaceOpen(false);
        try {
            const filename = imageUrl.split('/').pop()?.split('?')[0] || 'preset.jpg';
            const file = await urlToFile(imageUrl, filename);
            setStyleFile(file);
        } catch (err) {
            console.error(err);
            setError('Failed to load the selected preset.');
        }
    };
    
    const handleUndo = () => {
        if (historyIndex > 0) {
            setHistoryIndex(historyIndex - 1);
        }
    };
    
    const handleRedo = () => {
        if (historyIndex < history.length - 1) {
            setHistoryIndex(historyIndex + 1);
        }
    };


    return (
        <>
            <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="flex flex-col space-y-6">
                    <h2 className="text-2xl font-bold text-white">AI Image Style Transfer</h2>
                    <p className="text-gray-400">
                        Upload a source image and a style reference. Then, tell the AI what you want to do in your own words.
                    </p>
                    
                    <ImageUpload file={sourceFile} onFileSelect={setSourceFile} title="1. Upload Source Image (Content)" />
                    <ImageUpload file={styleFile} onFileSelect={setStyleFile} title="2. Upload Reference Image (Style)">
                         {/* This button functionality is currently not implemented */ }
                    </ImageUpload>
                    
                    <div>
                        <label htmlFor="style-prompt-image" className="block text-sm font-medium text-gray-300">
                           3. Tell the AI what to do (Optional)
                        </label>
                        <textarea
                            id="style-prompt-image"
                            name="style-prompt-image"
                            rows={3}
                            className="mt-1 block w-full rounded-md shadow-sm sm:text-sm ai-textarea p-3"
                            placeholder="e.g., 'Make my photo look like this painting', 'give it this vibe', or 'match the colors and texture'"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                        />
                    </div>
                    
                    <div className="flex items-center space-x-3">
                        <ActionButton 
                            onClick={handleGenerate}
                            disabled={!sourceFile || !styleFile || isLoading || userTokens < cost}
                            isLoading={isLoading}
                            text={isLoading ? 'Transferring...' : `Transfer Style • ${cost} Tokens`}
                            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M17.135 9.336c0-1.428-1.03-2.618-2.378-2.903.13-.312.203-.648.203-1.003 0-1.282-.835-2.355-1.957-2.735-.01-.004-.021-.007-.032-.01C12.013 1.01 10.15 0 8 0 5.85 0 3.987 1.01 3.03 2.685c-.01.003-.021-.006-.032-.01C1.876 3.078 1.04 4.15 1.04 5.43c0 .355.073.69.203 1.003C.265 6.718.225 7.908.225 9.336c0 1.954.83 3.69 2.052 4.935.305.305.62.59.945.855L3 17.5h14l-.222-2.375c.325-.265.64-.55.945-.855C16.305 13.025 17.135 11.29 17.135 9.336zM8 2c1.31 0 2.5.64 3.25 1.75.24.35.38.74.38 1.15 0 1.1-.9 2-2 2h-3.25C5.45 6.9 4.55 6 4.55 4.9c0-.41.14-.8.38-1.15C5.5 2.64 6.69 2 8 2z" /></svg>}
                        />
                        <button onClick={handleUndo} disabled={historyIndex <= 0} className="p-3 ai-button bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed" title="Undo"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zM5.293 8.293a1 1 0 011.414 0L9 10.586V7a1 1 0 112 0v3.586l2.293-2.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg></button>
                        <button onClick={handleRedo} disabled={historyIndex >= history.length - 1} className="p-3 ai-button bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed" title="Redo"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm4.707-11.707a1 1 0 00-1.414 0L11 8.586V12a1 1 0 102 0V8.586l2.293 2.293a1 1 0 101.414-1.414l-4-4a1 1 0 00-1.414 0z" clipRule="evenodd" transform="rotate(-180 10 10)" /></svg></button>
                    </div>
                </div>
                <div className="flex items-center justify-center bg-gray-900/50 rounded-lg min-h-[600px]">
                    {isLoading && <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-blue-500"></div>}
                    {error && <p className="text-red-400 p-4 text-center">{error}</p>}
                    {!isLoading && !resultImageUrl && !error && (
                        <p className="text-gray-500">Your stylized image will appear here</p>
                    )}
                    {resultImageUrl && (
                        <div className="w-full">
                            <ResultDisplay mediaUrl={resultImageUrl} mediaType="image" prompt={prompt || "stylized-image"} requireSignIn={requireSignIn} />
                            <SendToBar imageUrl={resultImageUrl} onNavigate={onNavigate} actions={['edit', 'asSource', 'asStyle', 'toBatch']} />
                        </div>
                    )}
                </div>
            </div>
            {/* {isMarketplaceOpen && (
                <MarketplaceModal 
                    isOpen={isMarketplaceOpen}
                    onClose={() => setIsMarketplaceOpen(false)}
                    onSelectPreset={handleSelectPreset}
                    likedPresets={likedPresets}
                    followedAuthors={followedAuthors}
                    onToggleLike={onToggleLike}
                    onToggleFollow={onToggleFollow}
                    allPresets={allPresets}
                    purchasedPresets={purchasedPresets}
                    onPurchasePreset={onPurchasePreset}
                    onStripePurchase={onStripePurchase}
                    currency={currency}
                />
            )} */}
        </>
    );
};

export default ImageStyleTransfer;