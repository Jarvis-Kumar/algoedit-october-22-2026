import React from 'react';

interface ActionButtonProps {
    onClick: () => void;
    disabled?: boolean;
    isLoading?: boolean;
    text: string;
    icon: React.JSX.Element;
    className?: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({ onClick, disabled = false, isLoading = false, text, icon, className }) => {
    const isActuallyDisabled = disabled || isLoading;
    
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={isActuallyDisabled}
            title={disabled && !isLoading ? "You need tokens to generate" : ""}
            className={`w-full flex items-center justify-center font-mono font-black uppercase tracking-[0.2em] py-3 px-5 rounded-xl transition-all duration-300 relative overflow-hidden outline-none cursor-pointer ${
                isActuallyDisabled
                    ? 'bg-white/5 text-slate-600 cursor-not-allowed border border-white/5'
                    : 'bg-gradient-to-r from-white via-[#E8F0F4] to-[#AFC3CF] text-[#050709] border border-white shadow-[0_0_20px_rgba(255,255,255,0.25)] hover:brightness-110 active:scale-[0.98]'
            } ${className || ''}`}
        >
            {isLoading ? (
                <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                </>
            ) : (
                <>
                    {icon}
                    {text}
                </>
            )}
        </button>
    );
};

export default ActionButton;