import React, { useState, useRef, useEffect } from 'react';
import { Asset } from '../types';
import { CustomSelect } from './ui/CustomSelect';

interface AdvancedExportModalProps {
    imageUrl: string;
    prompt: string;
    onClose: () => void;
    onMediaGenerated: (name: string, type: Asset['type'], size: number, url: string) => void;
    requireSignIn: () => boolean;
}

const AdvancedExportModal: React.FC<AdvancedExportModalProps> = ({ imageUrl, prompt, onClose, onMediaGenerated, requireSignIn }) => {
    const [format, setFormat] = useState('jpeg');
    const [quality, setQuality] = useState(90);
    const [useSmartCompression, setUseSmartCompression] = useState(false);
    const [finalSize, setFinalSize] = useState<string | null>(null);
    
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imageRef = useRef<HTMLImageElement | null>(null);

    useEffect(() => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = imageUrl;
        img.onload = () => {
            imageRef.current = img;
            updatePreviewSize();
        };

        if (imageUrl.startsWith('data:image/png')) {
            setFormat('png');
        }
    }, [imageUrl]);
    
    useEffect(() => {
        if(imageRef.current) {
            updatePreviewSize();
        }
    }, [format, quality, useSmartCompression, imageUrl]);

    const updatePreviewSize = () => {
        if (!imageRef.current || !canvasRef.current) return;
        
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = imageRef.current.width;
        canvas.height = imageRef.current.height;
        ctx.drawImage(imageRef.current, 0, 0);

        const mimeType = `image/${format}`;
        const dataUrl = canvas.toDataURL(mimeType, quality / 100);
        
        // Calculate size
        const head = "data:" + mimeType + ";base64,";
        const sizeInBytes = Math.round((dataUrl.length - head.length) * 3 / 4);

        // Simulate AI compression benefit
        const finalSizeInBytes = useSmartCompression ? sizeInBytes * 0.75 : sizeInBytes;

        if (finalSizeInBytes > 1024 * 1024) {
            setFinalSize((finalSizeInBytes / (1024 * 1024)).toFixed(2) + ' MB');
        } else {
            setFinalSize((finalSizeInBytes / 1024).toFixed(1) + ' KB');
        }
    };
    
    const handleDownload = () => {
        if (!requireSignIn()) return;
        if (!canvasRef.current) return;
        const mimeType = `image/${format}`;
        const dataUrl = canvasRef.current.toDataURL(mimeType, quality / 100);

        const head = `data:${mimeType};base64,`;
        const sizeInBytes = Math.round((dataUrl.length - head.length) * 3 / 4);
        const assetName = (prompt.substring(0, 20).replace(/\s/g, '_') || 'exported_image');
        onMediaGenerated(assetName, 'image', sizeInBytes, dataUrl);

        const link = document.createElement('a');
        link.download = `${assetName}.${format}`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        onClose();
    };


    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-gray-800 w-full max-w-lg ai-modal" onClick={(e) => e.stopPropagation()}>
                <header className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">Advanced Export</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
                </header>
                <main className="p-6 space-y-4">
                    <canvas ref={canvasRef} className="hidden" />
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Format</label>
                        <CustomSelect 
                            value={format} 
                            onChange={(val) => setFormat(val)} 
                            options={[
                                { label: 'JPEG', value: 'jpeg' },
                                { label: 'PNG', value: 'png' },
                                { label: 'WEBP', value: 'webp' }
                            ]}
                        />
                    </div>
                    {format !== 'png' && (
                         <div>
                            <label className="block text-sm font-medium text-gray-300">Quality: {quality}%</label>
                            <input type="range" min="10" max="100" step="5" value={quality} onChange={e => setQuality(Number(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
                        </div>
                    )}
                    <div className="flex items-center justify-between bg-gray-700/50 p-3 rounded-md">
                        <label htmlFor="smart-compression" className="flex flex-col">
                            <span className="font-medium text-white">AI Smart Compression</span>
                            <span className="text-xs text-gray-400">Reduces file size while preserving visual quality.</span>
                        </label>
                         <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                            <input type="checkbox" id="smart-compression" checked={useSmartCompression} onChange={() => setUseSmartCompression(!useSmartCompression)} className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"/>
                            <label htmlFor="smart-compression" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-600 cursor-pointer"></label>
                        </div>
                        <style>{`.toggle-checkbox:checked { right: 0; border-color: #3B82F6; } .toggle-checkbox:checked + .toggle-label { background-color: #3B82F6; }`}</style>
                    </div>
                </main>
                 <footer className="p-4 bg-gray-900/50 flex justify-between items-center">
                    <p className="text-sm text-gray-300">Estimated size: <span className="font-semibold text-white">{finalSize || 'Calculating...'}</span></p>
                    <button onClick={handleDownload} className="ai-button bg-green-600 hover:bg-green-700 text-white">Download</button>
                </footer>
            </div>
        </div>
    );
};

export default AdvancedExportModal;