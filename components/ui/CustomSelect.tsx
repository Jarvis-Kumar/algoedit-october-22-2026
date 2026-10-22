
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Check } from 'lucide-react';

interface CustomSelectProps {
  options: string[] | { label: string; value: string }[];
  value: string;
  onChange: (val: string) => void;
  className?: string;
  placeholder?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({ options, value, onChange, className = "", placeholder = "Select option..." }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getValueLabel = (val: string) => {
    const option = options.find(o => typeof o === 'string' ? o === val : o.value === val);
    if (!option) return val || placeholder;
    return typeof option === 'string' ? option : option.label;
  };

  return (
    <div className={`relative w-full ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-xs text-white flex items-center justify-between hover:border-white/20 transition-all outline-none focus:ring-1 focus:ring-white/20 shadow-lg"
      >
        <span className="font-bold truncate pr-4">{getValueLabel(value)}</span>
        <ChevronDown size={14} className={`text-slate-500 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-full mt-2 w-full bg-[#0a0c10] border border-white/10 rounded-xl shadow-2xl z-[9999] overflow-hidden backdrop-blur-2xl"
          >
            <div className="py-1 max-h-60 overflow-y-auto custom-scrollbar">
              {options.map((option) => {
                const optValue = typeof option === 'string' ? option : option.value;
                const optLabel = typeof option === 'string' ? option : option.label;
                return (
                  <button
                    key={optValue}
                    type="button"
                    onClick={() => {
                      onChange(optValue);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 text-xs flex items-center justify-between transition-colors ${
                      value === optValue ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span className={value === optValue ? 'font-bold' : 'font-medium'}>{optLabel}</span>
                    {value === optValue && <Check size={12} className="text-white" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
