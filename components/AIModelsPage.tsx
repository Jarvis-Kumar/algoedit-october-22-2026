
import React from 'react';
import { motion } from 'motion/react';
import { 
  Cpu, 
  Video, 
  Image as ImageIcon, 
  Mic, 
  Scissors, 
  PenTool, 
  Zap,
  ArrowLeft,
  ChevronRight,
  Sparkles,
  Command,
  Wand2,
  Layout,
  Presentation,
  Rocket,
  Layers
} from 'lucide-react';
import { OnNavigateType } from '../types';

interface AIModel {
  name: string;
  description: string;
  category: string;
  tags: string[];
  icon: React.ReactNode;
  color: string;
}

const aiModels: AIModel[] = [
  // Image Generation
  {
    name: "FLUX.1 [Pro]",
    description: "State-of-the-art image generation with unparalleled detail and prompt adherence.",
    category: "Image Generation",
    tags: ["High Detail", "Photorealistic", "Newest"],
    icon: <ImageIcon size={24} />,
    color: "from-blue-500 to-cyan-400"
  },
  {
    name: "Midjourney v6.1",
    description: "Aesthetic mastery with specialized lighting and composition models for artistic excellence.",
    category: "Image Generation",
    tags: ["Artistic", "Creative", "Vibrant"],
    icon: <ImageIcon size={24} />,
    color: "from-indigo-500 to-purple-400"
  },
  {
    name: "Stable Diffusion 3",
    description: "Open-weights powerhouse capable of high-resolution synthesis and complex multi-subject prompts.",
    category: "Image Generation",
    tags: ["Versatile", "Fast", "Customizable"],
    icon: <ImageIcon size={24} />,
    color: "from-purple-500 to-pink-400"
  },
  {
    name: "DALL-E 3 Plus",
    description: "Exceptional semantic understanding for precise text rendering and complex scene composition.",
    category: "Image Generation",
    tags: ["Semantic", "Text-in-Image", "Reliable"],
    icon: <ImageIcon size={24} />,
    color: "from-blue-600 to-indigo-500"
  },
  // Video Generation
  {
    name: "Kling AI",
    description: "Cinematic video generation with human-like motion and physics-compliant interactions.",
    category: "Video Generation",
    tags: ["Cinematic", "Physics", "Pro"],
    icon: <Video size={24} />,
    color: "from-red-500 to-orange-400"
  },
  {
    name: "Runway Gen-3 Alpha",
    description: "Hyper-realistic video synthesis with extraordinary temporal consistency and high resolution.",
    category: "Video Generation",
    tags: ["Realistic", "Fluid", "High-res"],
    icon: <Video size={24} />,
    color: "from-pink-500 to-rose-400"
  },
  {
    name: "Luma Dream Machine",
    description: "Efficient video model capable of generating diverse cinematic shots from text or reference images.",
    category: "Video Generation",
    tags: ["Fast", "Dynamic", "Image-to-Video"],
    icon: <Video size={24} />,
    color: "from-cyan-500 to-blue-400"
  },
  {
    name: "Sora Engine (Preview)",
    description: "Next-gen video synthesis capable of complex scenes with multiple characters and specific motions.",
    category: "Video Generation",
    tags: ["Long-form", "Complex", "Research"],
    icon: <Video size={24} />,
    color: "from-emerald-500 to-teal-400"
  },
  // Audio & Music
  {
    name: "Suno v3.5",
    description: "Breakthrough music generation that produces full-length songs with lyrics and high-fidelity audio.",
    category: "Audio & Music",
    tags: ["Full Song", "Vocal", "Instrumental"],
    icon: <Mic size={24} />,
    color: "from-amber-500 to-orange-400"
  },
  {
    name: "Udio AI",
    description: "Premium audio synthesis for professional-grade music production and ambient soundscapes.",
    category: "Audio & Music",
    tags: ["Studio Quality", "Melodic", "Crisp"],
    icon: <Mic size={24} />,
    color: "from-orange-500 to-yellow-400"
  },
  {
    name: "MusicLM",
    description: "High-fidelity music generation from text descriptions with sophisticated rhythmic patterns.",
    category: "Audio & Music",
    tags: ["Atmospheric", "Ambient", "Smart"],
    icon: <Mic size={24} />,
    color: "from-indigo-400 to-blue-300"
  },
  // Voice AI
  {
    name: "ElevenLabs V2",
    description: "The gold standard in voice synthesis and cloning with unmatched emotional range.",
    category: "Voice AI",
    tags: ["Emotional", "Natural", "Fast"],
    icon: <Mic size={24} />,
    color: "from-rose-400 to-orange-400"
  },
  {
    name: "OpenAI Voice Engine",
    description: "Instant voice cloning with a 15-second sample for hyper-realistic text-to-speech.",
    category: "Voice AI",
    tags: ["Cloning", "Precise", "Efficient"],
    icon: <Mic size={24} />,
    color: "from-emerald-400 to-green-500"
  },
  {
    name: "XTTS v2.5",
    description: "Cross-language voice synthesis with shared speaker characteristics across 16 languages.",
    category: "Voice AI",
    tags: ["Multilingual", "Sync", "Open-Weights"],
    icon: <Mic size={24} />,
    color: "from-blue-400 to-cyan-300"
  },
  // Design Enhancement
  {
    name: "Neural Colorizer",
    description: "Restores color to black & white images with historical accuracy and artistic flair.",
    category: "Design Enhancement",
    tags: ["Restore", "Vintage", "Auto"],
    icon: <Wand2 size={24} />,
    color: "from-blue-500 to-indigo-500"
  },
  {
    name: "Relight AI",
    description: "Changes the lightning of subjects in 2D images by generating a neural 3D depth map.",
    category: "Design Enhancement",
    tags: ["3D Lighting", "Studio", "Pro"],
    icon: <Zap size={24} />,
    color: "from-amber-500 to-yellow-400"
  },
  // Background Removal
  {
    name: "Object Isolator Pro",
    description: "Industry-leading alpha matting for complex hair and transparent object isolation.",
    category: "Background Removal",
    tags: ["Alpha Matte", "Clean", "Batch"],
    icon: <Scissors size={24} />,
    color: "from-red-500 to-pink-500"
  },
  {
    name: "Video BG Remover",
    description: "Real-time background removal for video content without needing a green screen.",
    category: "Background Removal",
    tags: ["Real-time", "Video", "Automatic"],
    icon: <Video size={24} />,
    color: "from-teal-500 to-cyan-500"
  },
  // Upscaling
  {
    name: "Magnific Pro",
    description: "Incredible image enhancement that adds realistic textures during upscaling.",
    category: "Upscaling",
    tags: ["8K", "Texture", "Ultra"],
    icon: <Rocket size={24} />,
    color: "from-indigo-600 to-blue-700"
  },
  {
    name: "Video Enhancer 4K",
    description: "Scales low-res footage to 4K while removing ISO noise and compression artifacts.",
    category: "Upscaling",
    tags: ["4K", "Denoise", "Smooth"],
    icon: <Video size={24} />,
    color: "from-orange-600 to-amber-500"
  },
  // Animation
  {
    name: "LivePortrait",
    description: "Animates static portraits with realistic expressions driven by a pilot video.",
    category: "Animation",
    tags: ["Expressions", "Driven", "Face"],
    icon: <Sparkles size={24} />,
    color: "from-pink-500 to-rose-400"
  },
  {
    name: "AnimateDiff v3",
    description: "Creates sophisticated animations from Stable Diffusion checkpoints with great consistency.",
    category: "Animation",
    tags: ["Consistent", "Iterative", "Artistic"],
    icon: <Zap size={24} />,
    color: "from-purple-500 to-indigo-500"
  },
  // 3D & Rendering
  {
    name: "Luma Genie",
    description: "Generates high-quality 3D assets from text with PBR materials and clean topology.",
    category: "3D & Rendering",
    tags: ["3D Meshes", "PBR", "Exportable"],
    icon: <Layers size={24} />,
    color: "from-blue-600 to-cyan-500"
  },
  {
    name: "Tripo AI",
    description: "Lightning-fast 3D reconstruction from single images or text for game assets.",
    category: "3D & Rendering",
    tags: ["Fast", "Game Assets", "Low-poly"],
    icon: <Layers size={24} />,
    color: "from-emerald-600 to-teal-500"
  },
  // Writing & Content
  {
    name: "DeepSeek V3",
    description: "Lightning-fast and highly efficient model for prompt enhancement, metadata writing, and creative workflow suggestions.",
    category: "Writing & Content",
    tags: ["Fast", "Efficient", "Creative"],
    icon: <PenTool size={24} />,
    color: "from-blue-500 to-cyan-400"
  },
  {
    name: "DeepSeek R1/V4",
    description: "Advanced reasoning model for complex visual analysis, design reasoning, structure code generation, and deep planning.",
    category: "Writing & Content",
    tags: ["Reasoning", "Code", "Advanced"],
    icon: <PenTool size={24} />,
    color: "from-purple-600 to-indigo-500"
  },
  // OCR & Document AI
  {
    name: "DocReader Engine",
    description: "Extracts structured data from messy documents, handwriting, and complex forms.",
    category: "OCR & Document AI",
    tags: ["Structure", "Forms", "Handwriting"],
    icon: <PenTool size={24} />,
    color: "from-blue-400 to-indigo-400"
  },
  {
    name: "V-Layout Parser",
    description: "Understands visual hierarchy in documents to preserve formatting during extraction.",
    category: "OCR & Document AI",
    tags: ["Layout", "Formatting", "Smart"],
    icon: <Layout size={24} />,
    color: "from-slate-400 to-slate-600"
  },
  // Branding & Marketing
  {
    name: "Logo Gen v2",
    description: "Specialized model for vector-style logo generation and brand identity iterations.",
    category: "Branding & Marketing",
    tags: ["Vector", "Iconic", "Logo"],
    icon: <Wand2 size={24} />,
    color: "from-orange-400 to-amber-500"
  },
  {
    name: "Ad-Copilot",
    description: "Generates high-performance ad creatives optimized for social media engagement.",
    category: "Branding & Marketing",
    tags: ["Ad-Tech", "Conversion", "Social"],
    icon: <Zap size={24} />,
    color: "from-blue-500 to-blue-700"
  },
  // Editing Automation
  {
    name: "Scene Splitter",
    description: "Automatically detects scene changes in long videos for easier editing workflows.",
    category: "Editing Automation",
    tags: ["Automatic", "Indexing", "Video"],
    icon: <Scissors size={24} />,
    color: "from-indigo-500 to-violet-600"
  },
  {
    name: "Auto-Cutter",
    description: "Removes silences and filler words from audio/video content with high precision.",
    category: "Editing Automation",
    tags: ["Trim", "Smart", "Podcast"],
    icon: <Mic size={24} />,
    color: "from-rose-500 to-pink-600"
  },
  // Presentation AI
  {
    name: "Slide Master",
    description: "Generates professional slide decks from long documents or text outlines.",
    category: "Presentation AI",
    tags: ["Slides", "Visuals", "Layout"],
    icon: <Presentation size={24} />,
    color: "from-cyan-500 to-blue-500"
  },
  {
    name: "InfoGraph Engine",
    description: "Converts raw facts into stunning, easy-to-read infographics and data visualisations.",
    category: "Presentation AI",
    tags: ["Data Viz", "Infographic", "Clean"],
    icon: <Presentation size={24} />,
    color: "from-emerald-500 to-green-500"
  },
  // Coding & Assistant
  {
    name: "CodeLlama 70B",
    description: "Specialized coding model for large-scale application development and debugging.",
    category: "Coding & Assistant",
    tags: ["Coding", "Scripts", "Powerful"],
    icon: <Command size={24} />,
    color: "from-slate-700 to-black"
  },
  {
    name: "Dev-Companion v4",
    description: "Real-time pair programmer that suggests optimizations and fixes as you build.",
    category: "Coding & Assistant",
    tags: ["Real-time", "Assistant", "IDE"],
    icon: <Command size={24} />,
    color: "from-blue-700 to-indigo-900"
  },
  // More models to ensure 55+
  { name: "Flux Dev", description: "Open weight development model.", category: "Image Generation", tags: ["Dev", "Quality"], icon: <ImageIcon size={24} />, color: "from-pink-500 to-purple-500" },
  { name: "SDXL Turbo", description: "Real-time image generation.", category: "Image Generation", tags: ["Real-time", "Fast"], icon: <ImageIcon size={24} />, color: "from-yellow-400 to-orange-500" },
  { name: "SVD Pro", description: "Stable Video Diffusion for animation.", category: "Video Generation", tags: ["Diffusion", "Video"], icon: <Video size={24} />, color: "from-blue-500 to-indigo-500" },
  { name: "Bark AI", description: "Generative text-to-audio model.", category: "Audio & Music", tags: ["Speech", "Audio"], icon: <Mic size={24} />, color: "from-rose-500 to-red-600" },
  { name: "DeepFace", description: "Advanced face reenactment tech.", category: "Animation", tags: ["Face", "Video"], icon: <Sparkles size={24} />, color: "from-indigo-500 to-blue-500" },
  { name: "Inpaint Engine", description: "Specific tool for clearing unwanted items from photos.", category: "Design Enhancement", tags: ["Cleanup", "Smart"], icon: <Wand2 size={24} />, color: "from-emerald-500 to-teal-500" },
  { name: "3D Gaussian Studio", description: "Point cloud to 3D mesh.", category: "3D & Rendering", tags: ["Splatting", "Pointcloud"], icon: <Layers size={24} />, color: "from-orange-500 to-rose-500" },
  { name: "Llama 3 8B", description: "Small, fast, efficient LLM.", category: "Writing & Content", tags: ["Efficient", "Chat"], icon: <PenTool size={24} />, color: "from-blue-400 to-cyan-400" },
  { name: "Mistral Large", description: "High performance logic model.", category: "Writing & Content", tags: ["Logic", "Pro"], icon: <PenTool size={24} />, color: "from-indigo-400 to-indigo-600" },
  { name: "Handwriting OCR", description: "Specialized for cursive scripts.", category: "OCR & Document AI", tags: ["Cursive", "OCR"], icon: <PenTool size={24} />, color: "from-yellow-500 to-orange-500" },
  { name: "Asset Generator", description: "UI component generation.", category: "Branding & Marketing", tags: ["UI", "Assets"], icon: <Wand2 size={24} />, color: "from-blue-600 to-violet-600" },
  { name: "Summary Bot", description: "High speed doc summarization.", category: "OCR & Document AI", tags: ["Summary", "Fast"], icon: <Layout size={24} />, color: "from-cyan-400 to-blue-500" },
  { name: "Prompt Engineer", description: "Refines prompts for other models.", category: "Writing & Content", tags: ["Meta", "Prompting"], icon: <PenTool size={24} />, color: "from-purple-400 to-blue-400" },
  { name: "Mood Setter", description: "Adjusts tone of audio backgrounds.", category: "Audio & Music", tags: ["Tone", "Mood"], icon: <Mic size={24} />, color: "from-rose-400 to-pink-500" },
  { name: "Vectorize AI", description: "Converts pixels to SVG paths.", category: "Design Enhancement", tags: ["SVG", "Vector"], icon: <Wand2 size={24} />, color: "from-orange-400 to-red-400" },
  { name: "Batch Processor", description: "Executes same tasks over 100+ items.", category: "Editing Automation", tags: ["Bulk", "Tasks"], icon: <Zap size={24} />, color: "from-cyan-500 to-blue-600" },
  { name: "Pitch Deck Gen", description: "Startup focused presentations.", category: "Presentation AI", tags: ["Pitch", "Deck"], icon: <Presentation size={24} />, color: "from-indigo-500 to-purple-600" },
  { name: "Python Expert", description: "Optimized for python debugging.", category: "Coding & Assistant", tags: ["Python", "Code"], icon: <Command size={24} />, color: "from-emerald-500 to-green-600" },
  { name: "React Assist", description: "Tailwind and React specialized.", category: "Coding & Assistant", tags: ["Web", "React"], icon: <Command size={24} />, color: "from-blue-500 to-indigo-600" },
  { name: "Texture Painter", description: "Applies neural textures to UVs.", category: "3D & Rendering", tags: ["Texture", "UV"], icon: <Layers size={24} />, color: "from-yellow-500 to-amber-500" },
  { name: "Character Rig", description: "Auto-rigging for 3D characters.", category: "Animation", tags: ["Rigging", "3D"], icon: <Sparkles size={24} />, color: "from-fuchsia-500 to-pink-600" },
  { name: "Global Voice", description: "Dubbing content into 50+ languages.", category: "Voice AI", tags: ["Dubbing", "Multilingual"], icon: <Mic size={24} />, color: "from-indigo-600 to-purple-700" },
  { name: "Style Sync Pro", description: "Maintains character consistency across frames.", category: "Animation", tags: ["Consistency", "Pro"], icon: <Zap size={24} />, color: "from-cyan-400 to-blue-500" },
  { name: "Logo Vectorizer", description: "Precision conversion from sketch to SVG.", category: "Branding & Marketing", tags: ["Logo", "SVG"], icon: <Wand2 size={24} />, color: "from-orange-500 to-red-500" },
  { name: "Physics Engine AI", description: "Simulates fluid and cloth in video.", category: "Video Generation", tags: ["Physics", "Sim"], icon: <Video size={24} />, color: "from-blue-700 to-indigo-900" },
  { name: "Deep Inpaint", description: "Complex foreground object removal.", category: "Design Enhancement", tags: ["Editing", "Inpaint"], icon: <Scissors size={24} />, color: "from-red-600 to-pink-700" },
  { name: "Neural Upscaler 8K", description: "Superior noise reduction for print.", category: "Upscaling", tags: ["8K", "Print"], icon: <Rocket size={24} />, color: "from-teal-500 to-emerald-600" },
  { name: "Voice Match", description: "Cross-platform voice consistency.", category: "Voice AI", tags: ["Sync", "Voice"], icon: <Mic size={24} />, color: "from-pink-500 to-rose-600" },
  { name: "Auto-Cap Pro", description: "Semantic captioning for diverse contexts.", category: "Editing Automation", tags: ["Captions", "AI"], icon: <Scissors size={24} />, color: "from-amber-600 to-orange-700" },
  { name: "Interior Render", description: "Photorealistic arch-viz synthesis.", category: "3D & Rendering", tags: ["Arch-Viz", "Render"], icon: <Layout size={24} />, color: "from-blue-400 to-cyan-500" },
  { name: "Script Master", description: "Generates long-form cinematic scripts.", category: "Writing & Content", tags: ["Script", "Cinema"], icon: <PenTool size={24} />, color: "from-purple-600 to-indigo-800" },
  { name: "Persona AI", description: "Character development and lore generation.", category: "Writing & Content", tags: ["Lore", "RPG"], icon: <PenTool size={24} />, color: "from-emerald-500 to-teal-700" },
  { name: "Sonic Logo Gen", description: "Short audio branding identities.", category: "Audio & Music", tags: ["Audio", "Branding"], icon: <Mic size={24} />, color: "from-red-500 to-orange-600" }
];

interface AIModelsPageProps {
  onNavigate: OnNavigateType;
}

const AIModelsPage: React.FC<AIModelsPageProps> = ({ onNavigate }) => {
  const categories = Array.from(new Set(aiModels.map(m => m.category)));

  return (
    <div className="min-h-full pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-12">
        <div className="flex flex-col">
          <div className="flex items-center gap-3 text-[#8DB8CC] mb-2">
            <Cpu className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase tracking-[0.5em]">Neural Database</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter uppercase leading-none">
            AI MODELS <span className="text-[#AFC3CF]">SHOWCASE</span>
          </h1>
        </div>
        
        <button 
          onClick={() => onNavigate('home-main')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-white"
        >
          <ArrowLeft size={14} />
          Back to Studio
        </button>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20 bg-black/40 p-1.5 rounded-[40px] border border-white/5 backdrop-blur-md">
         {[
           { label: '50+', sub: 'Active Models', icon: <Cpu />, color: 'text-[#E8F0F4]' },
           { label: '15+', sub: 'Neural Engines', icon: <Zap />, color: 'text-[#AFC3CF]' },
           { label: '450+', sub: 'GPU Cores On-Demand', icon: <Command />, color: 'text-[#8DB8CC]' },
           { label: '99.9%', sub: 'Synthesis Success', icon: <Sparkles />, color: 'text-white' }
         ].map((stat, i) => (
           <div key={i} className="bg-[#10161B] border border-[#26313A] rounded-[32px] p-6 flex flex-col items-center text-center group">
              <div className={`p-4 rounded-2xl bg-white/5 mb-4 group-hover:scale-110 transition-transform ${stat.color}`}>
                {stat.icon}
              </div>
              <span className="text-2xl font-black text-white italic leading-tight brightness-125">{stat.label}</span>
              <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest mt-1">{stat.sub}</span>
           </div>
         ))}
      </div>

      {/* Model Sections */}
      <div className="space-y-24">
        {categories.map((category) => (
          <section key={category} className="space-y-10">
            <div className="flex items-center gap-6">
              <h2 className="text-3xl ai-header text-white whitespace-nowrap">{category}</h2>
              <div className="h-px w-full bg-gradient-to-r from-white/10 to-transparent" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {aiModels.filter(m => m.category === category).map((model, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="bg-[#10161B]/95 border border-[#26313A] rounded-[32px] p-8 relative overflow-hidden group shadow-2xl backdrop-blur-xl"
                >
                  <div className={`absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br ${model.color} opacity-0 group-hover:opacity-10 blur-[60px] transition-opacity duration-500`} />
                  
                  <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between mb-8">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br from-[#10161B] via-[#1A2229] to-[#26313A] border border-[#26313A] group-hover:border-[#8DB8CC]/40 flex items-center justify-center text-white shadow-lg`}>
                        {model.icon}
                      </div>
                      <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                        {model.tags.map(tag => (
                          <span key={tag} className="text-[7px] font-black uppercase tracking-widest px-2 py-1 bg-white/5 border border-white/10 text-slate-400 rounded-md">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-4 group-hover:text-[#8DB8CC] transition-colors">
                      {model.name}
                    </h3>
                    
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wide leading-relaxed mb-10 flex-grow opacity-80 group-hover:opacity-100 transition-opacity">
                      {model.description}
                    </p>

                    <button 
                      onClick={() => {
                        const target = model.category.includes('Video') ? 'ai-video-generator' : 'ai-image-generator';
                        onNavigate(target as any);
                      }}
                      className="flex items-center justify-between gap-3 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all font-black text-[10px] uppercase tracking-[0.2em] text-white w-full"
                    >
                      <span>Launch Prototype</span>
                      <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default AIModelsPage;
