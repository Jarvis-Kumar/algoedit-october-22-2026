



import React, { useState, useCallback, useEffect } from 'react';
import ActionButton from './ActionButton';
import { fileToBase64, fileToDataUrl } from '../utils/fileUtils';
import { urlToFile } from '../utils/urlToFile';
// FIX: Updated import for PreloadedAssetState to use the shared types file.
import { PreloadedAssetState, Page, StudioTab, OnNavigateType } from '../types';
import { AI_TOKEN_COSTS } from '../constants';

interface ImageFile {
    id: number;
    file: File;
    previewUrl: string;
    status: 'pending' | 'processing' | 'done' | 'error';
    resultUrl?: string;
    error?: string;
}

interface BatchEditorProps {
    preloadedImageUrls?: string[];
    onNavigate: OnNavigateType;
    requireSignIn: () => boolean;
    userTokens: number;
    deductTokens: (amount: number) => boolean;
}


const BatchEditor: React.FC<BatchEditorProps> = ({ preloadedImageUrls, onNavigate, requireSignIn, userTokens, deductTokens }) => {
    const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);
    const [prompt, setPrompt] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [progress, setProgress] = useState(0);
    const [preProcessState, setPreProcessState] = useState<ImageFile[] | null>(null);

    const costPerImage = AI_TOKEN_COSTS.BATCH_EDIT_PER_IMAGE;
    const totalCost = imageFiles.length * costPerImage;

    const handleFileChange = useCallback(async (files: FileList | null) => {
        if (!files) return;

        const filesToProcess = Array.from(files).filter(file => file.type.startsWith('image/'));
        
        if (filesToProcess.length === 0) return;

        const newImagePromises = filesToProcess.map(async (file): Promise<ImageFile | null> => {
            try {
                const previewUrl = await fileToDataUrl(file);
                return {
                    id: Date.now() + Math.random(), // more robust ID
                    file,
                    previewUrl,
                    status: 'pending',
                };
            } catch (err) {
                console.error("Error processing file for batch editor:", file.name, err);
                return null;
            }
        });

        const newImages = (await Promise.all(newImagePromises)).filter((img): img is ImageFile => img !== null);
        
        if (newImages.length > 0) {
            setImageFiles(prev => [...prev, ...newImages]);
        }
    }, []);

    useEffect(() => {
        if (preloadedImageUrls && preloadedImageUrls.length > 0) {
            const addImages = async () => {
                const newImageFiles: ImageFile[] = [];
                for (const [i, url] of preloadedImageUrls.entries()) {
                    try {
                        const file = await urlToFile(url, `preloaded-${Date.now()}-${i}.jpg`);
                        newImageFiles.push({
                            id: Date.now() + i,
                            file,
                            previewUrl: url,
                            status: 'pending',
                        });
                    } catch (err) {
                        console.error("Failed to load preloaded image:", err);
                    }
                }
                setImageFiles(prev => [...prev, ...newImageFiles]);
            };
            addImages();
        }
    }, [preloadedImageUrls]);
    
    const handleDragOver = useCallback((e: React.DragEvent<HTMLLabelElement>) => { e.preventDefault(); e.stopPropagation(); }, []);
    const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => { 
        e.preventDefault(); e.stopPropagation(); 
        handleFileChange(e.dataTransfer.files);
    }, [handleFileChange]);

    const handleRemoveImage = (idToRemove: number) => {
        setImageFiles(prevFiles => prevFiles.filter(file => file.id !== idToRemove));
    };

    const processImage = async (image: ImageFile): Promise<Partial<ImageFile>> => {
        try {
            const base64 = await fileToBase64(image.file);
            const response = await fetch('/api/ai/image-edit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ base64ImageData: base64, mimeType: image.file.type, prompt })
            });

            if (!response.ok) throw new Error("Edit failed");
            const resultData = await response.json();
            const resultUrl = resultData.url;
            
            return { resultUrl, status: 'done' };
        } catch (err) {
            console.error(err);
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            return { status: 'error', error: errorMessage };
        }
    };
    
    const handleStartProcessing = async () => {
        if (!prompt) {
            alert('Please enter a prompt to apply to all images.');
            return;
        }
        if (!deductTokens(totalCost)) {
            return;
        }
        setPreProcessState(JSON.parse(JSON.stringify(imageFiles))); // Save state for undo
        setIsProcessing(true);
        setProgress(0);
        
        let processedCount = 0;
        const totalImages = imageFiles.length;

        for (const image of imageFiles) {
            setImageFiles(prev => prev.map(f => f.id === image.id ? { ...f, status: 'processing' } : f));
            const result = await processImage(image);
            setImageFiles(prev => prev.map(f => f.id === image.id ? { ...f, ...result } : f));
            processedCount++;
            setProgress((processedCount / totalImages) * 100);
        }

        setIsProcessing(false);
    };

    const handleClearAll = () => {
        setImageFiles([]);
        setPrompt('');
        setIsProcessing(false);
        setProgress(0);
        setPreProcessState(null);
    };

    const handleUndoBatch = () => {
        if (preProcessState) {
            setImageFiles(preProcessState);
            setPreProcessState(null);
        }
    };

    const handleDownloadAll = () => {
        if (!requireSignIn()) return;
        const successfulImages = imageFiles.filter(img => img.status === 'done' && img.resultUrl);
        if (successfulImages.length > 0) {
            alert(`Simulating download of ${successfulImages.length} images as a ZIP file. This is a demo feature.`);
            // In a real app, you would use a library like JSZip to create and download the archive.
        } else {
            alert('There are no successfully processed images to download.');
        }
    };
    
    const handleIndividualDownload = (url: string, name: string) => {
        if (!requireSignIn()) return;
        const link = document.createElement('a');
        link.href = url;
        link.download = `${name.split('.')[0]}_edited.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="p-6 md:p-8">
            <h2 className="text-2xl font-bold text-white">Batch Editor</h2>
            <p className="text-gray-400 mt-1 mb-6">Apply the same AI edit to multiple images at once.</p>
            
            {imageFiles.length === 0 ? (
                 <label onDragOver={handleDragOver} onDrop={handleDrop} className="flex justify-center w-full h-64 px-6 pt-5 pb-6 border-2 border-[#26313A] border-dashed rounded-2xl cursor-pointer hover:border-[#8DB8CC] transition-colors bg-[#10161B]/60">
                    <div className="space-y-1 text-center"><svg className="mx-auto h-12 w-12 text-[#8DB8CC]" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg><div className="flex text-sm text-gray-400"><p className="pl-1">or drag and drop multiple images</p></div><p className="text-xs text-[#AFC3CF]">PNG, JPG, up to 20 files</p></div>
                    <input id="batch-upload" name="batch-upload" type="file" multiple className="sr-only" accept="image/*" onChange={(e) => { handleFileChange(e.target.files); e.currentTarget.value = ''; }}/>
                </label>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-200">{imageFiles.length} images loaded</h3>
                             <div className="flex items-center space-x-3">
                                {preProcessState && !isProcessing && <button onClick={handleUndoBatch} className="text-sm text-[#8DB8CC] hover:underline">Undo Batch</button>}
                                <button onClick={handleClearAll} className="text-sm text-red-400 hover:underline">Clear All</button>
                            </div>
                        </div>
                        <label htmlFor="batch-prompt" className="block text-sm font-medium text-gray-300">AI Editing Prompt</label>
                        <textarea id="batch-prompt" rows={4} className="mt-1 block w-full bg-[#10161B] border border-[#26313A] rounded-xl text-white sm:text-sm p-3 focus:border-[#8DB8CC]/50 outline-none" placeholder="e.g., 'Remove the background'" value={prompt} onChange={(e) => setPrompt(e.target.value)} />
                        <div className="mt-4 space-y-2">
                            <ActionButton onClick={handleStartProcessing} disabled={isProcessing || !prompt || userTokens < totalCost} isLoading={isProcessing} text={`Process ${imageFiles.length} Images (${totalCost} tokens)`} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a1 1 0 011-1h14a1 1 0 110 2H3a1 1 0 01-1-1z" /></svg>} />
                            <button onClick={handleDownloadAll} disabled={isProcessing || imageFiles.every(f => f.status !== 'done')} className="w-full flex items-center justify-center py-3 px-4 rounded-xl bg-[#10161B] border border-[#26313A] hover:border-[#AFC3CF]/40 text-xs font-mono font-bold uppercase tracking-wider text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#8DB8CC]" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                Download All (ZIP)
                            </button>
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
                            {imageFiles.map(img => (
                                <div key={img.id} className="relative group aspect-square bg-[#10161B] rounded-xl overflow-hidden border border-[#26313A]">
                                    <img src={img.status === 'done' && img.resultUrl ? img.resultUrl : img.previewUrl} className="w-full h-full object-cover"/>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleRemoveImage(img.id); }}
                                        className="absolute top-1 right-1 bg-gray-900/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all z-10"
                                        title="Remove image"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                    {img.status === 'processing' && <div className="absolute inset-0 bg-black/70 flex items-center justify-center"><div className="w-6 h-6 border-2 border-dashed rounded-full animate-spin border-white"></div></div>}
                                    {img.status === 'done' && img.resultUrl && (
                                        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 space-y-1.5">
                                            <button onClick={() => onNavigate('studio', undefined, { sourceImageUrl: img.resultUrl })} className="w-full text-center text-xs font-mono font-bold py-1.5 px-2 rounded-lg bg-gradient-to-r from-white via-[#E8F0F4] to-[#AFC3CF] text-[#050709] hover:brightness-110">Edit Further</button>
                                            <button onClick={() => onNavigate('studio', undefined, { sourceImageUrl: img.resultUrl })} className="w-full text-center text-xs font-mono font-bold py-1.5 px-2 rounded-lg bg-[#10161B] border border-[#26313A] text-white hover:border-[#AFC3CF]/40">Use as Source</button>
                                            <button onClick={() => handleIndividualDownload(img.resultUrl!, img.file.name)} className="w-full text-center text-xs font-mono font-bold py-1.5 px-2 rounded-lg bg-[#10161B] border border-[#26313A] text-[#8DB8CC] hover:text-white">Download</button>
                                        </div>
                                    )}
                                    {img.status === 'error' && <div className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1" title={img.error}><svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.697a1 1 0 010-1.414z" clipRule="evenodd" /></svg></div>}
                                </div>
                            ))}
                              <label className="flex items-center justify-center aspect-square bg-[#10161B] rounded-xl border-2 border-dashed border-[#26313A] hover:border-[#8DB8CC] transition-colors text-gray-400 cursor-pointer">
                                <div className="text-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto text-[#8DB8CC]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                                    <span className="text-xs mt-1 text-[#AFC3CF]">Add More</span>
                                </div>
                                <input type="file" multiple className="sr-only" accept="image/*" onChange={(e) => { handleFileChange(e.target.files); e.currentTarget.value = ''; }}/>
                            </label>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BatchEditor;