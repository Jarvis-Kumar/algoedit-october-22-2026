
import React, { useState, useEffect } from 'react';
import { Page, User, Asset, FeaturePageId, StudioTab, PreloadedAssetState, OnNavigateType, Project, CollaboratorPresence } from '../types';
import { CollaborationService } from '../services/CollaborationService';
import CollaborationPanel from './CollaborationPanel';
import { Users, History, Share2, MoreHorizontal, Shield, Settings, Activity, Sparkles, ChevronRight, ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

import ImageGenerator from './ImageGenerator';
import ImageEditor from './ImageEditor';
import ImageStyleTransfer from './ImageStyleTransfer';
import BatchEditor from './BatchEditor';
import IdeationAssistant from './IdeationAssistant';

import VideoGenerator from './VideoGenerator';
import VideoEditor from './VideoEditor';
import VideoStyleTransfer from './VideoStyleTransfer';
import VideoBatchEditor from './VideoBatchEditor';

import WritingAssistant from './WritingAssistant';
import AutomationStudio from './AutomationStudio';
import WallpaperStudio from './WallpaperStudio';
import InteriorStudio from './InteriorStudio';
import PosterAutomationStudio from './PosterAutomationStudio';
import NeuralEditingEngine from './NeuralEditingEngine';
import SmartDrawToEdit from './SmartDrawToEdit';
import FalModelShowcase from './FalModelShowcase';
import BrandIdentityEngine from './BrandIdentityEngine';
import MovieStudio from './MovieStudio';
import AgentLabs from './AgentLabs';
import AITutorStudio from './AITutorStudio';
import InnovationHub from './InnovationHub';
import StudioDashboard from './StudioDashboard';
import ProjectPanel from './ProjectsPanel';
import FavoritesPage from './FavoritesPage';
import AccountSettingsPage from './AccountSettingsPage';
import FeatureIntro from './FeatureIntro';
import { featuresData } from '../data/features';
import { SpecializedPlayground } from './SpecializedPlayground';

type CreativeToolId = 'dashboard' | 'generate' | 'edit' | 'style' | 'compose' | 'background' | 'upscale' | 'batch' | 'ideation' | 'automation' | 'wallpaper' | 'interior' | 'smart-edit' | 'neural-hub' | 'brand-engine' | 'movie-studio' | 'agent-labs' | 'innovation-hub' | 'projects' | 'favorites' | 'settings' | 'templates' | 'neural-editing' | 'poster-engine';
type MediaType = 'image' | 'video' | 'text';

const TABS: { id: CreativeToolId, name: string, supportsVideo: boolean, icon: string }[] = [
    { id: 'dashboard', name: 'Dashboard', supportsVideo: false, icon: '🏠' },
    { id: 'neural-editing', name: 'Neural Engine', supportsVideo: true, icon: '🧠' },
    { id: 'neural-hub', name: 'Neural Hub', supportsVideo: true, icon: '🚀' },
    { id: 'movie-studio', name: 'Movie Forge', supportsVideo: true, icon: '🎬' },
    { id: 'agent-labs', name: 'Agent Labs', supportsVideo: false, icon: '🤖' },
    { id: 'innovation-hub', name: 'Innovator', supportsVideo: true, icon: '💡' },
    { id: 'generate', name: 'Synthesize', supportsVideo: true, icon: '✨' },
    { id: 'compose', name: 'Compose', supportsVideo: false, icon: '✍️' },
    { id: 'edit', name: 'Refine', supportsVideo: true, icon: '🪄' },
    { id: 'style', name: 'Style', supportsVideo: true, icon: '🎨' },
    { id: 'batch', name: 'Automate', supportsVideo: true, icon: '⚙️' },
    { id: 'automation', name: 'Pro Studio', supportsVideo: true, icon: '🚀' },
    { id: 'wallpaper', name: 'Wallpaper', supportsVideo: false, icon: '📱' },
    { id: 'poster-engine', name: 'Poster Forge', supportsVideo: false, icon: '🖼️' },
    { id: 'smart-edit', name: 'Smart Edit', supportsVideo: false, icon: '🎯' },
    { id: 'interior', name: 'Interior', supportsVideo: false, icon: '🏠' },
    { id: 'ideation', name: 'Nexus AI', supportsVideo: false, icon: '🧠' },
];

const featureToToolMap: Partial<Record<FeaturePageId, { tab: CreativeToolId, type: MediaType }>> = {
    'home-main': { tab: 'dashboard', type: 'image' },
    'ai-tools': { tab: 'neural-hub', type: 'image' },
    'all-ai-models': { tab: 'neural-hub', type: 'image' },
    
    'ai-image-generator': { tab: 'generate', type: 'image' },
    'ai-video-generator': { tab: 'generate', type: 'video' },
    'ai-editing-suite': { tab: 'edit', type: 'image' },
    'ai-design-studio': { tab: 'automation', type: 'image' },
    'ai-thumbnail-maker': { tab: 'generate', type: 'image' },
    'ai-template-hub': { tab: 'automation', type: 'image' },
    'adaptive-design': { tab: 'smart-edit', type: 'image' },
    'interactive-editing': { tab: 'edit', type: 'image' },

    'ai-tutor': { tab: 'compose', type: 'text' },
    'homework-helper': { tab: 'compose', type: 'text' },
    'diagram-creator': { tab: 'ideation', type: 'image' },
    'quiz-generator': { tab: 'compose', type: 'text' },
    'visual-learning': { tab: 'innovation-hub', type: 'video' },

    'image-studio': { tab: 'generate', type: 'image' },
    'video-studio': { tab: 'generate', type: 'video' },
    'avatar-studio': { tab: 'generate', type: 'image' },
    'shorts-studio': { tab: 'automation', type: 'video' },
    'image-generator': { tab: 'generate', type: 'image' },
    'prompt-to-image': { tab: 'generate', type: 'image' },
    'image-enhancer': { tab: 'edit', type: 'image' },
    'style-transfer': { tab: 'style', type: 'image' },
    'video-generator': { tab: 'generate', type: 'video' },
    'video-editor': { tab: 'edit', type: 'video' },
    'style-transfer-video': { tab: 'style', type: 'video' },
    'batch-edit': { tab: 'batch', type: 'image' },
    'ideation': { tab: 'ideation', type: 'image' },
    
    'writing-assistant': { tab: 'compose', type: 'text' },
    'contextual-optimization': { tab: 'compose', type: 'text' },
    'intelligent-rephrasing': { tab: 'compose', type: 'text' },
    'style-adaptation': { tab: 'compose', type: 'text' },
    'multi-language-edit': { tab: 'compose', type: 'text' },
    
    'auto-shorts-maker': { tab: 'automation', type: 'video' },
    'auto-caption-generator': { tab: 'automation', type: 'video' },
    'video-cleanup': { tab: 'automation', type: 'video' },
    'shorts-cut-detection': { tab: 'automation', type: 'video' },
    'wallpaper-generator': { tab: 'wallpaper', type: 'image' },
    'smart-draw-to-edit': { tab: 'smart-edit', type: 'image' },
    'interior-redesign': { tab: 'interior', type: 'image' },
    'my-projects': { tab: 'projects', type: 'image' },
    'my-templates': { tab: 'templates', type: 'image' },
    'favorites': { tab: 'favorites', type: 'image' },
    'workspace-settings': { tab: 'settings', type: 'image' },
    'automation-studio': { tab: 'automation', type: 'video' },
    'poster-automation': { tab: 'poster-engine', type: 'image' },
    'neural-editing': { tab: 'neural-editing', type: 'image' },
};

interface CreativeStudioProps {
  initialActiveTool: FeaturePageId;
  user: User | null;
  onNavigate: OnNavigateType;
  onUpdateUser: (updates: Partial<User>) => Promise<void>;
  requireSignIn: () => boolean;
  userTokens: number;
  hasTokens: (amount: number) => boolean;
  deductTokens: (amount: number, description?: string) => boolean;
  onMediaGenerated: (name: string, type: Asset['type'], size: number, url: string) => void;
  preloadedAssetState: PreloadedAssetState | null;
}

const MediaTypeToggle: React.FC<{
    value: MediaType;
    onChange: (value: MediaType) => void;
    disabled: boolean;
}> = ({ value, onChange, disabled }) => (
    <div className="flex p-1 rounded-xl bg-black/60 border border-white/5">
        <button 
            onClick={() => onChange('image')}
            className={`flex-1 px-6 py-2.5 text-[11px] sm:text-xs font-black uppercase tracking-widest rounded-lg transition-all ${value === 'image' ? 'bg-white/15 text-white shadow-inner' : 'text-slate-400 hover:text-slate-200'}`}
        >
            Image
        </button>
        <button
            onClick={() => onChange('video')}
            disabled={disabled}
            className={`flex-1 px-6 py-2.5 text-[11px] sm:text-xs font-black uppercase tracking-widest rounded-lg transition-all ${value === 'video' ? 'bg-white/15 text-white shadow-inner' : 'text-slate-400 hover:text-slate-200 disabled:opacity-20'}`}
        >
            Motion
        </button>
    </div>
);

const CreativeStudio: React.FC<CreativeStudioProps> = (props) => {
    const [activeTab, setActiveTab] = useState<CreativeToolId>('dashboard');
    const [mediaType, setMediaType] = useState<MediaType>('image');
    const [showCollabPanel, setShowCollabPanel] = useState(false);
    const [currentProject, setCurrentProject] = useState<Project | null>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [overrideTokenCost, setOverrideTokenCost] = useState<number | null>(null);

    useEffect(() => {
        setOverrideTokenCost(null);
    }, [activeTab, mediaType]);

    useEffect(() => {
        // Initialize or fetch current project
        const projects = CollaborationService.getProjects();
        let project = projects[0]; // For demo, just take the first one

        if (!project && props.user) {
            project = {
                id: 'demo-project-1',
                workspaceId: 'demo-workspace-1',
                name: 'Synthesized Vision 2026',
                lastUpdate: new Date().toISOString(),
                members: [
                    { id: props.user.email, name: props.user.name, email: props.user.email, role: 'Owner' }
                ],
                versionHistory: [],
                activityLogs: [],
                currentState: {}
            };
            CollaborationService.saveProject(project);
        }
        setCurrentProject(project || null);
    }, [props.user]);

    useEffect(() => {
        const mapping = featureToToolMap[props.initialActiveTool];
        if (mapping) {
            setActiveTab(mapping.tab);
            setMediaType(mapping.type);
        }
    }, [props.initialActiveTool]);

    const renderContent = () => {
        // Handle all specialized professional AI tools
        if ([
          'effects-studio', 'lora-studio', 'face-swap', 'background-remover', 'green-screen', 
          'sketch-to-image', 'image-upscaler', 'photo-restoration', 'photo-colorizer', 'magic-eraser', 
          'image-expand', 'object-replace', 'canvas-expand', 'prompt-builder', 'product-studio', 
          'logo-creator', 'interior-designer', 'character-creator', 'anime-creator', 'pixel-studio', 
          'cinematic-fx', 'light-studio', 'world-builder', 'scene-creator', 'landscape-studio', 
          'motion-fx', 'video-enhancer', 'video-upscaler', 'lip-sync-studio', 'voice-clone', 
          'voice-generator', 'speech-transcriber', 'thumbnail-creator', 'poster-creator', 
          'social-studio', 'background-creator', 'depth-creator', '3d-creator', 'animation-studio', 
          'smart-reframe',
          
          // Image Categories
          'background-remover-image', 'object-remover-image', 'image-enhancer', 'upscale-2k', 'upscale-4k', 
          'style-transfer', 'replace-background', 'replace-object', 'face-restore-image', 'color-correction', 
          'lighting-fix', 'anime-convert', 'sketch-to-photo', 'pencil-sketch-convert',

          // Video Categories
          'video-background-removal', 'video-upscale', 'slow-motion', 'speed-ramp', 'lip-sync-fix', 
          'motion-retarget', 'video-color-grade', 'video-cleanup',

          // Avatar Categories
          'talking-avatar', 'lip-sync-avatar', '3d-avatar-maker', 'cartoon-avatar', 'corporate-avatar',

          // Social Categories
          'auto-shorts-maker', 'auto-caption-generator', 'tiktok-style-edits', 'reels-enhancer', 'shorts-cut-detection',

          // Filter Categories
          'ai-gta-filter', 'ai-jojo-filter', 'comic-filter', 'neon-filter', 'pixel-filter', 
          'manga-shadows', 'glitch-fx', 'bollywood-style', 'hollywood-cinematic', 'vaporwave', 'retro-vhs',

          // Restore Categories
          'image-restore', 'video-restore', 'noise-removal', 'denoiser-remaster', 'super-resolution',

          // Multi-model Categories
          'multi-model-render', '4k-video-generator', 'ultra-enhance', 'raw-image-processor',

          // Fun/Activity Categories
          'cartoonify', 'old-age-filter', 'baby-filter', 'zombie-filter', 'cartoon-video', 
          'ai-dance-generator', 'anime-video-enhancer', 'music-beat-sync',

          // Design/Palette Categories
          'prompt-to-image', 'concept-art', 'logo-generator', 'prompt-to-video', 
          'scene-generator', 'character-animation', 'talking-portrait', 'anime-character', 
          'game-character', 'mascot-character', '3d-character', 'image-to-animation-gen', 
          'video-to-animation-gen', 'motion-animation', 'digital-dance'
        ].includes(props.initialActiveTool)) {
            return (
                <SpecializedPlayground 
                    toolId={props.initialActiveTool}
                    user={props.user}
                    deductTokens={props.deductTokens}
                    onMediaGenerated={props.onMediaGenerated}
                    requireSignIn={props.requireSignIn}
                    onNavigate={props.onNavigate}
                />
            );
        }

        switch (activeTab) {
            case 'dashboard':
                return <StudioDashboard onLaunch={(id) => setActiveTab(id as any)} onNavigate={props.onNavigate} />;
            case 'neural-editing':
                return <NeuralEditingEngine user={props.user} deductTokens={props.deductTokens} onMediaGenerated={props.onMediaGenerated} />;
            case 'neural-hub':
                return (
                    <FalModelShowcase 
                        mediaType={mediaType} 
                        user={props.user}
                        userTokens={props.userTokens}
                        hasTokens={props.hasTokens}
                        deductTokens={props.deductTokens}
                        requireSignIn={props.requireSignIn}
                    />
                );
            case 'brand-engine':
                return <BrandIdentityEngine />;
            case 'movie-studio':
                return <MovieStudio />;
            case 'agent-labs':
                return <AgentLabs />;
            case 'innovation-hub':
                return <InnovationHub />;
            case 'generate':
                return mediaType === 'image' 
                    ? <ImageGenerator {...props} onCostChange={setOverrideTokenCost} /> 
                    : <VideoGenerator {...props} onCostChange={setOverrideTokenCost} />;
            case 'edit':
                return mediaType === 'image' ? <ImageEditor {...props} /> : <VideoEditor {...props} />;
            case 'style':
                return mediaType === 'image' ? <ImageStyleTransfer {...props} likedPresets={new Set()} followedAuthors={new Set()} onToggleLike={()=>{}} onToggleFollow={()=>{}} allPresets={[]} purchasedPresets={new Set()} onPurchasePreset={()=>{}} onStripePurchase={()=>{}} currency='USD' /> : <VideoStyleTransfer {...props} />;
            case 'compose':
                return props.initialActiveTool === 'ai-tutor' ? <AITutorStudio /> : <WritingAssistant {...props} />;
            case 'batch':
                return mediaType === 'image' ? <BatchEditor {...props} /> : <VideoBatchEditor {...props} />;
            case 'ideation':
                return <IdeationAssistant {...props} />;
            case 'automation':
                return <AutomationStudio {...props} />;
            case 'wallpaper':
                return <WallpaperStudio {...props} />;
            case 'poster-engine':
                return <PosterAutomationStudio {...props} />;
            case 'interior':
                return <InteriorStudio {...props} />;
            case 'smart-edit':
                return <SmartDrawToEdit {...props} />;
            case 'projects':
                return <ProjectPanel user={props.user} onNavigate={props.onNavigate} mode="projects" />;
            case 'favorites':
                return <FavoritesPage user={props.user} onNavigate={props.onNavigate} />;
            case 'settings':
                return <AccountSettingsPage user={props.user} onUpdateUser={props.onUpdateUser} onNavigate={props.onNavigate} />;
            case 'templates':
                return <ProjectPanel user={props.user} onNavigate={props.onNavigate} mode="templates" />;
            default:
                return <ImageGenerator {...props} />;
        }
    };

    const handleRestore = (versionId: string) => {
        if (!currentProject || !props.user) return;
        const updated = CollaborationService.restoreVersion(currentProject, versionId, props.user);
        setCurrentProject(updated);
        alert(`Project restored to selected version.`);
    };

    const handleAction = (summary: string) => {
        if (!currentProject || !props.user) return;
        const updated = CollaborationService.createSnapshot(currentProject, props.user, summary);
        setCurrentProject(updated);
    };

    const toolToFeatureMap: Record<CreativeToolId, FeaturePageId> = {
        'dashboard': 'home-main',
        'generate': mediaType === 'image' ? 'ai-image-generator' : 'ai-video-generator',
        'edit': mediaType === 'image' ? 'ai-editing-suite' : 'video-editor',
        'style': mediaType === 'image' ? 'style-transfer' : 'style-transfer-video',
        'batch': mediaType === 'image' ? 'batch-edit' : 'video-batch-editor',
        'compose': 'writing-assistant',
        'automation': 'automation-studio',
        'poster-engine': 'poster-automation',
        'neural-editing': 'neural-editing',
        'wallpaper': 'wallpaper-generator',
        'interior': 'interior-redesign',
        'smart-edit': 'smart-draw-to-edit',
        'neural-hub': 'all-ai-models',
        'brand-engine': 'ai-design-studio',
        'movie-studio': 'movie-studio',
        'agent-labs': 'agent-labs',
        'innovation-hub': 'innovation-hub',
        'ideation': 'ideation',
        'background': 'replace-background',
        'upscale': 'upscale-4k',
        'projects': 'my-projects',
        'favorites': 'favorites',
        'settings': 'workspace-settings',
        'templates': 'my-templates'
    };

    const currentFeatureId = toolToFeatureMap[activeTab];
    const featureData = featuresData[currentFeatureId] || featuresData[props.initialActiveTool] || featuresData['ai-image-generator'];
    const [showInfo, setShowInfo] = useState(true);

    return (
        <div className="flex flex-col min-h-screen bg-studio-gradient relative selection:bg-white/20">
            <AnimatePresence>
                {showCollabPanel && currentProject && props.user && (
                    <CollaborationPanel 
                        project={currentProject}
                        user={props.user}
                        onRestore={handleRestore}
                        onClose={() => setShowCollabPanel(false)}
                        onUpdateProject={setCurrentProject}
                    />
                )}
            </AnimatePresence>

            {/* Feature Info Sidebar (Integrated Explanation) */}
            <AnimatePresence>
                {showInfo && featureData && activeTab !== 'dashboard' && (
                    <motion.div 
                        initial={{ opacity: 0, x: -300 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -300 }}
                        className="fixed left-0 top-1/2 -translate-y-1/2 z-[100] w-[280px] p-6 bg-black/60 backdrop-blur-3xl border-y border-r border-white/10 rounded-r-[40px] shadow-[40px_0_100px_rgba(0,0,0,0.8)] hidden xl:block"
                    >
                        <button 
                            onClick={() => setShowInfo(false)}
                            className="absolute top-6 right-6 w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-colors"
                        >
                            <MoreHorizontal size={14} />
                        </button>

                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-[#10161B] border border-[#26313A] flex items-center justify-center p-1.5 shadow-lg text-[#8DB8CC]">
                                    {React.cloneElement(featureData.icon as React.ReactElement<any>, { size: 16, className: 'text-[#8DB8CC]' } as any)}
                                </div>
                                <h3 className="text-xs font-black text-white uppercase tracking-widest leading-tight">{featureData.name}</h3>
                            </div>
                            
                            <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                                {featureData.description}
                            </p>

                            <div className="space-y-4 pt-4 border-t border-white/5">
                                <div className="flex items-center gap-2 text-[9px] font-black text-white uppercase tracking-widest">
                                    <Sparkles size={12} className="text-[#8DB8CC]" />
                                    Key Capabilities
                                </div>
                                <ul className="space-y-2">
                                    {['Neural Synthesis', 'Recursive Refinement', 'Style Transfer'].map((cap, i) => (
                                        <li key={i} className="flex items-center gap-2 text-[9px] text-slate-500 font-mono">
                                            <div className="w-1 h-1 rounded-full bg-[#8DB8CC]" />
                                            {cap}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="p-4 rounded-2xl bg-[#10161B] border border-[#26313A]">
                                <p className="text-[9px] text-[#AFC3CF] font-bold tracking-wide italic">Pro Tip: Use the 'Neural_Link' command for localized context synthesis.</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {!showInfo && activeTab !== 'dashboard' && (
                <button 
                    onClick={() => setShowInfo(true)}
                    className="fixed left-0 top-1/2 -translate-y-1/2 z-[99] w-8 h-20 bg-black/40 backdrop-blur-md border border-white/10 rounded-r-2xl flex items-center justify-center text-slate-500 hover:text-studio-accent-cyan transition-all group hidden xl:flex"
                >
                    <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
            )}

            <header className="sticky top-0 z-30 bg-[#0a0a14]/85 border-b border-white/12 min-h-16 py-2.5 flex flex-wrap items-center px-6 shadow-[0_15px_40px_rgba(0,0,0,0.5)] backdrop-blur-3xl transition-all duration-300">
                <div className="flex flex-wrap items-center gap-2 flex-grow">
                    <div className="flex items-center gap-2.5 mr-4 pr-4 border-r border-white/10">
                        <div className="w-6.5 h-6.5 rounded-lg bg-[#10161B] border border-[#26313A] flex items-center justify-center p-1 shadow-[0_0_15px_rgba(141,184,204,0.2)]">
                             <Activity size={15} className="text-[#8DB8CC]" />
                        </div>
                        <span className="text-[12px] sm:text-xs font-black text-white uppercase tracking-[0.2em] italic">NEURAL_OS</span>
                    </div>
                    
                    <div className="relative">
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="px-4.5 h-10 rounded-xl bg-gradient-to-b from-[#10161B] to-[#0A0E12] border border-[#26313A] hover:border-[#AFC3CF]/40 text-white font-black text-xs uppercase tracking-widest flex items-center gap-2.5 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.3)] active:scale-98 cursor-pointer hover:-translate-y-0.5"
                        >
                            <span className="text-[#8DB8CC]">⚡</span>
                            <span>Workspace</span>
                            <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180 text-white' : ''}`} />
                        </button>

                        <AnimatePresence>
                            {isDropdownOpen && (
                                <>
                                    <div 
                                        className="fixed inset-0 z-40" 
                                        onClick={() => setIsDropdownOpen(false)} 
                                    />
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        transition={{ duration: 0.15, ease: 'easeOut' }}
                                        className="absolute left-0 mt-2.5 z-50 w-72 bg-[#09090f]/95 backdrop-blur-2xl border border-white/15 rounded-2xl p-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.8)] grid grid-cols-1 gap-1 max-h-[80vh] overflow-y-auto custom-scrollbar"
                                    >
                                        <div className="px-3.5 py-1.5 border-b border-white/5 mb-1.5 flex justify-between items-center">
                                            <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Active Core Modules</span>
                                        </div>
                                        {TABS.map(tab => {
                                            const isSelected = activeTab === tab.id;
                                            return (
                                                <button
                                                    key={tab.id}
                                                    onClick={() => {
                                                        setActiveTab(tab.id);
                                                        setIsDropdownOpen(false);
                                                        if (props.user) {
                                                            handleAction(`Switched to ${tab.name} tool`);
                                                        }
                                                    }}
                                                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-black tracking-wider transition-all flex items-center justify-between border cursor-pointer ${
                                                        isSelected 
                                                        ? 'bg-gradient-to-r from-white via-[#E8F0F4] to-[#AFC3CF] text-[#050709] border-transparent shadow-[0_4px_20px_rgba(255,255,255,0.3)] font-black scale-[1.02]' 
                                                        : 'text-slate-300 border-transparent hover:bg-white/5 hover:text-white hover:-translate-y-0.5'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-sm opacity-90">{tab.icon}</span>
                                                        <span className="font-mono uppercase">{tab.name}</span>
                                                    </div>
                                                    {isSelected && (
                                                        <span className="w-1.5 h-1.5 rounded-full bg-[#050709] shadow-[0_0_8px_rgba(0,0,0,0.5)]" />
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Quick indicator of currently selected workspace next to button */}
                    <div className="flex items-center gap-2 pl-3 border-l border-white/10 text-slate-500 text-[10px] sm:text-xs font-mono uppercase tracking-widest">
                        <span>/</span>
                        <span className="text-white font-extrabold">{TABS.find(t => t.id === activeTab)?.name}</span>
                    </div>

                </div>
                
                <div className="flex items-center gap-4 ml-4">
                    {activeTab !== 'dashboard' && activeTab !== 'compose' && activeTab !== 'ideation' && (
                        <div className="glass-panel p-0.5 rounded-xl border border-white/10 shadow-lg">
                            <MediaTypeToggle value={mediaType as any} onChange={setMediaType as any} disabled={!TABS.find(t=>t.id===activeTab)?.supportsVideo} />
                        </div>
                    )}
                </div>
            </header>
            
            <main className={`flex-grow ${activeTab === 'dashboard' ? 'p-0' : 'p-4 lg:p-6'} max-w-screen-2xl mx-auto w-full`}>
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={`${activeTab}-${mediaType}`}
                    className={`${activeTab === 'dashboard' ? '' : 'glass-panel p-4 lg:p-6 border-white/10'} min-h-[80vh] relative transition-all duration-700`}
                >
                    {/* Ambient Background Glows */}
                    {activeTab !== 'dashboard' && (
                        <>
                            <div className="absolute top-0 right-0 w-96 h-96 bg-[#8DB8CC]/5 blur-[120px] -z-10 pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/[0.02] blur-[120px] -z-10 pointer-events-none" />
                        </>
                    )}
                    
                    <div className="relative z-10">
                        {activeTab !== 'dashboard' && activeTab !== 'poster-engine' && currentFeatureId && featuresData[currentFeatureId] && (
                            <FeatureIntro feature={featuresData[currentFeatureId]!} overrideTokenCost={overrideTokenCost} />
                        )}
                        {renderContent()}
                    </div>
                </motion.div>
            </main>
        </div>
    );
};

export default CreativeStudio;
