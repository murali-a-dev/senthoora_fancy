import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState(null);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(({ type = 'info', title = '', message = '', duration = 4000 }) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const showSuccess = useCallback((message, title = 'Success') => {
    addToast({ type: 'success', title, message });
  }, [addToast]);

  const showError = useCallback((message, title = 'Error') => {
    addToast({ type: 'error', title, message });
  }, [addToast]);

  const showWarning = useCallback((message, title = 'Notice') => {
    addToast({ type: 'warning', title, message });
  }, [addToast]);

  const showInfo = useCallback((message, title = 'Information') => {
    addToast({ type: 'info', title, message });
  }, [addToast]);

  const confirm = useCallback(({
    title = 'Confirm Action',
    message = 'Are you sure you want to proceed?',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    isDanger = false,
    onConfirm = () => {},
  }) => {
    setConfirmDialog({
      title,
      message,
      confirmText,
      cancelText,
      isDanger,
      onConfirm: async () => {
        setConfirmDialog(null);
        await onConfirm();
      },
      onCancel: () => setConfirmDialog(null),
    });
  }, []);

  const getToastIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />;
      default:
        return <Info className="w-5 h-5 text-sky-500 shrink-0" />;
    }
  };

  return (
    <ToastContext.Provider value={{ showSuccess, showError, showWarning, showInfo, confirm }}>
      {children}

      {/* Floating Toasts Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-start gap-3 p-4 rounded-2xl bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border border-rose-100 dark:border-stone-800 shadow-xl shadow-rose-950/5 dark:shadow-black/40 text-stone-900 dark:text-stone-100 animate-in fade-in slide-in-from-bottom-3 duration-200"
          >
            {getToastIcon(toast.type)}
            <div className="flex-1 min-w-0">
              {toast.title && (
                <h4 className="text-sm font-bold leading-tight mb-0.5">{toast.title}</h4>
              )}
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed m-0">
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Confirmation Modal */}
      {confirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 m-0">
              {confirmDialog.title}
            </h3>
            <p className="text-sm text-stone-600 dark:text-stone-400 mt-2 mb-6">
              {confirmDialog.message}
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={confirmDialog.onCancel}
                className="px-4 py-2 text-sm font-semibold rounded-xl text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              >
                {confirmDialog.cancelText}
              </button>
              <button
                type="button"
                onClick={confirmDialog.onConfirm}
                className={`px-5 py-2 text-sm font-semibold rounded-xl text-white transition-all cursor-pointer shadow-sm ${
                  confirmDialog.isDanger
                    ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                    : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                }`}
              >
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
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export default ToastContext;
