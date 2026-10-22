
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Search, Filter, Play, ExternalLink, Trash2, Loader2, Sparkles, Box, Layout, Cpu } from 'lucide-react';
import { Favorite, User, FeaturePageId } from '../types';
import { ContentService } from '../services/contentService';
import { featuresData } from '../data/features';
import { useToast } from './ui/Toast';

interface FavoritesPageProps {
  user: User | null;
  onNavigate: (page: FeaturePageId | string) => void;
}

const FavoritesPage: React.FC<FavoritesPageProps> = ({ user, onNavigate }) => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Favorite['type'] | 'all'>('all');
  const { showToast } = useToast();

  useEffect(() => {
    if (user?.uid) {
      fetchFavorites();
    } else {
      setLoading(false);
    }
  }, [user?.uid]);

  const fetchFavorites = async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const data = await ContentService.getFavorites(user.uid);
      setFavorites(data);
    } catch (err) {
      console.error('Failed to fetch favorites:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (itemId: string, type: Favorite['type']) => {
    try {
      await ContentService.toggleFavorite({ itemId, type });
      setFavorites(prev => prev.filter(f => !(f.itemId === itemId && f.type === type)));
      showToast('Neural node decoupled from favorites.', 'success');
    } catch (err) {
      showToast('De-coupling failed.', 'error');
    }
  };

  const getFavData = (fav: Favorite) => {
    if (fav.type === 'tool') {
      const tool = featuresData[fav.itemId as FeaturePageId];
      return tool ? { 
        name: tool.name, 
        desc: tool.description, 
        icon: tool.icon || <Box />, 
        color: 'text-[#8DB8CC]',
        bg: 'bg-[#8DB8CC]/10'
      } : null;
    }
    // Fallback for models or projects
    return { 
      name: fav.itemId.toUpperCase(), 
      desc: `A saved ${fav.type} node`, 
      icon: fav.type === 'model' ? <Cpu /> : fav.type === 'template' ? <Layout /> : <Box />,
      color: fav.type === 'model' ? 'text-purple-400' : 'text-emerald-400',
      bg: fav.type === 'model' ? 'bg-purple-500/10' : 'bg-emerald-500/10'
    };
  };

  const filteredFavs = favorites.filter(f => filter === 'all' || f.type === filter);

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 text-rose-500 animate-spin" />
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest animate-pulse">Syncing Starred Neurons...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 py-4 animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter flex items-center gap-4">
            Neural_Sanctuary
            <Heart className="text-rose-500 fill-rose-500/20" size={28} />
          </h2>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Your high-priority creative nodes and automation protocols</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {(['all', 'tool', 'template', 'model', 'project'] as const).map(t => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${filter === t ? 'bg-rose-500 text-white border-rose-400 shadow-xl shadow-rose-500/20' : 'bg-white/5 border-transparent text-slate-500 hover:text-white'}`}
            >
              {t === 'all' ? 'All_Sources' : t}
            </button>
          ))}
        </div>
      </div>

      {filteredFavs.length === 0 ? (
        <div className="h-[50vh] flex flex-col items-center justify-center p-12 rounded-[40px] border border-dashed border-white/10 bg-white/[0.01]">
          <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-6 text-slate-700">
            <Heart size={40} className="opacity-20" />
          </div>
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest text-center">No Starred Protocols Found</h3>
          <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em] mt-3 mb-8 max-w-xs text-center">Your favorite models and projects will appear here for accelerated access</p>
          <button 
            onClick={() => onNavigate('explore' as any)}
            className="px-8 py-3 rounded-xl border border-white/10 text-[10px] font-black text-white hover:bg-white/5 uppercase tracking-widest transition-all"
          >
            Explore_Neural_Library
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredFavs.map((fav, idx) => {
              const data = getFavData(fav);
              if (!data) return null;
              
              return (
                <motion.div
                  key={fav.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group relative bg-[#050810]/60 border border-white/5 hover:border-rose-500/30 rounded-[32px] p-8 transition-all duration-500 backdrop-blur-xl"
                >
                  <div className="flex items-start justify-between mb-8">
                    <div className={`w-14 h-14 rounded-2xl ${data.bg} border border-white/10 flex items-center justify-center ${data.color}`}>
                       {React.isValidElement(data.icon) ? React.cloneElement(data.icon as React.ReactElement<any>, { size: 24 }) : <Box size={24} />}
                    </div>
                    <button 
                      onClick={() => handleRemove(fav.itemId, fav.type)}
                      className="text-slate-600 hover:text-rose-500 p-2 transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-black text-white tracking-tight group-hover:text-rose-400 transition-colors">
                        {data.name}
                      </h3>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{data.desc}</p>
                    </div>

                    <div className="flex items-center gap-3 pt-6">
                      <button 
                         onClick={() => onNavigate(fav.itemId as FeaturePageId)}
                         className="flex-grow py-3 px-6 rounded-2xl bg-[#10161B] hover:bg-[#1A2229] border border-[#26313A] hover:border-[#AFC3CF]/40 text-[10px] font-black text-white uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                         Open_Node
                         <ExternalLink size={12} className="text-[#8DB8CC]" />
                      </button>
                      <button 
                         onClick={() => onNavigate(fav.itemId as FeaturePageId)}
                         className="w-12 h-12 rounded-2xl bg-[#10161B] hover:bg-[#1A2229] border border-[#26313A] hover:border-[#AFC3CF]/40 text-[#8DB8CC] hover:text-white shadow-xl active:scale-95 transition-all flex items-center justify-center cursor-pointer"
                      >
                         <Play size={16} fill="currentColor" />
                      </button>
                    </div>
                  </div>

                  <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-rose-500/5 blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-full" />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
      
      <div className="p-10 rounded-[40px] bg-gradient-to-br from-rose-500/5 to-purple-500/5 border border-white/5 flex flex-col md:flex-row items-center gap-8 justify-between">
          <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-3xl bg-rose-500/20 flex items-center justify-center text-rose-500">
                  <Sparkles size={32} />
              </div>
              <div>
                  <h4 className="text-lg font-black text-white italic tracking-tight">Accelerate your synthesis cycle</h4>
                  <p className="text-xs text-slate-500 font-medium">Favorite tools are pinned to your quick-access neural bridge.</p>
              </div>
          </div>
          <button className="px-10 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest hover:bg-white/10 transition-all">
              Organize_Workspace
          </button>
      </div>
    </div>
  );
};

export default FavoritesPage;
