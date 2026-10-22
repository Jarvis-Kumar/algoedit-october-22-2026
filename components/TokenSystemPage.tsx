import React from 'react';
import { Page, OnNavigateType } from '../types';
import { featuresData } from '../data/features';
import { SIGNUP_BONUS_TOKENS } from '../constants';

interface TokenSystemPageProps {
  onNavigate: OnNavigateType;
}

const sampleFeatures = [
    featuresData['image-generator'],
    featuresData['video-generator'],
    featuresData['image-enhancer'],
    featuresData['multi-model-render'],
    featuresData['ai-gta-filter'],
    featuresData['lip-sync-avatar'],
].filter(Boolean);

const TokenSystemPage: React.FC<TokenSystemPageProps> = ({ onNavigate }) => {
  return (
    <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-screen-xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">The ALGOEDIT Token System</h1>
          <p className="mt-4 text-lg text-gray-400 max-w-3xl mx-auto">A flexible, pay-as-you-go system that puts you in control of your creative output and spending.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            <div className="ai-card p-6">
                <h3 className="text-xl font-bold text-white mb-2">How Tokens Work</h3>
                <p className="text-sm text-gray-400">Tokens are the universal currency of the ALGOEDIT Studio. Every AI-powered action, from generating an image to upscaling a video, consumes a specific number of tokens. This allows you to pay only for the computational resources you use.</p>
            </div>
             <div className="ai-card p-6">
                <h3 className="text-xl font-bold text-white mb-2">Normal vs. Premium Tools</h3>
                <p className="text-sm text-gray-400">Simple tasks like applying a filter cost fewer tokens. More complex tasks, like 4K video generation or using our most advanced multi-model renders, are 'Premium' actions and consume more tokens, reflecting their higher computational cost.</p>
            </div>
             <div className="ai-card p-6">
                <h3 className="text-xl font-bold text-white mb-2">How to Get Tokens</h3>
                <p className="text-sm text-gray-400">Sign up for free to get {SIGNUP_BONUS_TOKENS} bonus tokens! For more, purchase one-time token packs or subscribe to a monthly plan for the best value and a fresh supply of tokens every month.</p>
            </div>
        </div>

        <section className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-8">Token Usage Examples</h2>
            <div className="ai-card p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sampleFeatures.map(feature => (
                        <div key={feature.id} className="bg-[#10161B] p-4 rounded-xl border border-[#26313A]">
                            <h4 className="font-semibold text-white">{feature.name}</h4>
                            <p className="text-xs text-gray-400">{feature.description}</p>
                            <div className="mt-3 text-right font-bold text-lg flex items-center justify-end gap-1">
                                <span className="text-[#8DB8CC]">⚡</span>
                                <span className="text-white">{feature.tokenCost} Tokens</span>
                            </div>
                        </div>
                    ))}
                </div>
                <p className="text-center text-sm text-gray-500 mt-6">...and many more. Each tool clearly displays its token cost before you start.</p>
            </div>
        </section>
        
        <section className="grid md:grid-cols-2 gap-8 items-center mb-16">
            <div className="ai-card p-8 bg-[#10161B] border border-[#26313A] rounded-2xl">
                 <h3 className="text-2xl font-bold text-white mb-4">How to Save Tokens</h3>
                 <ul className="space-y-3 text-gray-300">
                    <li className="flex gap-3"><strong className="text-[#8DB8CC]">1.</strong><span>Start with lower-quality models for drafts and previews, then use premium models for final renders.</span></li>
                    <li className="flex gap-3"><strong className="text-[#8DB8CC]">2.</strong><span>Utilize monthly subscriptions to get tokens at a discounted rate compared to one-time packs.</span></li>
                    <li className="flex gap-3"><strong className="text-[#8DB8CC]">3.</strong><span>Use the 'Regenerate' option to iterate on an idea, which can sometimes be more efficient than starting a new prompt from scratch.</span></li>
                 </ul>
            </div>
             <div className="ai-card p-8">
                 <h3 className="text-2xl font-bold text-white mb-4">Purchasing Options</h3>
                 <div className="space-y-4">
                     <div>
                        <h4 className="font-semibold text-white">Token Bundles</h4>
                        <p className="text-sm text-gray-400">Perfect for specific projects. Buy a pack of tokens that never expire. The larger the pack, the lower the cost per token.</p>
                     </div>
                     <div>
                        <h4 className="font-semibold text-white">Subscriptions</h4>
                        <p className="text-sm text-gray-400">The best value for regular users. Get a fresh batch of tokens deposited into your account every month at the lowest possible rate.</p>
                     </div>
                 </div>
            </div>
        </section>

        <section className="text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Fuel Your Creativity?</h2>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">Choose a plan that fits your workflow. Our subscriptions offer the best value, providing a generous monthly token allowance at a discounted rate.</p>
            <button
              onClick={() => onNavigate('pricing')}
              className="ai-button bg-gradient-to-r from-white via-[#E8F0F4] to-[#AFC3CF] !text-[#050709] !px-10 !py-4 !text-lg !font-bold"
            >
              View Pricing and Plans
            </button>
        </section>

      </div>
    </div>
  );
};

export default TokenSystemPage;