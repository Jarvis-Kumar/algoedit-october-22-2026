
import React from 'react';
import { Page, User, Asset, FeaturePageId, StudioTab, PreloadedAssetState, OnNavigateType } from '../types';
import FeaturePage from './FeaturePage';
import { featuresData, getStudioForFeature } from '../data/features';
import CreativeStudio from './CreativeStudio';
import PlaceholderStudio from './PlaceholderStudio';
import StudioDashboard from './StudioDashboard';

interface ContentRendererProps {
  activePage: FeaturePageId;
  viewMode: 'info' | 'tool';
  onLaunchTool: (page: FeaturePageId, assets?: PreloadedAssetState) => void;
  preloadedAssetState: PreloadedAssetState | null;
  user: User | null;
  onNavigate: OnNavigateType;
  onUpdateUser: (updates: Partial<User>) => Promise<void>;
  requireSignIn: () => boolean;
  userTokens: number;
  hasTokens: (amount: number) => boolean;
  deductTokens: (amount: number, description?: string) => boolean;
  onMediaGenerated: (name: string, type: Asset['type'], size: number, url: string) => void;
}

const ContentRenderer: React.FC<ContentRendererProps> = (props) => {
    const { activePage, viewMode, onLaunchTool, onNavigate } = props;
    
    const feature = featuresData[activePage];
    const studioType = getStudioForFeature(activePage);

    // Dashboard handling
    if (activePage === 'home-main') {
        return <StudioDashboard onLaunch={(id) => onLaunchTool(id as FeaturePageId)} onNavigate={onNavigate} />;
    }

    // Redirect sidebar placeholders to CreativeStudio
    if (['pro-effects', 'fun-effects', 'photo-effects', 'ai-tools', 'app-page', 'api-page'].includes(activePage)) {
         return <CreativeStudio {...props} initialActiveTool={activePage} />;
    }

    // Show the studio for the feature.
    if (feature || studioType) {
        switch (studioType) {
            case 'Creative':
            case 'Avatar':
            case 'Shorts':
            case 'Workspace':
            case 'Account':
            default:
                return <CreativeStudio {...props} initialActiveTool={activePage} />;
        }
    }

    // Fallback -> Creative Studio
    return <CreativeStudio {...props} initialActiveTool={activePage} />;
};

export default ContentRenderer;
