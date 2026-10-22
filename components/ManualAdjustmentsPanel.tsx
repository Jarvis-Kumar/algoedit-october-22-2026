import React from 'react';
import { ImageAdjustments } from '../types';

interface ManualAdjustmentsPanelProps {
    adjustments: ImageAdjustments | null;
    onAdjustmentChange: (newAdjustments: Partial<ImageAdjustments>) => void;
    onStartAdjustment: () => void;
    onCommitAdjustment: () => void;
    onReset: () => void;
    disabled: boolean;
}

interface SliderProps {
    label: string;
    value: number;
    min: number;
    max: number;
    step?: number;
    onChange: (value: number) => void;
    onMouseDown: () => void;
    onMouseUp: () => void;
    disabled: boolean;
}

const AdjustmentSlider: React.FC<SliderProps> = ({ label, value, min, max, step = 1, onChange, onMouseDown, onMouseUp, disabled }) => (
    <div>
        <label className="block text-sm font-medium text-gray-300">{label}</label>
        <div className="flex items-center space-x-2">
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                onMouseDown={onMouseDown}
                onMouseUp={onMouseUp}
                onTouchStart={onMouseDown}
                onTouchEnd={onMouseUp}
                disabled={disabled}
                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed"
            />
            <span className="text-xs font-mono text-gray-400 w-10 text-center">{value}</span>
        </div>
    </div>
);

const ManualAdjustmentsPanel: React.FC<ManualAdjustmentsPanelProps> = ({ adjustments, onAdjustmentChange, onStartAdjustment, onCommitAdjustment, onReset, disabled }) => {
    if (!adjustments) {
        return (
            <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700 text-center text-gray-500">
                Select an image on the canvas to enable manual adjustments.
            </div>
        );
    }
    
    const handleFilterClick = (filter: ImageAdjustments['filter']) => {
        onAdjustmentChange({ filter: adjustments.filter === filter ? 'none' : filter });
        // Since this is a single click, we can treat it as a start and commit in one go.
        onStartAdjustment();
        onCommitAdjustment();
    };

    return (
        <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700 space-y-3">
            <div className="flex justify-between items-center">
                <h3 className="text-base font-semibold text-gray-200">Manual Adjustments</h3>
                <button onClick={onReset} disabled={disabled} className="text-sm text-yellow-400 hover:underline disabled:text-gray-500">Reset</button>
            </div>
            
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                <AdjustmentSlider label="Brightness" value={adjustments.brightness} min={0} max={200} onChange={v => onAdjustmentChange({ brightness: v })} onMouseDown={onStartAdjustment} onMouseUp={onCommitAdjustment} disabled={disabled} />
                <AdjustmentSlider label="Contrast" value={adjustments.contrast} min={0} max={200} onChange={v => onAdjustmentChange({ contrast: v })} onMouseDown={onStartAdjustment} onMouseUp={onCommitAdjustment} disabled={disabled} />
                <AdjustmentSlider label="Saturation" value={adjustments.saturate} min={0} max={200} onChange={v => onAdjustmentChange({ saturate: v })} onMouseDown={onStartAdjustment} onMouseUp={onCommitAdjustment} disabled={disabled} />
                <AdjustmentSlider label="Blur (px)" value={adjustments.blur} min={0} max={20} onChange={v => onAdjustmentChange({ blur: v })} onMouseDown={onStartAdjustment} onMouseUp={onCommitAdjustment} disabled={disabled} />
                <div className="col-span-2">
                    <AdjustmentSlider label="Rotate (°)" value={adjustments.rotate} min={-180} max={180} onChange={v => onAdjustmentChange({ rotate: v })} onMouseDown={onStartAdjustment} onMouseUp={onCommitAdjustment} disabled={disabled} />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Filters</label>
                <div className="grid grid-cols-4 gap-2">
                    {(['none', 'grayscale', 'sepia', 'invert'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => handleFilterClick(f)}
                            disabled={disabled}
                            className={`px-2.5 py-1.5 text-xs font-mono font-bold rounded-xl transition-all capitalize cursor-pointer ${adjustments.filter === f ? 'bg-gradient-to-r from-white via-[#E8F0F4] to-[#AFC3CF] text-[#050709] shadow-sm' : 'bg-[#10161B] text-slate-300 border border-[#26313A] hover:border-[#AFC3CF]/40 hover:text-white'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ManualAdjustmentsPanel;