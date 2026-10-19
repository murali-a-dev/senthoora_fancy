import { Eye, Sparkles, MessageCircle } from 'lucide-react';
import { useCompany } from '../../context/CompanyContext';
import ImageWithFallback from './ImageWithFallback';

export default function ProductCard({ product, onQuickView }) {
  const { companyDetails, getProductInquiryUrl } = useCompany();
  const { name, photo, image, rate, rateDisplay, category, badge, description, stockStatus } = product;
  const displayImage = photo || image || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80';
  const formattedRate = rateDisplay || (rate ? `₹${Number(rate).toLocaleString('en-IN')}` : 'Price on Request');

  const handleWhatsAppInquiry = (e) => {
    e.stopPropagation();
    window.open(getProductInquiryUrl(product), '_blank', 'noopener,noreferrer');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (onQuickView) onQuickView(product);
    }
  };

  return (
    <div
      tabIndex={0}
      role="button"
      aria-label={`View details for ${name}, rate: ${formattedRate}`}
      onClick={() => onQuickView && onQuickView(product)}
      onKeyDown={handleKeyDown}
      className="group relative flex flex-col bg-white dark:bg-stone-900 border border-rose-100/80 dark:border-stone-800 rounded-3xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
    >
      {/* Image Container with Badges */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-stone-100 dark:bg-stone-800">
        <ImageWithFallback
          src={displayImage}
          alt={name}
          className="group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Subtle Overlay on Hover */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end p-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/95 dark:bg-stone-900/95 text-xs font-bold text-stone-900 dark:text-stone-100 shadow-sm">
            <Eye className="w-3.5 h-3.5 text-rose-500" />
            <span>Click to View Details</span>
          </span>
        </div>

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 pointer-events-none">
          {badge && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-600 text-white shadow-xs flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>{badge}</span>
            </span>
          )}
        </div>

        {/* Category Pill Top Right */}
        <div className="absolute top-3 right-3 pointer-events-none">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide bg-stone-900/75 text-white backdrop-blur-xs capitalize">
            {category || 'Showcase'}
          </span>
        </div>
      </div>

      {/* Product Details */}
      <div className="flex-1 p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
              {stockStatus || 'Showroom Available'}
            </span>
          </div>

          <h3 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100 line-clamp-1 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
            {name}
          </h3>

          <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-2 mt-1 leading-relaxed">
            {description || `Visit ${companyDetails?.shopName || 'Sri Senthoora Fancy Store'} to experience this exquisite piece in person.`}
          </p>
        </div>

        {/* Rate & WhatsApp Inquiry Strip */}
        <div className="pt-4 mt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-500 dark:text-stone-400 block leading-tight">
              Showcase Rate
            </span>
            <span className="font-serif text-lg font-bold text-rose-600 dark:text-rose-400">
              {formattedRate}
            </span>
          </div>

          <button
            type="button"
            onClick={handleWhatsAppInquiry}
            aria-label={`Inquire about ${name} on WhatsApp`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 transition-colors cursor-pointer"
            title="Inquire about this product on WhatsApp"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Inquire</span>
          </button>
        </div>
      </div>
    </div>
  );
}
