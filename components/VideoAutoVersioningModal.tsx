import React, { useState } from 'react';

type VideoAspectRatio = '16:9' | '9:16';

interface VideoAutoVersioningModalProps {
    baseVideoUrl: string;
    prompt: string;
    onClose: () => void;
    requireSignIn: () => boolean;
    sourceFrames?: string[];
}

interface VideoSocialPlatform {
    id: string;
    name: string;
    aspectRatio: VideoAspectRatio;
    icon: React.ReactNode;
}

const videoSocialPlatforms: VideoSocialPlatform[] = [
    // 9:16
    { id: 'ig-story', name: 'IG Story', aspectRatio: '9:16', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg> },
    { id: 'ig-reel', name: 'IG Reel', aspectRatio: '9:16', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg> },
    { id: 'yt-short', name: 'YT Short', aspectRatio: '9:16', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 28 28" fill="currentColor"><path d="M27.52 7.29a3.48 3.48 0 0 0-2.45-2.46C22.88 4 14 4 14 4s-8.88 0-11.07.83a3.48 3.48 0 0 0-2.45 2.46A36.43 36.43 0 0 0 0 14a36.43 36.43 0 0 0 .48 6.71a3.48 3.48 0 0 0 2.45 2.46C5.12 24 14 24 14 24s8.88 0 11.07-.83a3.48 3.48 0 0 0 2.45-2.46A36.43 36.43 0 0 0 28 14a36.43 36.43 0 0 0-.48-6.71zM11.2 18.4V9.6l7.2 4.4z"></path></svg> },
    { id: 'tiktok', name: 'TikTok', aspectRatio: '9:16', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02c.08 0 .14.02.2.04c.49.21.98.42 1.47.64c.12.05.23.1.35.16c1.03.49 2.02 1.05 2.93 1.73c.42.31.82.66 1.2 1.03c.18.18.35.37.5.57c.91 1.22 1.61 2.58 2.06 4.08c.22.74.37 1.5.46 2.28c.03.26.04.52.05.78c.01.27.02.55.02.83c0 .19-.01.38-.01.57c0 2.37-.53 4.65-1.55 6.7c-.51 1.02-1.12 1.98-1.83 2.86c-.34.42-.7.82-1.09 1.19c-.19.18-.38.36-.58.53c-1.22.99-2.59 1.76-4.07 2.27c-.74.25-1.5.43-2.27.53c-.27.03-.54.04-.81.05c-.26.01-.52.02-.78.02c-.28 0-.56-.01-.83-.02c-2.37-.05-4.65-.58-6.7-1.6c-1.02-.51-1.98-1.12-2.86-1.83c-.42-.34-.82-.7-1.19-1.09c-.18-.19-.36-.38-.53-.58c-.99-1.22-1.76-2.59-2.27-4.07c-.25-.74-.43-1.5-.53-2.27c-.03-.27-.04-.54-.05-.81c-.01-.26-.02-.52-.02-.78c0-.28.01-.56.02-.83c.05-2.37.58-4.65 1.6-6.7c.51-1.02 1.12-1.98 1.83-2.86c.34-.42.7-.82-1.09-1.19c.19-.18.38-.36.58-.53C4.83 2.99 6.2 2.22 7.68 1.71c.74-.25 1.5-.43 2.27-.53c.27-.03.54-.04.81-.05c.26-.01.52-.02.78-.02zM10.15 6.7c-.12.01-.24.02-.37.03c-1.29.1-2.54.41-3.71.93c-.45.2-.89.44-1.3.7c-.14.09-.28.18-.42.28c-1.09.84-1.97 1.89-2.58 3.1c-.2.4-.37.82-.5 1.25c-.06.2-.12.4-.17.6c-.22.81-.35 1.64-.41 2.48c-.01.21-.02.42-.02.63c0 1.91.43 3.76 1.25 5.43c.41.84.9 1.62 1.47 2.34c.19.24.39.47.6.69c.84 1.09 1.89 1.97 3.1 2.58c.4.2.82.37 1.25.5c.2.06.4.12.6.17c.81.22 1.64.35 2.48.41c.21.01.42.02.63.02c.33 0 .66-.01.99-.03c1.29-.1 2.54-.41 3.71-.93c.45-.2.89-.44 1.3-.7c.14-.09.28-.18.42-.28c1.09-.84 1.97-1.89 2.58-3.1c.2-.4.37-.82-.5-1.25c.06-.2.12-.4.17-.6c.22-.81.35-1.64.41-2.48c.01-.21.02.42.02-.63c0-1.91-.43-3.76-1.25-5.43c-.41-.84-.9-1.62-1.47-2.34c-.19-.24-.39-.47-.6-.69c-.84-1.09-1.89-1.97-3.1-2.58c-.4-.2-.82-.37-1.25-.5c-.2-.06-.4-.12-.6-.17c-.81-.22-1.64-.35-2.48-.41a.42.42 0 0 0-.15-.02zm.17 1.45c.08.01.16.02.24.03c.78.08 1.54.26 2.27.54c.14.05.28.11.41.17c.75.33 1.45.76 2.08 1.28c.19.16.38.32.56.5c.61.64 1.1 1.38 1.43 2.2c.11.27.2.55.29.83c.13.43.23.87.29 1.32c.01.1.02.2.03.3c.04.45.06.9.06 1.35c0 1.55-.34 3.05-1 4.39c-.33.67-.76 1.28-1.28 1.81c-.16.17-.32.33-.5.49c-.64.61-1.38 1.1-2.2 1.43c-.27.11-.55.2-.83.29c-.43.13-.87.23-1.32.29c-.1.01-.2.02-.3.03c-.45.04-.9.06-1.35.06c-.47 0-.93-.02-1.39-.06c-.45-.05-.89-.14-1.32-.29c-.28-.09-.55-.2-.82-.31c-.69-.29-1.34-.69-1.92-1.18c-.18-.15-.35-.31-.52-.48c-.59-.59-1.09-1.25-1.48-1.98c-.13-.25-.25-.5-.35-.76c-.2-.51-.33-1.04-.4-1.59c-.02-.14-.03-.29-.04-.43c-.05-.53-.08-1.07-.08-1.6c0-.52.03-1.04.08-1.55c.05-.51.15-1.02.29-1.5c.1-.34.23-.67.39-1c.25-.52.56-1.01.92-1.46c.18-.21.36-.42.56-.62c.57-.59 1.22-1.08 1.94-1.46c.26-.13.52-.25.79-.35c.51-.2.1-.03.17-.05z"></path></svg> },
    
    // 16:9
    { id: 'yt-video', name: 'YT Video', aspectRatio: '16:9', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 28 28" fill="currentColor"><path d="M27.52 7.29a3.48 3.48 0 0 0-2.45-2.46C22.88 4 14 4 14 4s-8.88 0-11.07.83a3.48 3.48 0 0 0-2.45 2.46A36.43 36.43 0 0 0 0 14a36.43 36.43 0 0 0 .48 6.71a3.48 3.48 0 0 0 2.45 2.46C5.12 24 14 24 14 24s8.88 0 11.07-.83a3.48 3.48 0 0 0 2.45-2.46A36.43 36.43 0 0 0 28 14a36.43 36.43 0 0 0-.48-6.71zM11.2 18.4V9.6l7.2 4.4z"></path></svg> },
    { id: 'x-post', name: 'X (Twitter)', aspectRatio: '16:9', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg> },
    { id: 'fb-post', name: 'FB Post', aspectRatio: '16:9', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878V15.89H8.223v-3.79h2.215v-2.838c0-2.197 1.31-3.424 3.336-3.424.95 0 1.955.17 1.955.17v3.24h-1.68c-1.08 0-1.42.64-1.42 1.36v1.64h3.58l-.57 3.79h-3.01v6.02C18.343 21.128 22 16.991 22 12z"></path></svg> },
];

interface VersionResult {
    platformId: string;
    status: 'pending' | 'processing' | 'done' | 'error';
    videoUrl?: string;
    error?: string;
}

const VideoAutoVersioningModal: React.FC<VideoAutoVersioningModalProps> = ({ baseVideoUrl, prompt, onClose, requireSignIn, sourceFrames }) => {
    const [selectedPlatforms, setSelectedPlatforms] = useState<Set<string>>(new Set());
    const [results, setResults] = useState<VersionResult[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSelect = (platformId: string) => {
        setSelectedPlatforms(prev => {
            const newSet = new Set(prev);
            if (newSet.has(platformId)) newSet.delete(platformId);
            else newSet.add(platformId);
            return newSet;
        });
    };
    
    const handleSelectAll = () => {
        if (selectedPlatforms.size === videoSocialPlatforms.length) setSelectedPlatforms(new Set());
        else setSelectedPlatforms(new Set(videoSocialPlatforms.map(p => p.id)));
    };
    
    const handleGenerateVersions = async () => {
        setIsProcessing(true);
        const platformsToProcess = videoSocialPlatforms.filter(p => selectedPlatforms.has(p.id));
        setResults(platformsToProcess.map(p => ({ platformId: p.id, status: 'pending' })));

        const processPlatform = (platform: VideoSocialPlatform) => {
            return new Promise<{ status: 'done' | 'error'; videoUrl?: string; error?: string }>((resolve) => {
                const simulationTime = 8000 + Math.random() * 5000; // 8-13 seconds
                setTimeout(async () => {
                    try {
                        const stockVideoUrl = platform.aspectRatio === '9:16' 
                            ? 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4'
                            : 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4';
                        
                        const response = await fetch(stockVideoUrl);
                        if (!response.ok) throw new Error(`Stock video not found.`);
                        
                        const blob = await response.blob();
                        const resultUrl = URL.createObjectURL(blob);
                        resolve({ status: 'done' as const, videoUrl: resultUrl });
                    } catch (err) {
                        resolve({ status: 'error' as const, error: err instanceof Error ? err.message : 'Unknown error' });
                    }
                }, simulationTime);
            });
        };

        const processingPromises = platformsToProcess.map(async (platform) => {
            setResults(prev => prev.map(r => r.platformId === platform.id ? { ...r, status: 'processing' } : r));
            const result = await processPlatform(platform);
            setResults(prev => prev.map(r => r.platformId === platform.id ? { ...r, ...result } : r));
        });
        
        await Promise.all(processingPromises);
        setIsProcessing(false);
    };
    
    const downloadVideo = (url: string, filename: string) => {
        if (!requireSignIn()) return;
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-gray-800 w-full max-w-4xl max-h-[90vh] flex flex-col ai-modal" onClick={(e) => e.stopPropagation()}>
                <header className="p-4 border-b border-gray-700 flex justify-between items-center flex-shrink-0">
                    <h2 className="text-xl font-bold text-white">Generate Social Media Videos</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
                </header>
                <main className="p-6 flex-grow overflow-y-auto">
                    {results.length === 0 ? (
                        <>
                            <p className="text-gray-400 mb-4 text-center">Select which social media platforms you'd like to create a video for.</p>
                            <div className="flex justify-center mb-6">
                                <button onClick={handleSelectAll} className="px-5 py-2.5 rounded-xl bg-[#10161B] border border-[#26313A] hover:border-[#AFC3CF]/40 text-xs font-mono font-bold uppercase tracking-wider text-slate-300 hover:text-white transition-all cursor-pointer">
                                    {selectedPlatforms.size === videoSocialPlatforms.length ? 'Deselect All' : 'Select All'}
                                </button>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                {videoSocialPlatforms.map(p => (
                                    <button key={p.id} onClick={() => handleSelect(p.id)} className={`p-4 flex flex-col items-center justify-center rounded-2xl border transition-all cursor-pointer ${selectedPlatforms.has(p.id) ? 'border-[#8DB8CC] bg-[#8DB8CC]/15 shadow-[0_0_15px_rgba(141,184,204,0.2)]' : 'border-[#26313A] bg-[#10161B] hover:border-[#AFC3CF]/40'}`}>
                                        <div className="text-white mb-2">{p.icon}</div>
                                        <p className="font-semibold text-white text-sm">{p.name}</p>
                                        <p className="text-xs text-gray-400">{p.aspectRatio}</p>
                                    </button>
                                ))}
                            </div>
                        </>
                    ) : (
                         <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {results.map(res => {
                                const platform = videoSocialPlatforms.find(p => p.id === res.platformId);
                                if (!platform) return null;
                                return (
                                    <div key={res.platformId} className="relative aspect-[9/16] bg-gray-900 rounded-lg overflow-hidden flex flex-col items-center justify-center text-center">
                                        {res.status === 'processing' && <div className="absolute inset-0 bg-black/70 flex items-center justify-center"><div className="w-8 h-8 border-2 border-dashed rounded-full animate-spin border-white"></div></div>}
                                        {res.status === 'done' && res.videoUrl && (
                                            <>
                                                <video src={res.videoUrl} loop autoPlay muted className="w-full h-full object-contain" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-2">
                                                     <button onClick={() => downloadVideo(res.videoUrl!, `${platform.name.replace(/\s/g, '_')}.mp4`)} className="w-full text-xs font-semibold bg-white/20 text-white py-1.5 rounded backdrop-blur-sm hover:bg-white/30">Download</button>
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
                    <button onClick={handleGenerateVersions} disabled={selectedPlatforms.size === 0 || isProcessing} className="px-6 py-3 rounded-xl bg-gradient-to-r from-white via-[#E8F0F4] to-[#AFC3CF] text-[#050709] font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(255,255,255,0.25)] hover:brightness-110 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer">
                        {isProcessing ? 'Generating...' : `Generate ${selectedPlatforms.size} Version${selectedPlatforms.size === 1 ? '' : 's'}`}
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default VideoAutoVersioningModal;