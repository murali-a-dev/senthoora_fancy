import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts]           = useState([]);
  const [confirmDialog, setConfirm]   = useState(null);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(({ type = 'info', title = '', message = '', duration = 4000 }) => {
    const id = Date.now() + Math.random().toString(36).slice(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    if (duration > 0) setTimeout(() => removeToast(id), duration);
  }, [removeToast]);

  const showSuccess = useCallback((message, title = 'Success')    => addToast({ type:'success', title, message }), [addToast]);
  const showError   = useCallback((message, title = 'Error')      => addToast({ type:'error',   title, message }), [addToast]);
  const showWarning = useCallback((message, title = 'Notice')     => addToast({ type:'warning', title, message }), [addToast]);
  const showInfo    = useCallback((message, title = 'Information')=> addToast({ type:'info',    title, message }), [addToast]);

  const confirm = useCallback(({ title='Confirm Action', message='Are you sure?', confirmText='Confirm', cancelText='Cancel', isDanger=false, onConfirm=()=>{} }) => {
    setConfirm({ title, message, confirmText, cancelText, isDanger,
      onConfirm: async () => { setConfirm(null); await onConfirm(); },
      onCancel: () => setConfirm(null),
    });
  }, []);

  const TOAST_STYLES = {
    success: { icon: <CheckCircle2 className="w-5 h-5 text-[var(--color-emerald)] shrink-0" />, border: 'border-[var(--color-emerald)]/20' },
    error:   { icon: <AlertCircle  className="w-5 h-5 text-[var(--color-primary)]  shrink-0" />, border: 'border-[var(--color-primary)]/20' },
    warning: { icon: <AlertTriangle className="w-5 h-5 text-[var(--color-accent-gold)] shrink-0" />, border: 'border-[var(--color-accent-gold)]/20' },
    info:    { icon: <Info         className="w-5 h-5 text-sky-500 shrink-0" />,               border: 'border-sky-200 dark:border-sky-900' },
  };

  return (
    <ToastContext.Provider value={{ showSuccess, showError, showWarning, showInfo, confirm }}>
      {children}

      {/* Toasts */}
      <div className="fixed bottom-6 right-4 sm:right-6 z-[60] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none" aria-live="polite" aria-label="Notifications">
        {toasts.map((toast) => {
          const s = TOAST_STYLES[toast.type] || TOAST_STYLES.info;
          return (
            <div key={toast.id} role="alert"
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl bg-[var(--color-bg-surface)]/96 backdrop-blur-sm border ${s.border} shadow-2xl text-[var(--color-text-main)] animate-slide-up`}>
              {s.icon}
              <div className="flex-1 min-w-0">
                {toast.title && <h4 className="text-sm font-bold leading-tight mb-0.5 m-0">{toast.title}</h4>}
                <p className="text-xs text-[var(--color-text-muted)] leading-relaxed m-0">{toast.message}</p>
              </div>
              <button type="button" onClick={() => removeToast(toast.id)} aria-label="Dismiss notification"
                className="text-[var(--color-text-light)] hover:text-[var(--color-text-main)] transition-colors p-1 cursor-pointer shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Confirm Dialog */}
      {confirmDialog && (
        <div role="dialog" aria-modal="true" aria-labelledby="confirm-title"
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 modal-backdrop animate-fade-in">
          <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-3xl max-w-sm w-full p-6 shadow-2xl animate-zoom-in">
            <h3 id="confirm-title" className="font-serif text-lg font-bold text-[var(--color-text-main)] m-0">{confirmDialog.title}</h3>
            <p className="text-sm text-[var(--color-text-muted)] mt-2 mb-6 leading-relaxed">{confirmDialog.message}</p>
            <div className="flex items-center justify-end gap-3">
              <button type="button" onClick={confirmDialog.onCancel}
                className="px-4 py-2 text-sm font-semibold rounded-xl text-[var(--color-text-muted)] hover:bg-[var(--color-bg-subtle)] transition-colors cursor-pointer">
                {confirmDialog.cancelText}
              </button>
              <button type="button" onClick={confirmDialog.onConfirm}
                className={`px-5 py-2 text-sm font-bold rounded-xl text-white transition-all cursor-pointer shadow-sm ${confirmDialog.isDanger ? 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)]' : 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)]'}`}>
                {confirmDialog.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
}

export default ToastContext;
