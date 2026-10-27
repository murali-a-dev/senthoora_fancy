import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, Crown, ChevronRight } from 'lucide-react';
import { useCompany } from '../../context/CompanyContext';
import ThemeToggle from './ThemeToggle';

const NAV_LINKS = [
  { to: '/',         label: 'Home',     end: true  },
  { to: '/products', label: 'Products', end: false },
  { to: '/about',    label: 'About',    end: false },
  { to: '/contact',  label: 'Contact',  end: false },
];

export default function Navbar() {
  const { companyDetails } = useCompany();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled]     = useState(false);
  const location  = useLocation();
  const drawerRef = useRef(null);

  // Scroll shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close drawer on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  // Esc key close
  useEffect(() => {
    if (!mobileOpen) return;
    const handler = (e) => { if (e.key === 'Escape') setMobileOpen(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [mobileOpen]);

  // Body scroll lock when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const navLinkClass = ({ isActive }) =>
    `relative text-sm font-semibold transition-colors duration-150 px-1 py-0.5
     after:absolute after:bottom-0 after:left-0 after:h-[2px] after:rounded-full
     after:transition-all after:duration-200
     ${isActive
       ? 'text-[var(--color-primary)] after:w-full after:bg-[var(--color-primary)]'
       : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] after:w-0 hover:after:w-full after:bg-[var(--color-primary)]'
     }`;

  return (
    <>
      <a href="#main-content" className="skip-to-content">Skip to content</a>

      <header
        className={`sticky top-0 z-40 glass-nav transition-shadow duration-200 ${scrolled ? 'shadow-md' : ''}`}
        role="banner"
      >
        <nav
          aria-label="Main navigation"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4"
        >
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 shrink-0 group"
            aria-label={`${companyDetails.shopName} – Go to homepage`}
          >
            <div className="w-9 h-9 rounded-xl bg-[var(--color-primary-light)] border border-[var(--color-border)] p-1 flex items-center justify-center overflow-hidden transition-transform duration-200 group-hover:scale-105">
              <img
                src={companyDetails.logo}
                alt=""
                aria-hidden="true"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <span className="font-serif text-xs sm:text-base font-bold text-[var(--color-text-main)] leading-tight block truncate max-w-[170px] sm:max-w-none">
                {companyDetails.shopName}
              </span>
              <span className="text-[10px] font-semibold text-[var(--color-primary)] tracking-wide leading-none hidden sm:block">
                {companyDetails.shopNameTamil}
              </span>
            </div>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map(({ to, label, end }) => (
              <NavLink key={to} to={to} end={end} className={navLinkClass}>
                {label}
              </NavLink>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2 shrink-0">
            <ThemeToggle />

            {/* Mobile Hamburger */}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={mobileOpen}
              aria-controls="mobile-drawer"
              className="md:hidden p-2 rounded-xl text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-subtle)] transition-colors cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          role="presentation"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-50 modal-backdrop md:hidden animate-fade-in"
        />
      )}

      {/* Mobile Drawer */}
      <div
        id="mobile-drawer"
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={`fixed top-0 right-0 z-50 h-full w-[82vw] max-w-xs bg-[var(--color-bg-surface)] border-l border-[var(--color-border)] shadow-2xl flex flex-col transition-transform duration-300 ease-out md:hidden ${
          mobileOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border-subtle)]">
          <Link to="/" className="flex items-center gap-2.5" onClick={() => setMobileOpen(false)}>
            <div className="w-8 h-8 rounded-lg bg-[var(--color-primary-light)] p-1 flex items-center justify-center">
              <img src={companyDetails.logo} alt="" className="w-full h-full object-contain" />
            </div>
            <span className="font-serif text-sm font-bold text-[var(--color-text-main)]">
              {companyDetails.shopName}
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation menu"
            className="p-2 rounded-xl text-[var(--color-text-light)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-subtle)] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Links */}
        <nav aria-label="Mobile navigation" className="flex-1 px-4 py-5 space-y-1 overflow-y-auto">
          {NAV_LINKS.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)] shadow-sm'
                    : 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-text-main)]'
                }`
              }
            >
              <span>{label}</span>
              <ChevronRight className="w-4 h-4 opacity-50" />
            </NavLink>
          ))}
        </nav>

        {/* Drawer Footer */}
        <div className="px-5 py-4 border-t border-[var(--color-border-subtle)] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--color-text-light)] font-medium">Appearance</span>
            <ThemeToggle />
          </div>
          <div className="flex items-center gap-2 px-1">
            <Crown className="w-3.5 h-3.5 text-[var(--color-accent-gold)]" />
            <span className="text-[11px] text-[var(--color-text-light)]">
              Est. {companyDetails.establishedYear}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
