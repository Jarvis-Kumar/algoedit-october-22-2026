import React from 'react';

interface PromptEnhancerToggleProps {
    isEnabled: boolean;
    onChange: (isEnabled: boolean) => void;
}

const PromptEnhancerToggle: React.FC<PromptEnhancerToggleProps> = ({ isEnabled, onChange }) => {
    const uniqueId = React.useId();
    return (
        <div className="flex items-center justify-between bg-gray-700/50 p-3 rounded-lg border border-gray-700/50">
            <label htmlFor={uniqueId} className="flex flex-col cursor-pointer pr-4">
                <span className="font-medium text-white">AI Prompt Enhancer</span>
                <span className="text-xs text-gray-400">Turn simple ideas into detailed, vivid prompts.</span>
            </label>
            <div className="relative inline-block w-10 flex-shrink-0 mr-2 align-middle select-none transition duration-200 ease-in">
                <input 
                    type="checkbox" 
                    id={uniqueId} 
                    checked={isEnabled} 
                    onChange={(e) => onChange(e.target.checked)} 
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                />
                <label htmlFor={uniqueId} className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-600 cursor-pointer"></label>
            </div>
            <style>{`.toggle-checkbox:checked { right: 0; border-color: #3B82F6; } .toggle-checkbox:checked + .toggle-label { background-color: #3B82F6; }`}</style>
        </div>
    );
};

export default PromptEnhancerToggle;