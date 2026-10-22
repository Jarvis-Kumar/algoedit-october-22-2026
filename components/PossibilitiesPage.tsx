
import React from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, 
  Video, 
  Image as ImageIcon, 
  Layout, 
  Layers, 
  Rocket, 
  Palette, 
  Wand2, 
  Mic, 
  Presentation,
  ArrowLeft,
  ChevronRight,
  Globe,
  Share2,
  Zap,
  PenTool,
  Users
} from 'lucide-react';
import { OnNavigateType } from '../types';

interface Possibility {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const possibilities: Possibility[] = [
  {
    title: "AI Image Creation",
    description: "Generate breathtaking visuals from simple text prompts using the world's most advanced diffusion models. Ideal for concept art, social media, and digital marketing where visual impact is paramount.",
    icon: <ImageIcon size={28} />,
    color: "from-blue-500 to-cyan-400"
  },
  {
    title: "AI Video Editing",
    description: "Automate complex editing tasks, remove backgrounds, and sync motion seamlessly with intelligent timeline tools. Reduces production time by 80% while maintaining cinematic quality.",
    icon: <Video size={28} />,
    color: "from-indigo-500 to-purple-400"
  },
  {
    title: "AI Film Production",
    description: "Synthesize full cinematic scenes, generate hyper-realistic actors, and create digital environments without expensive soundstages. The future of independent filmmaking starts here.",
    icon: <Video size={28} />,
    color: "from-red-500 to-rose-500"
  },
  {
    title: "Product Photography",
    description: "Transform casual phone photos into studio-grade product shots. AI automatically corrects lighting, adds realistic shadows, and creates professional backgrounds.",
    icon: <ImageIcon size={28} />,
    color: "from-emerald-500 to-teal-400"
  },
  {
    title: "Anime & Cartoon Generation",
    description: "Transform reality into stylized art. Convert photos to high-fidelity anime or cartoon styles instantly, perfect for creators, streamers, and profile identification.",
    icon: <Sparkles size={28} />,
    color: "from-purple-500 to-pink-400"
  },
  {
    title: "Branding & Marketing",
    description: "Create logos, identity kits, and marketing assets that perfectly capture your brand's unique essence. Generate consistent brand voice and visuals across all platforms.",
    icon: <Layout size={28} />,
    color: "from-pink-500 to-rose-400"
  },
  {
    title: "UI/UX Generation",
    description: "Blueprint entire applications from text descriptions. Generate wireframes, mockups, and high-fidelity prototypes with functional component hierarchies.",
    icon: <Layout size={28} />,
    color: "from-cyan-500 to-blue-500"
  },
  {
    title: "Architecture Visualization",
    description: "Convert 2D sketches into photorealistic 3D renders. Experiment with materials, lighting, and environments in seconds rather than hours of rendering.",
    icon: <Layers size={28} />,
    color: "from-amber-500 to-orange-400"
  },
  {
    title: "Content Creation",
    description: "Generate viral social media posts, reels, and shorts with automated captioning and dynamic effects. Optimized for platform algorithms and user engagement.",
    icon: <Rocket size={28} />,
    color: "from-rose-500 to-orange-400"
  },
  {
    title: "Motion Graphics",
    description: "Design fluid transitions and animated elements that bring your static designs to life with neural motion. No keyframing required—just specify the mood.",
    icon: <Layers size={28} />,
    color: "from-orange-500 to-amber-400"
  },
  {
    title: "Game Asset Creation",
    description: "Design characters, environments, and textures for gaming. Generate low-poly models and PBR materials that are ready for implementation in Unity or Unreal Engine.",
    icon: <Rocket size={28} />,
    color: "from-indigo-500 to-blue-600"
  },
  {
    title: "Motion Tracking",
    description: "Advanced neural tracking for VFX. Attach digital objects to moving subjects with pixel-perfect accuracy, even in complex lighting conditions.",
    icon: <Layers size={28} />,
    color: "from-teal-500 to-cyan-500"
  },
  {
    title: "AI Branding Kits",
    description: "Comprehensive identity generation. Get logos, color palettes, typography guides, and social media headers that automatically follow design best practices.",
    icon: <Palette size={28} />,
    color: "from-pink-400 to-fuchsia-600"
  },
  {
    title: "Social Media Campaigns",
    description: "Launch multi-platform campaigns at scale. Generate a month's worth of content in minutes, including variations for A/B testing and local markets.",
    icon: <Share2 size={28} />,
    color: "from-yellow-500 to-lime-400"
  },
  {
    title: "AI Ad Creatives",
    description: "High-conversion visual ads. Our neural networks analyze top-performing ads to generate visuals that grab attention and drive user action.",
    icon: <Zap size={28} />,
    color: "from-blue-600 to-indigo-600"
  },
  {
    title: "Cinematic Effects",
    description: "Apply Hollywood-grade color grading, lighting fixes, and visual effects to any video clip. Elevate your production value without a massive budget.",
    icon: <Palette size={28} />,
    color: "from-green-500 to-emerald-400"
  },
  {
    title: "Educational Content",
    description: "Transform complex topics into digestible visual lessons. Generate explanatory animations, diagrams, and narrations that simplify hard concepts.",
    icon: <Presentation size={28} />,
    color: "from-emerald-400 to-green-600"
  },
  {
    title: "Podcast Production",
    description: "Full audio suite for podcasters. Remove noise, clone voices for ad reads, and generate background music that matches the emotional output of your dialogue.",
    icon: <Mic size={28} />,
    color: "from-emerald-500 to-teal-400"
  },
  {
    title: "Presentation Design",
    description: "Turn data into visual stories. Generate professional slide decks and infographics with a single click, keeping your audience engaged throughout.",
    icon: <Presentation size={28} />,
    color: "from-teal-500 to-cyan-400"
  },
  {
    title: "Creative Automation",
    description: "Synchronize your entire workflow. Automate repetitive design tasks across thousands of assets simultaneously with deterministic precision.",
    icon: <Wand2 size={28} />,
    color: "from-purple-600 to-blue-600"
  },
  {
    title: "VFX Synthesis",
    description: "Generate complex visual effects including fire, water, and particle simulations without traditional 3D software rendering pipelines.",
    icon: <Sparkles size={28} />,
    color: "from-blue-500 to-indigo-600"
  },
  {
    title: "Podcast Branding",
    description: "Create a complete sonic identity including intro music, voice-matched narrators, and visual marketing assets for your audio series.",
    icon: <Mic size={28} />,
    color: "from-emerald-400 to-blue-500"
  },
  {
    title: "Neural Upscaling",
    description: "Enhance archived footage or low-res images to 8K cinematic standards using recursive detail refinement algorithms.",
    icon: <Rocket size={28} />,
    color: "from-orange-500 to-red-600"
  },
  {
    title: "AI Video Translation",
    description: "Automatically translate and dub video content while preserving the original speaker's voice and perfectly syncing lip movements.",
    icon: <Globe size={28} />,
    color: "from-cyan-400 to-blue-500"
  },
  {
    title: "NFT Creation Hub",
    description: "Generate high-fidelity generative art collections with consistent traits and unique aesthetic signatures ready for blockchain deployment.",
    icon: <Palette size={28} />,
    color: "from-pink-500 to-purple-600"
  },
  {
    title: "Real-time AI Avatars",
    description: "Deploy interactive 3D avatars for virtual assistants or gaming that respond instantly with natural expressions and human-like logic.",
    icon: <Users size={28} />,
    color: "from-indigo-600 to-violet-700"
  },
  {
    title: "Technical Diagramming",
    description: "Transform complex architectural or system descriptions into clean, professional technical diagrams and flowcharts automatically.",
    icon: <Presentation size={28} />,
    color: "from-slate-500 to-slate-700"
  },
  {
    title: "AI Interior Redesign",
    description: "Visualize home renovations by transforming real photos of rooms into stylized interior design concepts across dozens of themes.",
    icon: <Layout size={28} />,
    color: "from-amber-400 to-orange-500"
  },
  {
    title: "Stylized Storyboarding",
    description: "Draft entire comic books or film storyboards with consistent characters and perspectives using specialized layout-to-image models.",
    icon: <PenTool size={28} />,
    color: "from-fuchsia-500 to-rose-600"
  }
];

interface PossibilitiesPageProps {
  onNavigate: OnNavigateType;
}

const PossibilitiesPage: React.FC<PossibilitiesPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-full pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-20 gap-6">
        <div className="flex flex-col">
          <div className="flex items-center gap-3 text-purple-400 mb-2">
            <Globe className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase tracking-[0.5em]">Limitless Horizons</span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-4xl font-black text-white italic tracking-tighter uppercase leading-tight">
            ∞ <span className="text-purple-500">POSSIBILITIES</span>
          </h1>
          <p className="text-slate-400 mt-4 font-bold uppercase tracking-wide text-xs max-w-xl opacity-70">
            From raw concept to global showcase—AlgoEdit AI Studio provides the infrastructure for every creative breakthrough.
          </p>
        </div>
        
        <button 
          onClick={() => onNavigate('home-main')}
          className="flex items-center self-start md:self-center gap-2 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white"
        >
          <ArrowLeft size={16} />
          Return to Studio
        </button>
      </div>

      {/* Grid of Possibilities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {possibilities.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.05 }}
            whileHover={{ scale: 1.01, y: -5 }}
            onClick={() => {
               const map: Record<string, string> = {
                  'AI Image Creation': 'ai-image-generator',
                  'AI Video Editing': 'video-editor',
                  'AI Film Production': 'ai-video-generator',
                  'Product Photography': 'ai-image-generator',
                  'Anime & Cartoon Generation': 'anime-convert',
                  'Branding & Marketing': 'logo-generator',
                  'UI/UX Generation': 'ai-design-studio',
                  'Architecture Visualization': 'interior-redesign',
                  'Content Creation': 'auto-shorts-maker',
                  'Motion Graphics': 'ai-video-generator',
                  'Game Asset Creation': 'adaptive-design',
                  'Motion Tracking': 'video-cleanup',
                  'AI Branding Kits': 'brand-engine',
                  'Social Media Campaigns': 'auto-shorts-maker',
                  'AI Ad Creatives': 'ai-design-studio',
                  'Cinematic Effects': 'video-color-grade',
                  'Educational Content': 'visual-learning',
                  'Podcast Production': 'writing-assistant',
                  'Presentation Design': 'diagram-creator',
                  'Creative Automation': 'automation-studio'
               };
               onNavigate((map[item.title] || 'ai-image-generator') as any);
            }}
            className="group bg-[#050810]/60 border border-white/5 hover:border-purple-500/30 rounded-[40px] p-10 flex gap-8 items-start transition-all duration-500 backdrop-blur-xl shadow-2xl relative overflow-hidden cursor-pointer"
          >
            {/* Ambient Background Glow */}
            <div className={`absolute -top-20 -left-20 w-80 h-80 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-10 blur-[100px] transition-opacity duration-700`} />
            
            <div className={`shrink-0 p-6 rounded-3xl bg-white/5 border border-white/10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 relative z-10 overflow-hidden`}>
               <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-10`} />
               <div className="relative z-10 text-white">
                 {item.icon}
               </div>
            </div>

            <div className="space-y-4 relative z-10 mt-2">
              <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-tight group-hover:text-purple-400 transition-colors">
                {item.title}
              </h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-tight leading-relaxed opacity-70 group-hover:opacity-100 transition-opacity">
                {item.description}
              </p>
              
              <div className="pt-4 flex items-center gap-2 text-[10px] font-black text-white uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-[-10px] group-hover:translate-x-0">
                <span>Explore Workflow</span>
                <ChevronRight size={14} className="text-purple-500" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* CALL TO ACTION */}
      <div className="mt-24 p-1 rounded-[50px] bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-cyan-500/20 md:p-1.5 backdrop-blur-md border border-white/10 shadow-2xl">
         <div className="bg-[#050810] rounded-[44px] p-12 md:p-20 flex flex-col items-center text-center space-y-8">
            <div className="w-20 h-20 bg-purple-500/10 rounded-3xl flex items-center justify-center text-purple-400 border border-purple-500/20 scale-125 mb-4">
              <Wand2 size={40} className="animate-pulse" />
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter uppercase leading-none">
              READY TO <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">BEGIN?</span>
            </h2>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs max-w-2xl opacity-60">
              The neural canvas is primed. Access every module and start synthesizing your vision today.
            </p>
            <button 
              onClick={() => onNavigate('features-overview')}
              className="btn-primary !px-16 !py-5 !text-xl shadow-[0_20px_50px_rgba(59,130,246,0.3)]"
            >
              Initialize Synthesis
            </button>
         </div>
      </div>
    </div>
  );
};

export default PossibilitiesPage;
