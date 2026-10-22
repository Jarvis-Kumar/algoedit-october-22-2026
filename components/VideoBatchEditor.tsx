import React, { useState, useCallback, useEffect } from 'react';
import ActionButton from './ActionButton';
import { extractFramesFromVideo } from '../utils/fileUtils';
import { urlToFile } from '../utils/urlToFile';
import { PreloadedAssetState, Page, StudioTab, Asset, OnNavigateType } from '../types';
import { AI_TOKEN_COSTS } from '../constants';

interface VideoFile {
    id: number;
    file: File;
    previewUrl: string;
    status: 'pending' | 'processing' | 'done' | 'error';
    resultUrl?: string;
    error?: string;
}

interface VideoBatchEditorProps {
    preloadedVideoUrls?: string[];
    onNavigate: OnNavigateType;
    requireSignIn: () => boolean;
    userTokens: number;
    deductTokens: (amount: number) => boolean;
    onMediaGenerated: (name: string, type: Asset['type'], size: number, url: string) => void;
}

const VideoBatchEditor: React.FC<VideoBatchEditorProps> = ({ preloadedVideoUrls, onNavigate, requireSignIn, userTokens, deductTokens, onMediaGenerated }) => {
    const [videoFiles, setVideoFiles] = useState<VideoFile[]>([]);
    const [prompt, setPrompt] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [progress, setProgress] = useState(0);
    
    const costPerVideo = AI_TOKEN_COSTS.VIDEO_EDIT;
    const totalCost = videoFiles.length * costPerVideo;

    const handleFileChange = useCallback(async (files: FileList | null) => {
        if (!files) return;

        const filesToProcess = Array.from(files).filter(file => file.type.startsWith('video/'));
        
        if (filesToProcess.length === 0) return;

        const newVideoPromises = filesToProcess.map(async (file): Promise<VideoFile | null> => {
            try {
                const previewUrl = URL.createObjectURL(file);
                return {
                    id: Date.now() + Math.random(),
                    file,
                    previewUrl,
                    status: 'pending',
                };
            } catch (err) {
                console.error("Error processing file for batch editor:", file.name, err);
                return null;
            }
        });

        const newVideos = (await Promise.all(newVideoPromises)).filter((vid): vid is VideoFile => vid !== null);
        
        if (newVideos.length > 0) {
            setVideoFiles(prev => [...prev, ...newVideos]);
        }
    }, []);

    useEffect(() => {
        if (preloadedVideoUrls && preloadedVideoUrls.length > 0) {
            const addVideos = async () => {
                const newVideoFiles: VideoFile[] = [];
                for (const [i, url] of preloadedVideoUrls.entries()) {
                    try {
                        const file = await urlToFile(url, `preloaded-video-${Date.now()}-${i}.mp4`);
                        newVideoFiles.push({
                            id: Date.now() + i,
                            file,
                            previewUrl: url,
                            status: 'pending',
                        });
                    } catch (err) {
                        console.error("Failed to load preloaded video:", err);
                    }
                }
                setVideoFiles(prev => [...prev, ...newVideoFiles]);
            };
            addVideos();
        }
    }, [preloadedVideoUrls]);
    
    const handleDragOver = useCallback((e: React.DragEvent<HTMLLabelElement>) => { e.preventDefault(); e.stopPropagation(); }, []);
    const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => { 
        e.preventDefault(); e.stopPropagation(); 
        handleFileChange(e.dataTransfer.files);
    }, [handleFileChange]);

    const handleRemoveVideo = (idToRemove: number) => {
        setVideoFiles(prevFiles => prevFiles.filter(file => file.id !== idToRemove));
    };

    const processVideo = async (video: VideoFile): Promise<Partial<VideoFile>> => {
        try {
            const frames = await extractFramesFromVideo(video.file, 1);
            if (frames.length === 0) {
                throw new Error("Could not extract frame from video.");
            }
            const imagePayload = { imageBytes: frames[0], mimeType: 'image/jpeg' };

            const response = await fetch('/api/ai/video-generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt, aspectRatio: '16:9', image: imagePayload })
            });

            if (!response.ok) throw new Error("Generation failed");
            const resultData = await response.json();
            const resultUrl = resultData.url;
            
            const headResponse = await fetch(resultUrl);
            const blob = await headResponse.blob();
            onMediaGenerated(prompt, 'video', blob.size, resultUrl);
            
            return { resultUrl, status: 'done' };
        } catch (err) {
            console.error(err);
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            return { status: 'error', error: errorMessage };
        }
    };
    
    const handleStartProcessing = async () => {
        if (!prompt) {
            alert('Please enter a prompt to apply to all videos.');
            return;
        }
        if (!deductTokens(totalCost)) {
            return;
        }
        setIsProcessing(true);
        setProgress(0);
        
        let processedCount = 0;
        const totalVideos = videoFiles.length;

        for (const video of videoFiles) {
            setVideoFiles(prev => prev.map(f => f.id === video.id ? { ...f, status: 'processing' } : f));
            const result = await processVideo(video);
            setVideoFiles(prev => prev.map(f => f.id === video.id ? { ...f, ...result } : f));
            processedCount++;
            setProgress((processedCount / totalVideos) * 100);
        }

        setIsProcessing(false);
    };

    const handleClearAll = () => {
        setVideoFiles([]);
        setPrompt('');
        setIsProcessing(false);
        setProgress(0);
    };

    const handleIndividualDownload = (url: string, name: string) => {
        if (!requireSignIn()) return;
        const link = document.createElement('a');
        link.href = url;
        link.download = `${name.split('.')[0]}_edited.mp4`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="p-6 md:p-8">
            <h2 className="text-2xl font-bold text-white">Video Batch Editor</h2>
            <p className="text-gray-400 mt-1 mb-6">Apply the same AI edit to multiple videos at once.</p>
            
            {videoFiles.length === 0 ? (
                 <label onDragOver={handleDragOver} onDrop={handleDrop} className="flex justify-center w-full h-64 px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md cursor-pointer hover:border-blue-500 transition-colors">
                    <div className="space-y-1 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-500" stroke="currentColor" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                        <div className="flex text-sm text-gray-400"><p className="pl-1">or drag and drop multiple videos</p></div><p className="text-xs text-gray-500">MP4, MOV, up to 10 files</p>
                    </div>
                    <input id="video-batch-upload" name="video-batch-upload" type="file" multiple className="sr-only" accept="video/*" onChange={(e) => { handleFileChange(e.target.files); e.currentTarget.value = ''; }}/>
                </label>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-200">{videoFiles.length} videos loaded</h3>
                            <button onClick={handleClearAll} className="text-sm text-red-400 hover:underline">Clear All</button>
                        </div>
                        <label htmlFor="batch-prompt-video" className="block text-sm font-medium text-gray-300">AI Editing Prompt</label>
                        <textarea id="batch-prompt-video" rows={4} className="mt-1 block w-full ai-textarea" placeholder="e.g., 'Make it look like a vintage film'" value={prompt} onChange={(e) => setPrompt(e.target.value)} />
                        <div className="mt-4 space-y-2">
                            <ActionButton onClick={handleStartProcessing} disabled={isProcessing || !prompt || userTokens < totalCost} isLoading={isProcessing} text={`Process ${videoFiles.length} Videos (${totalCost} tokens)`} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a1 1 0 011-1h14a1 1 0 110 2H3a1 1 0 01-1-1z" /></svg>} />
                            <p className="text-xs text-center text-gray-400">Note: Video processing is resource-intensive and may take several minutes per video.</p>
                        </div>
                        {isProcessing && (
                            <div className="mt-4">
                                <div className="w-full bg-[#10161B] rounded-full h-2.5 overflow-hidden border border-[#26313A]">
                                    <div className="bg-[#8DB8CC] h-2.5 rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(141,184,204,0.6)]" style={{ width: `${progress}%` }}></div>
                                </div>
                                <p className="text-center text-sm text-gray-400 mt-2">{Math.round(progress)}% complete</p>
                            </div>
                        )}
                    </div>
                    <div className="max-h-[70vh] overflow-y-auto pr-2">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {videoFiles.map(vid => (
                                <div key={vid.id} className="relative group aspect-video bg-[#10161B] rounded-xl overflow-hidden border border-[#26313A]">
                                    <video src={vid.status === 'done' && vid.resultUrl ? vid.resultUrl : vid.previewUrl} muted loop playsInline className="w-full h-full object-cover"/>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleRemoveVideo(vid.id); }}
                                        className="absolute top-1 right-1 bg-gray-900/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all z-10 cursor-pointer"
                                        title="Remove video"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                    {vid.status === 'processing' && <div className="absolute inset-0 bg-black/70 flex items-center justify-center"><div className="w-6 h-6 border-2 border-dashed rounded-full animate-spin border-white"></div></div>}
                                    {vid.status === 'done' && vid.resultUrl && (
                                        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 space-y-1.5">
                                            <button onClick={() => onNavigate('studio', undefined, { sourceVideoUrl: vid.resultUrl })} className="w-full text-center text-xs font-mono font-bold py-1.5 px-2 rounded-lg bg-gradient-to-r from-white via-[#E8F0F4] to-[#AFC3CF] text-[#050709] hover:brightness-110 shadow-[0_0_10px_rgba(255,255,255,0.2)] cursor-pointer">Edit Further</button>
                                            <button onClick={() => handleIndividualDownload(vid.resultUrl!, vid.file.name)} className="w-full text-center text-xs font-mono font-bold py-1.5 px-2 rounded-lg bg-[#10161B] border border-[#26313A] text-[#8DB8CC] hover:text-white cursor-pointer">Download</button>
                                        </div>
                                    )}
                                    {vid.status === 'error' && <div className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1" title={vid.error}><svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.697a1 1 0 010-1.414z" clipRule="evenodd" /></svg></div>}
                                </div>
                            ))}
                              <label className="flex items-center justify-center aspect-video bg-[#10161B] rounded-xl border-2 border-dashed border-[#26313A] hover:border-[#8DB8CC] transition-colors text-gray-400 cursor-pointer">
                                <div className="text-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto text-[#8DB8CC]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                                    <span className="text-xs mt-1 text-[#AFC3CF]">Add More</span>
                                </div>
                                <input type="file" multiple className="sr-only" accept="video/*" onChange={(e) => { handleFileChange(e.target.files); e.currentTarget.value = ''; }}/>
                            </label>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VideoBatchEditor;
