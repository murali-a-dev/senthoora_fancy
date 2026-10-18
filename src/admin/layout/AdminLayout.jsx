import { useState, useEffect } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Info,
  Boxes,
  Globe,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useCompany } from '../../context/CompanyContext';
import ThemeToggle from '../../components/common/ThemeToggle';
import AdminPinModal from '../components/AdminPinModal';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated, logout } = useAdminAuth();
  const { companyDetails } = useCompany();
  const navigate = useNavigate();

  // Close sidebar on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && sidebarOpen) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sidebarOpen]);

  // Admin navigation items: Home, Products, About (Store Details), Inventory
  const adminNavItems = [
    { to: '/admin', label: 'Home', icon: LayoutDashboard, end: true },
    { to: '/admin/products', label: 'Products', icon: Package },
    { to: '/admin/about', label: 'About & Store Details', icon: Info },
    { to: '/admin/inventory', label: 'Inventory', icon: Boxes },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-stone-100/70 dark:bg-stone-950 flex flex-col md:flex-row transition-colors duration-300">
      {/* PIN Authentication Modal overlay when not logged in */}
      <AdminPinModal isOpen={!isAuthenticated} />

      {/* Backdrop for Mobile Sidebar */}
      {sidebarOpen && (
        <div
          role="presentation"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-2xs md:hidden"
        />
      )}

      {/* Admin Sidebar */}
      <aside
        aria-label="Admin Navigation Sidebar"
        className={`fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-white dark:bg-stone-900 border-r border-rose-100/80 dark:border-stone-800 p-5 flex flex-col justify-between transition-transform duration-300 shadow-xl md:shadow-none ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="space-y-6">
          {/* Admin Header with Logo from companyDetails */}
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-stone-800 border border-rose-200 dark:border-stone-700 p-1 flex items-center justify-center">
                <img src={companyDetails.logo} alt="Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h2 className="font-serif text-sm font-bold text-stone-900 dark:text-stone-100 leading-tight m-0">
                  {companyDetails.shopName}
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                  Admin Control Panel
                </span>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Admin Navigation Menu (Home, Products, About, Contact, Inventory) */}
          <nav aria-label="Admin Sections" className="space-y-1.5 pt-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 px-3 block mb-2">
              Management Menu
            </span>
            {adminNavItems.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                    isActive
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                      : 'text-stone-600 dark:text-stone-400 hover:bg-rose-50 dark:hover:bg-stone-800/80 hover:text-rose-600 dark:hover:text-rose-400'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Bottom Actions: View Store, Theme Toggle & Logout */}
        <div className="pt-4 border-t border-stone-100 dark:border-stone-800 space-y-2">
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-xs text-stone-500 font-medium">Appearance</span>
            <ThemeToggle />
          </div>

          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <Globe className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Open Public Website</span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Sign Out of Admin</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Top Header */}
        <header className="md:hidden sticky top-0 z-30 bg-white dark:bg-stone-900 border-b border-rose-100 dark:border-stone-800 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 rounded-xl text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
              aria-label="Open navigation menu"
              aria-expanded={sidebarOpen}
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="font-serif text-sm font-bold text-stone-900 dark:text-stone-100">
              Admin Dashboard
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </header>

        {/* Child Pages Router Outlet */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
