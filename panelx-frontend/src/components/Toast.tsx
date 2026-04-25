import React, { useCallback, useState, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircleIcon,
  XCircleIcon,
  AlertTriangleIcon,
  InfoIcon,
  XIcon } from
'lucide-react';
export type ToastType = 'success' | 'error' | 'warning' | 'info';
interface Toast {
  id: string;
  type: ToastType;
  message: string;
}
interface ToastContextType {
  addToast: (type: ToastType, message: string) => void;
  removeToast: (id: string) => void;
}
const ToastContext = createContext<ToastContextType | undefined>(undefined);
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
export function ToastProvider({ children }: {children: React.ReactNode;}) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);
  const addToast = useCallback(
    (type: ToastType, message: string) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [
      ...prev,
      {
        id,
        type,
        message
      }]
      );
      setTimeout(() => removeToast(id), 4000);
    },
    [removeToast]
  );
  return (
    <ToastContext.Provider
      value={{
        addToast,
        removeToast
      }}>
      
      {children}
      <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) =>
          <ToastItem
            key={toast.id}
            toast={toast}
            onRemove={() => removeToast(toast.id)} />

          )}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>);

}
function ToastItem({
  toast,
  onRemove



}: {toast: Toast;onRemove: () => void;}) {
  const icons = {
    success: <CheckCircleIcon className="w-5 h-5 text-status-installed" />,
    error: <XCircleIcon className="w-5 h-5 text-status-problem" />,
    warning: <AlertTriangleIcon className="w-5 h-5 text-status-pending" />,
    info: <InfoIcon className="w-5 h-5 text-accent" />
  };
  const borderColors = {
    success: '#16A34A',
    error: '#DC2626',
    warning: '#D97706',
    info: '#2E86AB'
  };
  return (
    <motion.div
      initial={{
        opacity: 0,
        x: 50,
        scale: 0.95
      }}
      animate={{
        opacity: 1,
        x: 0,
        scale: 1
      }}
      exit={{
        opacity: 0,
        scale: 0.95,
        transition: {
          duration: 0.2
        }
      }}
      className="bg-card-bg border border-border p-4 flex items-start gap-3 w-[320px] pointer-events-auto"
      style={{
        borderLeft: `3px solid ${borderColors[toast.type]}`,
        boxShadow: '0 4px 12px rgba(15,23,42,0.08)'
      }}>
      
      <div className="flex-shrink-0 mt-0.5">{icons[toast.type]}</div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] text-text-primary font-medium leading-snug">
          {toast.message}
        </p>
      </div>
      <button
        onClick={onRemove}
        className="flex-shrink-0 text-text-secondary hover:text-text-primary transition-colors">
        
        <XIcon className="w-4 h-4" />
      </button>
    </motion.div>);

}