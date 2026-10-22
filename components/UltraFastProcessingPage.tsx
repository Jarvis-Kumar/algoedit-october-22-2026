
import React from 'react';
import { motion } from 'motion/react';
import { 
  Rocket, 
  Cpu, 
  Zap, 
  Layers, 
  Activity, 
  ShieldCheck, 
  ArrowLeft,
  ChevronRight,
  Database,
  Cloud,
  Network,
  Sparkles
} from 'lucide-react';
import { OnNavigateType } from '../types';

interface PerformanceStat {
  label: string;
  value: string;
  percentage: number;
  color: string;
}

const performanceStats: PerformanceStat[] = [
  { label: "Rendering Speed", value: "0.4s / Frame", percentage: 95, color: "bg-orange-500" },
  { label: "GPU Load", value: "Adaptive", percentage: 82, color: "bg-cyan-500" },
  { label: "Neural Latency", value: "<15ms", percentage: 98, color: "bg-blue-500" },
  { label: "Cloud Mesh Sync", value: "99.99%", percentage: 99, color: "bg-purple-500" }
];

interface UltraFastProcessingPageProps {
  onNavigate: OnNavigateType;
}

const techDetails = [
  {
    title: "GPU Processing Architecture",
    desc: "Our custom GPU mesh utilizes H100 Tensor Cores with optimized FP8 kernels for maximum throughput. This architecture allows for massive parallel processing of neural inference tasks, reducing the overhead typically associated with consumer-grade hardware.",
    icon: <Cpu size={24} />,
    color: "text-orange-500"
  },
  {
    title: "Distributed Rendering",
    desc: "By utilizing a proprietary node-balancing algorithm, we split rendering tasks across thousands of geographical nodes. Your project is processed by the nearest available cluster, virtually eliminating late-stage latency and bottlenecks.",
    icon: <Network size={24} />,
    color: "text-cyan-500"
  },
  {
    title: "AI Pipeline Optimization",
    desc: "The AlgoEdit pipeline bypasses standard high-level APIs, communicating directly with the hardware drivers. This low-level integration ensures that every cycle is dedicated to synthesis rather than system overhead.",
    icon: <Activity size={24} />,
    color: "text-purple-500"
  },
  {
    title: "Real-Time Preview Engine",
    desc: "Our interactive engine uses a multi-layer buffering system that generates low-resolution neural proxies in under 15ms. This allows you to iterate on prompts with zero feedback lag before committing to a final render.",
    icon: <Zap size={24} />,
    color: "text-blue-500"
  },
  {
    title: "Cloud Processing Infrastructure",
    desc: "A globally distributed Tier-1 network ensures that your assets are stored and processed with 99.99% reliability. We use ultra-fast NVMe storage arrays for instant asset retrieval during the synthesis phase.",
    icon: <Cloud size={24} />,
    color: "text-pink-500"
  },
  {
    title: "Intelligent Resource Allocation",
    desc: "Dynamic load balancing shifts processing power where it's needed most. If you're working on a complex 4K video, our system automatically scales up dedicated cores to ensure your deadline is met.",
    icon: <Database size={24} />,
    color: "text-green-500"
  },
  {
    title: "Smart Queue Management",
    desc: "Our priority-based queuing system uses AI to predict processing times and optimize the order of operations. This means your quick edits don't get stuck behind massive rendering jobs.",
    icon: <Layers size={24} />,
    color: "text-amber-500"
  },
  {
    title: "Multi-Layer Acceleration",
    desc: "We utilize temporal and spatial acceleration layers that reuse previously computed neural data. This 'neural caching' significantly speeds up iterative changes to the same scene or project.",
    icon: <Zap size={24} />,
    color: "text-indigo-500"
  },
  {
    title: "Performance Metrics",
    desc: "AlgoEdit consistently outperforms industry standards by 3.4x in raw synthesis speed. Our benchmarks show a 400% improvement in token processing efficiency compared to standard cloud implementations.",
    icon: <Activity size={24} />,
    color: "text-rose-500"
  },
  {
    title: "AI Response Optimization",
    desc: "Every prompt goes through a pre-processing stage that optimizes its structure for the target neural model. This ensures the model begins generation with the most 'hardware-friendly' instructions possible.",
    icon: <Sparkles size={24} />,
    color: "text-cyan-400"
  },
  {
    title: "Quantum-Resistant Encryption",
    desc: "All data transit and stored assets are protected by post-quantum cryptographic standards, ensuring your unique intellectual property remains secure even against future computational threats.",
    icon: <ShieldCheck size={24} />,
    color: "text-emerald-500"
  },
  {
    title: "Edge Node Synthesis",
    desc: "Critical real-time tasks are pushed to edge nodes located within 50 miles of major urban centers, achieving sub-5ms round-trip latency for live interactive sessions.",
    icon: <Cloud size={24} />,
    color: "text-blue-600"
  },
  {
    title: "Neural Engine Hot-Swapping",
    desc: "Switch between different model versioning or engine types (e.g. from Video to 3D) without losing session state or cache, allowing for complex multi-stage creative workflows.",
    icon: <Rocket size={24} />,
    color: "text-purple-600"
  }
];

const UltraFastProcessingPage: React.FC<UltraFastProcessingPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-full pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-16 gap-6">
        <div className="flex flex-col">
          <div className="flex items-center gap-3 text-orange-400 mb-2">
            <Activity className="w-5 h-5 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.5em]">High Performance OS</span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-4xl font-black text-white italic tracking-tighter uppercase leading-tight">
            ULTRA FAST <span className="text-orange-500">PROCESSING</span>
          </h1>
          <p className="text-slate-400 mt-4 font-bold uppercase tracking-wide text-xs max-w-xl opacity-70">
            Proprietary GPU acceleration and real-time neural synthesis pipelines architected for maximum creative velocity.
          </p>
        </div>
        
        <button 
          onClick={() => onNavigate('home-main')}
          className="flex items-center self-start md:self-center gap-2 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white"
        >
          <ArrowLeft size={16} />
          System Dashboard
        </button>
      </div>

      {/* Main Stats Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-20">
        <div className="lg:col-span-12 glass-panel p-10 border-white/10 relative overflow-hidden group shadow-2xl">
           <div className="absolute top-0 right-0 w-full h-[2px] bg-gradient-to-r from-transparent via-orange-500/50 to-transparent animate-shimmer" />
           <div className="relative z-10 flex flex-col md:flex-row gap-12 items-center">
              <div className="w-48 h-48 rounded-full border-2 border-orange-500/20 flex items-center justify-center relative p-2 shadow-[0_0_100px_rgba(249,115,22,0.1)]">
                 <div className="absolute inset-0 rounded-full border-4 border-orange-500/40 border-t-transparent animate-spin duration-[3000ms]" />
                 <div className="w-full h-full rounded-full bg-orange-500/10 flex flex-col items-center justify-center text-orange-500 text-center">
                    <Rocket size={48} className="transition-transform duration-500 group-hover:translate-x-2 group-hover:-translate-y-2" />
                    <span className="text-[10px] font-black mt-2 tracking-widest leading-tight px-4 uppercase">OS V.4.0 ACTIVE</span>
                 </div>
              </div>
              
              <div className="flex-grow w-full space-y-8">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                    {performanceStats.map((stat, idx) => (
                      <div key={idx} className="space-y-3">
                         <div className="flex justify-between items-end">
                            <span className="text-[11px] font-black text-white uppercase tracking-widest">{stat.label}</span>
                            <span className="text-xl font-black text-white italic brightness-125">{stat.value}</span>
                         </div>
                         <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              whileInView={{ width: `${stat.percentage}%` }}
                              viewport={{ once: true }}
                              transition={{ duration: 1, ease: "easeOut" }}
                              className={`h-full ${stat.color} shadow-[0_0_15px_rgba(249,115,22,0.5)]`}
                            />
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Tech Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         {techDetails.map((item, idx) => (
           <motion.div 
             key={idx}
             whileHover={{ y: -8, scale: 1.02 }}
             className="bg-[#050810]/80 border border-white/5 p-8 rounded-[36px] flex flex-col items-start text-left group shadow-2xl backdrop-blur-xl relative overflow-hidden"
           >
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className={`w-14 h-14 rounded-2xl bg-white/5 mb-8 flex items-center justify-center ${item.color} border border-white/10 group-hover:scale-110 transition-all duration-500 relative z-10`}>
                {item.icon}
              </div>
              <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mb-4 group-hover:text-orange-400 transition-colors relative z-10">{item.title}</h3>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wide leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity relative z-10">{item.desc}</p>
              
              <div className="mt-8 pt-6 border-t border-white/5 w-full flex items-center justify-between gap-2 text-[8px] font-black text-orange-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-500 relative z-10">
                 <span>Latency: NOMINAL</span>
                 <ChevronRight size={12} />
              </div>
           </motion.div>
         ))}
      </div>

      {/* Infrastructure Note */}
      <div className="mt-20 flex flex-col items-center md:flex-row justify-center gap-10 opacity-40 grayscale group-hover:grayscale-0 transition-all duration-700">
         <div className="flex items-center gap-3">
            <ShieldCheck size={20} className="text-orange-500" />
            <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">Tier-1 Data Center</span>
         </div>
         <div className="flex items-center gap-3">
            <Activity size={20} className="text-cyan-500" />
            <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">99.9% Uptime Guarantee</span>
         </div>
         <div className="flex items-center gap-3">
            <Cpu size={20} className="text-purple-500" />
            <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">H100/A100 Nodes</span>
         </div>
      </div>
    </div>
  );
};

export default UltraFastProcessingPage;
