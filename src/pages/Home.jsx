import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  MessageCircle,
  MapPin,
  Clock,
  ShieldCheck,
  Crown,
  Gem,
  CircleDot,
  ShoppingBag,
  Gift,
  Flame,
} from 'lucide-react';
import { useCompany } from '../context/CompanyContext';
import { inventoryApi } from '../api/client';
import ProductCard from '../components/common/ProductCard';
import ProductModal from '../components/common/ProductModal';
import ImageWithFallback from '../components/common/ImageWithFallback';

const CATEGORY_ICON_MAP = {
  CircleDot,
  Gem,
  Sparkles,
  Crown,
  ShoppingBag,
  Gift,
  Flame,
};

export default function Home() {
  const { companyDetails, getWhatsAppUrl } = useCompany();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    async function loadShowcase() {
      try {
        const res = await inventoryApi.getAll();
        if (res.success && Array.isArray(res.data)) {
          const featured = res.data.filter((item) => item.featured);
          setFeaturedProducts(featured.length > 0 ? featured.slice(0, 8) : res.data.slice(0, 8));

          // Calculate live product counts per category
          const counts = {};
          res.data.forEach((item) => {
            const cat = (item.category || '').toLowerCase();
            counts[cat] = (counts[cat] || 0) + 1;
          });
          setCategoryCounts(counts);
        }
      } catch (err) {
        console.error('Failed to load featured products:', err);
      } finally {
        setLoading(false);
      }
    }
    loadShowcase();
  }, []);

  const showroomHours = companyDetails?.businessHours?.[0]?.hours || '09:30 AM – 09:30 PM';

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-10 pb-16 lg:pt-16 lg:pb-20 bg-stone-50/80 dark:bg-stone-950 border-b border-rose-100/70 dark:border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column: Store Branding & Intro */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase bg-rose-100/90 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-900 shadow-xs">
                <Crown className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 fill-amber-500/20" aria-hidden="true" />
                <span>Premier Bridal & Fancy Showcase</span>
              </div>

              {/* Main Heading */}
              <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-stone-900 dark:text-stone-50 leading-[1.14]">
                Adorn Every Moment with{' '}
                <span className="text-rose-700 dark:text-rose-400">
                  Timeless Elegance
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-sm sm:text-base lg:text-lg text-stone-600 dark:text-stone-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Discover an exquisite showcase of bridal bangles, matte gold antique jewelry, cosmetics, clutches, and celebratory return gifts at{' '}
                <strong className="font-semibold text-stone-900 dark:text-stone-100">{companyDetails.shopName}</strong>.
              </p>

              {/* Showcase CTAs */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-1">
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 active:scale-98 transition-all shadow-sm cursor-pointer"
                >
                  <span>Explore Showcase Catalog</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href={getWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl text-xs sm:text-sm font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800 transition-colors shadow-xs"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp Inquiry</span>
                </a>

                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 px-4 py-3.5 rounded-2xl text-xs sm:text-sm font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                >
                  <MapPin className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  <span>Visit Showroom</span>
                </Link>
              </div>

              {/* Live Hours & Trust Indicators */}
              <div className="pt-6 border-t border-stone-200 dark:border-stone-800 flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 text-xs text-stone-600 dark:text-stone-400">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                  <span>Showroom Open: {showroomHours}</span>
                </div>
                <span className="hidden sm:inline" aria-hidden="true">•</span>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                  <span>Authentic Quality & Custom Bridal Sizing</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Showcase */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="rounded-3xl overflow-hidden shadow-xl border border-rose-100 dark:border-stone-800 bg-white dark:bg-stone-900 group">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80"
                    alt="Sri Senthoora Bridal Bangle and Jewelry Showcase"
                    aspectRatioClass="aspect-4/3 sm:aspect-square"
                    className="group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="p-5 bg-white dark:bg-stone-900 border-t border-stone-100 dark:border-stone-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 block">
                          Bridal Boutique Special
                        </span>
                        <h2 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100 m-0">
                          Velvet Chuda & Matte Temple Sets
                        </h2>
                      </div>
                      <Link
                        to="/products?category=bangles"
                        className="p-2 rounded-xl bg-rose-50 dark:bg-stone-800 text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-colors"
                        aria-label="View bridal bangles collection"
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

      {/* Curated Categories Strip */}
      <section className="py-12 sm:py-16 bg-white dark:bg-stone-900/60 border-b border-rose-100/60 dark:border-stone-800" aria-labelledby="departments-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              Curated Departments
            </span>
            <h2 id="departments-heading" className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100 mt-1">
              Explore by Collection
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-2">
              Browse our diverse showcase categories designed to accessorize your beauty for weddings, festivals, and celebrations.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3.5 sm:gap-5">
            {companyDetails.categories.filter((c) => c.id !== 'all').map((cat) => {
              const IconComponent = CATEGORY_ICON_MAP[cat.icon] || Sparkles;
              const countLabel =
                categoryCounts[cat.id.toLowerCase()] !== undefined
                  ? `${categoryCounts[cat.id.toLowerCase()]} Designs`
                  : `${cat.count} Designs`;

              return (
                <Link
                  key={cat.id}
                  to={`/products?category=${cat.id}`}
                  className="group p-4 sm:p-5 rounded-2xl bg-stone-50/70 dark:bg-stone-900 border border-stone-200/70 dark:border-stone-800 hover:border-rose-300 dark:hover:border-rose-900 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col items-center text-center"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-rose-50 dark:bg-stone-800 group-hover:bg-rose-100 dark:group-hover:bg-rose-950/60 flex items-center justify-center text-rose-600 dark:text-rose-400 transition-colors mb-2.5">
                    <IconComponent className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors m-0">
                    {cat.name}
                  </h3>
                  <span className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                    {countLabel}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Products Showcase */}
      <section className="py-14 sm:py-16 bg-stone-50/50 dark:bg-stone-950 border-b border-rose-100/60 dark:border-stone-800" aria-labelledby="featured-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8 sm:mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                Showroom Highlights
              </span>
              <h2 id="featured-heading" className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100 mt-1">
                Featured Product Showcase
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1">
                A curated glimpse of our most admired bridal bangles, temple jewelry sets, and festive essentials.
              </p>
            </div>
            <Link
              to="/products"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-rose-600 dark:text-rose-400 hover:underline shrink-0"
            >
              <span>View All Products</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-72 rounded-3xl img-skeleton"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={(p) => setSelectedProduct(p)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Sri Senthoora Section */}
      <section className="py-14 sm:py-16 bg-white dark:bg-stone-900/60" aria-labelledby="why-choose-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              The Sri Senthoora Experience
            </span>
            <h2 id="why-choose-heading" className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100 mt-1">
              Why Customers Love Visiting Us
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {companyDetails.highlights.map((item, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-stone-50/70 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="w-11 h-11 rounded-2xl bg-rose-50 dark:bg-stone-800 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-4">
                    <Sparkles className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <h3 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100 mb-2 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed m-0">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* In-Store Showroom Visit Banner */}
      <section className="py-12 sm:py-14 bg-gradient-to-r from-rose-800 via-rose-700 to-rose-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-2.5 text-center lg:text-left">
              <span className="text-xs font-bold tracking-wider uppercase text-rose-200">
                Experience Collections in Person
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                Visit Sri Senthoora Fancy Store Today
              </h2>
              <p className="text-xs sm:text-sm text-rose-100 max-w-2xl leading-relaxed">
                Bring your wedding saree or festive attire to our showroom for customized color-matching bangle sets and personalized bridal consultation.
              </p>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-center">
              <Link
                to="/contact"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold text-rose-950 bg-white hover:bg-rose-50 transition-colors shadow-sm"
              >
                <MapPin className="w-4 h-4 text-rose-600" />
                <span>Get Store Directions</span>
              </Link>
              <a
                href={`tel:${companyDetails.contact.primaryPhoneRaw}`}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold text-white bg-rose-900/70 hover:bg-rose-900 border border-white/20 transition-colors"
              >
                <span>Call {companyDetails.contact.primaryPhone}</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}
