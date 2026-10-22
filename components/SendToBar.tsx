



import React from 'react';
// FIX: Updated import for PreloadedAssetState to use the shared types file.
import { Page, StudioTab, PreloadedAssetState } from '../types';

interface SendToBarProps {
    imageUrl: string;
    onNavigate: (page: Page, tab?: StudioTab, assets?: PreloadedAssetState) => void;
    actions: ('edit' | 'asSource' | 'asStyle' | 'toBatch')[];
}

const actionConfig: { [key in SendToBarProps['actions'][0]]: { label: string; handler: (imageUrl: string, onNavigate: SendToBarProps['onNavigate']) => void } } = {
    edit: { 
        label: 'Edit Further', 
        handler: (imageUrl, onNavigate) => onNavigate('studio', undefined, { sourceImageUrl: imageUrl }) 
    },
    asSource: { 
        label: 'Use as Source', 
        handler: (imageUrl, onNavigate) => onNavigate('studio', undefined, { sourceImageUrl: imageUrl }) 
    },
    asStyle: { 
        label: 'Use as Style', 
        handler: (imageUrl, onNavigate) => onNavigate('studio', undefined, { styleImageUrl: imageUrl }) 
    },
    toBatch: { 
        label: 'Add to Batch', 
        handler: (imageUrl, onNavigate) => onNavigate('studio', undefined, { batchImages: [imageUrl] }) 
    },
};


const SendToBar: React.FC<SendToBarProps> = ({ imageUrl, onNavigate, actions }) => {
    if (!imageUrl) return null;

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
                            onClick={() => config.handler(imageUrl, onNavigate)}
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

export default SendToBar;