import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

/**
 * Accessible Modal — focus-trapped, Esc-closable, scroll-locked
 */
export default function Modal({
  isOpen,
  onClose,
  children,
  maxWidthClass = 'max-w-2xl',
  ariaLabelId,
  title,
  showCloseButton = true,
}) {
  const panelRef = useRef(null);
  const previousFocusRef = useRef(null);

  // Lock body scroll + save focused element
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement;
      document.body.style.overflow = 'hidden';
      // Focus first focusable element
      setTimeout(() => {
        const focusable = panelRef.current?.querySelectorAll(
          'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
        );
        if (focusable && focusable.length > 0) focusable[0].focus();
      }, 60);
    } else {
      document.body.style.overflow = '';
      previousFocusRef.current?.focus?.();
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Esc key + focus trap
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key !== 'Tab') return;
      const focusable = panelRef.current?.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={ariaLabelId}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 modal-backdrop animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={panelRef}
        className={`relative w-full ${maxWidthClass} bg-white dark:bg-[#1a1122] border border-[var(--color-border)] rounded-t-3xl sm:rounded-3xl shadow-2xl animate-slide-up max-h-[92vh] sm:max-h-[88vh] overflow-hidden flex flex-col`}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[var(--color-border-subtle)] shrink-0">
            {title && (
              <h2 id={ariaLabelId} className="font-serif text-lg font-bold text-[var(--color-text-main)] m-0">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                className="ml-auto p-2 rounded-xl text-[var(--color-text-light)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-subtle)] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Body — scrollable */}
        <div className="overflow-y-auto flex-1 p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
