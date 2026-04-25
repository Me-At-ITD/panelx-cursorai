import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangleIcon } from 'lucide-react';
interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  variant?: 'danger' | 'warning' | 'primary';
}
export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  variant = 'danger'
}: ConfirmDialogProps) {
  if (!isOpen) return null;
  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return 'bg-status-problem text-white hover:bg-red-700';
      case 'warning':
        return 'bg-status-pending text-white hover:bg-amber-700';
      case 'primary':
        return 'btn-primary text-white';
      default:
        return 'bg-status-problem text-white hover:bg-red-700';
    }
  };
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
        <motion.div
          initial={{
            opacity: 0
          }}
          animate={{
            opacity: 1
          }}
          exit={{
            opacity: 0
          }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose} />
        
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.95,
            y: 10
          }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0
          }}
          exit={{
            opacity: 0,
            scale: 0.95,
            y: 10
          }}
          className="relative bg-card-bg border border-border w-full max-w-md p-6"
          style={{
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
          }}>
          
          <div className="flex items-start gap-4 mb-6">
            <div className="w-10 h-10 rounded-full bg-status-problem-bg flex items-center justify-center flex-shrink-0">
              <AlertTriangleIcon className="w-5 h-5 text-status-problem" />
            </div>
            <div>
              <h3 className="font-heading text-lg font-bold text-text-primary mb-2">
                {title}
              </h3>
              <p className="text-[13px] text-text-secondary leading-relaxed">
                {description}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <button
              onClick={onClose}
              className="px-4 py-2 text-[12px] font-heading font-medium uppercase tracking-wider text-text-secondary hover:text-text-primary hover:bg-subtle-bg transition-colors"
              autoFocus>
              
              Cancel
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`px-4 py-2 text-[12px] font-heading font-semibold uppercase tracking-wider transition-colors ${getVariantStyles()}`}>
              
              {confirmText}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>);

}