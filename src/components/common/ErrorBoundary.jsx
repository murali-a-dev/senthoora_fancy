import React from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full p-8 rounded-3xl bg-white dark:bg-stone-900 border border-rose-100 dark:border-stone-800 shadow-xl space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-stone-800 flex items-center justify-center text-rose-500 mx-auto">
              <AlertCircle className="w-7 h-7" />
            </div>

            <div>
              <h2 className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100">
                Something Went Unexpectedly Wrong
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-2">
                We apologize for the inconvenience. Please refresh the page or return to the storefront.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-sm cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload Page</span>
              </button>
              <a
                href="/"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 transition-colors"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Return Home</span>
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
