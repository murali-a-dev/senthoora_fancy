import { useState, useEffect } from 'react';
import { NavLink, Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, Info, Boxes, Globe, LogOut, Menu, X, ShieldCheck, ChevronRight } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useCompany } from '../../context/CompanyContext';
import ThemeToggle from '../../components/common/ThemeToggle';
import AdminPinModal from '../components/AdminPinModal';

const NAV = [
  { to: '/admin',           label: 'Dashboard',      icon: LayoutDashboard, end: true  },
  { to: '/admin/products',  label: 'Products',       icon: Package,         end: false },
  { to: '/admin/inventory', label: 'Inventory',      icon: Boxes,           end: false },
  { to: '/admin/about',     label: 'Store Settings', icon: Info,            end: false },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated, logout }   = useAdminAuth();
  const { companyDetails }            = useCompany();
  const navigate                      = useNavigate();
  const location                      = useLocation();

  // Close sidebar drawer on route navigation
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Close on Escape key
  useEffect(() => {
    if (!sidebarOpen) return;
    const h = (e) => { if (e.key === 'Escape') setSidebarOpen(false); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [sidebarOpen]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  const navClass = ({ isActive }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
      isActive
        ? 'bg-[var(--color-primary)] text-white shadow-md shadow-[var(--color-primary)]/20'
        : 'text-[var(--color-text-muted)] hover:bg-[var(--color-primary-light)] hover:text-[var(--color-primary)]'
    }`;

  const getPageTitle = () => {
    const p = location.pathname;
    if (p === '/admin') return 'Dashboard';
    if (p.startsWith('/admin/products')) return 'Products';
    if (p.startsWith('/admin/inventory')) return 'Inventory';
    if (p.startsWith('/admin/about')) return 'Store Settings';
    return 'Admin';
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-base)] flex flex-col md:flex-row transition-colors duration-300 relative overflow-x-hidden">
      {/* PIN Authentication Modal (renders at z-[100] with full backdrop) */}
      <AdminPinModal isOpen={!isAuthenticated} />

      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          role="presentation"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden animate-fade-in"
        />
      )}

      {/* Sidebar Navigation (Desktop sticky sidebar & Mobile off-canvas drawer) */}
      <aside
        aria-label="Admin Navigation"
        className={`fixed md:sticky top-0 left-0 z-50 md:z-40 h-[100dvh] md:h-screen w-72 max-w-[85vw] md:w-64 bg-[var(--color-bg-surface)] border-r border-[var(--color-border)] p-4 sm:p-5 flex flex-col justify-between transition-transform duration-300 shadow-2xl md:shadow-none overflow-y-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${!isAuthenticated ? 'filter blur-md pointer-events-none select-none opacity-40' : ''}`}
      >
        <div className="space-y-6">
          {/* Brand header */}
          <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border)] md:border-b-0">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-light)] border border-[var(--color-border)] p-1.5 flex items-center justify-center shrink-0">
                <img src={companyDetails.logo} alt="Logo" className="w-full h-full object-contain" />
              </div>
              <div className="min-w-0">
                <h2 className="font-serif text-sm font-bold text-[var(--color-text-main)] leading-tight truncate m-0">
                  {companyDetails.shopName}
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-primary)]">
                  Admin Panel
                </span>
              </div>
            </Link>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-1.5 rounded-xl text-[var(--color-text-light)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-subtle)] cursor-pointer"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav links */}
          <nav aria-label="Admin sections" className="space-y-1.5 pt-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-text-light)] px-3 block mb-2">
              Management
            </span>
            {NAV.map(({ to, label, icon: Icon, end }) => (
              <NavLink key={to} to={to} end={end} onClick={() => setSidebarOpen(false)} className={navClass}>
                <Icon className="w-4 h-4 shrink-0" />
                <span className="flex-1">{label}</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-40 md:hidden" />
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer Controls */}
        <div className="pt-4 border-t border-[var(--color-border)] space-y-2.5 mt-6">
          <div className="flex items-center justify-between px-2 mb-1">
            <span className="text-xs text-[var(--color-text-light)] font-medium">Appearance</span>
            <ThemeToggle />
          </div>
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-subtle)] transition-colors"
          >
            <Globe className="w-4 h-4 text-[var(--color-emerald)] shrink-0" />
            <span>Open Public Website</span>
          </Link>
          <button
            type="button"
            onClick={() => { logout(); navigate('/'); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${!isAuthenticated ? 'filter blur-md pointer-events-none select-none opacity-40' : ''}`}>
        {/* Mobile Header Bar */}
        <header className="md:hidden sticky top-0 z-30 bg-[var(--color-bg-surface)]/95 backdrop-blur-md border-b border-[var(--color-border)] px-3.5 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-subtle)] transition-colors cursor-pointer"
              aria-label="Open sidebar menu"
              aria-expanded={sidebarOpen}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-primary)] block leading-none">
                Admin Panel
              </span>
              <h2 className="font-serif text-sm font-bold text-[var(--color-text-main)] truncate m-0 leading-tight">
                {getPageTitle()}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Link
              to="/"
              target="_blank"
              rel="noopener noreferrer"
              title="Open public website"
              className="p-2 rounded-xl text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-subtle)] transition-colors"
            >
              <Globe className="w-4 h-4 text-[var(--color-emerald)]" />
            </Link>
            <ThemeToggle />
          </div>
        </header>

        {/* Content Outlet (pb-24 on mobile prevents bottom navigation bar from overlapping content) */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 pb-24 md:pb-8 overflow-y-auto">
          {isAuthenticated ? (
            <Outlet />
          ) : (
            <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-8 text-[var(--color-text-light)]">
              <ShieldCheck className="w-10 h-10 text-[var(--color-primary)] mb-3 opacity-60" />
              <h3 className="font-serif text-lg font-bold text-[var(--color-text-main)]">Admin Portal Locked</h3>
              <p className="text-xs text-[var(--color-text-light)] mt-1 max-w-sm">
                Please enter your store PIN in the modal to access and manage the showcase.
              </p>
            </div>
          )}
        </main>

        {/* Dedicated Mobile Bottom Navigation Bar (md:hidden) */}
        {isAuthenticated && (
          <nav
            aria-label="Mobile Navigation"
            className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-[var(--color-bg-surface)]/95 backdrop-blur-md border-t border-[var(--color-border)] px-1.5 py-1.5 flex items-center justify-around shadow-[0_-4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.3)]"
          >
            {NAV.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all group ${
                    isActive
                      ? 'text-[var(--color-primary)] font-bold'
                      : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div
                      className={`p-1.5 rounded-xl transition-all ${
                        isActive
                          ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)] shadow-xs'
                          : 'group-hover:bg-[var(--color-bg-subtle)]'
                      }`}
                    >
                      <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                    </div>
                    <span className="text-[10px] font-semibold tracking-tight mt-0.5 truncate max-w-[68px]">
                      {label}
                    </span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        )}
      </div>
    </div>
  );
}
