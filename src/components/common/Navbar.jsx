import { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Menu, X, Sparkles, Phone, Lock, ChevronRight } from 'lucide-react';
import { useCompany } from '../../context/CompanyContext';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const { companyDetails, getWhatsAppUrl } = useCompany();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { to: '/', label: 'Home', end: true },
    { to: '/products', label: 'Products' },
    { to: '/about', label: 'About Store' },
    { to: '/contact', label: 'Contact Us' },
  ];

  return (
    <>
      {/* Accessible Skip Link */}
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>

      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${scrolled
            ? 'glass-nav shadow-xs'
            : 'bg-stone-50/95 dark:bg-stone-950/90 backdrop-blur-md border-b border-rose-100/70 dark:border-stone-800'
          }`}
      >
        {/* Top Mini Announcement Bar */}
        <div className="bg-gradient-to-r from-rose-700 via-rose-600 to-rose-700 text-white text-[11px] sm:text-xs py-1.5 px-4 font-medium">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 truncate">
              <span className="flex h-2 w-2 rounded-full bg-amber-300 animate-ping shrink-0" aria-hidden="true"></span>
              <span className="font-semibold tracking-wide truncate">
                Special Bridal Bangles & 1-Gram Antique Jewelry
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-4 text-rose-50 shrink-0">
              <a
                href={`tel:${companyDetails.contact.primaryPhoneRaw}`}
                className="hover:text-white transition-colors flex items-center gap-1"
                aria-label={`Call our shop at ${companyDetails.contact.primaryPhone}`}
              >
                <Phone className="w-3 h-3" />
                <span>{companyDetails.contact.primaryPhone}</span>
              </a>
              <span>•</span>
              <span className="italic">{companyDetails.businessHours[0].hours}</span>
            </div>
          </div>
        </div>

        {/* Main Navigation Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18 sm:h-20">
            {/* Store Branding (retrieved from companyDetails) */}
            <Link to="/" className="flex items-center gap-3 group text-decoration-none" aria-label="Sri Senthoora Fancy Store - Return to Home">
              <div className="relative">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-rose-50 to-amber-50/60 dark:from-stone-900 dark:to-stone-800 border border-rose-200/80 dark:border-stone-700 flex items-center justify-center p-1.5 shadow-xs group-hover:scale-105 transition-transform duration-300">
                  <img
                    src={companyDetails.logo}
                    alt=""
                    aria-hidden="true"
                    className="w-full h-full object-contain"
                  />
                </div>
                <Sparkles className="w-3.5 h-3.5 text-amber-500 absolute -top-1 -right-1" aria-hidden="true" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-lg sm:text-xl font-bold tracking-tight text-stone-900 dark:text-stone-50 leading-tight">
                  {companyDetails.shopName}
                </span>
                <span className="text-[11px] font-medium text-rose-700 dark:text-rose-400 tracking-wider">
                  {companyDetails.shopNameTamil}
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1.5 lg:gap-2" aria-label="Main Navigation">
              {navLinks.map(({ to, label, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive
                      ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200/70 dark:border-rose-900/50 shadow-xs'
                      : 'text-stone-700 dark:text-stone-300 hover:text-rose-700 dark:hover:text-rose-400 hover:bg-stone-100/70 dark:hover:bg-stone-900/60'
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </nav>

            {/* Right Controls: Theme Toggle & Admin Portal Link */}
            <div className="hidden sm:flex items-center gap-3">
              <ThemeToggle />

              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Inquire on WhatsApp about our products"
                className="hidden lg:inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors shadow-xs"
              >
                <span>WhatsApp Inquiry</span>
              </a>

              <Link
                to="/admin"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800/80 transition-colors border border-transparent hover:border-stone-200 dark:hover:border-stone-700"
                title="Admin Portal Access"
                aria-label="Admin Portal Access"
              >
                <Lock className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                <span>Admin</span>
              </Link>
            </div>

            {/* Mobile Actions Hamburger */}
            <div className="flex sm:hidden items-center gap-2">
              <ThemeToggle />
              <button
                type="button"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-expanded={mobileOpen}
                aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
                className="p-2 rounded-xl text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              >
                {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      {mobileOpen && (
        <div
          className="sm:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setMobileOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation Drawer"
            className="w-4/5 max-w-sm h-full bg-white dark:bg-stone-900 p-6 flex flex-col justify-between shadow-2xl border-l border-rose-100 dark:border-stone-800 animate-in slide-in-from-right duration-200"
          >
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-stone-100 dark:border-stone-800">
                <div className="flex items-center gap-2.5">
                  <img src={companyDetails.logo} alt="" aria-hidden="true" className="w-9 h-9 object-contain" />
                  <div>
                    <h3 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100 leading-tight m-0">
                      {companyDetails.shopName}
                    </h3>
                    <p className="text-[10px] text-rose-700 dark:text-rose-400 font-semibold m-0">
                      {companyDetails.shopNameTamil}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                  className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Navigation List (strictly NO Inventory) */}
              <nav className="mt-6 flex flex-col gap-2" aria-label="Mobile Navigation">
                {navLinks.map(({ to, label, end }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all ${isActive
                        ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-900'
                        : 'text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
                      }`
                    }
                  >
                    <span>{label}</span>
                    <ChevronRight className="w-4 h-4 text-stone-400" />
                  </NavLink>
                ))}
              </nav>
            </div>

            <div className="pt-6 border-t border-stone-100 dark:border-stone-800 space-y-3">
              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800"
              >
                <span>WhatsApp Inquiry</span>
              </a>

              <Link
                to="/admin"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200"
              >
                <Lock className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                <span>Admin Panel</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
