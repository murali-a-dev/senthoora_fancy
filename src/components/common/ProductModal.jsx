import { MessageCircle, Phone, Tag, Check, ShieldCheck, Sparkles, X } from 'lucide-react';
import { useCompany } from '../../context/CompanyContext';
import ImageWithFallback from './ImageWithFallback';
import { useEffect, useRef } from 'react';

export default function ProductModal({ product, onClose }) {
  const { companyDetails, getProductInquiryUrl } = useCompany();
  const panelRef = useRef(null);

  useEffect(() => {
    if (!product) return;
    document.body.style.overflow = 'hidden';
    const prev = document.activeElement;
    setTimeout(() => panelRef.current?.querySelector('button')?.focus(), 60);
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
      prev?.focus?.();
    };
  }, [product, onClose]);

  if (!product) return null;

  const { name, photo, image, rate, rateDisplay, category, badge, description, tags, stockStatus } = product;
  const displayImage = photo || image || '';
  const formattedRate = rateDisplay || (rate ? `₹${Number(rate).toLocaleString('en-IN')}` : 'Price on Request');

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-modal-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 modal-backdrop animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={panelRef}
        className="relative w-full max-w-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-t-3xl sm:rounded-3xl shadow-2xl animate-slide-up max-h-[92vh] sm:max-h-[88vh] overflow-hidden flex flex-col"
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close product details"
          className="absolute top-4 right-4 z-10 p-2 rounded-xl bg-[var(--color-bg-surface)]/90 text-[var(--color-text-light)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-subtle)] transition-colors cursor-pointer shadow-sm"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {/* Image */}
            <div className="relative bg-[var(--color-bg-subtle)] min-h-[260px] md:min-h-[420px]">
              <ImageWithFallback
                src={displayImage}
                alt={name}
                aspectRatioClass="aspect-square md:h-full md:aspect-auto"
                className="w-full h-full"
              />
              {badge && (
                <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[var(--color-primary)] text-white shadow-md flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />{badge}
                </span>
              )}
            </div>

            {/* Details */}
            <div className="flex flex-col justify-between p-6 space-y-5">
              <div className="space-y-4">
                {/* Category & status */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[var(--color-primary-light)] text-[var(--color-primary)] border border-[var(--color-border)] capitalize">
                    {category || 'Showcase Item'}
                  </span>
                  <span className="text-xs font-semibold text-[var(--color-emerald)] flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    {stockStatus || 'In Showroom'}
                  </span>
                </div>

                {/* Title */}
                <h2 id="product-modal-title" className="font-serif text-2xl font-bold text-[var(--color-text-main)] leading-snug">
                  {name}
                </h2>

                {/* Rate */}
                <div className="p-4 rounded-2xl bg-[var(--color-bg-subtle)] border border-[var(--color-border-subtle)] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-[var(--color-text-light)] block">
                      Showcase Rate
                    </span>
                    <span className="font-serif text-2xl sm:text-3xl font-extrabold text-[var(--color-primary)]">
                      {formattedRate}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[var(--color-text-light)] block">Display only</span>
                    <span className="text-xs font-semibold text-[var(--color-text-muted)]">Visit Store</span>
                  </div>
                </div>

                {/* Description */}
                {description && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-light)] mb-1.5">
                      About this Product
                    </p>
                    <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                      {description}
                    </p>
                  </div>
                )}

                {/* Tags */}
                {tags && tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map((tag, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-medium bg-[var(--color-bg-muted)] text-[var(--color-text-muted)] border border-[var(--color-border-subtle)]">
                        <Tag className="w-2.5 h-2.5" />{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="space-y-3 pt-4 border-t border-[var(--color-border-subtle)]">
                <button
                  type="button"
                  onClick={() => window.open(getProductInquiryUrl(product), '_blank', 'noopener,noreferrer')}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-[var(--color-emerald)] hover:opacity-90 transition-opacity shadow-sm cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  Inquire on WhatsApp
                </button>

                <div className="flex items-center justify-between text-xs text-[var(--color-text-light)] px-1">
                  <a
                    href={`tel:${companyDetails?.contact?.primaryPhoneRaw}`}
                    className="flex items-center gap-1.5 hover:text-[var(--color-text-main)] transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                    <span>{companyDetails?.contact?.primaryPhone}</span>
                  </a>
                  <span className="flex items-center gap-1 text-[11px] text-[var(--color-accent-gold)] font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Showroom Only
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
