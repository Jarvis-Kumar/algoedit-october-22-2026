
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, AlertCircle, Info, Loader2 } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'loading';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type: ToastType, duration?: number) => void;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType, duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);

    if (type !== 'loading' && duration > 0) {
      setTimeout(() => hideToast(id), duration);
    }
  }, [hideToast]);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <div className="fixed bottom-8 right-8 z-[1000] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95, transition: { duration: 0.2 } }}
              className="pointer-events-auto"
            >
              <div className={`
                min-w-[320px] max-w-[400px] p-4 rounded-2xl border backdrop-blur-2xl shadow-2xl flex items-center gap-4
                ${toast.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : ''}
                ${toast.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' : ''}
                ${toast.type === 'info' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : ''}
                ${toast.type === 'loading' ? 'bg-white/5 border-white/10 text-white' : ''}
              `}>
                <div className="shrink-0">
                  {toast.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
                  {toast.type === 'error' && <AlertCircle className="w-5 h-5" />}
                  {toast.type === 'info' && <Info className="w-5 h-5" />}
                  {toast.type === 'loading' && <Loader2 className="w-5 h-5 animate-spin" />}
                </div>
                <div className="flex-grow">
                  <p className="text-xs font-black uppercase tracking-widest leading-none mb-1 opacity-50">
                    {toast.type === 'success' ? 'System_Success' : 
                     toast.type === 'error' ? 'System_Error' : 
                     toast.type === 'loading' ? 'Processing_Task' : 'System_Notice'}
                  </p>
                  <p className="text-[13px] font-medium leading-tight text-white/90">{toast.message}</p>
                </div>
                <button 
                  onClick={() => hideToast(toast.id)}
                  className="p-1 hover:bg-white/5 rounded-lg transition-colors opacity-40 hover:opacity-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
