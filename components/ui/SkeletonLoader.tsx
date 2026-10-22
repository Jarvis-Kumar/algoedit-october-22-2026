import React from 'react';
import { motion } from 'motion/react';

interface SkeletonLoaderProps {
  type: 'image' | 'video' | 'general' | 'list';
  aspectRatio?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ type, aspectRatio = '16:9' }) => {
  if (type === 'image' || type === 'video') {
    return (
      <div className="w-full flex flex-col space-y-4 animate-pulse">
        {/* Main media viewport skeleton */}
        <div 
          className="w-full bg-slate-900/60 rounded-3xl border border-white/5 relative overflow-hidden flex items-center justify-center"
          style={{ aspectRatio: aspectRatio === '1:1' ? '1/1' : aspectRatio === '16:9' ? '16/9' : aspectRatio === '9:16' ? '9/16' : '16/9' }}
        >
          {/* Subtle neural scanning lines */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#8DB8CC]/10 to-transparent -translate-x-full animate-shimmer" />
          
          <div className="space-y-3 text-center z-10 px-4">
            <div className="w-12 h-12 rounded-full bg-[#10161B] border border-[#26313A] mx-auto flex items-center justify-center shadow-lg shadow-black/40">
              <div className="w-6 h-6 rounded-full border-2 border-[#8DB8CC] border-t-transparent animate-spin" />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-mono text-[#8DB8CC] uppercase tracking-[0.25em]">Synthesizing Latent Grid</p>
              <div className="w-24 h-1 bg-white/5 rounded-full mx-auto overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#8DB8CC] to-[#AFC3CF] w-1/2 rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Action bar skeleton */}
        <div className="flex items-center justify-between pt-2">
          <div className="h-9 w-32 bg-slate-900/80 rounded-xl border border-white/5" />
          <div className="h-9 w-24 bg-slate-900/80 rounded-xl border border-white/5" />
        </div>
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div className="space-y-3 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between p-3 bg-slate-950/40 border border-white/5 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-900 rounded-lg" />
              <div className="space-y-1.5">
                <div className="h-3 w-28 bg-slate-900 rounded" />
                <div className="h-2 w-16 bg-slate-900 rounded" />
              </div>
            </div>
            <div className="h-5 w-12 bg-slate-900 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-pulse p-4">
      <div className="h-4 w-1/3 bg-slate-900 rounded-md" />
      <div className="h-24 w-full bg-slate-900/60 rounded-xl border border-white/5" />
      <div className="h-10 w-full bg-slate-900/80 rounded-xl" />
    </div>
  );
};
