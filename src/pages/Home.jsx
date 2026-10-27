import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, ArrowRight, MessageCircle, MapPin, Clock,
  ShieldCheck, Crown, Gem, CircleDot, ShoppingBag, Gift, Flame,
} from 'lucide-react';
import { useCompany } from '../context/CompanyContext';
import { inventoryApi } from '../api/client';
import { usePageMeta } from '../hooks/usePageMeta';
import ProductCard from '../components/common/ProductCard';
import ProductSkeletonCard from '../components/common/ProductSkeletonCard';
import ProductModal from '../components/common/ProductModal';
import ImageWithFallback from '../components/common/ImageWithFallback';

const ICON_MAP = { CircleDot, Gem, Sparkles, Crown, ShoppingBag, Gift, Flame };

export default function Home() {
  const { companyDetails, getWhatsAppUrl } = useCompany();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(''); // FIX: surface errors instead of swallowing them
  const [selectedProduct, setSelectedProduct] = useState(null);

  // ✅ FIX: Per-page SEO title and meta description
  usePageMeta(
    `${companyDetails.shopName} | Bridal Bangles & Jewelry, Erode`,
    `Discover bridal bangles, antique jewelry, cosmetics and gifts at ${companyDetails.shopName} in ${companyDetails.address?.city || 'Erode'}, Tamil Nadu. Visit our showroom or WhatsApp for inquiries.`
  );

  useEffect(() => {
    async function loadShowcase() {
      try {
        const res = await inventoryApi.getAll();
        if (res.success && Array.isArray(res.data)) {
          const featured = res.data.filter((i) => i.featured);
          setFeaturedProducts(featured.length > 0 ? featured.slice(0, 8) : res.data.slice(0, 8));
          const counts = {};
          res.data.forEach((i) => {
            const c = (i.category || '').toLowerCase();
            counts[c] = (counts[c] || 0) + 1;
          });
          setCategoryCounts(counts);
        } else {
          // ✅ FIX: was 'catch { /* silent */ }' — now surfaces the failure
          setLoadError('Could not load featured products.');
        }
      } catch (err) {
        console.error('Failed to load showcase:', err);
        setLoadError('Could not connect to the showcase server.');
      } finally {
        setLoading(false);
      }
    }
    loadShowcase();
  }, []);

  const showroomHours = companyDetails?.businessHours?.[0]?.hours || '09:30 AM – 09:30 PM';

  // ✅ FIX: guard against missing primaryPhoneRaw (empty tel: link was broken)
  const primaryPhoneRaw = companyDetails?.contact?.primaryPhoneRaw || '';
  const primaryPhone = companyDetails?.contact?.primaryPhone || 'Call Us';

  return (
    <div className="flex flex-col min-h-screen">

      {/* ── Hero ── */}
      <section
        className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24 bg-gradient-to-br from-[var(--color-bg-base)] via-[var(--color-primary-light)]/30 to-[var(--color-bg-base)] border-b border-[var(--color-border)]"
      >
        <div aria-hidden="true" className="absolute top-0 right-0 w-96 h-96 bg-[var(--color-primary-pastel)]/20 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">

            {/* Left */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase bg-[var(--color-primary-light)] text-[var(--color-primary)] border border-[var(--color-border)]">
                <Crown className="w-3.5 h-3.5 text-[var(--color-accent-gold)]" aria-hidden="true" />
                <span>Premier Bridal &amp; Fancy Showcase</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[var(--color-text-main)] leading-[1.12]">
                Adorn Every Moment with{' '}
                <span className="text-[var(--color-primary)]">Timeless Elegance</span>
              </h1>

              <p className="text-sm sm:text-base lg:text-lg text-[var(--color-text-muted)] max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Discover an exquisite showcase of bridal bangles, matte gold antique jewelry,
                cosmetics, clutches, and celebratory gifts at{' '}
                <strong className="font-semibold text-[var(--color-text-main)]">
                  {companyDetails.shopName}
                </strong>.
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-1">
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] active:scale-98 transition-all shadow-md shadow-[var(--color-primary)]/25 cursor-pointer"
                >
                  <span>Explore Showcase</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href={getWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold text-[var(--color-emerald)] bg-[var(--color-emerald-light)] hover:opacity-80 border border-[var(--color-emerald)]/20 transition-opacity cursor-pointer shadow-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp Inquiry
                </a>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-semibold text-[var(--color-text-muted)] hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-text-main)] transition-colors"
                >
                  <MapPin className="w-4 h-4 text-[var(--color-primary)]" />
                  <span>Visit Showroom</span>
                </Link>
              </div>

              <div className="pt-5 border-t border-[var(--color-border)] flex flex-wrap items-center justify-center lg:justify-start gap-5 text-xs text-[var(--color-text-light)]">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[var(--color-emerald)]" aria-hidden="true" />
                  <span>Open: {showroomHours}</span>
                </div>
                <span aria-hidden="true" className="hidden sm:block opacity-30">•</span>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[var(--color-accent-gold)]" aria-hidden="true" />
                  <span>Authentic Quality &amp; Custom Bridal Sizing</span>
                </div>
              </div>
            </div>

            {/* Right — Hero Card */}
            {/* ✅ FIX: Replace hardcoded Unsplash stock photo with the store's own logo/branding card.
                Replace the src below with an actual store product Cloudinary URL once available. */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="rounded-3xl overflow-hidden shadow-2xl border-2 border-[var(--color-border)] bg-[var(--color-bg-surface)] group">
                  <ImageWithFallback
                    src={companyDetails.logo || '/logo_2.png'}
                    alt="Sri Senthoora Fancy Store — Bridal Bangle and Jewelry Showcase"
                    aspectRatioClass="aspect-4/3 sm:aspect-square"
                    className="group-hover:scale-105 transition-transform duration-700 object-contain p-8 bg-[var(--color-primary-light)]"
                    fetchPriority="high"  // ✅ FIX: LCP element gets priority loading hint
                  />
                  <div className="p-5 bg-[var(--color-bg-surface)] border-t border-[var(--color-border-subtle)]">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-primary)] block">
                          Bridal Boutique Special
                        </span>
                        <h2 className="font-serif text-base font-bold text-[var(--color-text-main)] m-0">
                          Velvet Chuda &amp; Matte Temple Sets
                        </h2>
                      </div>
                      <Link
                        to="/products?category=bangles"
                        className="p-2 rounded-xl bg-[var(--color-primary-light)] text-[var(--color-primary)] hover:bg-[var(--color-primary-pastel)] transition-colors"
                        aria-label="View bridal bangles"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section
        className="py-14 sm:py-16 bg-[var(--color-bg-surface)] border-b border-[var(--color-border)]"
        aria-labelledby="categories-heading"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary)]">
              Curated Departments
            </span>
            <h2
              id="categories-heading"
              className="font-serif text-2xl sm:text-3xl font-bold text-[var(--color-text-main)] mt-1"
            >
              Explore by Collection
            </h2>
            <p className="text-xs sm:text-sm text-[var(--color-text-muted)] mt-2">
              Browse our diverse showcase categories crafted for weddings, festivals, and celebrations.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {/* ✅ FIX: Guard against companyDetails.categories being undefined on first render */}
            {(companyDetails.categories || []).filter((c) => c.id !== 'all').map((cat) => {
              const Icon = ICON_MAP[cat.icon] || Sparkles;
              const count =
                categoryCounts[cat.id.toLowerCase()] !== undefined
                  ? `${categoryCounts[cat.id.toLowerCase()]} Designs`
                  : `${cat.count} Designs`;
              return (
                <Link
                  key={cat.id}
                  to={`/products?category=${cat.id}`}
                  className="group p-4 sm:p-5 rounded-2xl bg-[var(--color-bg-subtle)] border border-[var(--color-border)] hover:border-[var(--color-primary)]/50 hover:bg-[var(--color-primary-light)] hover:shadow-md transition-all duration-200 flex flex-col items-center text-center"
                >
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[var(--color-bg-surface)] group-hover:bg-[var(--color-primary-pastel)] flex items-center justify-center text-[var(--color-primary)] transition-colors mb-3">
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-[var(--color-text-main)] group-hover:text-[var(--color-primary)] transition-colors m-0">
                    {cat.name}
                  </h3>
                  <span className="text-[11px] text-[var(--color-text-light)] mt-0.5">{count}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Featured Products ── */}
      <section
        className="py-14 sm:py-16 bg-[var(--color-bg-base)] border-b border-[var(--color-border)]"
        aria-labelledby="featured-heading"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8 sm:mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary)]">
                Showroom Highlights
              </span>
              <h2
                id="featured-heading"
                className="font-serif text-2xl sm:text-3xl font-bold text-[var(--color-text-main)] mt-1"
              >
                Featured Product Showcase
              </h2>
              <p className="text-xs sm:text-sm text-[var(--color-text-muted)] mt-1">
                A curated glimpse of our most admired collections.
              </p>
            </div>
            <Link
              to="/products"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-[var(--color-primary)] hover:underline shrink-0"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[1, 2, 3, 4].map((i) => <ProductSkeletonCard key={i} />)}
            </div>
          ) : loadError ? (
            // ✅ FIX: Show error state instead of silent empty screen
            <div className="text-center py-16 text-[var(--color-text-light)] space-y-2">
              <Sparkles className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm text-[var(--color-text-muted)]">{loadError}</p>
              <p className="text-xs">Please check your internet connection or try refreshing.</p>
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="text-center py-16 text-[var(--color-text-light)]">
              <Sparkles className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">Products will appear here once added via Admin.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {featuredProducts.map((p) => (
                <ProductCard key={p.id} product={p} onQuickView={setSelectedProduct} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Why Choose Us ── */}
      <section
        className="py-14 sm:py-16 bg-[var(--color-bg-surface)]"
        aria-labelledby="why-heading"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary)]">
              The Sri Senthoora Experience
            </span>
            <h2
              id="why-heading"
              className="font-serif text-2xl sm:text-3xl font-bold text-[var(--color-text-main)] mt-1"
            >
              Why Customers Love Visiting Us
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {(companyDetails.highlights || []).map((item, idx) => {
              const Icon = ICON_MAP[item.icon] || Sparkles;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-3xl bg-[var(--color-bg-subtle)] border border-[var(--color-border)] shadow-[var(--color-card-shadow)] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className="w-11 h-11 rounded-2xl bg-[var(--color-primary-light)] flex items-center justify-center text-[var(--color-primary)] mb-4">
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <h3 className="font-serif text-base font-bold text-[var(--color-text-main)] mb-2 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[var(--color-text-muted)] leading-relaxed m-0">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-14 sm:py-16 bg-gradient-to-r from-[var(--color-primary-hover)] via-[var(--color-primary)] to-[var(--color-primary-hover)] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-2.5 text-center lg:text-left">
              <span className="text-xs font-bold tracking-wider uppercase text-white/70">
                Experience Collections in Person
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                Visit {companyDetails.shopName} Today
              </h2>
              <p className="text-sm text-white/80 max-w-2xl leading-relaxed">
                Bring your wedding saree or festive attire for customized color-matching bangle sets
                and personalized bridal consultation.
              </p>
            </div>
            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-center">
              <Link
                to="/contact"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold text-[var(--color-primary-hover)] bg-white hover:bg-rose-50 transition-colors shadow-sm"
              >
                <MapPin className="w-4 h-4" />
                Get Store Directions
              </Link>

              {/* ✅ FIX: Guard against empty primaryPhoneRaw producing a broken tel: link */}
              {primaryPhoneRaw ? (
                <a
                  href={`tel:${primaryPhoneRaw}`}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold text-white bg-white/15 hover:bg-white/25 border border-white/25 transition-colors"
                >
                  Call {primaryPhone}
                </a>
              ) : (
                <Link
                  to="/contact"
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold text-white bg-white/15 hover:bg-white/25 border border-white/25 transition-colors"
                >
                  Contact Us
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {selectedProduct && (
        <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </div>
  );
}
