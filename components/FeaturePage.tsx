

import React, { useState } from 'react';
import { FeatureDefinition } from '../data/features';
import { FeaturePageId, PreloadedAssetState } from '../types';

interface FeaturePageProps {
    feature: FeatureDefinition;
    onLaunchTool: (page: FeaturePageId, assets?: PreloadedAssetState) => void;
}

const FeaturePage: React.FC<FeaturePageProps> = ({ feature, onLaunchTool }) => {
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const toggleFaq = (index: number) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    // Don't render a page for non-tool items
    if (!feature.toolComponent) {
        return (
             <div className="flex items-center justify-center h-full p-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-white">{feature.name}</h1>
                    <p className="text-gray-400 mt-2">Select a tool from the sidebar to get started.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto text-white p-6 md:p-8">
            {/* Header */}
            <header className="text-center mb-12">
                <div className="inline-block p-4 bg-gray-800/50 border border-gray-700 rounded-2xl mb-4">
                    {/* FIX: Explicitly provide SVG attributes type to React.cloneElement */}
                    {React.cloneElement<React.SVGAttributes<SVGSVGElement>>(feature.icon, { className: 'h-12 w-12 text-cyan-400' })}
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">{feature.name}</h1>
                <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">{feature.longDescription}</p>
            </header>

            {/* Hero Banner / CTA */}
            <section className="mb-16">
                 <div className="ai-card p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold">Ready to Create?</h2>
                        <p className="text-gray-400 mt-2">Unleash your creativity with the {feature.name}. Click the button to start generating amazing content instantly.</p>
                    </div>
                    <button 
                        onClick={() => onLaunchTool(feature.id)}
                        className="bg-gradient-to-r from-white via-[#E8F0F4] to-[#AFC3CF] text-[#050709] px-10 py-4 text-base font-black uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.25)] hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                    >
                        Start Creating →
                    </button>
                </div>
            </section>

            {/* Why This Feature Is Cool */}
            <section className="mb-16">
                <h2 className="text-3xl font-bold text-center mb-8">Why It's a Game-Changer</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {feature.whyCool.map((item, index) => (
                        <div key={index} className="ai-card p-6">
                            <h3 className="font-bold text-[#8DB8CC] mb-2">{item.title}</h3>
                            <p className="text-sm text-gray-300">{item.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* How The Algorithm Works */}
            <section className="mb-16">
                <div className="ai-card p-8">
                    <h2 className="text-3xl font-bold text-center mb-4">How It Works (The Simple Version)</h2>
                    <p className="text-gray-400 text-center max-w-2xl mx-auto">{feature.howItWorks}</p>
                </div>
            </section>

            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Use Cases */}
                <section>
                     <h2 className="text-3xl font-bold mb-6">Popular Use Cases</h2>
                     <ul className="space-y-4">
                        {feature.useCases.map((useCase, index) => (
                            <li key={index} className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-cyan-400 font-bold">
                                    {index + 1}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white">{useCase.title}</h3>
                                    <p className="text-sm text-gray-400">{useCase.description}</p>
                                </div>
                            </li>
                        ))}
                     </ul>
                </section>
                
                 {/* FAQ */}
                <section>
                    <h2 className="text-3xl font-bold mb-6">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                        {feature.faqs.map((faq, index) => (
                            <div key={index} className="border border-gray-700 rounded-lg overflow-hidden">
                                <button
                                    onClick={() => toggleFaq(index)}
                                    className="w-full flex justify-between items-center text-left p-4 bg-gray-800 hover:bg-gray-700"
                                >
                                    <span className="font-semibold">{faq.question}</span>
                                    <svg className={`w-5 h-5 transform transition-transform ${openFaq === index ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                {openFaq === index && (
                                    <div className="p-4 bg-gray-800/50">
                                        <p className="text-gray-400 text-sm">{faq.answer}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            </div>
             {/* Token Info */}
            <section className="mt-16 text-center">
                 <div className="ai-card p-6 inline-flex items-center gap-3">
                    <span className="text-yellow-400 text-2xl">⚡</span>
                    <p className="font-bold text-lg">{feature.tokenCost} Tokens Per Action</p>
                </div>
            </section>

        </div>
    );
};

export default FeaturePage;