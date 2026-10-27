import { useState, useEffect, useMemo, useDeferredValue } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Sparkles, RefreshCw, AlertCircle, X, SlidersHorizontal } from 'lucide-react';
import { inventoryApi } from '../api/client';
import { useCompany } from '../context/CompanyContext';
import { usePageMeta } from '../hooks/usePageMeta';
import ProductCard from '../components/common/ProductCard';
import ProductSkeletonCard from '../components/common/ProductSkeletonCard';
import ProductModal from '../components/common/ProductModal';

const RATE_PRESETS = [
  { id: 'all',         label: 'All',          min: 0,    max: Infinity },
  { id: 'under-500',  label: 'Under ₹500',    min: 0,    max: 500     },
  { id: '500-1000',   label: '₹500–₹1K',     min: 500,  max: 1000    },
  { id: '1000-2000',  label: '₹1K–₹2K',      min: 1000, max: 2000    },
  { id: 'above-2000', label: '₹2K & Above',  min: 2000, max: Infinity }, // FIX: clearer label
];

export default function Products() {
  const { companyDetails } = useCompany();
  const [products, setProducts]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategory, setCategory] = useState(searchParams.get('category') || 'all');
  const [searchQuery, setSearchQuery]   = useState('');
  const [sortBy, setSortBy]             = useState(searchParams.get('sort') || 'newest'); // ✅ FIX: read sort from URL
  const [ratePreset, setRatePreset]     = useState(searchParams.get('rate') || 'all');    // ✅ FIX: read rate from URL
  const [selectedProduct, setSelectedProduct] = useState(null); // ✅ FIX: consistent naming
  const [showFilters, setShowFilters]   = useState(false);

  // ✅ FIX: SEO title per page
  usePageMeta(
    `Product Showcase | ${companyDetails.shopName}`,
    `Browse bridal bangles, imitation jewelry, cosmetics and gifts at ${companyDetails.shopName}, Erode.`
  );

  // ✅ FIX: Sync category, sort, and rate from URL params
  useEffect(() => {
    setCategory(searchParams.get('category') || 'all');
    setSortBy(searchParams.get('sort') || 'newest');
    setRatePreset(searchParams.get('rate') || 'all');
  }, [searchParams]);

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await inventoryApi.getAll();
      if (res.success && Array.isArray(res.data)) setProducts(res.data);
      else setError('Could not retrieve product showcase.');
    } catch (err) {
      setError(err.message || 'Unable to connect to showcase server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  // ✅ FIX: Sync category to URL
  const handleCategory = (catId) => {
    setCategory(catId);
    const sp = new URLSearchParams(searchParams);
    catId === 'all' ? sp.delete('category') : sp.set('category', catId);
    setSearchParams(sp);
  };

  // ✅ FIX: Sync sort to URL
  const handleSort = (val) => {
    setSortBy(val);
    const sp = new URLSearchParams(searchParams);
    val === 'newest' ? sp.delete('sort') : sp.set('sort', val);
    setSearchParams(sp);
  };

  // ✅ FIX: Sync rate preset to URL
  const handleRatePreset = (val) => {
    setRatePreset(val);
    const sp = new URLSearchParams(searchParams);
    val === 'all' ? sp.delete('rate') : sp.set('rate', val);
    setSearchParams(sp);
  };

  const handleReset = () => {
    setCategory('all');
    setSearchQuery('');
    setRatePreset('all');
    setSortBy('newest');
    setSearchParams(new URLSearchParams());
  };

  // ✅ FIX: Defer the search query to avoid re-filtering on every single keystroke
  const deferredQuery = useDeferredValue(searchQuery);

  const activePreset = RATE_PRESETS.find((p) => p.id === ratePreset) || RATE_PRESETS[0];
  const hasFilters = selectedCategory !== 'all' || deferredQuery.trim() !== '' || ratePreset !== 'all';

  const filtered = useMemo(() => {
    return products
      .filter((item) => {
        const catMatch =
          selectedCategory === 'all' ||
          (item.category?.toLowerCase() === selectedCategory.toLowerCase());
        const q = deferredQuery.toLowerCase().trim(); // ✅ use deferred value
        const queryMatch =
          !q ||
          item.name?.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q) ||
          item.tags?.some?.((t) => t.toLowerCase().includes(q));
        const rate = Number(item.rate) || 0;
        const rateMatch = rate >= activePreset.min && rate <= activePreset.max;
        return catMatch && queryMatch && rateMatch;
      })
      .sort((a, b) => {
        if (sortBy === 'rate-asc')  return (Number(a.rate) || 0) - (Number(b.rate) || 0);
        if (sortBy === 'rate-desc') return (Number(b.rate) || 0) - (Number(a.rate) || 0);
        if (sortBy === 'name-asc')  return (a.name || '').localeCompare(b.name || '');
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });
  }, [products, selectedCategory, deferredQuery, sortBy, activePreset]);

  return (
    <div className="min-h-screen py-8 sm:py-12 bg-[var(--color-bg-base)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">

        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[var(--color-primary-light)] text-[var(--color-primary)] border border-[var(--color-border)]">
            <Sparkles className="w-3 h-3 text-[var(--color-accent-gold)]" />
            Showroom Product Showcase
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--color-text-main)]">
            Exquisite Handpicked Collections
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-text-muted)] leading-relaxed">
            Browse our full showcase of bridal bangles, matte gold jewelry, cosmetics, and festive
            gifts. Rates are showroom reference only.
          </p>
        </div>

        {/* Filter & Search */}
        <div className="rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] shadow-sm overflow-hidden">
          {/* Top row */}
          <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full sm:w-96 flex-1">
              <Search className="w-4 h-4 text-[var(--color-text-light)] absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search bangles, jewelry, cosmetics…"
                aria-label="Search products"
                className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-[var(--color-bg-subtle)] border border-[var(--color-border)] text-sm text-[var(--color-text-main)] placeholder-[var(--color-text-light)] focus:border-[var(--color-primary)] focus:bg-[var(--color-bg-surface)] outline-none transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-light)] hover:text-[var(--color-text-main)] cursor-pointer p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-2 shrink-0">
              {/* ✅ FIX: onChange now calls handleSort which syncs to URL */}
              <select
                value={sortBy}
                onChange={(e) => handleSort(e.target.value)}
                aria-label="Sort products"
                className="flex-1 sm:flex-none px-3 py-2.5 rounded-xl bg-[var(--color-bg-subtle)] border border-[var(--color-border)] text-xs font-medium text-[var(--color-text-main)] focus:border-[var(--color-primary)] outline-none cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="rate-asc">Rate: Low–High</option>
                <option value="rate-desc">Rate: High–Low</option>
                <option value="name-asc">Name: A–Z</option>
              </select>

              <button
                type="button"
                onClick={fetchProducts}
                title="Refresh"
                aria-label="Refresh products"
                className="p-2.5 rounded-xl bg-[var(--color-bg-subtle)] border border-[var(--color-border)] text-[var(--color-text-light)] hover:text-[var(--color-text-main)] transition-colors cursor-pointer shrink-0"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                aria-label="Toggle price filters"
                aria-expanded={showFilters}
                className={`p-2.5 rounded-xl border transition-colors cursor-pointer shrink-0 ${
                  showFilters
                    ? 'bg-[var(--color-primary-light)] border-[var(--color-primary)]/30 text-[var(--color-primary)]'
                    : 'bg-[var(--color-bg-subtle)] border-[var(--color-border)] text-[var(--color-text-light)] hover:text-[var(--color-text-main)]'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="px-4 sm:px-5 border-t border-[var(--color-border-subtle)]">
            <div
              className="flex items-center gap-2 overflow-x-auto scrollbar-none py-3"
              role="tablist"
              aria-label="Filter by category"
            >
              {(companyDetails.categories || []).map((cat) => {
                const isActive = selectedCategory.toLowerCase() === cat.id.toLowerCase();
                return (
                  <button
                    key={cat.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => handleCategory(cat.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[var(--color-primary)] text-white shadow-sm'
                        : 'bg-[var(--color-bg-subtle)] text-[var(--color-text-muted)] hover:bg-[var(--color-bg-muted)] hover:text-[var(--color-text-main)]'
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rate Filters — collapsible */}
          {showFilters && (
            <div className="px-4 sm:px-5 pb-4 border-t border-[var(--color-border-subtle)] pt-3 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-[var(--color-text-light)] mr-1">Rate Range:</span>
              {/* ✅ FIX: onChange now calls handleRatePreset which syncs to URL */}
              {RATE_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleRatePreset(preset.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    ratePreset === preset.id
                      ? 'bg-[var(--color-text-main)] text-[var(--color-bg-surface)] font-bold'
                      : 'bg-[var(--color-bg-subtle)] text-[var(--color-text-muted)] hover:bg-[var(--color-bg-muted)]'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Results Info */}
        <div
          aria-live="polite"
          aria-atomic="true"
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[var(--color-text-light)] px-1"
        >
          <div className="flex items-center gap-3">
            <span>
              Showing <strong className="text-[var(--color-text-main)]">{filtered.length}</strong> items
            </span>
            {hasFilters && (
              <button
                type="button"
                onClick={handleReset}
                className="text-[var(--color-primary)] font-bold hover:underline cursor-pointer flex items-center gap-1"
              >
                <X className="w-3 h-3" />Reset Filters
              </button>
            )}
          </div>
          <span className="italic text-[11px]">Showroom display only • Visit store to purchase</span>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => <ProductSkeletonCard key={i} />)}
          </div>
        ) : error ? (
          <div className="p-8 rounded-3xl bg-[var(--color-primary-light)] border border-[var(--color-primary)]/20 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-[var(--color-primary)] mx-auto" />
            <h2 className="text-base font-bold text-[var(--color-text-main)] m-0">{error}</h2>
            <button
              onClick={fetchProducts}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[var(--color-primary-light)] flex items-center justify-center mx-auto text-[var(--color-primary)]">
              <Search className="w-7 h-7" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-[var(--color-text-main)] m-0">
                No products found
              </h2>
              <p className="text-xs text-[var(--color-text-light)] max-w-sm mx-auto mt-1">
                Try resetting your filters to explore the full collection.
              </p>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} onQuickView={setSelectedProduct} />
            ))}
          </div>
        )}

        {selectedProduct && (
          <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
        )}
      </div>
    </div>
  );
}
