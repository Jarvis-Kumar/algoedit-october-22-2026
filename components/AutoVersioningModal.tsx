import React, { useState } from 'react';
import { AspectRatio } from '../types';
import { AI_TOKEN_COSTS } from '../constants';

interface AutoVersioningModalProps {
    baseImageUrl: string;
    originalPrompt: string;
    onClose: () => void;
    requireSignIn: () => boolean;
    userTokens: number;
    deductTokens: (amount: number) => boolean;
}

interface SocialPlatform {
    id: string;
    name: string;
    aspectRatio: AspectRatio;
    icon: React.ReactNode;
}

const socialPlatforms: SocialPlatform[] = [
    { id: 'ig-post', name: 'Instagram Post', aspectRatio: '1:1', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg> },
    { id: 'ig-story', name: 'Instagram Story', aspectRatio: '9:16', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="7" y="2" width="10" height="20" rx="5" ry="5"></rect><circle cx="12" cy="12" r="2"></circle></svg> },
    { id: 'fb-post', name: 'Facebook Post', aspectRatio: '4:3', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878V15.89H8.223v-3.79h2.215v-2.838c0-2.197 1.31-3.424 3.336-3.424.95 0 1.955.17 1.955.17v3.24h-1.68c-1.08 0-1.42.64-1.42 1.36v1.64h3.58l-.57 3.79h-3.01v6.02C18.343 21.128 22 16.991 22 12z"></path></svg> },
    { id: 'fb-story', name: 'Facebook Story', aspectRatio: '9:16', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.04c-5.5 0-10 4.49-10 10s4.5 10 10 10 10-4.49 10-10-4.5-10-10-10zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zM12.5 7.5h-1v7h1v-7zm0 9h-1v2h1v-2z"></path></svg> },
    { id: 'x-post', name: 'X (Twitter)', aspectRatio: '16:9', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg> },
    { id: 'yt-thumb', name: 'YouTube Thumb', aspectRatio: '16:9', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M21.58 7.19c-.23-.86-.9-1.52-1.76-1.75C18.25 5 12 5 12 5s-6.25 0-7.82.44c-.86.23-1.52.89-1.76 1.75C2 8.75 2 12 2 12s0 3.25.42 4.81c.23.86.9 1.52 1.76 1.75C5.75 19 12 19 12 19s6.25 0 7.82-.44c.86.23 1.52.89 1.76-1.75C22 15.25 22 12 22 12s0-3.25-.42-4.81zM9.5 15.5V8.5l6.5 3.5-6.5 3.5z"></path></svg> },
    { id: 'wa-status', name: 'WhatsApp Status', aspectRatio: '9:16', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21h.01c5.46 0 9.91-4.45 9.91-9.91s-4.45-9.91-9.91-9.91zM12.04 20.13h-.01c-1.53 0-3.03-.38-4.38-1.12l-.31-.18-3.26.86.88-3.18-.2-.33c-.82-1.38-1.25-2.98-1.25-4.63 0-4.54 3.7-8.24 8.24-8.24 4.54 0 8.24 3.7 8.24 8.24s-3.7 8.24-8.24 8.24zm4.52-6.15c-.25-.12-1.47-.72-1.7-.81-.23-.09-.39-.12-.56.12-.17.25-.64.81-.79.98-.15.17-.29.19-.54.06-.25-.12-1.06-.39-2.02-1.24-.75-.66-1.25-1.48-1.4-1.73-.15-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.42h-.48c-.17 0-.43.06-.66.31-.23.25-.87.85-.87 2.07s.9 2.4 1.02 2.56c.12.17 1.76 2.68 4.25 3.73.59.25 1.05.4 1.41.51.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.07-.12-.22-.19-.48-.31z"></path></svg> },
    { id: 'wa-profile', name: 'WhatsApp Profile', aspectRatio: '1:1', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"></path></svg> },
    { id: 'pinterest-pin', name: 'Pinterest Pin', aspectRatio: '3:4', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3l-.5 3h-2.5v6.95c4.56-.93 8-4.96 8-9.75 0-5.52-4.48-10-10-10z"></path></svg> },
    { id: 'tiktok-post', name: 'TikTok Post', aspectRatio: '9:16', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 0 .14.02.2.04.49.21.98.42 1.47.64.12.05.23.1.35.16 1.03.49 2.02 1.05 2.93 1.73.42.31.82.66 1.2 1.03.18.18.35.37.5.57.91 1.22 1.61 2.58 2.06 4.08.22.74.37 1.5.46 2.28.03.26.04.52.05.78.01.27.02.55.02.83c0 .19-.01.38-.01.57c0 2.37-.53 4.65-1.55 6.7c-.51 1.02-1.12 1.98-1.83 2.86c-.34.42-.7.82-1.09 1.19c-.19.18-.38.36-.58.53c-1.22.99-2.59 1.76-4.07 2.27c-.74.25-1.5.43-2.27.53c-.27.03-.54.04-.81.05c-.26.01-.52.02-.78.02c-.28 0-.56-.01-.83-.02c-2.37-.05-4.65-.58-6.7-1.6c-1.02-.51-1.98-1.12-2.86-1.83c-.42-.34-.82-.7-1.19-1.09c-.18-.19-.36-.38-.53-.58c-.99-1.22-1.76-2.59-2.27-4.07c-.25-.74-.43-1.5-.53-2.27c-.03-.27-.04-.54-.05-.81c-.01-.26-.02-.52-.02-.78c0-.28.01-.56.02-.83c.05-2.37.58-4.65 1.6-6.7c.51-1.02 1.12-1.98 1.83-2.86c.34-.42.7-.82-1.09-1.19c.19-.18.38-.36.58-.53C4.83 2.99 6.2 2.22 7.68 1.71c.74-.25 1.5-.43 2.27-.53c.27-.03.54-.04.81-.05c.26-.01.52-.02.78-.02zM10.15 6.7c-.12.01-.24.02-.37.03c-1.29.1-2.54.41-3.71.93c-.45.2-.89.44-1.3.7c-.14.09-.28.18-.42.28c-1.09.84-1.97 1.89-2.58 3.1c-.2.4-.37.82-.5 1.25c-.06.2-.12.4-.17.6c-.22.81-.35 1.64-.41 2.48c-.01.21-.02.42-.02.63c0 1.91.43 3.76 1.25 5.43c.41.84.9 1.62 1.47 2.34c.19.24.39.47.6.69c.84 1.09 1.89 1.97 3.1 2.58c.4.2.82.37 1.25.5c.2.06.4.12.6.17c.81.22 1.64.35 2.48.41c.21.01.42.02.63.02c.33 0 .66-.01.99-.03c1.29-.1 2.54-.41 3.71-.93c.45-.2.89-.44 1.3-.7c.14-.09.28-.18.42-.28c1.09-.84 1.97-1.89 2.58-3.1c.2-.4.37-.82-.5-1.25c.06-.2.12-.4.17-.6c.22-.81.35-1.64.41-2.48c.01-.21.02.42.02-.63c0-1.91-.43-3.76-1.25-5.43c-.41-.84-.9-1.62-1.47-2.34c-.19-.24-.39-.47-.6-.69c-.84-1.09-1.89-1.97-3.1-2.58c-.4-.2-.82-.37-1.25-.5c-.2-.06-.4-.12-.6-.17c-.81-.22-1.64-.35-2.48-.41a.42.42 0 0 0-.15-.02zm.17 1.45c.08.01.16.02.24.03c.78.08 1.54.26 2.27.54c.14.05.28.11.41.17c.75.33 1.45.76 2.08 1.28c.19.16.38.32.56.5c.61.64 1.1 1.38 1.43 2.2c.11.27.2.55.29.83c.13.43.23.87.29 1.32c.01.1.02.2.03.3c.04.45.06.9.06 1.35c0 1.55-.34 3.05-1 4.39c-.33.67-.76 1.28-1.28 1.81c-.16.17-.32.33-.5.49c-.64.61-1.38 1.1-2.2 1.43c-.27.11-.55.2-.83.29c-.43.13-.87.23-1.32.29c-.1.01-.2.02-.3.03c-.45.04-.9.06-1.35.06c-.47 0-.93-.02-1.39-.06c-.45-.05-.89-.14-1.32-.29c-.28-.09-.55-.2-.82-.31c-.69-.29-1.34-.69-1.92-1.18c-.18-.15-.35-.31-.52-.48c-.59-.59-1.09-1.25-1.48-1.98c-.13-.25-.25-.5-.35-.76c-.2-.51-.33-1.04-.4-1.59c-.02-.14-.03-.29-.04-.43c-.05-.53-.08-1.07-.08-1.6c0-.52.03-1.04.08-1.55c.05-.51.15-1.02.29-1.5c.1-.34.23-.67.39-1c.25-.52.56-1.01.92-1.46c.18-.21.36-.42.56-.62c.57-.59 1.22-1.08 1.94-1.46c.26-.13.52-.25.79-.35c.51-.2.1-.03.17-.05z"></path></svg> },
];

interface VersionResult {
    platformId: string;
    status: 'pending' | 'processing' | 'done' | 'error';
    imageUrl?: string;
    error?: string;
}

const AutoVersioningModal: React.FC<AutoVersioningModalProps> = ({ baseImageUrl, originalPrompt, onClose, requireSignIn, userTokens, deductTokens }) => {
    const [selectedPlatforms, setSelectedPlatforms] = useState<Set<string>>(new Set());
    const [results, setResults] = useState<VersionResult[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const costPerImage = AI_TOKEN_COSTS.AUTO_VERSIONING_PER_IMAGE;

    const handleSelect = (platformId: string) => {
        setSelectedPlatforms(prev => {
            const newSet = new Set(prev);
            if (newSet.has(platformId)) {
                newSet.delete(platformId);
            } else {
                newSet.add(platformId);
            }
            return newSet;
        });
    };
    
    const handleSelectAll = () => {
        if (selectedPlatforms.size === socialPlatforms.length) {
            setSelectedPlatforms(new Set());
        } else {
            setSelectedPlatforms(new Set(socialPlatforms.map(p => p.id)));
        }
    };
    
    const processVersion = async (platform: SocialPlatform, baseImageParts: { data: string, mimeType: string }) => {
        try {
            const response = await fetch('/api/ai/image-recreate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    base64ImageData: baseImageParts.data, 
                    mimeType: baseImageParts.mimeType, 
                    originalPrompt, 
                    platformName: platform.name, 
                    aspectRatio: platform.aspectRatio 
                })
            });

            if (!response.ok) throw new Error("Recreation failed");
            const resultData = await response.json();
            return { status: 'done' as const, imageUrl: resultData.url };
        } catch (err) {
            console.error(`Error processing for ${platform.name}`, err);
            return { status: 'error' as const, error: err instanceof Error ? err.message : 'Unknown error' };
        }
    };

    const handleGenerateVersions = async () => {
        const totalCost = selectedPlatforms.size * costPerImage;
        if (!deductTokens(totalCost)) {
            return;
        }

        setIsProcessing(true);
        const platformsToProcess = socialPlatforms.filter(p => selectedPlatforms.has(p.id));
        setResults(platformsToProcess.map(p => ({ platformId: p.id, status: 'pending' })));

        const parts = baseImageUrl.split(',');
        if (parts.length !== 2) {
            console.error("Invalid base image data URL");
            setIsProcessing(false);
            return;
        }
        const header = parts[0];
        const data = parts[1];
        const mimeTypeMatch = header.match(/:(.*?);/);
        if (!mimeTypeMatch || !mimeTypeMatch[1]) {
            console.error("Could not determine image MIME type");
            setIsProcessing(false);
            return;
        }
        const baseImageParts = { data, mimeType: mimeTypeMatch[1] };
        
        const promises = platformsToProcess.map(platform => {
            return (async () => {
                setResults(prev => prev.map(r => r.platformId === platform.id ? { ...r, status: 'processing' } : r));
                const result = await processVersion(platform, baseImageParts);
                setResults(prev => prev.map(r => r.platformId === platform.id ? { ...r, ...result } : r));
            })();
        });
        
        await Promise.all(promises);
        
        setIsProcessing(false);
    };
    
     const downloadImage = (url: string, filename: string) => {
        if (!requireSignIn()) return;
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const totalCost = selectedPlatforms.size * costPerImage;

    return (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-gray-800 w-full max-w-4xl max-h-[90vh] flex flex-col ai-modal" onClick={(e) => e.stopPropagation()}>
                <header className="p-4 border-b border-gray-700 flex justify-between items-center flex-shrink-0">
                    <h2 className="text-xl font-bold text-white">Generate Social Media Versions</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
                </header>
                <main className="p-6 flex-grow overflow-y-auto">
                    {results.length === 0 ? (
                        <>
                            <p className="text-gray-400 mb-4 text-center">Your design is ready! Select which social media platforms you'd like to create a version for.</p>
                            <div className="flex justify-center mb-6">
                                <button onClick={handleSelectAll} className="px-5 py-2.5 rounded-xl bg-[#10161B] border border-[#26313A] hover:border-[#AFC3CF]/40 text-xs font-mono font-bold uppercase tracking-wider text-slate-300 hover:text-white transition-all cursor-pointer">
                                    {selectedPlatforms.size === socialPlatforms.length ? 'Deselect All' : 'Select All'}
                                </button>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                {socialPlatforms.map(p => (
                                    <button key={p.id} onClick={() => handleSelect(p.id)} className={`p-4 flex flex-col items-center justify-center rounded-2xl border transition-all cursor-pointer ${selectedPlatforms.has(p.id) ? 'border-[#8DB8CC] bg-[#8DB8CC]/15 shadow-[0_0_15px_rgba(141,184,204,0.2)]' : 'border-[#26313A] bg-[#10161B] hover:border-[#AFC3CF]/40'}`}>
                                        <div className="text-white mb-2">{p.icon}</div>
                                        <p className="font-semibold text-white text-sm text-center">{p.name}</p>
                                        <p className="text-xs text-gray-400">{p.aspectRatio}</p>
                                    </button>
                                ))}
                            </div>
                        </>
                    ) : (
                         <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {results.map(res => {
                                const platform = socialPlatforms.find(p => p.id === res.platformId);
                                if (!platform) return null;
                                return (
                                    <div key={res.platformId} className={`relative bg-gray-900 rounded-lg overflow-hidden flex flex-col items-center justify-center text-center ${platform.aspectRatio === '16:9' ? 'aspect-video' : platform.aspectRatio === '9:16' ? 'aspect-[9/16]' : platform.aspectRatio === '4:3' ? 'aspect-[4/3]' : platform.aspectRatio === '3:4' ? 'aspect-[3/4]' : 'aspect-square'}`}>
                                        {res.status === 'processing' && <div className="absolute inset-0 bg-black/70 flex items-center justify-center"><div className="w-8 h-8 border-2 border-dashed rounded-full animate-spin border-white"></div></div>}
                                        {res.status === 'done' && res.imageUrl && (
                                            <>
                                                <img src={res.imageUrl} alt={`${platform.name} version`} className="w-full h-full object-contain" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-2">
                                                     <button onClick={() => downloadImage(res.imageUrl!, `${platform.name.replace(/\s/g, '_')}.jpg`)} className="w-full text-xs font-semibold bg-white/20 text-white py-1.5 rounded backdrop-blur-sm hover:bg-white/30">Download</button>
                                                </div>
                                            </>
                                        )}
                                        {res.status === 'error' && <p className="text-red-400 text-xs p-2">{res.error}</p>}
                                        {(res.status === 'pending' || res.status === 'processing') && (
                                             <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-2">
                                                <p className="text-white text-sm font-semibold w-full">{platform.name}</p>
                                             </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </main>
                <footer className="p-4 bg-[#0A0E12] border-t border-[#26313A] flex-shrink-0 flex items-center justify-end gap-3">
                    {results.length > 0 && !isProcessing && (
                         <button onClick={() => setResults([])} className="px-5 py-2.5 rounded-xl bg-[#10161B] border border-[#26313A] hover:border-[#AFC3CF]/40 text-xs font-mono font-bold uppercase text-slate-300 hover:text-white transition-all cursor-pointer">Back</button>
                    )}
                    <button onClick={handleGenerateVersions} disabled={selectedPlatforms.size === 0 || isProcessing || userTokens < totalCost} className="px-6 py-3 rounded-xl bg-gradient-to-r from-white via-[#E8F0F4] to-[#AFC3CF] text-[#050709] font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(255,255,255,0.25)] hover:brightness-110 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer">
                        {isProcessing ? 'Generating...' : `Generate ${selectedPlatforms.size} Version${selectedPlatforms.size === 1 ? '' : 's'} (${totalCost} tokens)`}
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default AutoVersioningModal;