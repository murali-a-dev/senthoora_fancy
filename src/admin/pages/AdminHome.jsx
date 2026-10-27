import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Boxes, Package, Sparkles, ArrowRight, PlusCircle, Eye, MessageSquare, Settings } from 'lucide-react';
import { inventoryApi, inquiryApi } from '../../api/client';
import { useCompany } from '../../context/CompanyContext';

function StatCard({ icon: Icon, color, label, value, loading }) {
  const bg = {
    primary: 'bg-[var(--color-primary-light)] text-[var(--color-primary)]',
    gold:    'bg-[var(--color-accent-gold-light)] text-[var(--color-accent-gold)]',
    purple:  'bg-purple-100 dark:bg-purple-950/30 text-purple-500',
    emerald: 'bg-[var(--color-emerald-light)] text-[var(--color-emerald)]',
  };
  return (
    <div className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] shadow-[var(--color-card-shadow)] flex items-center gap-3 sm:gap-4">
      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 ${bg[color]}`}>
        <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
      </div>
      <div className="min-w-0">
        <span className="text-[11px] sm:text-xs font-medium text-[var(--color-text-light)] truncate block">{label}</span>
        <h3 className="font-serif text-lg sm:text-2xl font-bold text-[var(--color-text-main)] m-0">
          {loading ? <span className="inline-block w-8 h-5 sm:h-6 img-skeleton rounded" /> : value}
        </h3>
      </div>
    </div>
  );
}

export default function AdminHome() {
  const { companyDetails } = useCompany();
  const [products, setProducts]   = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [pr, ir] = await Promise.all([
          inventoryApi.getAll().catch(() => ({ success: false, data: [] })),
          inquiryApi.getAll().catch(() => ({ success: false, data: [] })),
        ]);
        if (pr.success && Array.isArray(pr.data)) setProducts(pr.data);
        if (ir.success && Array.isArray(ir.data)) setInquiries(ir.data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const featuredCount = products.filter((p) => p.featured).length;

  // ✅ FIX: "Categories" stat now guards against the 'all' entry being absent
  const categoryCount = Math.max(
    0,
    (companyDetails.categories || []).filter((c) => c.id !== 'all').length
  );

  // ✅ FIX: Sort products by createdAt DESC so "Latest Inventory Items" shows the actual newest
  const latestItems = [...products]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 5);

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto">

      {/* Welcome Banner */}
      <div className="p-5 sm:p-8 rounded-3xl bg-gradient-to-r from-[var(--color-primary-hover)] via-[var(--color-primary)] to-[var(--color-primary-hover)] text-white shadow-lg shadow-[var(--color-primary)]/20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 sm:gap-6">
          <div className="space-y-2">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full inline-block">
              Store Administrator Overview
            </span>
            <h1 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold leading-tight">
              Welcome to {companyDetails.shopName}
            </h1>
            <p className="text-xs sm:text-sm text-white/85 max-w-xl leading-relaxed">
              Manage showcase collections, update inventory, review customer inquiries, and customize all store settings.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
            <Link
              to="/admin/inventory"
              className="flex-1 sm:flex-none justify-center inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold text-[var(--color-primary-hover)] bg-white hover:bg-rose-50 transition-colors shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />Manage Inventory
            </Link>
            <Link
              to="/"
              target="_blank"
              className="flex-1 sm:flex-none justify-center inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold text-white bg-white/15 hover:bg-white/25 border border-white/25 transition-colors"
            >
              <Eye className="w-4 h-4" />Live Site
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard icon={Boxes}         color="primary" label="Total Items"       value={products.length}  loading={loading} />
        <StatCard icon={Sparkles}      color="gold"    label="Featured on Home"  value={featuredCount}    loading={loading} />
        {/* ✅ FIX: Counts only real categories (excludes 'all') robustly */}
        <StatCard icon={Package}       color="purple"  label="Categories"        value={categoryCount}    loading={false} />
        <StatCard icon={MessageSquare} color="emerald" label="Inquiries"         value={inquiries.length} loading={loading} />
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">

        {/* Latest items — sorted newest first */}
        <div className="lg:col-span-7 p-4 sm:p-6 rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border-subtle)]">
            <h3 className="font-serif text-base sm:text-lg font-bold text-[var(--color-text-main)] m-0">
              Latest Inventory Items
            </h3>
            <Link to="/admin/inventory" className="text-xs font-bold text-[var(--color-primary)] hover:underline flex items-center gap-1">
              Manage <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-2.5">
            {loading ? (
              [1,2,3,4,5].map((i) => <div key={i} className="h-16 rounded-2xl img-skeleton" />)
            ) : latestItems.length === 0 ? (
              <p className="text-xs sm:text-sm text-[var(--color-text-light)] text-center py-8">
                No products yet. Add via Inventory.
              </p>
            ) : (
              // ✅ FIX: was products.slice(0,5) = insertion order (not "latest")
              // Now uses latestItems sorted by createdAt DESC
              latestItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2.5 sm:p-3 rounded-2xl bg-[var(--color-bg-subtle)] border border-[var(--color-border-subtle)] gap-2"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={item.photo || item.image}
                      alt={item.name}
                      className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl object-cover bg-[var(--color-bg-muted)] shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-[var(--color-text-main)] m-0 truncate">
                        {item.name}
                      </h4>
                      <span className="text-[11px] text-[var(--color-text-light)] capitalize block truncate">
                        {item.category} • {item.rateDisplay || `₹${item.rate}`}
                      </span>
                    </div>
                  </div>
                  {item.featured && (
                    <span className="px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[var(--color-accent-gold-light)] text-[var(--color-accent-gold)] shrink-0">
                      Featured
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick nav + inquiries */}
        <div className="lg:col-span-5 p-4 sm:p-6 rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] shadow-sm space-y-4">
          <div>
            <h3 className="font-serif text-base sm:text-lg font-bold text-[var(--color-text-main)] m-0">
              Quick Navigation
            </h3>
            <p className="text-xs text-[var(--color-text-light)] mt-1">
              Jump into managing specific sections of your showcase website.
            </p>
          </div>
          <div className="space-y-2">
            {[
              { to: '/admin/products',  icon: Package,  label: 'Products Showcase Manager',  sub: 'Toggle featured, view catalog' },
              { to: '/admin/inventory', icon: Boxes,    label: 'Inventory & Uploads',         sub: 'Add, edit, delete products' },
              { to: '/admin/about',     icon: Settings, label: 'Store Settings & Details',    sub: 'Info, contacts, hours, categories' },
            ].map(({ to, icon: Icon, label, sub }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center justify-between p-3 rounded-2xl bg-[var(--color-bg-subtle)] hover:bg-[var(--color-primary-light)] hover:border-[var(--color-primary)]/30 border border-[var(--color-border-subtle)] transition-all group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-[var(--color-primary-light)] flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-[var(--color-primary)]" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-[var(--color-text-main)] block truncate">{label}</span>
                    <span className="text-[11px] text-[var(--color-text-light)] block truncate">{sub}</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[var(--color-text-light)] group-hover:text-[var(--color-primary)] transition-colors shrink-0 ml-2" />
              </Link>
            ))}
          </div>

          {inquiries.length > 0 && (
            <div className="mt-4 pt-4 border-t border-[var(--color-border-subtle)]">
              <h4 className="text-xs font-bold text-[var(--color-text-muted)] mb-2">Latest Inquiries</h4>
              <div className="space-y-2">
                {inquiries.slice(0, 3).map((inq, i) => (
                  <div key={i} className="text-xs p-2.5 rounded-xl bg-[var(--color-bg-subtle)] flex items-center justify-between">
                    <span className="font-semibold text-[var(--color-text-main)] truncate">{inq.name}</span>
                    <span className="text-[var(--color-text-light)] font-mono text-[11px] shrink-0 ml-2">{inq.phone}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
