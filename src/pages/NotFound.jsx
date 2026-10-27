import { Link } from 'react-router-dom';
import { Home, Sparkles } from 'lucide-react'; // ✅ FIX: Removed unused ArrowLeft import
import { usePageMeta } from '../hooks/usePageMeta';

export default function NotFound() {
  // ✅ FIX: Set a meaningful page title (was inheriting the default index.html title)
  usePageMeta('Page Not Found | Sri Senthoora Fancy Store');

  return (
    <div className="min-h-[72vh] flex items-center justify-center p-6 text-center bg-[var(--color-bg-base)]">
      <div className="max-w-md w-full space-y-6 animate-fade-in">
        <div className="w-24 h-24 rounded-3xl bg-[var(--color-primary-light)] border border-[var(--color-border)] flex items-center justify-center mx-auto text-[var(--color-primary)]">
          <span className="font-serif text-4xl font-black">404</span>
        </div>

        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[var(--color-text-main)] m-0">
            Page Not Found
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-2 leading-relaxed">
            The showcase page you're looking for doesn't exist or may have been moved.
            Return to our storefront to continue browsing.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] transition-colors shadow-md shadow-[var(--color-primary)]/20"
          >
            <Home className="w-4 h-4" />Return to Storefront
          </Link>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold text-[var(--color-text-muted)] bg-[var(--color-bg-subtle)] hover:bg-[var(--color-bg-muted)] border border-[var(--color-border)] transition-colors"
          >
            <Sparkles className="w-4 h-4 text-[var(--color-primary)]" />Browse Showcase
          </Link>
        </div>
      </div>
    </div>
  );
}
