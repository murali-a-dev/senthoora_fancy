import { useState, useEffect, useRef } from 'react';
import { Lock, ShieldAlert, ArrowRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';  // ✅ FIX: was <a href="/">, causing full-page reload
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useCompany } from '../../context/CompanyContext';

const MAX_ATTEMPTS = 5;       // ✅ FIX: front-end lockout after N failed attempts
const LOCKOUT_SECONDS = 60;   // lockout duration

export default function AdminPinModal({ isOpen }) {
  const { companyDetails } = useCompany();
  const { login, loading } = useAdminAuth();
  const [pin, setPin]           = useState('');
  const [error, setError]       = useState('');
  const [attempts, setAttempts] = useState(0);         // ✅ FIX: track failed attempts
  const [lockedUntil, setLockedUntil] = useState(null); // ✅ FIX: lockout timestamp
  const [remaining, setRemaining] = useState(0);        // countdown seconds
  const inputRef = useRef(null);
  const modalRef = useRef(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 80);
  }, [isOpen]);

  // Trap focus within modal
  useEffect(() => {
    if (!isOpen) return;
    const h = (e) => {
      if (e.key !== 'Tab') return;
      const els = modalRef.current?.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), a[href]'
      );
      if (!els?.length) return;
      const first = els[0];
      const last = els[els.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [isOpen]);

  // ✅ FIX: Countdown timer during lockout
  useEffect(() => {
    if (!lockedUntil) return;
    const interval = setInterval(() => {
      const secs = Math.ceil((lockedUntil - Date.now()) / 1000);
      if (secs <= 0) {
        setLockedUntil(null);
        setAttempts(0);
        setError('');
        setRemaining(0);
        clearInterval(interval);
      } else {
        setRemaining(secs);
      }
    }, 500);
    return () => clearInterval(interval);
  }, [lockedUntil]);

  if (!isOpen) return null;

  const isLockedOut = lockedUntil && Date.now() < lockedUntil;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pin.trim() || isLockedOut) return;
    setError('');
    const res = await login(pin.trim());
    if (!res.success) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setPin('');
      if (newAttempts >= MAX_ATTEMPTS) {
        // ✅ FIX: Lock out the UI for LOCKOUT_SECONDS
        setLockedUntil(Date.now() + LOCKOUT_SECONDS * 1000);
        setError(`Too many failed attempts. Please wait ${LOCKOUT_SECONDS} seconds.`);
      } else {
        const left = MAX_ATTEMPTS - newAttempts;
        setError(
          `Incorrect PIN. ${left} attempt${left === 1 ? '' : 's'} remaining.`
        );
      }
    }
  };

  const digit = (d) => {
    if (isLockedOut) return;
    if (pin.length < 8) {
      setPin((p) => p + d);
      setError('');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pin-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-2xl overflow-y-auto animate-fade-in"
    >
      <div
        ref={modalRef}
        className="my-auto bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-3xl shadow-2xl max-w-sm w-full p-5 sm:p-6 text-center space-y-4 animate-zoom-in"
      >
        {/* Brand */}
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[var(--color-primary-light)] border border-[var(--color-border)] flex items-center justify-center mx-auto p-2">
          <img src={companyDetails.logo} alt="Sri Senthoora" className="w-full h-full object-contain" />
        </div>

        <div>
          <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-[var(--color-primary)] uppercase tracking-wider mb-1">
            <Lock className="w-3.5 h-3.5" />Store Management Portal
          </div>
          <h2 id="pin-title" className="font-serif text-xl sm:text-2xl font-bold text-[var(--color-text-main)] m-0">
            Admin Authentication
          </h2>
          <p className="text-xs text-[var(--color-text-light)] mt-1">
            Enter your secure store PIN to access controls.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label htmlFor="pin-input" className="sr-only">Admin PIN</label>
            <input
              id="pin-input"
              ref={inputRef}
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"           // ✅ FIX: discourage non-numeric input on mobile
              maxLength={8}
              placeholder="••••"
              value={pin}
              disabled={isLockedOut}
              onChange={(e) => {
                // ✅ FIX: only accept digit characters
                const val = e.target.value.replace(/\D/g, '');
                setPin(val);
                setError('');
              }}
              className="w-full text-center text-2xl font-mono font-bold tracking-widest px-4 py-2.5 sm:py-3 bg-[var(--color-bg-subtle)] border border-[var(--color-border)] rounded-2xl focus:border-[var(--color-primary)] focus:bg-[var(--color-bg-surface)] outline-none transition-all text-[var(--color-text-main)] disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {error && (
              <div
                role="alert"
                className="flex items-center gap-1.5 text-xs text-[var(--color-primary)] font-semibold mt-2 justify-center"
              >
                <ShieldAlert className="w-4 h-4 shrink-0" />{error}
              </div>
            )}
            {/* ✅ FIX: Show live countdown during lockout */}
            {isLockedOut && remaining > 0 && (
              <p className="text-xs text-[var(--color-text-light)] mt-1">
                Try again in <strong>{remaining}s</strong>
              </p>
            )}
          </div>

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2" role="group" aria-label="PIN Keypad">
            {['1','2','3','4','5','6','7','8','9','C','0','⌫'].map((k) => (
              <button
                key={k}
                type="button"
                disabled={isLockedOut}
                onClick={() => {
                  if (k === 'C') { setPin(''); setError(''); }
                  else if (k === '⌫') setPin((p) => p.slice(0, -1));
                  else digit(k);
                }}
                className="min-h-[42px] sm:min-h-[46px] py-2 rounded-xl text-sm font-bold bg-[var(--color-bg-subtle)] hover:bg-[var(--color-primary-light)] hover:text-[var(--color-primary)] active:scale-95 text-[var(--color-text-main)] transition-all cursor-pointer border border-[var(--color-border-subtle)] disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label={k === 'C' ? 'Clear' : k === '⌫' ? 'Backspace' : `Digit ${k}`}
              >
                {k}
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || !pin.trim() || isLockedOut}
            className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] active:scale-98 disabled:opacity-50 transition-all shadow-md shadow-[var(--color-primary)]/20 cursor-pointer"
          >
            {loading ? 'Verifying…' : 'Unlock Admin Portal'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 border-t border-[var(--color-border-subtle)]">
          {/* ✅ FIX: Use React Router <Link> instead of <a href="/"> to avoid full-page reload */}
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-text-light)] hover:text-[var(--color-text-main)] transition-colors"
          >
            <Home className="w-3.5 h-3.5" />Return to Public Showcase
          </Link>
        </div>
      </div>
    </div>
  );
}
