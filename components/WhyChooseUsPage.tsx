import React from 'react';
import { Page, OnNavigateType } from '../types';

interface WhyChooseUsPageProps {
  onNavigate: OnNavigateType;
}

const CheckIcon = () => (
    <svg className="w-6 h-6 text-cyan-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
    </svg>
);

const valuePropositions = [
    {
        title: "DYNAMIC MULTI-MODEL SYNAPSE",
        description: "We orchestrate our platform cleanly without relying on a single neural library. Our dynamic routing engine directs each asset generation directly to the absolute best-in-class foundation model, guaranteeing unmatched spatial density and clarity."
    },
    {
        title: "BESPOKE MOTION & FILTER INFERENCE",
        description: "Beyond standard pre-trained architectures, we run proprietary fine-tuned algorithms to power advanced Lip Synchronization, fluid skeleton mapping, and our custom high-fidelity animation pipelines you won't experience elsewhere."
    },
    {
        title: "FRICTIONLESS CROSS-MEDIA WORKSPACE",
        description: "Eliminate workspace fragmentation and multiple billing overheads. Our unified cockpit aggregates image generation, vector movement tools, and upscale utilities in a seamless, high-contrast visual canvas."
    },
    {
        title: "GPU-ACCELERATED COMPUTE CORE",
        description: "Your workspace is directly integrated with state-of-the-art server farm arrays. Enjoy near-instant visual drafts, crisp 4K resolution upscaled streams, and immediate preview updates during high global workloads."
    },
    {
        title: "MAXIMIZED DEPLOYMENT METRICS",
        description: "Our plans are configured with maximum professional flexibility in mind. Avoid frustrating restrictions with a transparent balance database and generous automatic monthly token recharges."
    },
     {
        title: "UNIVERSAL CREATIVE UTILITY",
        description: "Whether you are a professional design lead seeking to optimize structured batch workflows or a social media influencer building hyper-stylized short-form assets, our platform easily adapts to your precise goals."
    },
];

const WhyChooseUsPage: React.FC<WhyChooseUsPageProps> = ({ onNavigate }) => {
  return (
    <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-screen-xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">THE ALGOEDIT ADVANTAGE</h1>
          <p className="mt-4 text-lg text-gray-400 max-w-3xl mx-auto">In a fragmented landscape of single-use extensions, we deliver a cohesive, unified creative node system optimized to translate raw imagination into pristine visual assets.</p>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {valuePropositions.map((item, index) => (
            <div key={index} className="ai-card p-6">
                <div className="flex items-start gap-4">
                    <CheckIcon />
                    <div>
                        <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                        <p className="text-sm text-gray-400">{item.description}</p>
                    </div>
                </div>
            </div>
          ))}
        </div>

        <section className="mt-20 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Experience the Shift?</h2>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">Connect with a global community of forward-looking creators who demand uncompromising quality. Take charge of your dynamic media pipeline today.</p>
            <button
              onClick={() => onNavigate('studio')}
              className="ai-button bg-gradient-to-r from-white via-[#E8F0F4] to-[#AFC3CF] !text-[#050709] !px-10 !py-4 !text-lg !font-bold"
            >
              Launch The Studio
            </button>
        </section>

      </div>
    </div>
  );
};

export default WhyChooseUsPage;