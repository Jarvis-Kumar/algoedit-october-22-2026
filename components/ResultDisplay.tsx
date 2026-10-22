import React, { useState } from 'react';

interface ResultDisplayProps {
    mediaUrl: string;
    mediaType: 'image' | 'video';
    prompt: string;
    requireSignIn: () => boolean;
    onPlay?: () => void;
    onPause?: () => void;
    onSeeked?: (time: number) => void;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ mediaUrl, mediaType, prompt, requireSignIn, onPlay, onPause, onSeeked }) => {
    const [isMuted, setIsMuted] = useState(true);

    const downloadMedia = () => {
        if (!requireSignIn()) {
            return;
        }
        // Note: Manual filters and audio settings applied via CSS/HTML properties won't be reflected in the direct download.
        // A real app would require server-side processing (e.g., with FFmpeg) to apply these changes to the file permanently.
        alert("Downloading the original, unprocessed media file.");

        const link = document.createElement('a');
        link.href = mediaUrl;
        const fileExtension = mediaType === 'video' ? 'mp4' : 'jpg';
        const fileName = prompt.substring(0, 20).replace(/\s/g, '_') || 'generated_media';
        link.download = `${fileName}.${fileExtension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    return (
        <div className="w-full bg-[#0A0E12] border border-[#26313A] p-5 rounded-2xl shadow-xl">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-4 text-[#AFC3CF] font-mono flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#8DB8CC] animate-pulse" />
                Render Output
            </h3>
            <div className="relative group rounded-xl overflow-hidden shadow-2xl bg-black border border-white/10">
                {mediaType === 'image' ? (
                    <img src={mediaUrl} alt={prompt} className="w-full h-auto object-contain max-h-[70vh]" />
                ) : (
                    <video 
                        src={mediaUrl} 
                        controls 
                        autoPlay 
                        loop 
                        muted={isMuted} 
                        onPlay={onPlay}
                        onPause={onPause}
                        onSeeked={(e) => onSeeked?.(e.currentTarget.currentTime)}
                        className="w-full h-auto object-contain max-h-[70vh]" 
                    />
                )}
            </div>
            {mediaType === 'video' && (
                <div className="mt-4 flex items-center">
                    <input type="checkbox" id="mute-toggle" checked={isMuted} onChange={() => setIsMuted(!isMuted)} className="w-4 h-4 text-[#8DB8CC] bg-[#10161B] border-[#26313A] rounded accent-[#8DB8CC] focus:ring-[#8DB8CC]" />
                    <label htmlFor="mute-toggle" className="ml-2 text-xs font-mono font-medium text-slate-300">Mute Video's Original Audio</label>
                </div>
            )}
            <button
                onClick={downloadMedia}
                className="w-full mt-4 bg-gradient-to-r from-white via-[#E8F0F4] to-[#AFC3CF] text-[#050709] font-black text-xs uppercase tracking-[0.2em] py-3.5 px-4 rounded-xl hover:brightness-110 active:scale-98 transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.2)] cursor-pointer"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Download Render
            </button>
        </div>
    );
};

export default ResultDisplay;