
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Heart, 
  Share2, 
  Download, 
  Eye, 
  Search, 
  Filter, 
  Sparkles, 
  MessageCircle,
  ExternalLink,
  Copy
} from 'lucide-react';
import { Asset } from '../types';

interface ShowcaseItem extends Asset {
  author: string;
  likes: number;
  views: number;
  prompt: string;
}

const MOCK_SHOWCASE: ShowcaseItem[] = [
  { id: 1, name: 'Cyberpunk Cityscape', type: 'image', size: 1024, createdAt: Date.now(), url: '', author: 'NeoVisual', likes: 1240, views: 5400, prompt: 'A futuristic cyberpunk city with neon lights and flying cars, cinematic lighting, 8k' },
  { id: 2, name: 'Ethereal Forest', type: 'image', size: 1024, createdAt: Date.now(), url: '', author: 'NatureAI', likes: 890, views: 3200, prompt: 'An enchanted forest with glowing mushrooms and mystical creatures, soft bokeh, watercolor style' },
  { id: 3, name: 'Abstract Dreams', type: 'image', size: 1024, createdAt: Date.now(), url: '', author: 'DreamWeaver', likes: 2100, views: 8900, prompt: 'Abstract representation of human consciousness, vibrant colors, flowing lines, digital art' },
  { id: 4, name: 'Mechanical Heart', type: 'image', size: 1024, createdAt: Date.now(), url: '', author: 'SteamPunk', likes: 560, views: 1200, prompt: 'A complex mechanical heart with gears and steam, brass and copper textures, realistic lighting' },
];

const PublicShowcase: React.FC<{ onNavigate: (page: any) => void }> = ({ onNavigate }) => {
  const [search, setSearch] = useState('');
  const [likedItems, setLikedItems] = useState<Set<number>>(new Set());

  const toggleLike = (id: number) => {
    setLikedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="bg-[#0a0a0c] min-h-screen p-6 lg:p-12">
      <div className="max-w-screen-2xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20">
              <Sparkles size={14} className="text-cyan-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-cyan-500">Community Gallery</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tighter">
              Synthesized <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-[#E8F0F4] to-[#AFC3CF]">
                Masterpieces
              </span>
            </h1>
            <p className="text-gray-500 max-w-xl text-lg">
              Explore the most viral creations from our global community of AI artists. 
              One-click to reuse prompts or share to your network.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="text" 
                placeholder="Search prompts..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:w-64 bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white text-sm focus:border-cyan-500 outline-none transition-all"
              />
            </div>
            <button className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-bold text-sm hover:bg-white/10 transition-all">
              <Filter size={18} />
              Filter
            </button>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {MOCK_SHOWCASE.map((item, idx) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group relative bg-[#0f0f12] rounded-3xl overflow-hidden border border-white/5 hover:border-white/20 transition-all"
            >
              <div className="aspect-[4/5] relative overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center p-8">
                {item.url ? (
                  <img 
                    src={item.url} 
                    alt={item.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="text-center space-y-4">
                    <Sparkles className="w-12 h-12 text-cyan-500/30 mx-auto" />
                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{item.name}</p>
                  </div>
                )}
                
                {/* Watermark (Viral Loop) */}
                <div className="absolute bottom-4 left-4 px-2 py-1 bg-black/40 backdrop-blur-md rounded text-[8px] font-black text-white/60 uppercase tracking-widest border border-white/10">
                  Synthesized with Algo AI
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-6">
                  <div className="flex justify-end gap-2">
                    <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors">
                      <Share2 size={18} />
                    </button>
                    <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors">
                      <Download size={18} />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <p className="text-xs text-white/80 line-clamp-3 italic">"{item.prompt}"</p>
                    <button 
                      onClick={() => onNavigate('studio')}
                      className="w-full py-3 bg-cyan-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 hover:bg-cyan-600 transition-colors"
                    >
                      <Copy size={14} />
                      Reuse Prompt
                    </button>
                  </div>
                </div>
              </div>

              {/* Info Bar */}
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-white to-[#AFC3CF] p-0.5">
                      <div className="w-full h-full rounded-full bg-[#0f0f12] flex items-center justify-center text-[10px] font-bold text-white">
                        {item.author[0]}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">{item.author}</div>
                      <div className="text-[10px] text-gray-500">Founding Member</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => toggleLike(item.id)}
                    className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${likedItems.has(item.id) ? 'text-rose-500' : 'text-gray-500 hover:text-white'}`}
                  >
                    <Heart size={16} fill={likedItems.has(item.id) ? 'currentColor' : 'none'} />
                    {item.likes + (likedItems.has(item.id) ? 1 : 0)}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Viral CTA */}
        <div className="ai-card p-12 text-center bg-gradient-to-br from-[#8DB8CC]/10 via-transparent to-white/[0.04] border-white/5">
          <h2 className="text-3xl font-black text-white mb-4 tracking-tight">Ready to join the gallery?</h2>
          <p className="text-gray-500 max-w-xl mx-auto mb-8">
            Synthesize your next masterpiece and share it with the world. 
            Viral creations earn you <strong>bonus tokens</strong> and <strong>exclusive badges</strong>.
          </p>
          <button 
            onClick={() => onNavigate('studio')}
            className="ai-button bg-white text-black px-10 py-4 font-black uppercase tracking-widest rounded-2xl hover:scale-105 transition-all"
          >
            Start Creating
          </button>
        </div>
      </div>
    </div>
  );
};

export default PublicShowcase;
