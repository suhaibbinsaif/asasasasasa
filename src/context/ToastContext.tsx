import { createContext, useContext, useState, ReactNode, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal, X } from 'lucide-react';

interface Toast {
  id: string;
  message: string;
}

interface ToastContextType {
  addToast: (message: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const removeToast = useCallback((id: string) => {
    const existing = timeoutsRef.current.get(id);
    if (existing) {
      clearTimeout(existing);
      timeoutsRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => {
      // Keep up to 3 most recent toasts
      const trimmed = prev.length >= 3 ? prev.slice(prev.length - 2) : prev;
      return [...trimmed, { id, message }];
    });

    const timer = setTimeout(() => {
      removeToast(id);
    }, 4500);

    timeoutsRef.current.set(id, timer);
  }, [removeToast]);

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((timer) => clearTimeout(timer));
      timeoutsRef.current.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div 
        role="region"
        aria-live="polite"
        aria-label="System Notifications"
        className="fixed top-20 sm:top-24 right-4 left-4 sm:left-auto sm:right-6 z-[200] flex flex-col gap-2.5 pointer-events-none max-w-[calc(100vw-2rem)] sm:max-w-sm"
      >
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className="bg-black/90 backdrop-blur-md border border-lime-500/40 p-3.5 rounded-sm shadow-[0_4px_24px_rgba(0,0,0,0.7)] flex items-start gap-3 pointer-events-auto group relative cursor-pointer"
              onClick={() => removeToast(toast.id)}
            >
              <Terminal className="w-4 h-4 text-lime-400 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0 pr-4">
                <div className="text-[10px] text-lime-400/90 font-mono uppercase tracking-widest mb-0.5 font-bold">
                  &gt; SYSTEM BROADCAST
                </div>
                <div className="text-xs sm:text-sm text-gray-200 font-mono break-words">
                  {toast.message}
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeToast(toast.id);
                }}
                className="text-gray-500 hover:text-white transition-colors p-1"
                aria-label="Dismiss notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}
