import React, { memo, useState } from 'react';
import { FeaturePageId, Page } from '../types';
import { sidebarData, SidebarItemConfig } from '../data/features';
import { motion, AnimatePresence } from 'motion/react';
import { Cpu, Sparkles, Home, Layout, Folder, Heart, Settings, Shield, Zap, ChevronRight, Box } from 'lucide-react';
import { AlgoEditLogo } from './AlgoEditLogo';

interface SidebarProps {
    activePage: FeaturePageId | Page;
    onNavigate: (page: FeaturePageId | Page) => void;
    onPageNavigate: (page: Page) => void;
    isOpen: boolean;
    onToggle?: () => void;
}

const Sidebar = memo(({ activePage, onNavigate, onPageNavigate, isOpen, onToggle }: SidebarProps) => {
    // Keep track of which categories are collapsed. Initial states are expanded.
    const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({
        'AI CREATOR SUITE': false,
        'AI EDUCATION SUITE': false,
        'AI MODEL HUB': false,
        'MY WORKSPACE': false
    });

    const toggleCategory = (categoryName: string) => {
        setCollapsedCategories(prev => ({
            ...prev,
            [categoryName]: !prev[categoryName]
        }));
    };

    // Helper to render links
    const renderLink = (item: SidebarItemConfig, indexKey: string | number) => {
        const isActive = activePage === item.id;
        const isDashboard = item.id === 'home-main';

        if (isDashboard) {
            return (
                <button
                    key={item.id}
                    onClick={(e) => {
                        e.preventDefault();
                        if (item.id) onNavigate(item.id);
                    }}
                    className={`relative w-full group flex items-center gap-3.5 px-4.5 py-3 rounded-xl transition-all duration-300 mb-2.5 outline-none border cursor-pointer ${
                        isActive 
                            ? 'bg-white/10 text-white border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.08)]' 
                            : 'text-[#A8B0B7] border-transparent hover:bg-white/5 hover:text-white hover:scale-[1.015]'
                    }`}
                >
                    {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r bg-[#E8F0F4] shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                    )}
                    <div className={`p-1.5 rounded-lg border flex items-center justify-center transition-all duration-300 ${
                        isActive 
                            ? 'bg-white/15 border-white/30 text-white shadow-[0_0_8px_rgba(255,255,255,0.2)]'
                            : 'bg-[#050709] border-[#26313A] text-[#A8B0B7] group-hover:bg-[#10161B] group-hover:border-[#AFC3CF]/40 group-hover:text-white'
                    }`}>
                        <Home size={15} />
                    </div>
                    <span className="text-[13px] sm:text-sm font-semibold tracking-wide">Dashboard</span>
                </button>
            );
        }

        return (
            <button
                key={item.id}
                onClick={(e) => {
                    e.preventDefault();
                    if (item.id) onNavigate(item.id);
                }}
                className={`relative w-full group flex items-center gap-3.5 px-4 py-2 rounded-xl transition-all duration-300 mb-1.5 outline-none border cursor-pointer ${
                    isActive 
                        ? 'bg-white/10 text-white border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.06)] md:pl-5' 
                        : 'text-[#A8B0B7] border-transparent hover:bg-white/5 hover:text-white hover:scale-[1.015]'
                }`}
            >
                {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r bg-[#E8F0F4] shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                )}
                
                <div className={`p-1.5 rounded-lg border flex items-center justify-center transition-all duration-300 ${
                    isActive 
                        ? 'bg-white/15 border-white/30 text-white shadow-[0_0_8px_rgba(255,255,255,0.2)]'
                        : 'bg-[#050709] border-[#26313A] text-[#A8B0B7] group-hover:bg-[#10161B] group-hover:border-[#AFC3CF]/40 group-hover:text-white'
                }`}>
                    {item.icon ? React.cloneElement(item.icon as React.ReactElement, { size: 15 } as any) : <Cpu size={15} />}
                </div>
                
                <span className="text-[13px] font-semibold tracking-wide text-left flex-grow truncate">{item.name}</span>
            </button>
        );
    };

    // Parse the sidebarData dynamically into sections to render with proper bellows/accordion structures
    const sections: { title: string; isCategory: boolean; items: SidebarItemConfig[] }[] = [];
    let currentCategoryName = 'Dashboard';
    let currentItems: SidebarItemConfig[] = [];

    sidebarData.forEach((item) => {
        if (item.type === 'header') {
            // Push old section if it has elements
            if (currentItems.length > 0) {
                sections.push({
                    title: currentCategoryName,
                    isCategory: currentCategoryName !== 'Dashboard' && currentCategoryName !== 'My Settings',
                    items: currentItems
                });
            }
            currentCategoryName = item.name || '';
            currentItems = [];
        } else if (item.type === 'divider') {
            // Treat dividers as partition markers for account settings area
            if (currentItems.length > 0) {
                sections.push({
                    title: currentCategoryName,
                    isCategory: currentCategoryName !== 'Dashboard' && currentCategoryName !== 'My Settings',
                    items: currentItems
                });
            }
            currentCategoryName = 'MY WORKSPACE';
            currentItems = [];
        } else if (item.type !== 'button-secondary') {
            currentItems.push(item);
        }
    });

    if (currentItems.length > 0) {
        sections.push({
            title: currentCategoryName,
            isCategory: currentCategoryName !== 'Dashboard' && currentCategoryName !== 'My Settings',
            items: currentItems
        });
    }

    return (
        <aside className={`h-full bg-gradient-to-b from-[#0A0E12]/95 to-[#050709]/98 backdrop-blur-[24px] border-r border-[#26313A] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] z-20 flex-shrink-0 relative overflow-hidden ${isOpen ? 'w-64 opacity-100' : 'w-0 opacity-0 border-r-0'}`}>
           {/* Subtle Light Accent Glow behind the glass pane */}
           <div className="absolute -top-12 -left-12 w-32 h-32 bg-white/[0.03] blur-[40px] rounded-full pointer-events-none" />
           <div className="absolute top-[40%] -right-12 w-28 h-28 bg-[#8DB8CC]/5 blur-[35px] rounded-full pointer-events-none" />

           <div className="h-full flex flex-col p-4.5 w-64 relative z-10">
             
             {/* Logo & Toggle Header */}
             <div className="flex items-center justify-between mb-4 px-1">
                  <div className="cursor-pointer" onClick={() => onNavigate('home')}>
                     <AlgoEditLogo size="sm" />
                  </div>

                 {onToggle && (
                     <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onToggle();
                        }}
                        className="p-1.5 rounded-lg border border-[#26313A] bg-[#10161B] hover:border-[#AFC3CF]/40 hover:bg-[#26313A]/50 text-[#AFC3CF] hover:text-white transition-all cursor-pointer flex items-center justify-center group shadow-[0_0_12px_rgba(0,0,0,0.3)]"
                        title="Collapse Workspace Sidebar"
                     >
                        <ChevronRight size={14} className="rotate-180 group-hover:-translate-x-0.5 transition-transform text-[#A8B0B7] group-hover:text-white" />
                     </button>
                 )}
             </div>

             {/* Dynamic Status Indicator Badge and Workspace Selector */}
             <div className="flex flex-col gap-2 mb-5 px-1">
                 <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-[#10161B] border border-[#26313A] shadow-inner">
                     <div className="flex items-center gap-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-[#8DB8CC] animate-pulse shadow-[0_0_8px_rgba(141,184,204,0.8)]" />
                         <span className="text-[11px] font-semibold text-[#A8B0B7]">Default Sandbox</span>
                     </div>
                     <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-[#E8F0F4] border border-white/10 font-bold tracking-wider">v2.1</span>
                 </div>
                 <div className="flex items-center gap-1.5 px-0.5">
                     <span className="relative flex h-2 w-2">
                         <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8DB8CC] opacity-75"></span>
                         <span className="relative inline-flex rounded-full h-2 w-2 bg-[#AFC3CF]"></span>
                     </span>
                     <span className="text-[9.5px] font-black uppercase tracking-[0.2em] text-[#A8B0B7]">AI PLATFORM ONLINE</span>
                 </div>
             </div>

             {/* Scrolling Menu Content */}
             <div className="flex-grow overflow-y-auto no-scrollbar pr-1 -mr-1">
                <nav className="flex flex-col gap-2">
                   {sections.map((section, secIdx) => {
                       const isAccordion = section.isCategory;
                       const isCollapsed = collapsedCategories[section.title];

                       if (!isAccordion) {
                           // Standard top-level or workspace group
                           return (
                               <div key={`sec-${secIdx}`} className="flex flex-col mt-2 first:mt-0">
                                   {section.title !== 'Dashboard' && (
                                       <div className="px-3.5 py-1.5 mb-1.5">
                                           <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-[0.18em]">{section.title}</span>
                                       </div>
                                   )}
                                   {section.items.map((item, itemIdx) => renderLink(item, `link-${secIdx}-${itemIdx}`))}
                               </div>
                           );
                       }

                       return (
                           <div key={`section-acc-${secIdx}`} className="flex flex-col mb-1.5">
                               {/* Category Accordion Header Button */}
                               <button 
                                   onClick={() => toggleCategory(section.title)}
                                   className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-[#10161B] hover:bg-[#26313A]/50 border border-[#26313A] text-[#A8B0B7] hover:text-white transition-all cursor-pointer group mb-1.5"
                               >
                                   <span className="text-[10.5px] font-bold tracking-[0.16em] uppercase flex items-center gap-2 text-[#A8B0B7] group-hover:text-white transition-colors">
                                       <Sparkles size={11} className="text-[#AFC3CF] group-hover:text-white animate-pulse" />
                                       {section.title}
                                   </span>
                                   <ChevronRight size={12} className={`text-[#6F7982] group-hover:text-white transition-transform duration-300 ${isCollapsed ? '' : 'rotate-90 text-white'}`} />
                               </button>

                               {/* Collapsible Content */}
                               <motion.div
                                   initial={false}
                                   animate={{ 
                                       height: isCollapsed ? 0 : 'auto',
                                       opacity: isCollapsed ? 0 : 1
                                   }}
                                   transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                                   className="overflow-hidden flex flex-col pl-0.5"
                               >
                                   {section.items.map((item, itemIdx) => renderLink(item, `link-acc-${secIdx}-${itemIdx}`))}
                               </motion.div>
                           </div>
                       );
                   })}
                </nav>
             </div>

             {/* Footer - Premium Upgrade Card */}
             <div className="mt-auto pt-4 border-t border-white/5">
                {sidebarData
                    .filter(item => item.type === 'button-secondary')
                    .map((item, index) => (
                        <div 
                            key="premium-upgrade-wrap" 
                            className="relative overflow-hidden rounded-2xl border border-[#26313A] bg-gradient-to-b from-[#10161B] to-[#0A0E12] p-4 hover:border-[#AFC3CF]/40 transition-all duration-300 shadow-[0_4px_25px_rgba(0,0,0,0.5)] group"
                        >
                            {/* Ambient Glows */}
                            <div className="absolute -right-6 -bottom-6 w-16 h-16 bg-white/[0.04] blur-xl rounded-full group-hover:bg-white/[0.08] transition-colors" />
                            <div className="absolute -left-6 -top-6 w-12 h-12 bg-[#8DB8CC]/10 blur-xl rounded-full animate-pulse" />
                            
                            <div className="flex items-center gap-3 relative z-10">
                                <div className="p-2 rounded-lg bg-white/10 border border-white/20 text-[#E8F0F4] group-hover:scale-110 transition-transform">
                                    <Zap size={15} className="fill-white/10 text-white animate-pulse" />
                                </div>
                                <div className="flex-grow min-w-0">
                                    <h4 className="text-[13px] font-extrabold text-white tracking-wide truncate">Unlimited Creator</h4>
                                    <p className="text-[10px] text-[#A8B0B7] font-medium truncate">Unleash all premium neural tools</p>
                                </div>
                            </div>
                            
                            <button 
                                onClick={() => onPageNavigate('pricing')}
                                className="w-full mt-3.5 py-2 px-4 rounded-xl bg-gradient-to-r from-white via-[#E8F0F4] to-[#AFC3CF] hover:brightness-110 text-[#050709] font-extrabold text-[12px] tracking-wider transition-all duration-300 cursor-pointer text-center relative overflow-hidden group shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:shadow-[0_0_20px_rgba(255,255,255,0.35)] hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <span className="relative z-10">UPGRADE NOW</span>
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                            </button>
                        </div>
                    ))}
             </div>
           </div>
        </aside>
    );
});

Sidebar.displayName = 'Sidebar';

export default Sidebar;
