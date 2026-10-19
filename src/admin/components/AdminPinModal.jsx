import { useState, useEffect, useRef } from 'react';
import { Lock, ShieldAlert, ArrowRight, Home } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useCompany } from '../../context/CompanyContext';

export default function AdminPinModal({ isOpen, onSuccess }) {
  const { companyDetails } = useCompany();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const { login, loading } = useAdminAuth();
  const inputRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Trap focus inside modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key !== 'Tab') return;

      const focusableEls = modalRef.current?.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), a[href]'
      );
      if (!focusableEls || focusableEls.length === 0) return;

      const firstEl = focusableEls[0];
      const lastEl = focusableEls[focusableEls.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        }
      } else {
        if (document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pin.trim()) return;

    setError('');
    const res = await login(pin.trim());
    if (res.success) {
      if (onSuccess) onSuccess();
    } else {
      setError(res.message || 'Incorrect Admin PIN. Please try again.');
    }
  };

  const handleKeyClick = (digit) => {
    if (pin.length < 8) {
      setPin((prev) => prev + digit);
      if (error) setError('');
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="adminPinTitle"
      aria-describedby="adminPinDesc"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md"
    >
      <div
        ref={modalRef}
        className="bg-white dark:bg-stone-900 border border-rose-100 dark:border-stone-800 rounded-3xl shadow-2xl max-w-sm w-full p-6 text-center space-y-5 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Brand Emblem */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-50 to-amber-50 dark:from-stone-800 dark:to-stone-900 border border-rose-200/80 dark:border-stone-700 flex items-center justify-center mx-auto shadow-xs p-2">
          <img src={companyDetails.logo} alt="Sri Senthoora" className="w-full h-full object-contain" />
        </div>

        <div>
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-1">
            <Lock className="w-3.5 h-3.5" />
            <span>Store Management Portal</span>
          </div>
          <h2 id="adminPinTitle" className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100 m-0">
            Admin Authentication
          </h2>
          <p id="adminPinDesc" className="text-xs text-stone-500 dark:text-stone-400 mt-1 m-0">
            Please enter your secure store PIN to access showcase & inventory controls.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label htmlFor="adminPinInput" className="sr-only">
              Admin PIN
            </label>
            <input
              id="adminPinInput"
              ref={inputRef}
              type="password"
              inputMode="numeric"
              maxLength={8}
              placeholder="••••"
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                if (error) setError('');
              }}
              className="w-full text-center text-2xl font-mono font-bold tracking-widest px-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl focus:border-rose-500 focus:bg-white dark:focus:bg-stone-900 transition-all text-stone-900 dark:text-stone-100"
            />
            {error && (
              <div role="alert" className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-semibold mt-2 justify-center">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Quick Digit Pad (min 44px height touch targets) */}
          <div className="grid grid-cols-3 gap-2 pt-1" aria-label="Keypad">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  if (item === 'C') setPin('');
                  else if (item === '⌫') handleBackspace();
                  else handleKeyClick(item);
                }}
                className="min-h-[44px] py-2.5 rounded-xl text-sm font-bold bg-stone-100 dark:bg-stone-800/80 hover:bg-rose-50 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 transition-colors cursor-pointer"
                aria-label={item === 'C' ? 'Clear PIN' : item === '⌫' ? 'Backspace' : `Digit ${item}`}
              >
                {item}
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || !pin.trim()}
            className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 transition-all shadow-md shadow-rose-600/20 cursor-pointer"
          >
            <span>{loading ? 'Verifying PIN...' : 'Unlock Admin Portal'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 border-t border-stone-100 dark:border-stone-800">
          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 dark:hover:text-stone-200 transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return to Public Showcase</span>
          </a>
        </div>
      </div>
    </div>
  );
}
