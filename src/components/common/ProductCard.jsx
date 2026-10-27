import { Eye, Sparkles, MessageCircle } from 'lucide-react';
import { useCompany } from '../../context/CompanyContext';
import ImageWithFallback from './ImageWithFallback';

export default function ProductCard({ product, onQuickView }) {
  const { companyDetails, getProductInquiryUrl } = useCompany();
  const { name, photo, image, rate, rateDisplay, category, badge, description, stockStatus } = product;
  const displayImage = photo || image || '';
  const formattedRate = rateDisplay || (rate ? `₹${Number(rate).toLocaleString('en-IN')}` : 'Price on Request');

  const handleWhatsAppInquiry = (e) => {
    e.stopPropagation();
    window.open(getProductInquiryUrl(product), '_blank', 'noopener,noreferrer');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onQuickView?.(product);
    }
  };

  return (
    // ✅ FIX: Changed from <article role="button"> which is semantically invalid
    // (role="button" on <article> overrides its landmark role entirely).
    // Now uses a plain <div role="button"> which is correct for an interactive card.
    <div
      tabIndex={0}
      role="button"
      aria-label={`View details for ${name}, rate: ${formattedRate}`}
      onClick={() => onQuickView?.(product)}
      onKeyDown={handleKeyDown}
      className="group relative flex flex-col bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-3xl overflow-hidden shadow-[var(--color-card-shadow)] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
    >
      {/* Image */}
      <div className="relative overflow-hidden bg-[var(--color-bg-subtle)]">
        <ImageWithFallback
          src={displayImage}
          alt={name}
          aspectRatioClass="aspect-4/3"
          className="group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end p-3.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/95 dark:bg-[#1a1122]/95 text-xs font-bold text-[var(--color-text-main)] shadow-sm">
            <Eye className="w-3.5 h-3.5 text-[var(--color-primary)]" />
            <span>View Details</span>
          </span>
        </div>

        {/* Badge */}
        {badge && (
          <div className="absolute top-3 left-3 pointer-events-none">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[var(--color-primary)] text-white shadow-sm flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" />
              {badge}
            </span>
          </div>
        )}

        {/* Category pill */}
        <div className="absolute top-3 right-3 pointer-events-none">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-black/65 text-white backdrop-blur-sm capitalize">
            {category || 'Showcase'}
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="flex-1 p-4 flex flex-col justify-between gap-3">
        <div>
          <span className="text-[10px] font-bold text-[var(--color-emerald)] uppercase tracking-wider block mb-1">
            {stockStatus || 'In Showroom'}
          </span>
          <h3 className="font-serif text-sm font-bold text-[var(--color-text-main)] line-clamp-1 group-hover:text-[var(--color-primary)] transition-colors">
            {name}
          </h3>
          <p className="text-[11px] text-[var(--color-text-light)] line-clamp-2 mt-1 leading-relaxed">
            {/* ✅ FIX: Safe fallback when companyDetails isn't loaded yet */}
            {description || `Visit ${companyDetails?.shopName || 'our showroom'} to experience this piece.`}
          </p>
        </div>

        <div className="pt-3 border-t border-[var(--color-border-subtle)] flex items-center justify-between gap-2">
          <div>
            <span className="text-[9px] uppercase tracking-wider font-semibold text-[var(--color-text-light)] block leading-tight">
              Rate
            </span>
            <span className="font-serif text-base font-bold text-[var(--color-primary)]">
              {formattedRate}
            </span>
          </div>
          <button
            type="button"
            onClick={handleWhatsAppInquiry}
            aria-label={`Inquire about ${name} on WhatsApp`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold text-[var(--color-emerald)] bg-[var(--color-emerald-light)] hover:opacity-80 border border-[var(--color-emerald)]/20 transition-opacity cursor-pointer"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            {/* ✅ UX: Stronger CTA label when price is not listed */}
            {!rate && !rateDisplay ? 'Ask Price' : 'Inquire'}
          </button>
        </div>
      </div>
    </div>
  );
}
