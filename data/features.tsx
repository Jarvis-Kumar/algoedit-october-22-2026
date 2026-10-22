
import React from 'react';
import { FeaturePageId } from '../types';
import { TokenPricing } from '../services/tokenPricingConfig';
import { 
  Home, 
  Image as ImageIcon, 
  Video, 
  Wand2, 
  Palette, 
  Layout, 
  Folder, 
  Heart,
  Zap, 
  Users, 
  Settings, 
  Star, 
  GraduationCap, 
  Binary, 
  BookOpen, 
  Presentation, 
  ClipboardList,
  Cpu,
  Layers,
  Sparkles,
  MousePointer2,
  Box,
  HardDrive,
  CreditCard,
  Mail
} from 'lucide-react';

export interface FeatureDefinition {
  id: FeaturePageId;
  name: string;
  icon: React.ReactElement;
  description: string;
  longDescription: string;
  tokenCost: number;
  isTopFeature?: boolean;
  toolComponent?: 'CreativeStudio' | 'AvatarStudio' | 'ShortsStudio' | 'Placeholder';
  whyCool: { title: string; description: string }[];
  howItWorks: string;
  galleryImages: string[];
  useCases: { title: string; description: string }[];
  faqs: { question: string; answer: string }[];
}

export interface SidebarItemConfig {
    type: 'button-primary' | 'button-secondary' | 'link' | 'header' | 'divider' | 'socials';
    id?: FeaturePageId;
    name?: string;
    icon?: React.ReactElement;
    beta?: boolean;
}

const placeholderContent = (name: string) => ({
  longDescription: `Explore the full potential of ${name} and unlock new creative possibilities. This tool is designed for excellence.`,
  whyCool: [{ title: "Powerful", description: "Utilizes state-of-the-art AI for top-tier results." }, { title: "Fast", description: "Optimized for speed, delivering results in seconds." }, { title: "Versatile", description: "Perfect for a wide range of creative projects." }],
  howItWorks: `Our advanced AI analyzes your input and leverages vast datasets of linguistic information to generate a unique, high-quality result that matches your creative vision with ${name}.`,
  galleryImages: [],
  useCases: [{ title: "Business", description: `Create professional ${name} content for your brand.` }, { title: "Academic", description: "Perfect for students and researchers." }, { title: "Creative", description: "Bring your writing ideas to life." }],
  faqs: [{ question: `Is ${name} easy to use?`, answer: "Yes, our tools are designed with a user-friendly interface to be intuitive for both beginners and professionals." }, { question: "What can I create?", answer: "Anything you can imagine! From optimized emails to rephrased manuscripts." }],
});

export const featuresData: Partial<Record<FeaturePageId, FeatureDefinition>> = {
    'home-main': { id: 'home-main', name: 'Dashboard', icon: <Home />, description: 'Central Command for your AI automation.', tokenCost: 0, ...placeholderContent('Home') },
    'explore': { id: 'explore', name: 'Templates', icon: <Layout />, description: 'Pre-built automation workflows.', tokenCost: 0, ...placeholderContent('Explore') },
    'projects': { id: 'projects', name: 'Active Canvases', icon: <Folder />, description: 'Your current projects.', tokenCost: 0, ...placeholderContent('Projects') },
    'ai-tools': { id: 'ai-tools', name: 'Toolbox', icon: <Cpu />, description: 'Deep access to all AI engines.', tokenCost: 0, ...placeholderContent('AI Tools') },
    
    'ai-image-generator': { id: 'ai-image-generator', name: 'AI Image Generator', icon: <ImageIcon />, description: 'Generate unique images instantly.', tokenCost: TokenPricing.features.imageGeneration, isTopFeature: true, toolComponent: 'CreativeStudio', ...placeholderContent('Image Engine') },
    'ai-video-generator': { id: 'ai-video-generator', name: 'AI Video Generator', icon: <Video />, description: 'Cinematic clips from text prompts.', tokenCost: TokenPricing.features.videoGeneration, isTopFeature: true, toolComponent: 'CreativeStudio', ...placeholderContent('Video Engine') },
    'ai-editing-suite': { id: 'ai-editing-suite', name: 'AI Editing Suite', icon: <Wand2 />, description: 'Complete AI-powered video and image editing.', tokenCost: TokenPricing.features.imageEdit, isTopFeature: true, toolComponent: 'CreativeStudio', ...placeholderContent('Editing Suite') },
    'ai-design-studio': { id: 'ai-design-studio', name: 'AI Design Studio', icon: <Palette />, description: 'Collaborative AI design environment.', tokenCost: 10, toolComponent: 'CreativeStudio', ...placeholderContent('Design Studio') },
    'ai-thumbnail-maker': { id: 'ai-thumbnail-maker', name: 'AI Thumbnail Maker', icon: <ImageIcon />, description: 'High-CTR YouTube thumbnails with AI.', tokenCost: TokenPricing.features.imageGeneration, toolComponent: 'CreativeStudio', ...placeholderContent('Thumbnail Maker') },
    'ai-template-hub': { id: 'ai-template-hub', name: 'AI Template Hub', icon: <Layout />, description: 'Professional AI-ready templates.', tokenCost: 5, toolComponent: 'Placeholder', ...placeholderContent('Template Hub') },
    'adaptive-design': { id: 'adaptive-design', name: 'Adaptive Design', icon: <Palette />, description: 'Design that responds to user intent.', tokenCost: 8, toolComponent: 'Placeholder', ...placeholderContent('Adaptive Design') },
    'interactive-editing': { id: 'interactive-editing', name: 'Interactive Editing', icon: <Wand2 />, description: 'Real-time interactive AI editing.', tokenCost: 6, toolComponent: 'CreativeStudio', ...placeholderContent('Interactive Editing') },

    'ai-tutor': { id: 'ai-tutor', name: 'AI Tutor', icon: <GraduationCap />, description: 'Personalized learning through AI.', tokenCost: 10, toolComponent: 'CreativeStudio', ...placeholderContent('AI Tutor') },
    'homework-helper': { id: 'homework-helper', name: 'Homework Helper', icon: <Layers />, description: 'AI-assisted academic problem solving.', tokenCost: 5, toolComponent: 'CreativeStudio', ...placeholderContent('Homework Helper') },
    'diagram-creator': { id: 'diagram-creator', name: 'Diagram Creator', icon: <Binary />, description: 'Visual diagrams from natural language.', tokenCost: 15, toolComponent: 'CreativeStudio', ...placeholderContent('Diagram Creator') },
    'quiz-generator': { id: 'quiz-generator', name: 'Quiz & Exam Generator', icon: <ClipboardList />, description: 'Automate assessment creation.', tokenCost: 10, toolComponent: 'CreativeStudio', ...placeholderContent('Quiz Generator') },
    'visual-learning': { id: 'visual-learning', name: 'Visual Learning AI', icon: <Presentation />, description: 'Convert concepts to visual explainers.', tokenCost: 20, toolComponent: 'CreativeStudio', ...placeholderContent('Visual Learning') },

    'all-ai-models': { id: 'all-ai-models', name: 'Neural Hub', icon: <Box />, description: 'Access and compare various AI models.', tokenCost: 5, toolComponent: 'CreativeStudio', ...placeholderContent('Neural Hub') },
    'neural-editing': { 
        id: 'neural-editing', 
        name: 'AI Neural Engine', 
        icon: <Cpu />, 
        description: 'Advanced Media Understanding and automatic cinematic style recreation.', 
        tokenCost: 15, 
        isTopFeature: true, 
        toolComponent: 'CreativeStudio', 
        ...placeholderContent('AI Neural Engine') 
    },
    'poster-automation': { 
        id: 'poster-automation', 
        name: 'AI Poster Forge', 
        icon: <ImageIcon />, 
        description: 'Automated high-quality poster & banner generation.', 
        tokenCost: 20, 
        isTopFeature: true, 
        toolComponent: 'CreativeStudio', 
        ...placeholderContent('Poster Forge') 
    },
    'my-projects': { id: 'my-projects', name: 'My Projects', icon: <Folder />, description: 'Manage your active AI canvases.', tokenCost: 0, toolComponent: 'Placeholder', ...placeholderContent('My Projects') },
    'my-templates': { id: 'my-templates', name: 'My Templates', icon: <Layout />, description: 'Your saved automation workflows.', tokenCost: 0, toolComponent: 'Placeholder', ...placeholderContent('My Templates') },
    'favorites': { id: 'favorites', name: 'Favorites', icon: <Star />, description: 'Quick access to top tools.', tokenCost: 0, toolComponent: 'Placeholder', ...placeholderContent('Favorites') },
    'team-management': { id: 'team-management' as any, name: 'Team Collaboration', icon: <Users />, description: 'Enterprise workspace, real-time collaboration, version history & Cloudflare R2 files.', tokenCost: 0, toolComponent: 'Placeholder', ...placeholderContent('Team Collaboration') },
    'workspace-settings': { id: 'workspace-settings', name: 'Workspace Admin', icon: <Settings />, description: 'Configuration and team settings.', tokenCost: 0, toolComponent: 'Placeholder', ...placeholderContent('Workspace Admin') },
    
    'effects-studio': { id: 'effects-studio', name: 'Effects Studio', icon: <Sparkles />, description: 'AI layered overlay effects, glitch filters, and atmospheric particles.', tokenCost: 8, toolComponent: 'CreativeStudio', ...placeholderContent('Effects Studio') },
    'lora-studio': { id: 'lora-studio', name: 'LoRA Studio', icon: <Cpu />, description: 'Train and blend fine-tuned character and style adaptors.', tokenCost: 15, toolComponent: 'CreativeStudio', ...placeholderContent('LoRA Studio') },
    'face-swap': { id: 'face-swap', name: 'Face Swap', icon: <Users />, description: 'High-fidelity face blending with auto-expression matching.', tokenCost: 12, toolComponent: 'CreativeStudio', ...placeholderContent('Face Swap') },
    'background-remover': { id: 'background-remover', name: 'Background Remover', icon: <Layers />, description: 'Isolate subjects with extreme detail precision.', tokenCost: 4, toolComponent: 'CreativeStudio', ...placeholderContent('Background Remover') },
    'green-screen': { id: 'green-screen', name: 'Green Screen', icon: <Layers />, description: 'Extract chroma key backings or swap background environments.', tokenCost: 8, toolComponent: 'CreativeStudio', ...placeholderContent('Green Screen') },
    'sketch-to-image': { id: 'sketch-to-image', name: 'Sketch to Image', icon: <Wand2 />, description: 'Convert sketch drawings into hyper-realistic textured photographic renders.', tokenCost: 10, toolComponent: 'CreativeStudio', ...placeholderContent('Sketch to Image') },
    'image-upscaler': { id: 'image-upscaler', name: 'Image Upscaler', icon: <Wand2 />, description: 'Enhance and upscale raster graphics to high-CTR 4K fidelity.', tokenCost: 6, toolComponent: 'CreativeStudio', ...placeholderContent('Image Upscaler') },
    'photo-restoration': { id: 'photo-restoration', name: 'Photo Restoration', icon: <Wand2 />, description: 'De-scratch, fix color fade, and denoise ancient photographic records.', tokenCost: 10, toolComponent: 'CreativeStudio', ...placeholderContent('Photo Restoration') },
    'photo-colorizer': { id: 'photo-colorizer', name: 'Photo Colorizer', icon: <Palette />, description: 'Breathe vivid, realistic color tones into black and white captures.', tokenCost: 8, toolComponent: 'CreativeStudio', ...placeholderContent('Photo Colorizer') },
    'magic-eraser': { id: 'magic-eraser', name: 'Magic Eraser', icon: <Wand2 />, description: 'Erase unwanted artifacts or objects with seamless contextual filling.', tokenCost: 5, toolComponent: 'CreativeStudio', ...placeholderContent('Magic Eraser') },
    'image-expand': { id: 'image-expand', name: 'Image Expand', icon: <Layout />, description: 'Outpaint and extend the viewport boundaries of any photograph.', tokenCost: 10, toolComponent: 'CreativeStudio', ...placeholderContent('Image Expand') },
    'object-replace': { id: 'object-replace', name: 'Object Replace', icon: <Wand2 />, description: 'Selectively repaint or swap objects inside an image.', tokenCost: 8, toolComponent: 'CreativeStudio', ...placeholderContent('Object Replace') },
    'canvas-expand': { id: 'canvas-expand', name: 'Canvas Expand', icon: <Layout />, description: 'Extend and expand borders of portraits or landscapes to infinite sizes.', tokenCost: 12, toolComponent: 'CreativeStudio', ...placeholderContent('Canvas Expand') },
    'prompt-builder': { id: 'prompt-builder', name: 'Prompt Builder', icon: <Cpu />, description: 'Deconstruct short ideas into hyper-detailed LLM-optimized prompts.', tokenCost: 2, toolComponent: 'CreativeStudio', ...placeholderContent('Prompt Builder') },
    'product-studio': { id: 'product-studio', name: 'Product Studio', icon: <Layout />, description: 'Isolate products and position them into studio-grade setups.', tokenCost: 10, toolComponent: 'CreativeStudio', ...placeholderContent('Product Studio') },
    'logo-creator': { id: 'logo-creator', name: 'Logo Creator', icon: <Palette />, description: 'Synthesize high-contrast minimalist, flat, or 3D vector logo assets.', tokenCost: 8, toolComponent: 'CreativeStudio', ...placeholderContent('Logo Creator') },
    'interior-designer': { id: 'interior-designer', name: 'Interior Designer', icon: <Palette />, description: 'Reimagine raw layouts or empty rooms with custom decor schemes.', tokenCost: 12, toolComponent: 'CreativeStudio', ...placeholderContent('Interior Designer') },
    'character-creator': { id: 'character-creator', name: 'Character Creator', icon: <Users />, description: 'Formulate bespoke character rigs or gaming portraits from ideas.', tokenCost: 10, toolComponent: 'CreativeStudio', ...placeholderContent('Character Creator') },
    'anime-creator': { id: 'anime-creator', name: 'Anime Creator', icon: <Palette />, description: 'Transform real life photos or cinematic frames into Japanese illustrations.', tokenCost: 8, toolComponent: 'CreativeStudio', ...placeholderContent('Anime Creator') },
    'pixel-studio': { id: 'pixel-studio', name: 'Pixel Studio', icon: <Layout />, description: 'Convert raster assets into retro 8-bit or 16-bit pixel-art tiles.', tokenCost: 6, toolComponent: 'CreativeStudio', ...placeholderContent('Pixel Studio') },
    'cinematic-fx': { id: 'cinematic-fx', name: 'Cinematic FX', icon: <Video />, description: 'Overlay high-end anamorphic lens flares, color grades, and digital mist.', tokenCost: 12, toolComponent: 'CreativeStudio', ...placeholderContent('Cinematic FX') },
    'light-studio': { id: 'light-studio', name: 'Light Studio', icon: <Palette />, description: 'Relight photographs dynamically by positioning a virtual light source.', tokenCost: 10, toolComponent: 'CreativeStudio', ...placeholderContent('Light Studio') },
    'world-builder': { id: 'world-builder', name: 'World Builder', icon: <Layout />, description: 'Design sweeping, high-fidelity fantasy concepts or panoramic scapes.', tokenCost: 15, toolComponent: 'CreativeStudio', ...placeholderContent('World Builder') },
    'scene-creator': { id: 'scene-creator', name: 'Scene Creator', icon: <Layout />, description: 'Synthesize custom environments or physical sets from descriptions.', tokenCost: 12, toolComponent: 'CreativeStudio', ...placeholderContent('Scene Creator') },
    'landscape-studio': { id: 'landscape-studio', name: 'Landscape Studio', icon: <Layout />, description: 'Generate immersive atmospheric outdoor environments and vistas.', tokenCost: 10, toolComponent: 'CreativeStudio', ...placeholderContent('Landscape Studio') },
    'motion-fx': { id: 'motion-fx', name: 'Motion FX', icon: <Video />, description: 'Apply fluid frame interpolation and recursive frame speed ramps.', tokenCost: 12, toolComponent: 'CreativeStudio', ...placeholderContent('Motion FX') },
    'video-enhancer': { id: 'video-enhancer', name: 'Video Enhancer', icon: <Video />, description: 'Deband, denoise, and reconstruct frame details on video clips.', tokenCost: 15, toolComponent: 'CreativeStudio', ...placeholderContent('Video Enhancer') },
    'video-upscaler': { id: 'video-upscaler', name: 'Video Upscaler', icon: <Video />, description: 'Upscale video files to native 4K UHD with frame temporal stability.', tokenCost: 20, toolComponent: 'CreativeStudio', ...placeholderContent('Video Upscaler') },
    'lip-sync-studio': { id: 'lip-sync-studio', name: 'Lip Sync Studio', icon: <Video />, description: 'Force lip contours of videos to perfectly sync to spoken audio tracks.', tokenCost: 15, toolComponent: 'CreativeStudio', ...placeholderContent('Lip Sync Studio') },
    'voice-clone': { id: 'voice-clone', name: 'Voice Clone', icon: <Cpu />, description: 'Extract tone harmonics and spectral maps to clone voice nodes.', tokenCost: 15, toolComponent: 'CreativeStudio', ...placeholderContent('Voice Clone') },
    'voice-generator': { id: 'voice-generator', name: 'Voice Generator', icon: <Cpu />, description: 'Generate expressive text-to-speech audio with emotive cadence guides.', tokenCost: 5, toolComponent: 'CreativeStudio', ...placeholderContent('Voice Generator') },
    'speech-transcriber': { id: 'speech-transcriber', name: 'Speech Transcriber', icon: <Cpu />, description: 'Transcribe high-fidelity audio speech records into text nodes.', tokenCost: 5, toolComponent: 'CreativeStudio', ...placeholderContent('Speech Transcriber') },
    'thumbnail-creator': { id: 'thumbnail-creator', name: 'Thumbnail Creator', icon: <ImageIcon />, description: 'Synthesize high-conversion visual thumbnails with layered text layouts.', tokenCost: 8, toolComponent: 'CreativeStudio', ...placeholderContent('Thumbnail Creator') },
    'poster-creator': { id: 'poster-creator', name: 'Poster Creator', icon: <ImageIcon />, description: 'Auto-compose beautiful layered posters and commercial banners.', tokenCost: 12, toolComponent: 'CreativeStudio', ...placeholderContent('Poster Creator') },
    'social-studio': { id: 'social-studio', name: 'Social Studio', icon: <Video />, description: 'Crop, segment, add active captions, and format videos into aspect sizes.', tokenCost: 10, toolComponent: 'CreativeStudio', ...placeholderContent('Social Studio') },
    'background-creator': { id: 'background-creator', name: 'Background Creator', icon: <Layers />, description: 'Synthesize detailed structural backings based on subject context.', tokenCost: 8, toolComponent: 'CreativeStudio', ...placeholderContent('Background Creator') },
    'depth-creator': { id: 'depth-creator', name: 'Depth Creator', icon: <Cpu />, description: 'Generate complete 16-bit depth mapping projections from 2D layouts.', tokenCost: 10, toolComponent: 'CreativeStudio', ...placeholderContent('Depth Creator') },
    '3d-creator': { id: '3d-creator', name: '3D Creator', icon: <Layers />, description: 'Formulate low-poly 3D assets or panoramic stereoscopic frames.', tokenCost: 15, toolComponent: 'CreativeStudio', ...placeholderContent('3D Creator') },
    'animation-studio': { id: 'animation-studio', name: 'Animation Studio', icon: <Video />, description: 'Animate stationary visual subjects or mimic complex motion rigs.', tokenCost: 15, toolComponent: 'CreativeStudio', ...placeholderContent('Animation Studio') },
    'smart-reframe': { id: 'smart-reframe', name: 'Smart Reframe', icon: <Wand2 />, description: 'Reframer & Aspect Ratio Expander. Auto-detect visual action centers.', tokenCost: 12, toolComponent: 'CreativeStudio', ...placeholderContent('Smart Reframe') },
};

export const sidebarData: SidebarItemConfig[] = [
    { type: 'link', id: 'home-main', name: 'Dashboard', icon: <Home /> },
    { type: 'header', name: 'AI CREATOR SUITE' },
    { type: 'link', id: 'ai-image-generator', name: 'AI Image Generator', icon: <ImageIcon className="text-[#E8F0F4]" /> },
    { type: 'link', id: 'ai-video-generator', name: 'AI Video Generator', icon: <Video className="text-[#AFC3CF]" /> },
    { type: 'link', id: 'ai-editing-suite', name: 'AI Editing Suite', icon: <Wand2 className="text-[#8DB8CC]" /> },
    { type: 'link', id: 'neural-editing', name: 'AI Neural Engine', icon: <Cpu className="text-[#E8F0F4]" /> },
    { type: 'link', id: 'poster-automation', name: 'AI Poster Forge', icon: <ImageIcon className="text-[#AFC3CF]" /> },
    { type: 'link', id: 'ai-design-studio', name: 'AI Design Studio', icon: <Palette className="text-[#8DB8CC]" /> },
    { type: 'link', id: 'ai-thumbnail-maker', name: 'AI Thumbnail Maker', icon: <ImageIcon className="text-[#E8F0F4]" /> },
    { type: 'link', id: 'ai-template-hub', name: 'AI Template Hub', icon: <Layout className="text-[#AFC3CF]" /> },
    { type: 'link', id: 'adaptive-design', name: 'Adaptive Design', icon: <Palette className="text-[#8DB8CC]" /> },
    { type: 'link', id: 'interactive-editing', name: 'Interactive Editing', icon: <Wand2 className="text-[#E8F0F4]" /> },
    { type: 'header', name: 'AI EDUCATION SUITE' },
    { type: 'link', id: 'ai-tutor', name: 'AI Tutor', icon: <GraduationCap className="text-slate-400" /> },
    { type: 'link', id: 'homework-helper', name: 'Homework Helper', icon: <Layers className="text-slate-400" /> },
    { type: 'link', id: 'diagram-creator', name: 'Diagram Creator', icon: <ImageIcon className="text-slate-400" /> },
    { type: 'link', id: 'quiz-generator', name: 'Quiz & Exam Generator', icon: <Box className="text-slate-400" /> },
    { type: 'link', id: 'visual-learning', name: 'Visual Learning AI', icon: <Presentation className="text-slate-400" /> },
    { type: 'header', name: 'AI MODEL HUB' },
    { type: 'link', id: 'all-ai-models', name: 'All AI Models', icon: <Box className="text-slate-400" /> },
    { type: 'divider' },
    { type: 'link', id: 'my-projects', name: 'My Projects', icon: <Folder className="text-slate-400" /> },
    { type: 'link', id: 'my-templates', name: 'My Templates', icon: <Layout className="text-slate-400" /> },
    { type: 'link', id: 'team-management' as any, name: 'Team Collaboration', icon: <Users className="text-[#8DB8CC]" /> },
    { type: 'link', id: 'r2-storage' as any, name: 'Cloud Storage (R2)', icon: <HardDrive className="text-[#AFC3CF]" /> },
    { type: 'link', id: 'razorpay-billing' as any, name: 'Razorpay Billing & Dev', icon: <CreditCard className="text-[#E8F0F4]" /> },
    { type: 'link', id: 'email-testing' as any, name: 'Email Delivery & Test', icon: <Mail className="text-[#8DB8CC]" /> },
    { type: 'link', id: 'favorites', name: 'Favorites', icon: <Heart className="text-slate-400" /> },
    { type: 'link', id: 'workspace-settings', name: 'Account Settings', icon: <Settings className="text-slate-400" /> },
    { type: 'divider' },
    { type: 'button-secondary', name: 'Pro Plan', icon: <Zap /> },
];

export const getStudioForFeature = (featureId: FeaturePageId): 'Creative' | 'Avatar' | 'Shorts' | 'Workspace' | 'Account' | 'Placeholder' => {
    const feature = featuresData[featureId];
    if (feature?.toolComponent) {
        switch (feature.toolComponent) {
            case 'CreativeStudio': return 'Creative';
            case 'AvatarStudio': return 'Avatar';
            case 'ShortsStudio': return 'Shorts';
            case 'Placeholder':
                if (featureId.startsWith('workspace-')) return 'Workspace';
                if (featureId.startsWith('account-')) return 'Account';
                return 'Placeholder';
            default: return 'Placeholder';
        }
    }
    return 'Placeholder';
};
