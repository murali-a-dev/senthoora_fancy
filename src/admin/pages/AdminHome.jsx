import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Boxes,
  Package,
  Sparkles,
  ArrowRight,
  PlusCircle,
  Eye,
  MessageSquare,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { inventoryApi, inquiryApi } from '../../api/client';
import { useCompany } from '../../context/CompanyContext';

export default function AdminHome() {
  const { companyDetails } = useCompany();
  const [products, setProducts] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [prodRes, inqRes] = await Promise.all([
          inventoryApi.getAll().catch(() => ({ success: false, data: [] })),
          inquiryApi.getAll().catch(() => ({ success: false, data: [] })),
        ]);

        if (prodRes.success && Array.isArray(prodRes.data)) {
          setProducts(prodRes.data);
        }
        if (inqRes.success && Array.isArray(inqRes.data)) {
          setInquiries(inqRes.data);
        }
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const featuredCount = products.filter((p) => p.featured).length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-rose-600 via-rose-700 to-pink-600 text-white shadow-xl shadow-rose-950/10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full">
              Store Administrator Overview
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold leading-tight">
              Welcome to {companyDetails.shopName}
            </h1>
            <p className="text-xs sm:text-sm text-rose-100 max-w-xl">
              Manage your showcase collections, update inventory rates, review customer product inquiries, and customize store information.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/admin/inventory"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold text-rose-900 bg-white hover:bg-rose-50 transition-colors shadow-sm"
            >
              <PlusCircle className="w-4 h-4 text-rose-600" />
              <span>Manage Inventory</span>
            </Link>
            <Link
              to="/"
              target="_blank"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold text-white bg-rose-800/80 hover:bg-rose-800 border border-white/20 transition-colors"
            >
              <Eye className="w-4 h-4" />
              <span>Live Website</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-rose-100/80 dark:border-stone-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-stone-800 flex items-center justify-center text-rose-600 dark:text-rose-400">
            <Boxes className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-stone-500 dark:text-stone-400">Total Showcase Items</span>
            <h3 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100 m-0">
              {loading ? '...' : products.length}
            </h3>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-rose-100/80 dark:border-stone-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-stone-800 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-stone-500 dark:text-stone-400">Featured On Home</span>
            <h3 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100 m-0">
              {loading ? '...' : featuredCount}
            </h3>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-rose-100/80 dark:border-stone-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-stone-800 flex items-center justify-center text-purple-600 dark:text-purple-400">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-stone-500 dark:text-stone-400">Showcase Categories</span>
            <h3 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100 m-0">
              {companyDetails.categories.length - 1}
            </h3>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-rose-100/80 dark:border-stone-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-stone-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-stone-500 dark:text-stone-400">Customer Inquiries</span>
            <h3 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100 m-0">
              {loading ? '...' : inquiries.length}
            </h3>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Recent Showcase Items & Quick Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Quick Product Overview */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-white dark:bg-stone-900 border border-rose-100/80 dark:border-stone-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
            <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100 m-0">
              Latest Inventory Items
            </h3>
            <Link
              to="/admin/inventory"
              className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
            >
              <span>Manage in Inventory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {products.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-700/60"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={item.photo || item.image}
                    alt={item.name}
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 m-0 line-clamp-1">
                      {item.name}
                    </h4>
                    <span className="text-[11px] text-stone-500 dark:text-stone-400 capitalize">
                      {item.category} • {item.rateDisplay || `₹${item.rate}`}
                    </span>
                  </div>
                </div>
                {item.featured && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                    Featured
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Quick Action Hub & Navigation */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-rose-100/80 dark:border-stone-800 shadow-xs space-y-4">
            <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100 m-0">
              Admin Showcase Navigation
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Jump directly into managing specific sections of your public showcase website.
            </p>

            <div className="space-y-2.5 pt-2">
              <Link
                to="/admin/products"
                className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 dark:bg-stone-800 hover:bg-rose-50 dark:hover:bg-stone-700 transition-colors text-xs font-bold text-stone-800 dark:text-stone-200"
              >
                <div className="flex items-center gap-3">
                  <Package className="w-4 h-4 text-rose-500" />
                  <span>Products Showcase Manager</span>
                </div>
                <ArrowRight className="w-4 h-4 text-stone-400" />
              </Link>

              <Link
                to="/admin/inventory"
                className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 dark:bg-stone-800 hover:bg-rose-50 dark:hover:bg-stone-700 transition-colors text-xs font-bold text-stone-800 dark:text-stone-200"
              >
                <div className="flex items-center gap-3">
                  <Boxes className="w-4 h-4 text-rose-500" />
                  <span>Inventory CRUD & Cloudinary Uploads</span>
                </div>
                <ArrowRight className="w-4 h-4 text-stone-400" />
              </Link>

              <Link
                to="/admin/about"
                className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 dark:bg-stone-800 hover:bg-rose-50 dark:hover:bg-stone-700 transition-colors text-xs font-bold text-stone-800 dark:text-stone-200"
              >
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-4 h-4 text-rose-500" />
                  <span>Store Details, Contacts & Story</span>
                </div>
                <ArrowRight className="w-4 h-4 text-stone-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
