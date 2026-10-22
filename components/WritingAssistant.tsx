
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { User, Asset, Page, FeaturePageId, PreloadedAssetState, WritingOptions, AdvancedWritingResult, WritingSuggestion, OnNavigateType } from '../types';
import { AI_TOKEN_COSTS } from '../constants';
import ActionButton from './ActionButton';
import { motion, AnimatePresence } from 'motion/react';
import { 
    Sparkles, Wand2, Languages, Users, MessageSquare, 
    Settings2, BrainCircuit, HeartHandshake, Info, 
    Copy, Check, Share2, Save, History, Trash2,
    ChevronDown, Sliders, Target, Lightbulb, AlertTriangle
} from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { debounce, throttle } from 'lodash';
import { CustomSelect } from './ui/CustomSelect';
import { DraftService } from '../services/draftService';

interface WritingAssistantProps {
    user: User | null;
    requireSignIn: () => boolean;
    userTokens: number;
    hasTokens: (amount: number) => boolean;
    deductTokens: (amount: number, description?: string) => boolean;
    onMediaGenerated: (name: string, type: Asset['type'], size: number, url: string) => void;
    onNavigate: OnNavigateType;
}

const TONES = ['Formal', 'Casual', 'Persuasive', 'Academic', 'Empathetic', 'Professional', 'Humorous'];
const AUDIENCES = ['General Public', 'Professionals', 'Students', 'Experts', 'Children'];
const INTENTS = ['Informative', 'Emotional', 'Marketing', 'Storytelling', 'Instructional'];
const LANGUAGES = ['English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Hindi', 'Arabic', 'Russian', 'Portuguese', 'Italian'];

const WritingAssistant: React.FC<WritingAssistantProps> = ({ 
    user, 
    requireSignIn, 
    userTokens, 
    hasTokens,
    deductTokens, 
    onMediaGenerated 
}) => {
    const [inputText, setInputText] = useState('');
    const [outputText, setOutputText] = useState('');
    const [analysis, setAnalysis] = useState<AdvancedWritingResult['analysis'] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [options, setOptions] = useState<WritingOptions>({
        tone: 'Professional',
        audience: 'General Public',
        intent: 'Informative',
        creativityLevel: 'balanced',
        sensitivityMode: false,
        targetLanguage: 'English'
    });
    const [activeTab, setActiveTab] = useState<'editor' | 'analysis' | 'collaboration'>('editor');
    const [isCopied, setIsCopied] = useState(false);
    const [showOptions, setShowOptions] = useState(false);

    // Collaboration State
    const [socket, setSocket] = useState<Socket | null>(null);
    const [roomId, setRoomId] = useState('');
    const [isCollaborating, setIsCollaborating] = useState(false);
    const [collaborators, setCollaborators] = useState<{ id: string; name: string; color: string }[]>([]);
    const [cursors, setCursors] = useState<Map<string, { x: number; y: number; name: string; color: string }>>(new Map());

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Initialize Socket
    useEffect(() => {
        if (!isCollaborating || !roomId) return;

        const newSocket = io(window.location.origin, {
            path: '/collaboration',
            query: {
                docId: roomId,
                userId: user?.email || 'anonymous',
                userName: user?.name || 'Anonymous'
            }
        });
        
        setSocket(newSocket);

        newSocket.on('doc:init', (state: Uint8Array) => {
            // In a real Yjs app, we would apply this to a Y.Doc
            // For this demo, we'll just log it
            console.log('Document initialized');
        });

        newSocket.on('doc:update', (update: Uint8Array) => {
            // Apply CRDT update
            console.log('Document update received');
        });

        newSocket.on('presence:update', (presences: any) => {
            setCollaborators(Object.values(presences));
        });

        newSocket.on('presence:cursor', (data: { userId: string; cursor: any }) => {
            setCursors(prev => {
                const next = new Map(prev);
                const collaborator = collaborators.find(c => (c as any).userId === data.userId);
                if (collaborator) {
                    next.set(data.userId, { ...data.cursor, name: (collaborator as any).userName, color: '#cyan' });
                }
                return next;
            });
        });

        return () => {
            newSocket.disconnect();
        };
    }, [isCollaborating, roomId, user]);

    const handleJoinRoom = () => {
        if (!roomId.trim()) return;
        if (!requireSignIn()) return;
        setIsCollaborating(true);
    };

    // Personalization: Load saved preferences
    useEffect(() => {
        const saved = localStorage.getItem('writing_preferences');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setOptions(prev => ({ ...prev, ...parsed }));
            } catch (e) {
                console.error('Failed to load preferences', e);
            }
        }
    }, []);

    // Load Saved Draft
    useEffect(() => {
        const loadInitialDraft = async () => {
            const userId = user?.uid || null;
            const saved = await DraftService.getDraft(userId, 'writing-assistant');
            if (saved && saved.state) {
                if (saved.state.inputText) setInputText(saved.state.inputText);
                if (saved.state.outputText) setOutputText(saved.state.outputText);
                if (saved.state.options) setOptions(prev => ({ ...prev, ...saved.state.options }));
            }
        };
        if (!inputText) {
            loadInitialDraft();
        }
    }, [user]);

    // Save Draft on Change
    useEffect(() => {
        if (inputText) {
            const timeoutId = setTimeout(() => {
                const userId = user?.uid || null;
                DraftService.saveDraft(userId, 'writing-assistant', `Draft: ${inputText.substring(0, 30)}...`, {
                    inputText,
                    outputText,
                    options
                });
            }, 600);
            return () => clearTimeout(timeoutId);
        } else {
            const userId = user?.uid || null;
            DraftService.deleteDraft(userId, 'writing-assistant');
        }
    }, [inputText, outputText, options, user]);

    // Save preferences when they change
    useEffect(() => {
        localStorage.setItem('writing_preferences', JSON.stringify({
            tone: options.tone,
            audience: options.audience,
            intent: options.intent,
            targetLanguage: options.targetLanguage,
            sensitivityMode: options.sensitivityMode,
            creativityLevel: options.creativityLevel
        }));
    }, [options]);

    // Debounced Content Update
    const debouncedUpdateContent = useCallback(
        debounce((roomId: string, content: string) => {
            if (socket) {
                // In a real app, we'd send a Yjs update
                // socket.emit('doc:update', update);
                console.log('Emitting doc update');
            }
        }, 500),
        [socket]
    );

    // Throttled Cursor Update
    const throttledUpdateCursor = useCallback(
        throttle((roomId: string, cursor: any) => {
            if (socket) {
                socket.emit('presence:cursor', cursor);
            }
        }, 50),
        [socket]
    );

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (isCollaborating && socket && roomId) {
            const rect = textareaRef.current?.getBoundingClientRect();
            if (rect) {
                throttledUpdateCursor(roomId, {
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top,
                    name: user?.name || 'Anonymous',
                    color: collaborators.find(c => c.id === socket.id)?.color || '#cyan'
                });
            }
        }
    }, [isCollaborating, socket, roomId, user, collaborators, throttledUpdateCursor]);

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newContent = e.target.value;
        setInputText(newContent);
        if (isCollaborating && socket) {
            debouncedUpdateContent(roomId, newContent);
        }
    };

    const handleAdvancedTask = async () => {
        if (!inputText.trim()) {
            setError("Please enter some text to process.");
            return;
        }

        const cost = AI_TOKEN_COSTS.TEXT_OPTIMIZATION * 2; // Advanced task costs more
        if (!hasTokens(cost)) return;

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/ai/writing-advanced', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: inputText, options })
            });

            if (!response.ok) throw new Error("Synthesis failed");
            
            const result = await response.json();
            
            // Deduct tokens ONLY after successful AI response
            deductTokens(cost, `Advanced AI Writing`);

            setOutputText(result.text);
            setAnalysis(result.analysis);
            setActiveTab('analysis');
            
            onMediaGenerated(
                inputText.substring(0, 20), 
                'document' as any, 
                inputText.length, 
                `data:text/plain;base64,${btoa(result.text)}`
            );
        } catch (err) {
            setError("Advanced Linguistic Synthesis failed. Please check your connection.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(outputText);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="p-0 max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="px-2 py-0.5 rounded text-[10px] font-black bg-[#10161B] text-[#8DB8CC] border border-[#26313A] tracking-[0.2em] uppercase">
                            Text Synthesis v4.0
                        </div>
                        <div className="w-1.5 h-1.5 rounded-full bg-[#8DB8CC] animate-pulse shadow-[0_0_10px_rgba(141,184,204,0.5)]" />
                    </div>
                    <h2 className="text-3xl font-black text-white tracking-tighter flex items-center gap-3">
                        COGNITIVE <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#E8F0F4] to-[#AFC3CF]">WRITING</span> ENGINE
                    </h2>
                    <p className="text-slate-500 text-[10px] font-mono mt-1 tracking-wider uppercase">Context-aware neural synthesis & real-time collaboration</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex -space-x-2.5 mr-3">
                        {collaborators.map((c, i) => (
                            <motion.div 
                                key={c.id} 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="w-8 h-8 rounded-full border-2 border-[#0B0F1A] flex items-center justify-center text-[9px] font-black text-white uppercase shadow-xl"
                                style={{ backgroundColor: c.color }}
                                title={c.name}
                            >
                                {c.name[0]}
                            </motion.div>
                        ))}
                    </div>
                    <div className="flex items-center gap-1.5 p-1 bg-white/5 rounded-xl border border-white/10 glass-panel">
                        <button 
                            onClick={() => setShowOptions(!showOptions)}
                            className={`p-2 rounded-lg transition-all ${showOptions ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                        >
                            <Settings2 className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => setActiveTab(activeTab === 'collaboration' ? 'editor' : 'collaboration')}
                            className={`p-2 rounded-lg transition-all ${activeTab === 'collaboration' ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                        >
                            <Users className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Editor */}
                <div className="lg:col-span-7 space-y-4">
                    <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-2xl relative group">
                        {/* AI Command Console Header */}
                        <div className="flex items-center justify-between px-5 py-3 bg-white/5 border-b border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="flex gap-1 mr-2">
                                    <div className="w-2 h-2 rounded-full bg-red-500/50" />
                                    <div className="w-2 h-2 rounded-full bg-amber-500/50" />
                                    <div className="w-2 h-2 rounded-full bg-green-500/50" />
                                </div>
                                <button 
                                    onClick={() => setActiveTab('editor')}
                                    className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all relative py-1 ${activeTab === 'editor' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    SOURCE_BUFFER
                                    {activeTab === 'editor' && <motion.div layoutId="tab-underline" className="absolute -bottom-4 left-0 right-0 h-0.5 bg-gradient-to-r from-white via-[#8DB8CC] to-[#AFC3CF] shadow-[0_0_10px_rgba(141,184,204,0.8)]" />}
                                </button>
                                <button 
                                    onClick={() => setActiveTab('analysis')}
                                    className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all relative py-1 ${activeTab === 'analysis' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    NEURAL_ANALYSIS
                                    {activeTab === 'analysis' && <motion.div layoutId="tab-underline" className="absolute -bottom-4 left-0 right-0 h-0.5 bg-gradient-to-r from-white via-[#8DB8CC] to-[#AFC3CF] shadow-[0_0_10px_rgba(141,184,204,0.8)]" />}
                                </button>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[9px] font-mono text-slate-400 uppercase tracking-widest">
                                    {inputText.length} CH
                                </div>
                                <div className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[9px] font-mono text-slate-400 uppercase tracking-widest">
                                    {inputText.split(/\s+/).filter(Boolean).length} WD
                                </div>
                            </div>
                        </div>

                        <div className="relative bg-black/20">
                            {/* Scanning Line Animation */}
                            <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-[#8DB8CC]/50 to-transparent top-0 animate-scan pointer-events-none z-10" />
                            
                             <textarea
                                ref={textareaRef}
                                className="w-full h-[450px] bg-transparent p-8 text-base leading-relaxed text-slate-200 resize-none focus:outline-none placeholder:text-slate-700 font-normal selection:bg-white/20 font-mono"
                                placeholder="Initialize narrative sequence..."
                                value={inputText}
                                onChange={handleTextChange}
                                onMouseMove={handleMouseMove}
                            />
                            
                            {/* Collaborative Cursors REMOVED */}

                            {/* Corner Accents */}
                            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-white/10 pointer-events-none" />
                            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-white/10 pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-white/10 pointer-events-none" />
                            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-white/10 pointer-events-none" />
                        </div>

                        <div className="px-6 py-4 bg-white/5 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Creativity_Level:</span>
                                <div className="flex gap-1.5 p-1 bg-black/20 rounded-xl border border-white/5">
                                    {(['low', 'balanced', 'high'] as const).map(level => (
                                        <button
                                            key={level}
                                            onClick={() => setOptions(prev => ({ ...prev, creativityLevel: level }))}
                                            className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${options.creativityLevel === level ? 'bg-white text-black shadow-lg' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
                                        >
                                            {level}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right hidden md:block">
                                    <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Compute Cost</div>
                                    <div className="text-[10px] font-mono text-[#8DB8CC] font-bold">{AI_TOKEN_COSTS.TEXT_OPTIMIZATION * 2} TOKENS</div>
                                </div>
                                <motion.button 
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleAdvancedTask}
                                    disabled={!inputText || isLoading || (userTokens > 0 && userTokens < (AI_TOKEN_COSTS.TEXT_OPTIMIZATION * 2))}
                                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-mono font-black uppercase tracking-[0.2em] transition-all cursor-pointer ${
                                        !inputText || isLoading || (userTokens > 0 && userTokens < (AI_TOKEN_COSTS.TEXT_OPTIMIZATION * 2))
                                        ? 'bg-white/5 text-slate-600 cursor-not-allowed border border-white/5'
                                        : 'bg-gradient-to-r from-white via-[#E8F0F4] to-[#AFC3CF] text-[#050709] border border-white/60 shadow-[0_0_20px_rgba(255,255,255,0.25)] hover:brightness-110'
                                    }`}
                                >
                                    {isLoading ? (
                                         <div className="flex items-center gap-2">
                                             <div className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                             <span>Synthesizing...</span>
                                         </div>
                                    ) : (
                                        <>
                                            <Sparkles className="w-4 h-4 text-[#050709]" />
                                            <span>Execute Synthesis</span>
                                        </>
                                    )}
                                </motion.button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Context & Analysis */}
                <div className="lg:col-span-5 space-y-8">
                    <AnimatePresence mode="wait">
                        {showOptions ? (
                            <motion.div 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="glass-panel rounded-3xl border border-white/10 p-8 space-y-8 shadow-2xl relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#8DB8CC]/10 blur-3xl -z-10" />
                                
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-3 text-[#8DB8CC]">
                                        <Settings2 className="w-5 h-5" />
                                        <h3 className="text-xs font-black uppercase tracking-[0.2em]">Contextual_Parameters</h3>
                                    </div>
                                    <div className="w-12 h-px bg-gradient-to-r from-[#8DB8CC]/50 to-transparent" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {[
                                        { label: 'Tone', icon: Sliders, value: options.tone, key: 'tone', options: TONES },
                                        { label: 'Audience', icon: Target, value: options.audience, key: 'audience', options: AUDIENCES },
                                        { label: 'Intent', icon: Lightbulb, value: options.intent, key: 'intent', options: INTENTS },
                                        { label: 'Language', icon: Languages, value: options.targetLanguage, key: 'targetLanguage', options: LANGUAGES },
                                    ].map((field) => (
                                        <div key={field.key} className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                                <field.icon className="w-3.5 h-3.5" /> {field.label}
                                            </label>
                                            <CustomSelect 
                                                options={field.options}
                                                value={field.value}
                                                onChange={(val) => setOptions(prev => ({ ...prev, [field.key]: val }))}
                                            />
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-8 border-t border-white/10">
                                    <label className="flex items-center justify-between cursor-pointer group p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-[#8DB8CC]/30 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 rounded-xl bg-[#8DB8CC]/10 text-[#8DB8CC] group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(141,184,204,0.2)]">
                                                <HeartHandshake className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="text-xs font-black text-white uppercase tracking-wider">Sensitivity Mode</div>
                                                <div className="text-[10px] text-slate-500 font-mono mt-1">EMPATHY_AWARE_SYNTHESIS</div>
                                            </div>
                                        </div>
                                        <div className={`w-12 h-6 rounded-full p-1 transition-colors ${options.sensitivityMode ? 'bg-[#8DB8CC]' : 'bg-white/10'}`}>
                                            <motion.div 
                                                animate={{ x: options.sensitivityMode ? 24 : 0 }}
                                                className="w-4 h-4 bg-white rounded-full shadow-lg"
                                            />
                                        </div>
                                        <input 
                                            type="checkbox" 
                                            className="hidden"
                                            checked={options.sensitivityMode} 
                                            onChange={(e) => setOptions(prev => ({ ...prev, sensitivityMode: e.target.checked }))}
                                        />
                                    </label>
                                </div>
                            </motion.div>
                        ) : activeTab === 'collaboration' ? (
                            <motion.div 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="glass-panel rounded-3xl border border-white/10 p-8 space-y-8 shadow-2xl relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#8DB8CC]/10 blur-3xl -z-10" />
                                
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-3 text-[#8DB8CC]">
                                        <Users className="w-5 h-5" />
                                        <h3 className="text-xs font-black uppercase tracking-[0.2em]">Neural_Workspace</h3>
                                    </div>
                                    <div className="w-12 h-px bg-gradient-to-r from-[#8DB8CC]/50 to-transparent" />
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Workspace_Access_Key</label>
                                        <div className="flex gap-2">
                                            <div className="relative flex-grow">
                                                <input 
                                                    type="text" 
                                                    value={roomId}
                                                    onChange={(e) => setRoomId(e.target.value)}
                                                    placeholder="Enter access code..."
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs font-mono text-white focus:ring-2 focus:ring-[#8DB8CC]/30 outline-none transition-all"
                                                />
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-[#8DB8CC] animate-pulse" />
                                            </div>
                                            <motion.button 
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={handleJoinRoom}
                                                className="px-6 py-2.5 bg-gradient-to-r from-white via-[#E8F0F4] to-[#AFC3CF] text-[#050709] rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl transition-all cursor-pointer"
                                            >
                                                Initialize
                                            </motion.button>
                                        </div>
                                    </div>

                                    {isCollaborating && (
                                        <div className="p-6 bg-[#10161B] rounded-2xl border border-[#26313A] backdrop-blur-sm">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="text-[10px] font-black text-[#8DB8CC] uppercase tracking-[0.2em]">Active_Nodes</div>
                                                <div className="px-2 py-0.5 rounded bg-white/10 text-[9px] font-mono text-[#AFC3CF]">{collaborators.length} ONLINE</div>
                                            </div>
                                            <div className="space-y-3">
                                                {collaborators.map(c => (
                                                    <div key={c.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: c.color, color: c.color }}></div>
                                                            <span className="text-xs font-bold text-white tracking-wide">{c.name.toUpperCase()}</span>
                                                        </div>
                                                        {c.id === socket?.id && <span className="text-[9px] font-mono text-slate-500">LOCAL_NODE</span>}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                className="flex flex-col h-full min-h-[550px]"
                            >
                                <div className="glass-panel rounded-3xl border border-white/10 flex flex-col h-full overflow-hidden shadow-2xl relative">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#8DB8CC]/30 to-transparent" />
                                    
                                    <div className="px-8 py-5 bg-white/5 border-b border-white/10 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-[#8DB8CC] animate-pulse shadow-[0_0_8px_rgba(141,184,204,0.5)]" />
                                            <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Synthesis_Output_Stream</h3>
                                        </div>
                                        {outputText && (
                                            <div className="flex items-center gap-2">
                                                <button onClick={copyToClipboard} className="p-2.5 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer">
                                                    {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                                                </button>
                                                <button className="p-2.5 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer">
                                                    <Share2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-grow p-10 overflow-y-auto custom-scrollbar bg-black/10">
                                        {isLoading ? (
                                            <div className="h-full flex flex-col items-center justify-center space-y-8">
                                                <div className="relative">
                                                    <div className="w-24 h-24 border-2 border-white/5 border-t-[#8DB8CC] rounded-full animate-spin shadow-[0_0_30px_rgba(141,184,204,0.15)]"></div>
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <BrainCircuit className="w-8 h-8 text-[#8DB8CC] animate-pulse" />
                                                    </div>
                                                </div>
                                                <div className="text-center space-y-3">
                                                    <p className="text-xs font-black text-white uppercase tracking-[0.3em] animate-pulse">Processing_Neural_Pathways</p>
                                                    <p className="text-[10px] text-slate-500 font-mono max-w-[240px] leading-relaxed">Applying multi-dimensional linguistic optimization and contextual resonance.</p>
                                                </div>
                                            </div>
                                        ) : outputText ? (
                                            <div className="space-y-10">
                                                <motion.div 
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="text-slate-200 text-lg leading-relaxed font-normal whitespace-pre-wrap selection:bg-white/20"
                                                >
                                                    {outputText}
                                                </motion.div>

                                                {analysis && (
                                                    <motion.div 
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        transition={{ delay: 0.4 }}
                                                        className="space-y-8 pt-10 border-t border-white/10"
                                                    >
                                                        <div className="grid grid-cols-3 gap-4">
                                                            {[
                                                                { label: 'Sentiment', value: analysis.sentiment, color: analysis.sentiment === 'Positive' ? 'text-emerald-400' : analysis.sentiment === 'Negative' ? 'text-rose-400' : 'text-[#8DB8CC]' },
                                                                { label: 'Readability', value: `${analysis.readabilityScore}%`, color: 'text-white' },
                                                                { label: 'Tone', value: analysis.emotionalTone, color: 'text-white' },
                                                            ].map((stat, i) => (
                                                                <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center group hover:border-[#8DB8CC]/20 transition-all">
                                                                    <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">{stat.label}</div>
                                                                    <div className={`text-xs font-black uppercase tracking-wider truncate ${stat.color}`}>
                                                                        {stat.value}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        <div className="space-y-4">
                                                            <div className="flex items-center gap-3 text-[#AFC3CF] mb-2">
                                                                <AlertTriangle className="w-4 h-4 text-[#8DB8CC]" />
                                                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">Linguistic_Optimization_Log</h4>
                                                            </div>
                                                            {analysis.suggestions.map((s, i) => (
                                                                <motion.div 
                                                                    key={i} 
                                                                    initial={{ opacity: 0, x: -10 }}
                                                                    animate={{ opacity: 1, x: 0 }}
                                                                    transition={{ delay: 0.5 + i * 0.1 }}
                                                                    className="group p-5 bg-[#10161B] rounded-2xl border border-[#26313A] hover:border-[#8DB8CC]/40 transition-all relative overflow-hidden"
                                                                >
                                                                    <div className="absolute top-0 left-0 w-1 h-full bg-[#8DB8CC]" />
                                                                    <div className="flex items-start justify-between gap-6">
                                                                        <div className="space-y-2">
                                                                            <div className="flex items-center gap-2">
                                                                                <div className="px-2 py-0.5 rounded bg-white/10 text-[8px] font-black text-[#AFC3CF] uppercase tracking-widest">{s.type}</div>
                                                                                <div className="w-1 h-1 rounded-full bg-slate-700" />
                                                                                <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Confidence: 94%</div>
                                                                            </div>
                                                                            <div className="text-xs font-bold text-white leading-relaxed">{s.suggestion}</div>
                                                                            <div className="text-[10px] text-slate-500 font-mono italic bg-black/20 px-2 py-1 rounded inline-block">ORIGIN: "{s.original}"</div>
                                                                        </div>
                                                                        <div className="relative">
                                                                            <Info className="w-4 h-4 text-slate-600 group-hover:text-[#8DB8CC] transition-colors cursor-help" />
                                                                            <div className="absolute right-0 bottom-full mb-3 w-56 p-4 bg-[#0A0E12] rounded-2xl text-[10px] text-slate-300 shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-50 border border-[#26313A] leading-relaxed">
                                                                                <div className="text-[#8DB8CC] font-black uppercase tracking-widest mb-2 text-[8px]">Rationalization:</div>
                                                                                {s.explanation}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </motion.div>
                                                            ))}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="h-full flex flex-col items-center justify-center text-center space-y-8 opacity-20">
                                                <div className="relative">
                                                    <div className="w-32 h-32 bg-[#10161B] rounded-full flex items-center justify-center border border-[#26313A]">
                                                        <Wand2 className="w-12 h-12 text-[#8DB8CC]" />
                                                    </div>
                                                    <motion.div 
                                                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                                                        transition={{ duration: 3, repeat: Infinity }}
                                                        className="absolute -top-4 -right-4 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center"
                                                    >
                                                        <Sparkles className="w-6 h-6 text-white" />
                                                    </motion.div>
                                                </div>
                                                <div className="space-y-3">
                                                    <h4 className="text-sm font-black text-white uppercase tracking-[0.3em]">Neural_Engine_Idle</h4>
                                                    <p className="text-xs text-slate-500 max-w-[280px] font-mono leading-relaxed">Synthesized variants with multi-dimensional analysis will manifest here after processing.</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default WritingAssistant;
