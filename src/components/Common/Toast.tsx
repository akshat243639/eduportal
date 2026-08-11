import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full px-4">
      {toasts.map(t => {
        const bgClass =
          t.type === 'success'
            ? 'bg-blue-600 text-white shadow-blue-200'
            : t.type === 'error'
            ? 'bg-rose-600 text-white shadow-rose-200'
            : t.type === 'warning'
            ? 'bg-amber-500 text-white shadow-amber-200'
            : 'bg-slate-800 text-white shadow-slate-300';

        return (
          <div
            key={t.id}
            className={`flex items-center justify-between p-3.5 rounded-xl shadow-lg border border-white/20 transition-all transform duration-200 ${bgClass}`}
          >
            <div className="flex items-center gap-2.5">
              {t.type === 'success' && <CheckCircle2 className="w-5 h-5 shrink-0" />}
              {t.type === 'error' && <AlertCircle className="w-5 h-5 shrink-0" />}
              {t.type === 'warning' && <AlertCircle className="w-5 h-5 shrink-0" />}
              {t.type === 'info' && <Info className="w-5 h-5 shrink-0" />}
              <p className="text-sm font-medium">{t.message}</p>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors ml-2"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
