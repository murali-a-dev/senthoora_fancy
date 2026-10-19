import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Search, Sparkles, PlusCircle, RefreshCw } from 'lucide-react';
import { inventoryApi } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { useCompany } from '../../context/CompanyContext';
import ImageWithFallback from '../../components/common/ImageWithFallback';

export default function AdminProducts() {
  const { companyDetails } = useCompany();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { showSuccess, showError } = useToast();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await inventoryApi.getAll();
      if (res.success && Array.isArray(res.data)) {
        setProducts(res.data);
      }
    } catch (err) {
      showError('Could not load products: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const toggleFeatured = async (product) => {
    const updatedStatus = !product.featured;
    try {
      const res = await inventoryApi.update(product.id, { featured: updatedStatus });
      if (res.success) {
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, featured: updatedStatus } : p))
        );
        showSuccess(
          `"${product.name}" is now ${updatedStatus ? 'featured on the homepage' : 'removed from featured showcase'}.`
        );
      }
    } catch (err) {
      showError('Failed to update featured status: ' + err.message);
    }
  };

  const filteredProducts = products.filter((item) => {
    const matchesCat =
      selectedCategory === 'all' ||
      (item.category && item.category.toLowerCase() === selectedCategory.toLowerCase());
    const query = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !query ||
      (item.name && item.name.toLowerCase().includes(query)) ||
      (item.description && item.description.toLowerCase().includes(query));
    return matchesCat && matchesQuery;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100 m-0">
            Showcase Products Manager
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Review how items appear in the public catalog and toggle featured status on the Home page.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchProducts}
            className="p-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 cursor-pointer shadow-2xs"
            title="Refresh showcase list"
            aria-label="Refresh showcase list"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            to="/admin/inventory"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-sm transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Manage & Add Items in Inventory</span>
          </Link>
        </div>
      </div>

      {/* Filter Strip */}
      <div className="p-4 rounded-3xl bg-white dark:bg-stone-900 border border-rose-100/80 dark:border-stone-800 flex flex-col sm:flex-row gap-4 justify-between items-center shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search showcase products..."
            aria-label="Search showcase products"
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100 focus:border-rose-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto scrollbar-none">
          {companyDetails.categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                selectedCategory.toLowerCase() === cat.id.toLowerCase()
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Content View */}
      {loading ? (
        <div className="p-12 text-center text-stone-400 text-sm">
          <div className="w-8 h-8 border-3 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          Loading showcase items...
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-stone-900 border border-rose-100/80 dark:border-stone-800 space-y-3">
          <Package className="w-10 h-10 text-stone-300 dark:text-stone-700 mx-auto" />
          <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
            No Products Found
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Try adjusting your search query or add items in Inventory.
          </p>
        </div>
      ) : (
        <>
          {/* Mobile Card View (screens < 640px) */}
          <div className="block sm:hidden space-y-3">
            {filteredProducts.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-rose-100/80 dark:border-stone-800 shadow-2xs space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-stone-200 dark:border-stone-700">
                    <ImageWithFallback
                      src={item.photo || item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate m-0">
                      {item.name}
                    </h4>
                    <span className="text-[11px] text-rose-600 dark:text-rose-400 capitalize block font-medium">
                      {item.category}
                    </span>
                    <span className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100">
                      {item.rateDisplay || `₹${Number(item.rate || 0).toLocaleString('en-IN')}`}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => toggleFeatured(item)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition-colors cursor-pointer ${
                      item.featured
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400'
                    }`}
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>{item.featured ? 'Featured on Home' : 'Not Featured'}</span>
                  </button>

                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                    Active
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View (screens >= 640px) */}
          <div className="hidden sm:block bg-white dark:bg-stone-900 border border-rose-100/80 dark:border-stone-800 rounded-3xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 dark:bg-stone-800/60 border-b border-stone-100 dark:border-stone-800 text-stone-500 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-4">Product Details</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Showcase Rate</th>
                    <th className="p-4 text-center">Featured on Home</th>
                    <th className="p-4 text-right">Showcase Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                  {filteredProducts.map((item) => (
                    <tr key={item.id} className="hover:bg-rose-50/40 dark:hover:bg-stone-800/40 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-stone-200 dark:border-stone-700">
                            <ImageWithFallback
                              src={item.photo || item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <span className="font-bold text-stone-900 dark:text-stone-100 block line-clamp-1">
                              {item.name}
                            </span>
                            <span className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-1">
                              {item.description || 'No description provided'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                          {item.category}
                        </span>
                      </td>
                      <td className="p-4 font-serif font-bold text-sm text-stone-900 dark:text-stone-100">
                        {item.rateDisplay || `₹${Number(item.rate || 0).toLocaleString('en-IN')}`}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          type="button"
                          onClick={() => toggleFeatured(item)}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold transition-colors cursor-pointer ${
                            item.featured
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
                          }`}
                          title="Click to toggle featured display on homepage"
                          aria-label={`Toggle featured status for ${item.name}`}
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>{item.featured ? 'Featured' : 'Regular'}</span>
                        </button>
                      </td>
                      <td className="p-4 text-right">
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                          Active Showcase
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
