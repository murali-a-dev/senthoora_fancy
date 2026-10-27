import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Search, Sparkles, PlusCircle, RefreshCw } from 'lucide-react';
import { inventoryApi } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { useCompany } from '../../context/CompanyContext';
import ImageWithFallback from '../../components/common/ImageWithFallback';

export default function AdminProducts() {
  const { companyDetails } = useCompany();
  const { showSuccess, showError } = useToast();
  const [products, setProducts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [searchQuery, setSearch]  = useState('');
  const [selectedCat, setCat]     = useState('all');

  // ✅ FIX: Per-item toggle loading state prevents double-clicks and race conditions
  const [toggling, setToggling] = useState({});

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await inventoryApi.getAll();
      if (res.success && Array.isArray(res.data)) setProducts(res.data);
    } catch (err) {
      showError('Could not load products: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const toggleFeatured = async (product) => {
    // ✅ FIX: Prevent rapid double-toggling on same item
    if (toggling[product.id]) return;
    setToggling((p) => ({ ...p, [product.id]: true }));

    const next = !product.featured;
    try {
      const res = await inventoryApi.update(product.id, { featured: next });
      if (res.success) {
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, featured: next } : p))
        );
        showSuccess(
          `"${product.name}" is now ${next ? 'featured on Homepage' : 'removed from featured'}.`
        );
      }
    } catch (err) {
      showError('Toggle failed: ' + err.message);
    } finally {
      setToggling((p) => ({ ...p, [product.id]: false }));
    }
  };

  const filtered = products.filter((item) => {
    const catOk =
      selectedCat === 'all' ||
      (item.category || '').toLowerCase() === selectedCat.toLowerCase();
    const q = searchQuery.toLowerCase().trim();
    const queryOk =
      !q ||
      (item.name || '').toLowerCase().includes(q) ||
      (item.description || '').toLowerCase().includes(q);
    return catOk && queryOk;
  });

  // ✅ FIX: Count featured across ALL products (not just filtered ones)
  const totalFeatured = products.filter((p) => p.featured).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[var(--color-border)]">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--color-text-main)] m-0">
            Showcase Products Manager
          </h1>
          <p className="text-xs text-[var(--color-text-light)] mt-1">
            Review catalog items and toggle featured status.{' '}
            {/* ✅ FIX: Shows total featured count across all products, not just the filtered view */}
            <span className="text-[var(--color-accent-gold)] font-semibold">
              {totalFeatured} featured
            </span>{' '}
            shown on Home page.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchProducts}
            title="Refresh"
            aria-label="Refresh products list"
            className="p-2.5 rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] text-[var(--color-text-light)] hover:text-[var(--color-text-main)] cursor-pointer transition-colors shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            to="/admin/inventory"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] shadow-sm transition-colors"
          >
            <PlusCircle className="w-4 h-4" />Manage in Inventory
          </Link>
        </div>
      </div>

      {/* Filter Strip */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] shadow-sm flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[var(--color-text-light)] absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search showcase products…"
            aria-label="Search products"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--color-bg-subtle)] border border-[var(--color-border)] text-sm text-[var(--color-text-main)] placeholder-[var(--color-text-light)] focus:border-[var(--color-primary)] outline-none transition-all"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none w-full sm:w-auto">
          {(companyDetails.categories || []).map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCat(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
                selectedCat.toLowerCase() === cat.id.toLowerCase()
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-[var(--color-bg-subtle)] text-[var(--color-text-muted)] hover:bg-[var(--color-bg-muted)]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="p-12 text-center text-[var(--color-text-light)] space-y-3">
          <div className="w-8 h-8 border-[3px] border-[var(--color-primary)]/20 border-t-[var(--color-primary)] rounded-full animate-spin mx-auto" />
          <p className="text-sm">Loading showcase items…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] space-y-4">
          <Package className="w-10 h-10 text-[var(--color-text-light)] mx-auto opacity-40" />
          <h3 className="font-serif text-lg font-bold text-[var(--color-text-main)] m-0">No Products Found</h3>
          <p className="text-xs text-[var(--color-text-light)]">Try adjusting filters, or add items via Inventory.</p>
        </div>
      ) : (
        <>
          {/* Mobile Cards */}
          <div className="sm:hidden space-y-3">
            {filtered.map((item) => (
              <div key={item.id} className="p-4 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] shadow-sm space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-[var(--color-border)]">
                    <ImageWithFallback src={item.photo || item.image} alt={item.name} aspectRatioClass="aspect-square" className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-[var(--color-text-main)] truncate m-0">{item.name}</h4>
                    <span className="text-[11px] text-[var(--color-primary)] capitalize block font-medium">{item.category}</span>
                    <span className="font-serif font-bold text-sm text-[var(--color-text-main)]">
                      {item.rateDisplay || `₹${Number(item.rate || 0).toLocaleString('en-IN')}`}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border-subtle)]">
                  {/* ✅ FIX: Button shows spinner while this specific item is being toggled */}
                  <button
                    type="button"
                    onClick={() => toggleFeatured(item)}
                    disabled={toggling[item.id]}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition-colors cursor-pointer disabled:opacity-60 ${
                      item.featured
                        ? 'bg-[var(--color-accent-gold-light)] text-[var(--color-accent-gold)]'
                        : 'bg-[var(--color-bg-subtle)] text-[var(--color-text-light)] hover:bg-[var(--color-bg-muted)]'
                    }`}
                  >
                    {toggling[item.id]
                      ? <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      : <Sparkles className="w-3 h-3" />
                    }
                    {item.featured ? 'Featured on Home' : 'Not Featured'}
                  </button>
                  <span className={`text-[11px] font-semibold ${item.featured ? 'text-[var(--color-emerald)]' : 'text-[var(--color-text-light)]'}`}>
                    {item.featured ? 'Active' : 'Regular'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden sm:block bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[var(--color-bg-subtle)] border-b border-[var(--color-border)] text-[var(--color-text-light)] uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-4 font-bold">Product</th>
                    <th className="p-4 font-bold">Category</th>
                    <th className="p-4 font-bold">Rate</th>
                    <th className="p-4 text-center font-bold">Featured on Home</th>
                    <th className="p-4 text-right font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border-subtle)]">
                  {filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-[var(--color-primary-light)]/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-[var(--color-border)]">
                            <ImageWithFallback src={item.photo || item.image} alt={item.name} aspectRatioClass="aspect-square" className="object-cover" />
                          </div>
                          <div>
                            <span className="font-bold text-[var(--color-text-main)] block line-clamp-1">{item.name}</span>
                            <span className="text-[11px] text-[var(--color-text-light)] line-clamp-1">{item.description || '—'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[var(--color-primary-light)] text-[var(--color-primary)] capitalize">
                          {item.category}
                        </span>
                      </td>
                      <td className="p-4 font-serif font-bold text-sm text-[var(--color-text-main)]">
                        {item.rateDisplay || `₹${Number(item.rate || 0).toLocaleString('en-IN')}`}
                      </td>
                      <td className="p-4 text-center">
                        {/* ✅ FIX: Shows per-item spinner, prevents double-toggle */}
                        <button
                          type="button"
                          onClick={() => toggleFeatured(item)}
                          disabled={toggling[item.id]}
                          aria-label={`Toggle featured: ${item.name}`}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold transition-colors cursor-pointer disabled:opacity-60 ${
                            item.featured
                              ? 'bg-[var(--color-accent-gold-light)] text-[var(--color-accent-gold)]'
                              : 'bg-[var(--color-bg-subtle)] text-[var(--color-text-light)] hover:bg-[var(--color-bg-muted)] hover:text-[var(--color-text-main)]'
                          }`}
                        >
                          {toggling[item.id]
                            ? <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            : <Sparkles className="w-3 h-3" />
                          }
                          {item.featured ? 'Featured' : 'Regular'}
                        </button>
                      </td>
                      <td className="p-4 text-right">
                        <span className={`text-[11px] font-semibold ${item.featured ? 'text-[var(--color-emerald)]' : 'text-[var(--color-text-light)]'}`}>
                          {item.featured ? 'Active Showcase' : 'Not Featured'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
