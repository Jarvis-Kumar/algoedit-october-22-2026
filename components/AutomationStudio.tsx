
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    Zap, Scissors, Video, Volume2, Sparkles, 
    Layout, Languages, Share2, Save, History,
    Play, Pause, SkipForward, SkipBack, Trash2,
    Check, AlertCircle, Loader2, Settings, Sliders,
    Eye, User as UserIcon, Maximize, Monitor, Smartphone,
    FileCode, Download, Plus, Search, Filter, Info,
    BrainCircuit, Wand2, Clock, Layers, MessageSquare,
    Mic, MousePointer2, Palette, Box, Repeat, Lightbulb,
    Target, Command
} from 'lucide-react';
import { 
    User, Asset, Page, FeaturePageId, PreloadedAssetState,
    AutomationTask, TimelineClip, BrollSuggestion, CaptionSegment, OnNavigateType,
    WorkflowMacro, BrandStyle
} from '../types';
import { generateTimelineExport } from '../utils/aiUtils';
import { AutomationService } from '../services/AutomationService';
import ActionButton from './ActionButton';
import { CustomSelect } from './ui/CustomSelect';

interface AutomationStudioProps {
    user: User | null;
    deductTokens: (amount: number, description?: string) => boolean;
    onMediaGenerated: (name: string, type: Asset['type'], size: number, url: string) => void;
    onNavigate: OnNavigateType;
    preloadedAssetState: PreloadedAssetState | null;
}

type AutomationCategory = 'cleanup' | 'assembly' | 'optimization' | 'macros' | 'batch' | 'brand' | 'copilot';

const AutomationStudio: React.FC<AutomationStudioProps> = ({
    user,
    deductTokens,
    onMediaGenerated,
    onNavigate,
    preloadedAssetState
}) => {
    const [activeCategory, setActiveCategory] = useState<AutomationCategory>('cleanup');
    const [sourceVideo, setSourceVideo] = useState<string>(preloadedAssetState?.sourceVideoUrl || '');
    const [isProcessing, setIsProcessing] = useState(false);
    const [tasks, setTasks] = useState<AutomationTask[]>([]);
    const [timeline, setTimeline] = useState<TimelineClip[]>([]);
    const [captions, setCaptions] = useState<CaptionSegment[]>([]);
    const [brollSuggestions, setBrollSuggestions] = useState<BrollSuggestion[]>([]);
    const [activeTask, setActiveTask] = useState<string | null>(null);

    // New Automation State
    const [macros, setMacros] = useState<WorkflowMacro[]>(AutomationService.getMacros());
    const [brandStyles, setBrandStyles] = useState<BrandStyle[]>(AutomationService.getBrandStyles());
    const [isRecording, setIsRecording] = useState(false);
    const [recordedSteps, setRecordedSteps] = useState<AutomationTask['type'][]>([]);
    const [promptCommand, setPromptCommand] = useState('');
    const [copilotSuggestions, setCopilotSuggestions] = useState<string[]>([]);
    const [batchFiles, setBatchFiles] = useState<string[]>([]);
    const [actionHistory, setActionHistory] = useState<string[]>([]);
    const [repetitiveSuggestion, setRepetitiveSuggestion] = useState<string | null>(null);

    // Automation Settings
    const [cleanupSettings, setCleanupSettings] = useState({
        fillerSensitivity: 75,
        silenceThreshold: -40,
        removeUms: true,
        removeLikes: true
    });

    const [visualSettings, setVisualSettings] = useState({
        eyeContact: false,
        faceSmoothing: 50,
        lightingCorrection: true,
        autoGreenScreen: false
    });

    const [exportFormat, setExportFormat] = useState<'XML' | 'FCPXML'>('XML');

    // Persistence
    useEffect(() => {
        const saved = localStorage.getItem('automation_settings');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.cleanup) setCleanupSettings(parsed.cleanup);
                if (parsed.visual) setVisualSettings(parsed.visual);
            } catch (e) {
                console.error("Failed to load automation settings", e);
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('automation_settings', JSON.stringify({
            cleanup: cleanupSettings,
            visual: visualSettings
        }));
    }, [cleanupSettings, visualSettings]);

    useEffect(() => {
        if (sourceVideo) {
            setCopilotSuggestions(AutomationService.getCopilotSuggestions({
                hasCaptions: captions.length > 0,
                lighting: 40,
                duration: 120
            }));
        }
    }, [sourceVideo, captions]);

    useEffect(() => {
        const suggestion = AutomationService.suggestAutomations(actionHistory);
        if (suggestion) {
            setRepetitiveSuggestion(suggestion);
        }
    }, [actionHistory]);

    const handleRunAutomation = async (type: AutomationTask['type']) => {
        if (!sourceVideo) {
            alert("Please select a source video first.");
            return;
        }

        setActionHistory(prev => [...prev, type]);

        if (isRecording) {
            setRecordedSteps(prev => [...prev, type]);
        }

        const cost = 5; // Base cost for automation tasks
        if (!deductTokens(cost, `AI Automation: ${type}`)) return;

        setIsProcessing(true);
        const taskId = Math.random().toString(36).substring(7);
        const newTask: AutomationTask = {
            id: taskId,
            type,
            status: 'processing',
            progress: 0
        };
        setTasks(prev => [newTask, ...prev]);
        setActiveTask(taskId);

        try {
            // Simulate progress
            const interval = setInterval(() => {
                setTasks(prev => prev.map(t => t.id === taskId ? { ...t, progress: Math.min(t.progress + 10, 90) } : t));
            }, 500);

            const response = await fetch('/api/ai/media-automation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mediaUrl: sourceVideo, taskType: type, context: JSON.stringify({ cleanupSettings, visualSettings }) })
            });

            if (!response.ok) throw new Error("Automation failed");
            const result = await response.json();
            
            clearInterval(interval);

            setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'completed', progress: 100, result } : t));

            if (type === 'rough-cut' && result.timeline) {
                setTimeline(result.timeline);
            } else if (type === 'captioning' && result.captions) {
                setCaptions(result.captions);
            } else if (type === 'b-roll' && result.suggestions) {
                setBrollSuggestions(result.suggestions);
            }

        } catch (error) {
            setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'failed' } : t));
        } finally {
            setIsProcessing(false);
        }
    };

    const handleRunMacro = async (macro: WorkflowMacro) => {
        if (!sourceVideo) return;
        if (!deductTokens(10, `Run Macro: ${macro.name}`)) return;
        
        setIsProcessing(true);
        await AutomationService.runWorkflow(macro.steps, (step, progress) => {
            setTasks(prev => {
                const existing = prev.find(t => t.type === step && t.status === 'processing');
                if (existing) {
                    return prev.map(t => t.id === existing.id ? { ...t, progress } : t);
                }
                return [{ id: Math.random().toString(36), type: step as any, status: 'processing', progress }, ...prev];
            });
        });
        setIsProcessing(false);
        alert(`Macro "${macro.name}" completed successfully!`);
    };

    const handleSaveMacro = () => {
        if (recordedSteps.length === 0) return;
        const name = prompt("Enter macro name:");
        if (!name) return;
        const newMacro: WorkflowMacro = {
            id: Math.random().toString(36),
            name,
            description: `Custom macro with ${recordedSteps.length} steps`,
            steps: recordedSteps,
            createdAt: Date.now()
        };
        AutomationService.saveMacro(newMacro);
        setMacros(prev => [...prev, newMacro]);
        setRecordedSteps([]);
        setIsRecording(false);
    };

    const handlePromptEdit = async () => {
        if (!promptCommand || !sourceVideo) return;
        if (!deductTokens(5, `Prompt Edit: ${promptCommand}`)) return;
        
        setIsProcessing(true);
        // Simulate AI processing prompt
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsProcessing(false);
        setPromptCommand('');
        alert(`AI has applied: "${promptCommand}"`);
    };

    const renderMacros = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <History className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-sm font-black uppercase tracking-widest text-white">Workflow Macros</h3>
                </div>
                <button 
                    onClick={() => isRecording ? handleSaveMacro() : setIsRecording(true)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${isRecording ? 'bg-rose-500 text-white animate-pulse' : 'bg-white/5 text-cyan-400 border border-cyan-500/30'}`}
                >
                    <div className={`w-2 h-2 rounded-full ${isRecording ? 'bg-white' : 'bg-rose-500'}`} />
                    {isRecording ? 'Stop Recording' : 'Record Macro'}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {macros.map(macro => (
                    <div key={macro.id} className="ai-card p-6 bg-white/5 border-white/10 hover:border-cyan-500/30 transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h4 className="text-sm font-bold text-white mb-1">{macro.name}</h4>
                                <p className="text-[10px] text-slate-500">{macro.description}</p>
                            </div>
                            <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400">
                                <Zap className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-6">
                            {macro.steps.map((step, i) => (
                                <span key={i} className="px-2 py-1 rounded bg-white/5 border border-white/5 text-[8px] font-black text-slate-400 uppercase">
                                    {step.replace('-', ' ')}
                                </span>
                            ))}
                        </div>
                        <ActionButton 
                            onClick={() => handleRunMacro(macro)}
                            text="Apply Workflow"
                            className="w-full !py-2.5"
                            icon={<Play className="w-3 h-3 mr-2" />}
                        />
                    </div>
                ))}
            </div>
        </div>
    );

    const renderBatch = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="ai-card p-8 bg-white/5 border-white/10 text-center">
                <div className="w-16 h-16 bg-cyan-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-cyan-500/20">
                    <Repeat className="w-8 h-8 text-cyan-400" />
                </div>
                <h3 className="text-xl font-black text-white mb-2">Smart Batch Processor</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mb-8">
                    Apply consistent edits across hundreds of files. AI detects similarities and adjusts parameters automatically.
                </p>
                <div className="flex flex-col items-center gap-4">
                    <button className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-300 hover:bg-white/10 transition-all">
                        Select 100+ Files
                    </button>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600">
                        <Info size={12} />
                        <span>Supports Image & Video Batching</span>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderBrand = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="ai-card p-6 bg-white/5 border-white/10">
                    <div className="flex items-center gap-3 mb-6">
                        <Palette className="w-5 h-5 text-purple-400" />
                        <h3 className="text-sm font-black uppercase tracking-widest text-white">Style Memory</h3>
                    </div>
                    <div className="space-y-4">
                        {brandStyles.map(style => (
                            <div key={style.id} className="p-4 bg-black/20 rounded-2xl border border-white/5">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-xs font-bold text-white">{style.name}</span>
                                    <div className="flex gap-1">
                                        {style.colors.map((c, i) => (
                                            <div key={i} className="w-3 h-3 rounded-full" style={{ backgroundColor: c }} />
                                        ))}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="p-2 bg-white/5 rounded-lg text-[9px] text-slate-400">
                                        Font: {style.typography}
                                    </div>
                                    <div className="p-2 bg-white/5 rounded-lg text-[9px] text-slate-400">
                                        Style: {style.layoutStyle}
                                    </div>
                                </div>
                            </div>
                        ))}
                        <button className="w-full py-3 bg-white/5 border border-white/5 rounded-xl text-[10px] font-black uppercase text-slate-500 hover:text-white transition-all">
                            + Add Brand Identity
                        </button>
                    </div>
                </div>

                <div className="ai-card p-6 bg-white/5 border-white/10">
                    <div className="flex items-center gap-3 mb-6">
                        <Target className="w-5 h-5 text-emerald-400" />
                        <h3 className="text-sm font-black uppercase tracking-widest text-white">Smart Resize</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { id: 'ig', name: 'Instagram', icon: <Smartphone size={14} /> },
                            { id: 'tt', name: 'TikTok', icon: <Smartphone size={14} /> },
                            { id: 'yt', name: 'YouTube', icon: <Monitor size={14} /> },
                            { id: 'li', name: 'LinkedIn', icon: <Monitor size={14} /> }
                        ].map(platform => (
                            <button key={platform.id} className="p-4 bg-black/20 rounded-2xl border border-white/5 hover:border-emerald-500/30 transition-all text-center group">
                                <div className="text-emerald-400 mb-2 flex justify-center">{platform.icon}</div>
                                <div className="text-[9px] font-black text-white uppercase">{platform.name}</div>
                            </button>
                        ))}
                    </div>
                    <ActionButton 
                        onClick={() => handleRunAutomation('smart-resize')}
                        text="Generate All Formats"
                        className="w-full mt-6 !py-3 !bg-emerald-600"
                        icon={<Maximize className="w-4 h-4 mr-2" />}
                    />
                </div>
            </div>
        </div>
    );

    const renderCopilot = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="ai-card p-6 bg-white/5 border-white/10">
                <div className="flex items-center gap-3 mb-6">
                    <Command className="w-5 h-5 text-[#8DB8CC]" />
                    <h3 className="text-sm font-black uppercase tracking-widest text-white">Prompt-to-Edit</h3>
                </div>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={promptCommand}
                        onChange={(e) => setPromptCommand(e.target.value)}
                        placeholder="e.g. 'Make the background cinematic glow' or 'Remove the watermark'..."
                        className="flex-grow bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white outline-none focus:ring-1 focus:ring-[#8DB8CC]/50"
                    />
                    <button 
                        onClick={handlePromptEdit}
                        className="px-6 bg-gradient-to-r from-white via-[#E8F0F4] to-[#AFC3CF] hover:brightness-110 rounded-xl text-xs font-mono font-black uppercase text-[#050709] transition-all cursor-pointer shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                    >
                        Apply
                    </button>
                </div>
            </div>

            <div className="ai-card p-6 bg-white/5 border-white/10">
                <div className="flex items-center gap-3 mb-6">
                    <Lightbulb className="w-5 h-5 text-[#8DB8CC]" />
                    <h3 className="text-sm font-black uppercase tracking-widest text-white">Copilot Suggestions</h3>
                </div>
                <div className="space-y-3">
                    {copilotSuggestions.map((s, i) => (
                        <div key={i} className="p-4 bg-[#10161B] border border-[#26313A] rounded-2xl flex items-center justify-between group">
                            <p className="text-xs text-[#AFC3CF] font-medium">{s}</p>
                            <button className="p-2 bg-[#8DB8CC]/10 hover:bg-[#8DB8CC]/20 rounded-lg text-[#8DB8CC] opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
                                <Plus size={14} />
                            </button>
                        </div>
                    ))}
                    {copilotSuggestions.length === 0 && (
                        <div className="py-12 text-center opacity-20">
                            <p className="text-xs font-bold text-slate-500 uppercase">No suggestions yet</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    const handleExport = async () => {
        if (timeline.length === 0) {
            alert("No timeline to export. Run 'Rough Cut' first.");
            return;
        }
        const xml = await generateTimelineExport(timeline, exportFormat);
        const blob = new Blob([xml], { type: 'text/xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `project_export.${exportFormat.toLowerCase()}`;
        a.click();
    };

    const renderCleanup = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="ai-card p-6 bg-white/5 border-white/10">
                    <div className="flex items-center gap-3 mb-6">
                        <Volume2 className="w-5 h-5 text-cyan-400" />
                        <h3 className="text-sm font-black uppercase tracking-widest text-white">Audio Cleanup</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Filler Sensitivity</label>
                                <span className="text-[10px] font-mono text-cyan-400">{cleanupSettings.fillerSensitivity}%</span>
                            </div>
                            <input 
                                type="range" 
                                value={cleanupSettings.fillerSensitivity}
                                onChange={(e) => setCleanupSettings(prev => ({ ...prev, fillerSensitivity: parseInt(e.target.value) }))}
                                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                            />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-black/20 rounded-xl border border-white/5">
                            <span className="text-xs font-bold text-slate-300">Remove "Um" & "Uh"</span>
                            <input 
                                type="checkbox" 
                                checked={cleanupSettings.removeUms}
                                onChange={(e) => setCleanupSettings(prev => ({ ...prev, removeUms: e.target.checked }))}
                                className="w-4 h-4 rounded border-white/10 bg-white/5 text-cyan-500"
                            />
                        </div>
                        <ActionButton 
                            onClick={() => handleRunAutomation('filler-removal')}
                            isLoading={isProcessing && activeTask?.includes('filler')}
                            text={`Remove Filler Words • 5 Tokens`}
                            className="w-full !py-3"
                            icon={<Scissors className="w-4 h-4 mr-2" />}
                        />
                    </div>
                </div>

                <div className="ai-card p-6 bg-white/5 border-white/10">
                    <div className="flex items-center gap-3 mb-6">
                        <Eye className="w-5 h-5 text-purple-400" />
                        <h3 className="text-sm font-black uppercase tracking-widest text-white">Visual Enhancement</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-black/20 rounded-xl border border-white/5">
                            <div className="flex items-center gap-2">
                                <UserIcon className="w-4 h-4 text-purple-400" />
                                <span className="text-xs font-bold text-slate-300">AI Eye Contact Correction</span>
                            </div>
                            <input 
                                type="checkbox" 
                                checked={visualSettings.eyeContact}
                                onChange={(e) => setVisualSettings(prev => ({ ...prev, eyeContact: e.target.checked }))}
                                className="w-4 h-4 rounded border-white/10 bg-white/5 text-purple-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Face Smoothing</label>
                                <span className="text-[10px] font-mono text-[#8DB8CC]">{visualSettings.faceSmoothing}%</span>
                            </div>
                            <input 
                                type="range" 
                                value={visualSettings.faceSmoothing}
                                onChange={(e) => setVisualSettings(prev => ({ ...prev, faceSmoothing: parseInt(e.target.value) }))}
                                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#8DB8CC]"
                            />
                        </div>
                        <ActionButton 
                            onClick={() => handleRunAutomation('face-smoothing')}
                            isLoading={isProcessing && activeTask?.includes('face')}
                            text={`Apply Visual Polish • 5 Tokens`}
                            className="w-full !py-3"
                            icon={<Sparkles className="w-4 h-4 mr-2" />}
                        />
                    </div>
                </div>
            </div>
        </div>
    );

    const renderAssembly = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="ai-card p-6 bg-white/5 border-white/10">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <Layers className="w-5 h-5 text-amber-400" />
                                <h3 className="text-sm font-black uppercase tracking-widest text-white">AI Rough Cut Timeline</h3>
                            </div>
                            <ActionButton 
                                onClick={() => handleRunAutomation('rough-cut')}
                                isLoading={isProcessing && activeTask?.includes('rough')}
                                text={`Generate Sequence • 5 Tokens`}
                                className="!py-2 !px-4 !text-[10px]"
                                icon={<BrainCircuit className="w-3 h-3 mr-2" />}
                            />
                        </div>
                        
                        <div className="h-48 bg-black/40 rounded-2xl border border-white/5 flex items-center justify-center relative overflow-hidden">
                            {timeline.length > 0 ? (
                                <div className="flex gap-1 p-4 w-full overflow-x-auto no-scrollbar">
                                    {timeline.map((clip, i) => (
                                        <div 
                                            key={clip.id} 
                                            className="h-32 min-w-[120px] bg-[#10161B] border border-[#26313A] rounded-xl flex flex-col items-center justify-center p-2 relative group cursor-pointer hover:border-[#8DB8CC]/50 transition-all"
                                        >
                                            <div className="text-[8px] font-black text-[#8DB8CC] uppercase mb-1">Clip {i+1}</div>
                                            <div className="text-[10px] font-bold text-white text-center line-clamp-2">{clip.emotion || 'Neutral'}</div>
                                            <div className="absolute bottom-2 right-2 text-[8px] font-mono text-[#AFC3CF]">{(clip.endTime - clip.startTime).toFixed(1)}s</div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center space-y-2 opacity-30">
                                    <Layout className="w-8 h-8 mx-auto text-slate-500" />
                                    <p className="text-[10px] font-bold text-slate-500 uppercase">No sequence generated</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="ai-card p-6 bg-white/5 border-white/10">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <Video className="w-5 h-5 text-emerald-400" />
                                <h3 className="text-sm font-black uppercase tracking-widest text-white">B-Roll Suggestions</h3>
                            </div>
                            <ActionButton 
                                onClick={() => handleRunAutomation('b-roll')}
                                isLoading={isProcessing && activeTask?.includes('b-roll')}
                                text={`Analyze Script • 5 Tokens`}
                                className="!py-2 !px-4 !text-[10px] !bg-emerald-600 hover:!bg-emerald-700"
                                icon={<Search className="w-3 h-3 mr-2" />}
                            />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {brollSuggestions.map((s, i) => (
                                <div key={i} className="p-3 bg-black/20 rounded-xl border border-white/5 hover:border-emerald-500/30 transition-all group">
                                    <div className="text-[8px] font-black text-emerald-400 uppercase mb-1">@{s.timestamp}s</div>
                                    <div className="text-[10px] font-bold text-white mb-2">{s.keyword}</div>
                                    <button className="w-full py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[8px] font-black uppercase text-slate-400 hover:text-white transition-all">
                                        Insert Asset
                                    </button>
                                </div>
                            ))}
                            {brollSuggestions.length === 0 && (
                                <div className="col-span-full py-12 text-center opacity-20">
                                    <p className="text-xs font-bold text-slate-500 uppercase">Suggestions will appear here</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="ai-card p-6 bg-white/5 border-white/10">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">Scene Detection</h3>
                        <ActionButton 
                            onClick={() => handleRunAutomation('scene-detection')}
                            isLoading={isProcessing && activeTask?.includes('scene')}
                            text={`Auto Segment • 5 Tokens`}
                            className="w-full !py-3"
                            icon={<Maximize className="w-4 h-4 mr-2" />}
                        />
                    </div>
                    <div className="ai-card p-6 bg-white/5 border-white/10">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">Creative Control</h3>
                        <div className="space-y-3">
                            <div className="p-3 bg-[#10161B] rounded-xl border border-[#26313A]">
                                <div className="flex items-center gap-2 text-[#8DB8CC] mb-1">
                                    <Info className="w-3 h-3" />
                                    <span className="text-[10px] font-black uppercase">Human-in-the-Loop</span>
                                </div>
                                <p className="text-[9px] text-slate-400 leading-relaxed">Every AI action is a suggestion. You have full rollback and manual override capability.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderOptimization = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="ai-card p-6 bg-white/5 border-white/10">
                    <div className="flex items-center gap-3 mb-6">
                        <Smartphone className="w-5 h-5 text-pink-400" />
                        <h3 className="text-sm font-black uppercase tracking-widest text-white">Short-Form Repurposing</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <button className="p-4 bg-black/20 rounded-2xl border border-white/5 hover:border-pink-500/30 transition-all text-center group">
                                <div className="w-8 h-8 bg-pink-500/10 rounded-full flex items-center justify-center mx-auto mb-2 text-pink-400 group-hover:scale-110 transition-transform">
                                    <Zap className="w-4 h-4" />
                                </div>
                                <div className="text-[10px] font-black text-white uppercase">Viral Hooks</div>
                            </button>
                            <button className="p-4 bg-black/20 rounded-2xl border border-white/5 hover:border-pink-500/30 transition-all text-center group">
                                <div className="w-8 h-8 bg-pink-500/10 rounded-full flex items-center justify-center mx-auto mb-2 text-pink-400 group-hover:scale-110 transition-transform">
                                    <Maximize className="w-4 h-4" />
                                </div>
                                <div className="text-[10px] font-black text-white uppercase">Auto Reframe</div>
                            </button>
                        </div>
                        <ActionButton 
                            onClick={() => handleRunAutomation('short-form')}
                            isLoading={isProcessing && activeTask?.includes('short')}
                            text={`Generate Shorts • 5 Tokens`}
                            className="w-full !py-3 !bg-pink-600 hover:!bg-pink-700"
                            icon={<Wand2 className="w-4 h-4 mr-2" />}
                        />
                    </div>
                </div>

                <div className="ai-card p-6 bg-white/5 border-white/10">
                    <div className="flex items-center gap-3 mb-6">
                        <Languages className="w-5 h-5 text-indigo-400" />
                        <h3 className="text-sm font-black uppercase tracking-widest text-white">Captions & Translation</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="flex gap-2">
                            <CustomSelect 
                                value="English (Source)"
                                onChange={() => {}}
                                options={['English (Source)', 'Spanish', 'French', 'Hindi']}
                            />
                        </div>
                        <div className="p-4 bg-black/20 rounded-2xl border border-white/5 h-32 overflow-y-auto custom-scrollbar">
                            {captions.length > 0 ? (
                                <div className="space-y-2">
                                    {captions.map((c, i) => (
                                        <div key={i} className="text-[10px] font-medium text-slate-300">
                                            <span className="text-indigo-400 font-mono mr-2">[{c.startTime}s]</span>
                                            {c.text}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="h-full flex items-center justify-center text-center opacity-20">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase">Captions will be generated here</p>
                                </div>
                            )}
                        </div>
                        <ActionButton 
                            onClick={() => handleRunAutomation('captioning')}
                            isLoading={isProcessing && activeTask?.includes('caption')}
                            text={`Generate Dynamic Captions • 5 Tokens`}
                            className="w-full !py-3"
                            icon={<MessageSquare className="w-4 h-4 mr-2" />}
                        />
                    </div>
                </div>
            </div>
        </div>
    );

    const renderIntegration = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="ai-card p-6 bg-white/5 border-white/10">
                    <div className="flex items-center gap-3 mb-6">
                        <Share2 className="w-5 h-5 text-[#8DB8CC]" />
                        <h3 className="text-sm font-black uppercase tracking-widest text-white">Timeline Export</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="flex gap-2">
                            {(['XML', 'FCPXML'] as const).map(format => (
                                <button
                                    key={format}
                                    onClick={() => setExportFormat(format)}
                                    className={`flex-1 py-3 rounded-xl text-xs font-black transition-all border cursor-pointer ${exportFormat === format ? 'bg-[#10161B] border-[#8DB8CC] text-white shadow-[0_0_15px_rgba(141,184,204,0.25)]' : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-white'}`}
                                >
                                    {format}
                                </button>
                            ))}
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                            Export your AI-generated rough cut to professional NLEs like Adobe Premiere Pro, Final Cut Pro, or DaVinci Resolve.
                        </p>
                        <ActionButton 
                            onClick={handleExport}
                            text="Download Project File"
                            className="w-full !py-3"
                            icon={<Download className="w-4 h-4 mr-2" />}
                        />
                    </div>
                </div>

                <div className="ai-card p-6 bg-white/5 border-white/10">
                    <div className="flex items-center gap-3 mb-6">
                        <BrainCircuit className="w-5 h-5 text-purple-400" />
                        <h3 className="text-sm font-black uppercase tracking-widest text-white">Brand Awareness</h3>
                    </div>
                    <div className="space-y-4">
                        <button className="w-full p-4 bg-black/20 rounded-2xl border border-white/5 hover:border-purple-500/30 transition-all flex items-center justify-between group">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                                    <FileCode className="w-4 h-4" />
                                </div>
                                <div className="text-left">
                                    <div className="text-xs font-bold text-white">Upload Brand Guidelines</div>
                                    <div className="text-[9px] text-slate-500 font-medium">PDF, TXT, or Style Presets</div>
                                </div>
                            </div>
                            <Plus className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors" />
                        </button>
                        <div className="p-4 bg-purple-500/5 rounded-2xl border border-purple-500/10">
                            <p className="text-[9px] text-purple-300 leading-relaxed italic">
                                "The AI will adapt cuts, pacing, and visual style to match your brand voice and previous editing patterns."
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col h-full space-y-8">
            {/* Source Selection */}
            <div className="ai-card p-6 bg-gradient-to-r from-cyan-500/5 to-purple-500/5 border-white/10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                            <Video className="w-6 h-6 text-cyan-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-white uppercase tracking-tighter">Automation Studio</h2>
                            <p className="text-xs text-slate-500 font-medium">Intelligent algorithms for high-efficiency editing</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <div className="flex-grow md:w-64 relative">
                            <input 
                                type="text" 
                                value={sourceVideo}
                                onChange={(e) => setSourceVideo(e.target.value)}
                                placeholder="Paste source video URL..."
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs font-bold text-white outline-none focus:ring-1 focus:ring-cyan-500/50"
                            />
                            <Search className="absolute right-3 top-2.5 w-4 h-4 text-slate-600" />
                        </div>
                        <button className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-slate-400 hover:text-white transition-all">
                            <History className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Category Navigation */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
                {(['cleanup', 'assembly', 'optimization', 'macros', 'batch', 'brand', 'copilot'] as const).map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${activeCategory === cat ? 'bg-white text-black border-white' : 'bg-white/5 text-slate-500 border-white/5 hover:bg-white/10 hover:text-slate-300'}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Main Content Area */}
            <div className="flex-grow">
                {activeCategory === 'cleanup' && renderCleanup()}
                {activeCategory === 'assembly' && renderAssembly()}
                {activeCategory === 'optimization' && renderOptimization()}
                {activeCategory === 'macros' && renderMacros()}
                {activeCategory === 'batch' && renderBatch()}
                {activeCategory === 'brand' && renderBrand()}
                {activeCategory === 'copilot' && renderCopilot()}
            </div>

            {/* Repetitive Task Suggestion Toast */}
            <AnimatePresence>
                {repetitiveSuggestion && (
                    <motion.div 
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 100 }}
                        className="fixed top-24 right-8 w-80 bg-cyan-600 rounded-2xl p-4 shadow-2xl z-[60] border border-cyan-400/30"
                    >
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <Zap className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-grow">
                                <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-1">Automation Opportunity</h4>
                                <p className="text-[11px] text-cyan-50 font-medium leading-tight mb-3">{repetitiveSuggestion}</p>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => {
                                            setActiveCategory('macros');
                                            setIsRecording(true);
                                            setRepetitiveSuggestion(null);
                                        }}
                                        className="px-3 py-1.5 bg-white text-cyan-600 rounded-lg text-[9px] font-black uppercase"
                                    >
                                        Create Macro
                                    </button>
                                    <button 
                                        onClick={() => setRepetitiveSuggestion(null)}
                                        className="px-3 py-1.5 bg-cyan-700 text-white rounded-lg text-[9px] font-black uppercase"
                                    >
                                        Dismiss
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Processing Status Bar */}
            <AnimatePresence>
                {tasks.length > 0 && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="fixed bottom-8 right-8 w-80 bg-[#121216] rounded-3xl border border-white/10 shadow-2xl overflow-hidden z-50"
                    >
                        <div className="p-4 bg-white/5 border-b border-white/5 flex items-center justify-between">
                            <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Active Processes</h4>
                            <button onClick={() => setTasks([])} className="text-slate-500 hover:text-white">
                                <Trash2 className="w-3 h-3" />
                            </button>
                        </div>
                        <div className="max-h-64 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                            {tasks.map(task => (
                                <div key={task.id} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {task.status === 'processing' ? (
                                                <Loader2 className="w-3 h-3 text-cyan-400 animate-spin" />
                                            ) : task.status === 'completed' ? (
                                                <Check className="w-3 h-3 text-emerald-400" />
                                            ) : (
                                                <AlertCircle className="w-3 h-3 text-red-400" />
                                            )}
                                            <span className="text-[10px] font-bold text-white uppercase">{task.type.replace('-', ' ')}</span>
                                        </div>
                                        <span className="text-[10px] font-mono text-slate-500">{task.progress}%</span>
                                    </div>
                                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${task.progress}%` }}
                                            className={`h-full ${task.status === 'completed' ? 'bg-emerald-500' : task.status === 'failed' ? 'bg-red-500' : 'bg-cyan-500'}`}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AutomationStudio;
