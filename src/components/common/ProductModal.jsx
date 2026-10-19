import { MessageCircle, Phone, Tag, Check, ShieldCheck, Sparkles } from 'lucide-react';
import { useCompany } from '../../context/CompanyContext';
import Modal from './Modal';
import ImageWithFallback from './ImageWithFallback';

export default function ProductModal({ product, onClose }) {
  const { companyDetails, getProductInquiryUrl } = useCompany();
  if (!product) return null;

  const { name, photo, image, rate, rateDisplay, category, badge, description, tags, stockStatus } = product;
  const displayImage = photo || image || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80';
  const formattedRate = rateDisplay || (rate ? `₹${Number(rate).toLocaleString('en-IN')}` : 'Price on Request');

  const handleWhatsAppInquiry = () => {
    window.open(getProductInquiryUrl(product), '_blank', 'noopener,noreferrer');
  };

  return (
    <Modal
      isOpen={Boolean(product)}
      onClose={onClose}
      maxWidthClass="max-w-3xl"
      ariaLabelId="product-details-modal-title"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 -m-2">
        {/* Product Image Column */}
        <div className="relative bg-stone-100 dark:bg-stone-800/60 rounded-2xl overflow-hidden flex items-center justify-center min-h-[260px] md:min-h-[380px]">
          <ImageWithFallback
            src={displayImage}
            alt={name}
            aspectRatioClass="aspect-square md:aspect-auto h-full"
            className="w-full h-full object-cover rounded-2xl"
          />
          {badge && (
            <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-600 text-white shadow-md flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{badge}</span>
            </span>
          )}
        </div>

        {/* Product Details Column */}
        <div className="flex flex-col justify-between space-y-5">
          <div>
            {/* Category & Status */}
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-900 capitalize">
                {category || 'Showcase Item'}
              </span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>{stockStatus || 'Showroom Available'}</span>
              </span>
            </div>

            {/* Title */}
            <h2 id="product-details-modal-title" className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100 leading-snug">
              {name}
            </h2>

            {/* Showcase Rate Block */}
            <div className="mt-3 p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-rose-100/80 dark:border-stone-700/80 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-stone-500 dark:text-stone-400 block">
                  Showcase Reference Rate
                </span>
                <span className="font-serif text-2xl sm:text-3xl font-extrabold text-rose-600 dark:text-rose-400">
                  {formattedRate}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-stone-500 dark:text-stone-400 font-medium block">
                  Display rate only
                </span>
                <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                  Visit Store in Person
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="mt-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1">
                About this Product
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed m-0">
                {description || `Visit ${companyDetails?.shopName || 'Sri Senthoora Fancy Store'} to experience this exquisite piece in person.`}
              </p>
            </div>

            {/* Tags */}
            {tags && tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-medium bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300"
                  >
                    <Tag className="w-2.5 h-2.5" />
                    <span>{tag}</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Action Strip */}
          <div className="space-y-3 pt-3 border-t border-stone-100 dark:border-stone-800">
            <button
              type="button"
              onClick={handleWhatsAppInquiry}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Inquire on WhatsApp</span>
            </button>

            <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 px-1">
              <a
                href={`tel:${companyDetails?.contact?.primaryPhoneRaw || (companyDetails?.contact?.primaryPhone || '').replace(/\D/g, '')}`}
                className="flex items-center gap-1.5 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-rose-500" />
                <span>Call: {companyDetails?.contact?.primaryPhone || 'Showroom'}</span>
              </a>
              <span className="flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Showroom Only</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
