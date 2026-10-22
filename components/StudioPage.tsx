import React from 'react';
import { Page, User, Asset, FeaturePageId, StudioTab, PreloadedAssetState, OnNavigateType } from '../types';
import ContentRenderer from './ContentRenderer';

interface StudioPageProps {
  user: User | null;
  onNavigate: OnNavigateType;
  requireSignIn: () => boolean;
  userTokens: number;
  hasTokens: (amount: number) => boolean;
  deductTokens: (amount: number, description?: string) => boolean;
  onMediaGenerated: (name: string, type: Asset['type'], size: number, url: string) => void;
  
  // State lifted to App.tsx
  activePage: FeaturePageId;
  viewMode: 'info' | 'tool';
  onLaunchTool: (page: FeaturePageId, assets?: PreloadedAssetState) => void;
  preloadedAssetState: PreloadedAssetState | null;
  onUpdateUser: (updates: Partial<User>) => Promise<void>;
}

const StudioPage: React.FC<StudioPageProps> = (props) => {
    return (
        <div className="studio-container">
            <main className="main-content">
                <ContentRenderer 
                    {...props} 
                />
            </main>
        </div>
    );
};

export default StudioPage;