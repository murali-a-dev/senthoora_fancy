import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { CompanyProvider } from './context/CompanyContext';
import ErrorBoundary from './components/common/ErrorBoundary';

import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';

import Home from './pages/Home';
const Products  = lazy(() => import('./pages/Products'));
const About     = lazy(() => import('./pages/About'));
const Contact   = lazy(() => import('./pages/Contact'));
const NotFound  = lazy(() => import('./pages/NotFound'));

const AdminLayout   = lazy(() => import('./admin/layout/AdminLayout'));
const AdminHome     = lazy(() => import('./admin/pages/AdminHome'));
const AdminProducts = lazy(() => import('./admin/pages/AdminProducts'));
const AdminAbout    = lazy(() => import('./admin/pages/AdminAbout'));
const AdminInventory= lazy(() => import('./admin/pages/AdminInventory'));

function PageFallback() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[var(--color-primary)]/20 border-t-[var(--color-primary)] rounded-full animate-spin" />
    </div>
  );
}

function PublicLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-bg-base)] text-[var(--color-text-main)] transition-colors duration-200">
      <Navbar />
      <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
        <Suspense fallback={<PageFallback />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

function AdminFallback() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[var(--color-bg-base)] text-[var(--color-text-muted)]">
      <div className="w-10 h-10 border-[3px] border-[var(--color-primary)]/20 border-t-[var(--color-primary)] rounded-full animate-spin mb-4" />
      <p className="font-serif text-sm font-semibold tracking-wide">Loading Store Administration…</p>
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
                  <Route element={<PublicLayout />}>
                    <Route index           element={<Home />}     />
                    <Route path="products" element={<Products />} />
                    <Route path="about"    element={<About />}    />
                    <Route path="contact"  element={<Contact />}  />
                    <Route path="*"        element={<NotFound />} />
                  </Route>

                  <Route path="/admin" element={
                    <ErrorBoundary>
                      <Suspense fallback={<AdminFallback />}>
                        <AdminLayout />
                      </Suspense>
                    </ErrorBoundary>
                  }>
                    <Route index              element={<AdminHome />}      />
                    <Route path="products"    element={<AdminProducts />}  />
                    <Route path="about"       element={<AdminAbout />}     />
                    <Route path="contact"     element={<Navigate to="/admin/about" replace />} />
                    <Route path="inventory"   element={<AdminInventory />} />
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
