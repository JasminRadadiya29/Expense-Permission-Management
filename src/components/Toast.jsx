import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const safeDuration = type === 'error' ? Math.max(duration, 3000) : duration;
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type, duration: safeDuration }]);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = {
    success: (msg, dur) => addToast(msg, 'success', dur),
    error: (msg, dur) => addToast(msg, 'error', dur),
    warning: (msg, dur) => addToast(msg, 'warning', dur),
    info: (msg, dur) => addToast(msg, 'info', dur),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 w-80 max-w-[calc(100vw-2rem)]">
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onRemove }) {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), toast.duration);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onRemove]);

  const styles = {
    success: {
      container: 'bg-emerald-900/90 border-emerald-500/50',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />,
      text: 'text-emerald-100',
    },
    error: {
      container: 'bg-red-900/90 border-red-500/50',
      icon: <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />,
      text: 'text-red-100',
    },
    warning: {
      container: 'bg-amber-900/90 border-amber-500/50',
      icon: <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />,
      text: 'text-amber-100',
    },
    info: {
      container: 'bg-blue-900/90 border-blue-500/50',
      icon: <Info className="w-5 h-5 text-blue-400 flex-shrink-0" />,
      text: 'text-blue-100',
    },
  };

  const s = styles[toast.type] || styles.info;

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md shadow-2xl ${s.container} animate-in slide-in-from-right duration-300`}
    >
      {s.icon}
      <p className={`text-sm font-medium flex-1 ${s.text}`}>{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="text-white/50 hover:text-white/90 transition-colors flex-shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

// Reusable confirm dialog modal
export function ConfirmDialog({ open, title, message, onConfirm, onCancel, confirmLabel = 'Confirm', confirmClass = 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700' }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-[9998]">
      <div className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl max-w-sm w-full p-6">
        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
        <p className="text-slate-400 text-sm mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className={`flex-1 text-white py-2.5 px-4 rounded-xl font-bold transition-all duration-200 text-sm ${confirmClass}`}
          >
            {confirmLabel}
          </button>
          <button
            onClick={onCancel}
            className="flex-1 border border-white/20 text-slate-300 hover:text-white hover:border-white/40 py-2.5 px-4 rounded-xl font-bold transition-all duration-200 text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
