import React from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, info) { console.error('ErrorBoundary caught:', error, info); }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-[var(--color-bg-base)]">
        <div className="max-w-md w-full space-y-5 p-8 rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] shadow-lg">
          <div className="w-14 h-14 rounded-2xl bg-[var(--color-primary-light)] flex items-center justify-center mx-auto text-[var(--color-primary)]">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div>
            <h2 className="font-serif text-xl font-bold text-[var(--color-text-main)] m-0">Something Went Wrong</h2>
            <p className="text-xs text-[var(--color-text-muted)] mt-2">{this.state.error?.message || 'An unexpected error occurred.'}</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button onClick={() => window.location.reload()} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] cursor-pointer transition-colors">
              <RefreshCw className="w-4 h-4" />Reload Page
            </button>
            <a href="/" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-[var(--color-text-muted)] bg-[var(--color-bg-subtle)] hover:bg-[var(--color-bg-muted)] border border-[var(--color-border)] transition-colors">
              <Home className="w-4 h-4" />Go Home
            </a>
          </div>
        </div>
      </div>
    );
  }
}
