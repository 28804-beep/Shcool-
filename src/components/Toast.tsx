import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  text: string;
  type: 'success' | 'warning' | 'error';
}

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 3500);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-200 dark:border-emerald-800 bg-white dark:bg-zinc-900',
    warning: 'border-amber-200 dark:border-amber-800 bg-white dark:bg-zinc-900',
    error: 'border-red-200 dark:border-red-800 bg-white dark:bg-zinc-900',
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full animate-bounce-short">
      <div
        className={`flex items-center justify-between gap-3 p-3.5 rounded-2xl border shadow-lg ${borders[toast.type]}`}
      >
        <div className="flex items-center gap-2.5">
          {icons[toast.type]}
          <span className="text-xs font-semibold text-stone-800 dark:text-zinc-100">
            {toast.text}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-zinc-200 rounded-lg"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
