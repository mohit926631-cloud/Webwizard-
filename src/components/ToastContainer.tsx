import React from 'react';
import { Toast } from '../types';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

interface Props {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<Props> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full px-4 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md transition-all duration-300 animate-slide-in ${
            t.type === 'success'
              ? 'bg-slate-900/90 border-emerald-500/30 text-emerald-300'
              : t.type === 'error'
              ? 'bg-slate-900/90 border-rose-500/30 text-rose-300'
              : 'bg-slate-900/90 border-blue-500/30 text-blue-300'
          }`}
        >
          <div className="mt-0.5 shrink-0">
            {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
            {t.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400" />}
            {t.type === 'info' && <Info className="w-5 h-5 text-blue-400" />}
          </div>
          <div className="flex-1 text-sm">
            {t.title && <div className="font-semibold text-slate-100 mb-0.5">{t.title}</div>}
            <div className="text-slate-300 leading-snug">{t.message}</div>
          </div>
          <button
            onClick={() => onDismiss(t.id)}
            className="text-slate-400 hover:text-slate-200 transition-colors p-1"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
