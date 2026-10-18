import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { CompanyProvider } from './context/CompanyContext';
import ErrorBoundary from './components/common/ErrorBoundary';

import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';

// Public Pages (Eagerly loaded for fast public first contentful paint)
import Home from './pages/Home';
import Products from './pages/Products';
import About from './pages/About';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';

// Admin Layout & Pages (Code-split to reduce public bundle size)
const AdminLayout = lazy(() => import('./admin/layout/AdminLayout'));
const AdminHome = lazy(() => import('./admin/pages/AdminHome'));
const AdminProducts = lazy(() => import('./admin/pages/AdminProducts'));
const AdminAbout = lazy(() => import('./admin/pages/AdminAbout'));
const AdminInventory = lazy(() => import('./admin/pages/AdminInventory'));

// Public Storefront Layout Wrapper
function PublicLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-stone-50/70 dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors duration-300">
      <Navbar />
      <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

// Admin Loading Spinner fallback
function AdminLoadingFallback() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-stone-100 dark:bg-stone-950 text-stone-700 dark:text-stone-300">
      <div className="w-10 h-10 border-3 border-rose-500/30 border-t-rose-600 rounded-full animate-spin mb-4" />
      <p className="font-serif text-sm font-semibold tracking-wide">Loading Store Administration...</p>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <AdminAuthProvider>
            <CompanyProvider>
              <BrowserRouter>
                <Routes>
                  {/* Public Showcase Routes (Strictly NO Inventory link) */}
                  <Route element={<PublicLayout />}>
                    <Route index element={<Home />} />
                    <Route path="products" element={<Products />} />
                    <Route path="about" element={<About />} />
                    <Route path="contact" element={<Contact />} />
                    <Route path="*" element={<NotFound />} />
                  </Route>

                  {/* Admin Portal Routes (Lazy loaded & wrapped in dedicated ErrorBoundary) */}
                  <Route
                    path="/admin"
                    element={
                      <ErrorBoundary>
                        <Suspense fallback={<AdminLoadingFallback />}>
                          <AdminLayout />
                        </Suspense>
                      </ErrorBoundary>
                    }
                  >
                    <Route index element={<AdminHome />} />
                    <Route path="products" element={<AdminProducts />} />
                    <Route path="about" element={<AdminAbout />} />
                    {/* Redirect deprecated /admin/contact to /admin/about */}
                    <Route path="contact" element={<Navigate to="/admin/about" replace />} />
                    <Route path="inventory" element={<AdminInventory />} />
                  </Route>
                </Routes>
              </BrowserRouter>
            </CompanyProvider>
          </AdminAuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
