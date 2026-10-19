import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Sparkles, RefreshCw, AlertCircle, X } from 'lucide-react';
import { inventoryApi } from '../api/client';
import ProductCard from '../components/common/ProductCard';
import ProductModal from '../components/common/ProductModal';

const RATE_PRESETS = [
  { id: 'all', label: 'All Rates', min: 0, max: Infinity },
  { id: 'under-500', label: 'Under ₹500', min: 0, max: 500 },
  { id: '500-1000', label: '₹500 - ₹1,000', min: 500, max: 1000 },
  { id: '1000-2000', label: '₹1,000 - ₹2,000', min: 1000, max: 2000 },
  { id: 'above-2000', label: 'Above ₹2,000', min: 2000, max: Infinity },
];

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();

  // Search & Filter State
  const initialCategory = searchParams.get('category') || 'all';
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // newest, rate-asc, rate-desc, name-asc
  const [selectedRatePreset, setSelectedRatePreset] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Sync with URL query parameter
  useEffect(() => {
    const cat = searchParams.get('category') || 'all';
    setSelectedCategory(cat);
  }, [searchParams]);

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await inventoryApi.getAll();
      if (res.success && Array.isArray(res.data)) {
        setProducts(res.data);
      } else {
        setError('Could not retrieve product showcase.');
      }
    } catch (err) {
      console.error('Fetch products error:', err);
      setError(err.message || 'Unable to connect to showcase server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleCategorySelect = (catId) => {
    setSelectedCategory(catId);
    if (catId === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', catId);
    }
    setSearchParams(searchParams);
  };

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setSelectedRatePreset('all');
    setSortBy('newest');
    searchParams.delete('category');
    setSearchParams(searchParams);
  };

  const activePreset = RATE_PRESETS.find((p) => p.id === selectedRatePreset) || RATE_PRESETS[0];

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return products
      .filter((item) => {
        // Category filter
        const matchesCategory =
          selectedCategory === 'all' ||
          (item.category && item.category.toLowerCase() === selectedCategory.toLowerCase());

        // Search query
        const query = searchQuery.toLowerCase().trim();
        const matchesQuery =
          !query ||
          (item.name && item.name.toLowerCase().includes(query)) ||
          (item.description && item.description.toLowerCase().includes(query)) ||
          (Array.isArray(item.tags) && item.tags.some((t) => t.toLowerCase().includes(query))) ||
          (item.badge && item.badge.toLowerCase().includes(query));

        // Rate filter
        const itemRate = Number(item.rate) || 0;
        const matchesRate = itemRate >= activePreset.min && itemRate <= activePreset.max;

        return matchesCategory && matchesQuery && matchesRate;
      })
      .sort((a, b) => {
        if (sortBy === 'rate-asc') return (Number(a.rate) || 0) - (Number(b.rate) || 0);
        if (sortBy === 'rate-desc') return (Number(b.rate) || 0) - (Number(a.rate) || 0);
        if (sortBy === 'name-asc') return (a.name || '').localeCompare(b.name || '');
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });
  }, [products, selectedCategory, searchQuery, sortBy, activePreset]);

  const hasActiveFilters = selectedCategory !== 'all' || searchQuery.trim() !== '' || selectedRatePreset !== 'all';

  return (
    <div className="min-h-screen py-8 sm:py-12 bg-stone-50/60 dark:bg-stone-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto space-y-2.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-rose-100/80 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 fill-amber-500/20" aria-hidden="true" />
            <span>Showroom Product Showcase</span>
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900 dark:text-stone-100">
            Exquisite Handpicked Collections
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
            Browse our full showcase of bridal bangles, matte gold jewelry, salon cosmetics, and festive gifts. All rates are for showroom display reference only.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-4">
          {/* Top Row: Search and Sort */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
              <input
                id="showcase-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search bangles, jhumkas, cosmetics, bags..."
                aria-label="Search showcase products"
                className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:border-rose-500 focus:bg-white dark:focus:bg-stone-900 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search input"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 p-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort & Refresh */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <div className="flex items-center gap-2">
                <label htmlFor="showcase-sort-select" className="text-xs font-semibold text-stone-500 dark:text-stone-400">
                  Sort:
                </label>
                <select
                  id="showcase-sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-medium text-stone-800 dark:text-stone-200 focus:border-rose-500"
                >
                  <option value="newest">Newest Arrivals</option>
                  <option value="rate-asc">Rate: Low to High</option>
                  <option value="rate-desc">Rate: High to Low</option>
                  <option value="name-asc">Name: A to Z</option>
                </select>
              </div>

              <button
                type="button"
                onClick={fetchProducts}
                title="Refresh product list"
                aria-label="Refresh product list"
                className="p-2 rounded-xl text-stone-500 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="pt-2 border-t border-stone-100 dark:border-stone-800">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none" role="tablist" aria-label="Category filter tabs">
              {companyDetails.categories.map((cat) => {
                const isActive = selectedCategory.toLowerCase() === cat.id.toLowerCase();
                return (
                  <button
                    key={cat.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => handleCategorySelect(cat.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
                    }`}
                  >
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rate Preset Filters */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
            <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400 mr-1">
              Rate Range:
            </span>
            {RATE_PRESETS.map((preset) => {
              const isSelected = selectedRatePreset === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setSelectedRatePreset(preset.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950 font-bold'
                      : 'bg-stone-100 dark:bg-stone-800/80 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Count & Active Filters Summary */}
        <div
          aria-live="polite"
          aria-atomic="true"
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-stone-500 dark:text-stone-400 px-1"
        >
          <div className="flex items-center gap-3">
            <span>
              Showing <strong className="text-stone-900 dark:text-stone-100">{filteredProducts.length}</strong> items in showcase
            </span>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-rose-600 dark:text-rose-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
          <span className="italic text-[11px]">Showroom display items • Visit store to purchase</span>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-80 rounded-3xl img-skeleton"></div>
            ))}
          </div>
        ) : error ? (
          <div className="p-8 rounded-3xl bg-rose-50 dark:bg-stone-900 border border-rose-200 dark:border-rose-900 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
            <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 m-0">{error}</h2>
            <button
              onClick={fetchProducts}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 cursor-pointer"
            >
              Retry Loading Showcase
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-stone-800 flex items-center justify-center mx-auto text-rose-500">
              <Search className="w-7 h-7" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100 m-0">
                No matching showcase products found
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto mt-1">
                We couldn't find items matching your active category or price range. Try resetting your filters to explore the full collection.
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 transition-colors cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={(p) => setSelectedProduct(p)}
              />
            ))}
          </div>
        )}

        {/* Product Detail Modal */}
        {selectedProduct && (
          <ProductModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
          />
        )}
      </div>
    </div>
  );
}
