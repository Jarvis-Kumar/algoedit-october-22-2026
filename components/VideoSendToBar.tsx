



import React from 'react';
// FIX: Updated import for PreloadedAssetState to use the shared types file.
import { Page, StudioTab, PreloadedAssetState } from '../types';

interface VideoSendToBarProps {
    videoUrl: string;
    onNavigate: (page: Page, tab?: StudioTab, assets?: PreloadedAssetState) => void;
    actions: ('edit' | 'asSource' | 'asStyle')[];
}

const actionConfig: { [key in VideoSendToBarProps['actions'][0]]: { label: string; handler: (videoUrl: string, onNavigate: VideoSendToBarProps['onNavigate']) => void } } = {
    edit: { 
        label: 'Edit Video', 
        handler: (videoUrl, onNavigate) => onNavigate('studio', undefined, { sourceVideoUrl: videoUrl }) 
    },
    asSource: { 
        label: 'Use as Source', 
        handler: (videoUrl, onNavigate) => onNavigate('studio', undefined, { sourceVideoUrl: videoUrl }) 
    },
    asStyle: { 
        label: 'Use as Style', 
        handler: (videoUrl, onNavigate) => onNavigate('studio', undefined, { styleVideoUrl: videoUrl }) 
    },
};

const VideoSendToBar: React.FC<VideoSendToBarProps> = ({ videoUrl, onNavigate, actions }) => {
    if (!videoUrl) return null;

    const buttonStyle = "flex-1 ai-button text-xs bg-gray-700 hover:bg-gray-600 text-white disabled:bg-gray-800 disabled:cursor-not-allowed py-2 px-3 inline-flex items-center justify-center";

    return (
        <div className="w-full bg-gray-800/50 p-2 rounded-lg border border-gray-700 mt-4">
            <div className="flex items-center space-x-2">
                <span className="text-sm font-semibold text-gray-300 px-2">Switch to:</span>
                {actions.map(actionKey => {
                    const config = actionConfig[actionKey];
                    return (
                        <button 
                            key={actionKey} 
                            onClick={() => config.handler(videoUrl, onNavigate)}
                            className={buttonStyle}
                        >
                            {config.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default VideoSendToBar;