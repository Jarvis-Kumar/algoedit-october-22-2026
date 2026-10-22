
import React, { useState } from 'react';
import { Currency, User } from '../types';
import { CustomSelect } from './ui/CustomSelect';
import { PayPalCheckoutModal } from './PayPalCheckoutModal';
import { ShieldCheck, CheckCircle2, Monitor, Smartphone, Laptop, Star, Chrome, ArrowRight, ExternalLink } from 'lucide-react';

type BillingCycle = 'subscription' | 'yearly' | 'packs';
type PlanId = 'free' | 'pro' | 'creator' | 'business' | 'basic_pack' | 'advanced_pack' | 'premium_pack';

const pricingData = {
    USD: {
        subscription: {
            free: { price: 0, tokens: 200 },
            pro: { price: 29, tokens: 5000 },
            creator: { price: 49, tokens: 12000 },
            business: { price: 199, tokens: 100000 },
        },
        packs: {
            basic_pack: { price: 9, tokens: 1000 },
            advanced_pack: { price: 19, tokens: 2500 },
            premium_pack: { price: 49, tokens: 7500 },
        },
    }
};

export const currencySymbols: Record<string, string> = {
    USD: '$',
};

const getFreePrice = (tokens: number, isYearly = false) => {
    const addedTokens = tokens - 200;
    const increments = Math.max(0, Math.floor(addedTokens / 100));
    return isYearly ? increments * 1.50 : increments * 1.00;
};

const getProPrice = (tokens: number, isYearly = false) => {
    const addedTokens = tokens - 5000;
    const increments = Math.max(0, Math.floor(addedTokens / 500));
    const basePrice = 29;
    return basePrice + (increments * (isYearly ? 4.00 : 3.00));
};

const getCreatorPrice = (tokens: number, isYearly = false) => {
    const addedTokens = tokens - 12000;
    const increments = Math.max(0, Math.floor(addedTokens / 1000));
    const basePrice = 49;
    return basePrice + (increments * (isYearly ? 5.00 : 4.00));
};

const getBusinessPrice = (tokens: number, isYearly = false) => {
    const addedTokens = tokens - 100000;
    const increments = Math.max(0, Math.floor(addedTokens / 10000));
    const basePrice = 199;
    return basePrice + (increments * (isYearly ? 15.00 : 14.00));
};

const planSliderConfigs: Record<string, { min: number, max: number, step: number, getPrice: (tokens: number, isYearly?: boolean) => number }> = {
    free: { min: 200, max: 1000, step: 100, getPrice: getFreePrice },
    pro: { min: 5000, max: 10000, step: 500, getPrice: getProPrice },
    creator: { min: 12000, max: 20000, step: 1000, getPrice: getCreatorPrice },
    business: { min: 100000, max: 250000, step: 10000, getPrice: getBusinessPrice }
};

const getPlanFeatures = (planId: PlanId, billingCycle: BillingCycle, currentTokensCount?: number) => {
    if (billingCycle === 'subscription' || billingCycle === 'yearly') {
        const dTokens = currentTokensCount !== undefined ? new Intl.NumberFormat('en-US').format(currentTokensCount) : undefined;
        if (planId === 'free') {
            return [
                `${dTokens || "200"} computing tokens per month`,
                "Up to 2 team members configuration",
                "Browse public templates & designs",
                "Download up to 5 presets per month",
                "Basic creator editor features",
                "Watermarked exports or lower-res downloads"
            ];
        } else if (planId === 'pro') {
            return [
                `${dTokens || "5,000"} computing tokens per month`,
                "Up to 5 team members configuration",
                "Higher AI generation limits",
                "HD and 4K exports",
                "Premium templates included",
                "Watermark removal",
                "Faster image & video processing",
                "100 GB custom cloud storage",
                "Priority customer support"
            ];
        } else if (planId === 'creator') {
            return [
                `${dTokens || "12,000"} computing tokens per month`,
                "Up to 15 team members configuration",
                "Includes everything in Pro, plus:",
                "Much higher AI generation limits",
                "Advanced creator editing tools",
                "Commercial usage rights",
                "Exclusive design & preset packs",
                "Continuous batch processing mode",
                "500 GB custom cloud storage",
                "Early access to new features"
            ];
        } else { // business
            return [
                `${dTokens || "100,000"} computing tokens per month`,
                "Complete entire website benefits unlocked",
                "Unlimited team members collaboration",
                "Advanced collaborative team creation panel",
                "Shared dynamic workspaces & enterprise libraries",
                "Multi-user design co-presence & version history",
                "Enterprise-grade 5 TB+ cloud storage",
                "API access & automated bulk exports",
                "VIP commercial priority rendering queue",
                "Custom branding & white-label preset output",
                "Dedicated manager & priority SLA customer support"
            ];
        }
    } else {
        // packs
        if (planId === 'basic_pack') {
            return [
                "1,000 computation tokens (one-time)",
                "No expiration on allocated tokens",
                "Browse public templates & presets",
                "AI image & video asset creation",
                "Ideal for basic editing/creations"
            ];
        } else if (planId === 'advanced_pack') {
            return [
                "2,500 computation tokens (one-time)",
                "No expiration on allocated tokens",
                "AI smart optimization workflow",
                "No watermarks on high-res outputs",
                "Ideal for regular makers / hobby creators"
            ];
        } else { // premium_pack
            return [
                "7,500 computation tokens (one-time)",
                "No expiration on allocated tokens",
                "Unlocks premium Cinematic studio tools",
                "Complete commercial usage licenses",
                "Priority backend prompt queueing"
            ];
        }
    }
};

const CheckIcon: React.FC = () => (
    <svg className="w-5 h-5 text-[#8DB8CC] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
    </svg>
);

const InfoIcon: React.FC = () => (
    <svg className="w-4 h-4 text-gray-500 ml-2 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>
);


const getPlanTagline = (planId: PlanId) => {
    switch (planId) {
        case 'free': return 'See what AI can do';
        case 'pro': return 'Keep creating with expanded access';
        case 'creator': return 'More access to advanced intelligence';
        case 'business': return 'Scale with ultimate team capabilities';
        case 'basic_pack': return 'Boost your computational power instantly';
        case 'advanced_pack': return 'Unlock high-volume resource generations';
        case 'premium_pack': return 'Maximize output with professional bundle';
        default: return 'Custom boost pack';
    }
};

const getPlanBadge = (planId: PlanId) => {
    switch (planId) {
        case 'pro': return 'POPULAR';
        case 'creator': return 'LIMITED TIME';
        case 'business': return 'BEST VALUE';
        default: return null;
    }
};

const getPlanFooterText = (planId: PlanId) => {
    switch (planId) {
        case 'free': return 'Have an existing plan? See billing help';
        case 'pro': return 'This plan may include ad credits. Learn more';
        case 'creator': return 'Promo pricing applies. Cancel anytime';
        case 'business': return 'Unlimited subject to abuse guardrails';
        default: return 'No expiration. One-time purchase';
    }
};

const PlanCard: React.FC<{
    planId: PlanId;
    planName: string;
    data: { price: number, tokens: number };
    currency: Currency;
    billingCycle: BillingCycle;
    isSelected: boolean;
    onSelect: (planId: PlanId) => void;
    onBuy: (planId: PlanId) => void;
    onChangeTokens?: (tokens: number) => void;
    sliderConfig?: { min: number, max: number, step: number };
}> = ({ planId, planName, data, currency, billingCycle, isSelected, onSelect, onBuy, onChangeTokens, sliderConfig }) => {
    
    const features = getPlanFeatures(planId, billingCycle, data.tokens);
    const tagline = getPlanTagline(planId);
    const badge = getPlanBadge(planId);
    const footerText = getPlanFooterText(planId);
    
    // Tokens count display
    const tokensCountFormatted = new Intl.NumberFormat('en-US').format(data.tokens);
    // Cost per token
    const costPerCreditNumber = data.tokens > 0 ? data.price / data.tokens : 0;
    const costPerCreditText = costPerCreditNumber > 0 
        ? `$${costPerCreditNumber.toFixed(4)} per token` 
        : `Free tier`;

    const isPaid = planId !== 'free' && planId !== 'basic_pack' && planId !== 'advanced_pack' && planId !== 'premium_pack';
    const isPack = billingCycle === 'packs';

    // Handle button click for activation/checkout
    const handleButtonClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onBuy(planId);
    };

    return (
        <div
            onClick={() => onSelect(planId)}
            className={`flex flex-col justify-between h-full p-6 sm:p-7 rounded-3xl border transition-all duration-300 relative cursor-pointer select-none ${
                isSelected 
                    ? 'border-[#8DB8CC]/40 bg-[#10161B]/95 shadow-2xl shadow-[0_0_25px_rgba(141,184,204,0.1)] scale-[1.01]' 
                    : 'border-zinc-800/80 bg-[#161617]/90 hover:border-zinc-700/80 hover:bg-[#1a1a1b]/95'
            }`}
        >
            {/* Top Header Section */}
            <div className="space-y-4">
                <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold text-white tracking-tight">{planName}</h3>
                    {badge && (
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase border ${
                            isSelected 
                                ? 'bg-white/10 text-[#E8F0F4] border-white/20' 
                                : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                        }`}>
                            {badge}
                        </span>
                    )}
                </div>

                {/* Price Display */}
                <div>
                    <div className="flex items-baseline gap-1 h-14">
                        <span className="text-xl font-bold text-zinc-400 align-top relative -top-3.5">
                            {currencySymbols[currency]}
                        </span>
                        <span className="text-4xl font-extrabold text-white tracking-tighter">
                            {new Intl.NumberFormat('en-US').format(data.price)}
                        </span>
                        <span className="text-[11px] text-zinc-500 font-medium ml-1.5">
                            {isPack ? 'one-time' : billingCycle === 'yearly' ? 'year' : 'month'}
                        </span>
                    </div>
                    {/* Sub title / tagline */}
                    <p className="text-xs font-medium text-zinc-400 mt-2 min-h-[32px] leading-relaxed">{tagline}</p>
                    
                    {/* Allocated tokens indicator */}
                    <div className="flex items-center gap-1.5 mt-3 text-[11px] font-mono text-zinc-500">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#8DB8CC]"></span>
                        <span className="text-zinc-300 font-semibold">{tokensCountFormatted} tokens</span>
                    </div>
                    <div className="text-[10px] text-zinc-500 font-mono mt-1">
                        {costPerCreditText}
                    </div>
                </div>

                {/* Call to action button */}
                <div className="pt-2">
                    <button
                        onClick={handleButtonClick}
                        className={`w-full py-3 px-4 rounded-full text-xs font-bold tracking-tight text-center transition-all duration-200 cursor-pointer ${
                            isSelected 
                                ? 'bg-gradient-to-r from-white via-[#E8F0F4] to-[#AFC3CF] hover:brightness-110 text-[#050709] shadow-lg shadow-white/10' 
                                : (planId === 'free' && data.tokens <= 200)
                                    ? 'border border-zinc-700 text-zinc-300 hover:border-zinc-500 bg-zinc-900/10 hover:bg-zinc-800/10'
                                    : 'bg-white hover:bg-zinc-100 text-[#131314]'
                        }`}
                    >
                        {isSelected 
                            ? (planId === 'free' ? (data.tokens > 200 ? 'Buy Now' : 'Activate Free Plan') : 'Buy Now') 
                            : (planId === 'free' ? (data.tokens > 200 ? 'Buy Now' : 'Select Free') : `Upgrade to ${planName}`)
                        }
                    </button>
                </div>

                {/* Dynamic Slider (if card is selected and configuration is provided) */}
                {isSelected && sliderConfig && onChangeTokens && (
                    <div 
                        className="p-4 rounded-2xl bg-zinc-950/50 border border-zinc-800/80 space-y-3 mt-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-zinc-400 font-medium">Adjust Allocation:</span>
                            <span className="text-[#AFC3CF] font-extrabold font-mono text-sm">
                                {tokensCountFormatted} tokens
                            </span>
                        </div>
                        <div className="relative flex items-center">
                            <input 
                                type="range"
                                min={sliderConfig.min}
                                max={sliderConfig.max}
                                step={sliderConfig.step}
                                value={data.tokens}
                                onChange={(e) => onChangeTokens(Number(e.target.value))}
                                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#8DB8CC] focus:outline-none focus:ring-1 focus:ring-white/30"
                                style={{
                                    background: `linear-gradient(to right, rgb(141, 184, 204) 0%, rgb(141, 184, 204) ${((data.tokens - sliderConfig.min) / (sliderConfig.max - sliderConfig.min)) * 100}%, rgba(39, 39, 42, 0.6) ${((data.tokens - sliderConfig.min) / (sliderConfig.max - sliderConfig.min)) * 100}%, rgba(39, 39, 42, 0.6) 100%)`
                                }}
                            />
                        </div>
                        <div className="flex justify-between items-center text-[9px] text-zinc-500 font-mono tracking-wider">
                            <span>MIN ({new Intl.NumberFormat('en-US').format(sliderConfig.min)})</span>
                            <span className="text-[#A8B0B7] font-semibold select-none text-[8px]">DRAG TO CUSTOMIZE</span>
                            <span>MAX ({new Intl.NumberFormat('en-US').format(sliderConfig.max)})</span>
                        </div>
                    </div>
                )}

                {/* Divider */}
                <div className="border-t border-zinc-800/80 pt-4 mt-6">
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-3">
                        {planId === 'free' ? 'Features:' : `Everything in ${planId === 'pro' ? 'Free' : planId === 'creator' ? 'Pro' : planId === 'business' ? 'Creator+' : 'Basic'} plus:`}
                    </p>
                    <ul className="space-y-3">
                        {features.map((feature, featureIdx) => (
                            <li key={featureIdx} className="flex items-start text-xs text-zinc-300 leading-normal font-sans">
                                {isSelected ? (
                                    <svg className="w-3.5 h-3.5 text-[#8DB8CC] flex-shrink-0 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                ) : (
                                    <svg className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                )}
                                <span dangerouslySetInnerHTML={{ 
                                    __html: feature.replace(/(\b\d+,?\d*\+?\b)/g, '<strong class="font-bold text-white">$1</strong>') 
                                }} />
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Bottom Footer Section */}
            <div className="pt-5 border-t border-zinc-800/40 mt-6">
                <span className="text-[10px] text-zinc-500 leading-tight font-medium hover:text-zinc-400 transition-colors block">
                    {footerText}
                </span>
            </div>
        </div>
    );
};


const PricingPage: React.FC<{ 
    onPurchase: (tokens: number, tier?: string) => void,
    currency: Currency,
    setCurrency: (currency: Currency) => void,
    user: User | null,
    requireSignIn: () => boolean,
}> = ({ onPurchase, currency, setCurrency, user, requireSignIn }) => {
    const [billingCycle, setBillingCycle] = useState<BillingCycle>('subscription');
    const [selectedPlan, setSelectedPlan] = useState<PlanId>('pro');
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    
    // Manage state for dynamically scaled subscription token counts
    const [customTokens, setCustomTokens] = useState<Record<string, number>>({
        free: 200,
        pro: 5000,
        creator: 12000,
        business: 100000
    });

    const handleSetBillingCycle = (cycle: BillingCycle) => {
        setBillingCycle(cycle);
        if (cycle === 'subscription' || cycle === 'yearly') {
            setSelectedPlan('pro');
        } else {
            setSelectedPlan('basic_pack');
        }
    };

    const getDynamicTokensAndPrice = (planId: PlanId) => {
        const activeCurrency: 'USD' = 'USD';
        if (billingCycle === 'packs') {
            const staticPlan = pricingData[activeCurrency].packs[planId as 'basic_pack' | 'advanced_pack' | 'premium_pack'];
            return { tokens: staticPlan.tokens, price: staticPlan.price };
        }
        
        // Subscription dynamic allocations
        const tokens = customTokens[planId] || 200;
        const config = planSliderConfigs[planId];
        const isYearly = billingCycle === 'yearly';
        const price = config ? config.getPrice(tokens, isYearly) : 0;
        return { tokens, price };
    };

    const handleBuy = () => {
        if (!requireSignIn()) return;
        const currentDetails = getDynamicTokensAndPrice(selectedPlan);
        if (selectedPlan === 'free' && currentDetails.tokens <= 200) {
            onPurchase(currentDetails.tokens, 'Free');
            return;
        }
        setIsCheckoutOpen(true);
    };

    const handleBuyForPlan = (planId: PlanId) => {
        if (selectedPlan === planId) {
            // It is already selected - execute purchase
            if (planId === 'free') {
                const currentDetails = getDynamicTokensAndPrice('free');
                if (currentDetails.tokens <= 200) {
                    onPurchase(currentDetails.tokens, 'Free');
                    return;
                }
            }
            if (!requireSignIn()) return;
            setIsCheckoutOpen(true);
        } else {
            // Select first, letting user adjust the allocation slider
            setSelectedPlan(planId);
        }
    };

    const activeCurrency: 'USD' = 'USD';
    const currentPlanDetails = getDynamicTokensAndPrice(selectedPlan);

    const getPlanDisplayNameByPlanId = (planId: PlanId) => {
        switch (planId) {
            case 'free': return 'Free Plan';
            case 'pro': return 'Pro Plan';
            case 'creator': return 'Creator+ Plan';
            case 'business': return 'Business Plan';
            case 'basic_pack': return 'Basic Templates Pack';
            case 'advanced_pack': return 'Advanced Preset Pack';
            case 'premium_pack': return 'Premium Bundle';
            default: return 'Custom Pack';
        }
    };

    const handleTokenChange = (planId: PlanId, newTokens: number) => {
        setCustomTokens(prev => ({
            ...prev,
            [planId]: newTokens
        }));
    };

    return (
        <div className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-screen-xl mx-auto">
                {/* Billing Cycle Switcher centered at the top */}
                <div className="flex flex-col items-center justify-center mb-12 text-center">
                    <p className="text-xs font-bold text-[#AFC3CF] tracking-widest uppercase mb-3">CHOOSE YOUR MONETIZATION STYLE</p>
                    <div className="bg-slate-800/90 p-1.5 rounded-3xl sm:rounded-full flex flex-col sm:flex-row items-center text-sm font-semibold border border-white/[0.08] shadow-2xl shadow-black gap-1">
                        <button 
                            onClick={() => handleSetBillingCycle('subscription')} 
                            className={`px-5 py-2.5 rounded-full transition-all duration-300 flex items-center gap-1.5 cursor-pointer w-full sm:w-auto justify-center ${billingCycle === 'subscription' ? 'bg-gradient-to-r from-white via-[#E8F0F4] to-[#AFC3CF] text-[#050709] font-bold shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}
                        >
                            <span>🔄</span>
                            <span>Monthly Subscription</span>
                        </button>
                        <button 
                            onClick={() => handleSetBillingCycle('yearly')} 
                            className={`px-5 py-2.5 rounded-full transition-all duration-300 flex items-center gap-1.5 cursor-pointer w-full sm:w-auto justify-center ${billingCycle === 'yearly' ? 'bg-gradient-to-r from-white via-[#E8F0F4] to-[#AFC3CF] text-[#050709] font-bold shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}
                        >
                            <span>📅</span>
                            <span>Yearly Subscription</span>
                        </button>
                        <button 
                            onClick={() => handleSetBillingCycle('packs')} 
                            className={`px-5 py-2.5 rounded-full transition-all duration-300 flex items-center gap-1.5 cursor-pointer w-full sm:w-auto justify-center ${billingCycle === 'packs' ? 'bg-gradient-to-r from-white via-[#E8F0F4] to-[#AFC3CF] text-[#050709] font-bold shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}
                        >
                            <span>🪙</span>
                            <span>One-Time Token Packs</span>
                        </button>
                    </div>
                    
                    {/* Clear, beginner-friendly description cards to clarify the distinction */}
                    <div className="mt-4 max-w-2xl bg-white/[0.02] border border-white/5 rounded-2xl p-5 text-sm font-light">
                        {billingCycle === 'subscription' && (
                            <p className="text-slate-300 leading-relaxed">
                                <strong className="text-white font-bold">🔄 Monthly Subscriptions</strong> provide automated, recurring token deposits every single month. By subscribing, you secure permanent website-wide benefits like custom multi-member team setups, dedicated cloud storage, watermark-free output rendering, and fast processing priority. <span className="text-[#AFC3CF] font-medium">Best for ongoing creators, teams, and professional agency workflows.</span>
                            </p>
                        )}
                        {billingCycle === 'yearly' && (
                            <p className="text-slate-300 leading-relaxed">
                                <strong className="text-emerald-400 font-bold">📅 Yearly Subscriptions</strong> offer the same monthly token injection and platform benefits, but billed annually at a <span className="text-emerald-400 font-bold">17% discount</span> (10 months price for 12 months!). Ideal for long-term creators who want the lowest possible rate with full dynamic slider adjustment.
                            </p>
                        )}
                        {billingCycle === 'packs' && (
                            <p className="text-slate-300 leading-relaxed">
                                <strong className="text-amber-400 font-bold">🪙 One-Time Token Packs</strong> are standalone, pay-as-you-go balance boosters. You buy them once, and they never expire. They allow you to inject instant computation power into your account to perform high-resolution renders, template builds, or advanced AI model runs. <span className="text-amber-400/90 font-medium">Best for occasional casual editing, individual template purchases, and burst tasks with no recurring fees.</span>
                            </p>
                        )}
                    </div>
                </div>


                {/* Main Billing Plan Layout */}
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-450 bg-white/[0.02] border border-white/5 py-2 px-4 rounded-xl w-full sm:w-auto">
                            <span className="w-2 h-2 rounded-full bg-[#6366f1] animate-pulse"></span>
                            <span>Region: <strong>US Premium Node</strong></span>
                        </div>
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-450 bg-white/[0.02] border border-white/5 py-2 px-4 rounded-xl w-full sm:w-auto">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span>Currency: <strong>USD - US Dollar ($)</strong></span>
                        </div>
                    </div>

                    {billingCycle === 'subscription' || billingCycle === 'yearly' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
                            <PlanCard
                                planId="free"
                                planName="Free"
                                data={getDynamicTokensAndPrice('free')}
                                currency={activeCurrency}
                                billingCycle={billingCycle}
                                isSelected={selectedPlan === 'free'}
                                onSelect={setSelectedPlan}
                                onBuy={handleBuyForPlan}
                                onChangeTokens={(val) => handleTokenChange('free', val)}
                                sliderConfig={planSliderConfigs.free}
                            />
                            <PlanCard
                                planId="pro"
                                planName="Pro"
                                data={getDynamicTokensAndPrice('pro')}
                                currency={activeCurrency}
                                billingCycle={billingCycle}
                                isSelected={selectedPlan === 'pro'}
                                onSelect={setSelectedPlan}
                                onBuy={handleBuyForPlan}
                                onChangeTokens={(val) => handleTokenChange('pro', val)}
                                sliderConfig={planSliderConfigs.pro}
                            />
                            <PlanCard
                                planId="creator"
                                planName="Creator+"
                                data={getDynamicTokensAndPrice('creator')}
                                currency={activeCurrency}
                                billingCycle={billingCycle}
                                isSelected={selectedPlan === 'creator'}
                                onSelect={setSelectedPlan}
                                onBuy={handleBuyForPlan}
                                onChangeTokens={(val) => handleTokenChange('creator', val)}
                                sliderConfig={planSliderConfigs.creator}
                            />
                            <PlanCard
                                planId="business"
                                planName="Business"
                                data={getDynamicTokensAndPrice('business')}
                                currency={activeCurrency}
                                billingCycle={billingCycle}
                                isSelected={selectedPlan === 'business'}
                                onSelect={setSelectedPlan}
                                onBuy={handleBuyForPlan}
                                onChangeTokens={(val) => handleTokenChange('business', val)}
                                sliderConfig={planSliderConfigs.business}
                            />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                            <PlanCard
                                planId="basic_pack"
                                planName="Basic Templates Pack"
                                data={pricingData[activeCurrency][billingCycle].basic_pack}
                                currency={activeCurrency}
                                billingCycle={billingCycle}
                                isSelected={selectedPlan === 'basic_pack'}
                                onSelect={setSelectedPlan}
                                onBuy={handleBuyForPlan}
                            />
                            <PlanCard
                                planId="advanced_pack"
                                planName="Advanced Preset Pack"
                                data={pricingData[activeCurrency][billingCycle].advanced_pack}
                                currency={activeCurrency}
                                billingCycle={billingCycle}
                                isSelected={selectedPlan === 'advanced_pack'}
                                onSelect={setSelectedPlan}
                                onBuy={handleBuyForPlan}
                            />
                            <PlanCard
                                planId="premium_pack"
                                planName="Premium Bundle"
                                data={pricingData[activeCurrency][billingCycle].premium_pack}
                                currency={activeCurrency}
                                billingCycle={billingCycle}
                                isSelected={selectedPlan === 'premium_pack'}
                                onSelect={setSelectedPlan}
                                onBuy={handleBuyForPlan}
                            />
                        </div>
                    )}
                </div>
            </div>

            {isCheckoutOpen && user && currentPlanDetails && (
              <PayPalCheckoutModal
                isOpen={isCheckoutOpen}
                onClose={() => setIsCheckoutOpen(false)}
                userId={user.uid || ''}
                email={user.email}
                itemType={billingCycle === 'packs' ? 'pack' : 'subscription'}
                itemId={selectedPlan}
                currency={activeCurrency}
                price={currentPlanDetails.price}
                tokens={currentPlanDetails.tokens}
                billingPeriod={billingCycle === 'yearly' ? 'yearly' : 'monthly'}
                onSuccess={(tokensAdded, newTier) => {
                  setIsCheckoutOpen(false);
                  onPurchase(tokensAdded, newTier);
                }}
              />
            )}
        </div>
    );
};

export default PricingPage;