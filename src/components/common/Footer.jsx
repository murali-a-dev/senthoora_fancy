import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, ShieldCheck, Heart, Sparkles, MessageCircle } from 'lucide-react';
import { useCompany } from '../../context/CompanyContext';

export default function Footer() {
  const { companyDetails, getWhatsAppUrl } = useCompany();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-stone-100/80 dark:bg-stone-950 border-t border-rose-100 dark:border-stone-800/80 transition-colors duration-300">
      {/* Top Value Banner */}
      <div className="border-b border-rose-100/70 dark:border-stone-800/60 py-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-rose-50/50 via-amber-50/30 to-pink-50/50 dark:from-stone-900/50 dark:via-stone-900/30 dark:to-stone-900/50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
          <div className="flex items-center gap-4 justify-center md:justify-start">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100 m-0">Exquisite Collection</h4>
              <p className="text-xs text-stone-600 dark:text-stone-400 m-0 mt-0.5">Custom bridal bangles & handpicked festive imitation jewelry</p>
            </div>
          </div>

          <div className="flex items-center gap-4 justify-center md:justify-start">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100 m-0">Trusted Local Retail</h4>
              <p className="text-xs text-stone-600 dark:text-stone-400 m-0 mt-0.5">Serving our community with authentic quality since {companyDetails.establishedYear}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 justify-center md:justify-start">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100 m-0">Personalized Assistance</h4>
              <p className="text-xs text-stone-600 dark:text-stone-400 m-0 mt-0.5">Color matching for wedding sarees & festive occasions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Col 1: Store Branding & Story */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-stone-900 border border-rose-200/80 dark:border-stone-700 p-1 flex items-center justify-center">
                <img src={companyDetails.logo} alt="Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100 leading-tight m-0">
                  {companyDetails.shopName}
                </h3>
                <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold m-0">
                  {companyDetails.shopNameTamil}
                </p>
              </div>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
              {companyDetails.shortDescription}
            </p>
            <div className="pt-2">
              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors shadow-xs"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Col 2: Showcase Quick Links */}
          <div>
            <h4 className="font-serif text-sm font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100 mb-4">
              Explore Showcase
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/" className="text-stone-600 dark:text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
                  Home Overview
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-stone-600 dark:text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
                  Product Showcase Gallery
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-stone-600 dark:text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
                  About Our Store
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-stone-600 dark:text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
                  Store Location & Contact
                </Link>
              </li>
              <li>
                <Link to="/admin" className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-300 transition-colors">
                  Admin Management
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Business Hours */}
          <div>
            <h4 className="font-serif text-sm font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100 mb-4 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-rose-500" />
              <span>Showroom Timings</span>
            </h4>
            <div className="space-y-3 text-xs">
              {companyDetails.businessHours.map((item, idx) => (
                <div key={idx} className="border-b border-stone-200/50 dark:border-stone-800/80 pb-2">
                  <span className="block font-semibold text-stone-800 dark:text-stone-200">
                    {item.days}
                  </span>
                  <span className="text-stone-600 dark:text-stone-400 font-mono mt-0.5 block">
                    {item.hours}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Col 4: Physical Address & Reach Us */}
          <div className="space-y-3 text-xs">
            <h4 className="font-serif text-sm font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100 mb-4 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-rose-500" />
              <span>Store Address</span>
            </h4>
            <div className="text-stone-600 dark:text-stone-400 leading-relaxed">
              <p className="font-semibold text-stone-800 dark:text-stone-200 m-0">
                {companyDetails.shopName}
              </p>
              <p className="m-0 mt-0.5">{companyDetails.address.street}</p>
              <p className="m-0">{companyDetails.address.landmark}</p>
              <p className="m-0">
                {companyDetails.address.area}, {companyDetails.address.city} - {companyDetails.address.pincode}
              </p>
              <p className="m-0">{companyDetails.address.state}, {companyDetails.address.country}</p>
            </div>

            <div className="pt-2 space-y-1.5 text-stone-600 dark:text-stone-400">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <a href={`tel:${companyDetails.contact.primaryPhoneRaw}`} className="hover:text-rose-600 dark:hover:text-rose-400">
                  {companyDetails.contact.primaryPhone}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <a href={`mailto:${companyDetails.contact.email}`} className="hover:text-rose-600 dark:hover:text-rose-400">
                  {companyDetails.contact.email}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Showcase Disclaimer Banner */}
        <div className="mt-10 p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-amber-900 dark:text-amber-200 text-[11px] leading-relaxed">
          <span className="font-bold uppercase tracking-wider mr-1.5">Showcase Notice:</span>
          {companyDetails.disclaimer}
        </div>

        {/* Bottom Copyright */}
        <div className="mt-8 pt-6 border-t border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500 dark:text-stone-400">
          <p className="m-0">
            © {currentYear} {companyDetails.shopName}. All Rights Reserved.
          </p>
          <p className="m-0 flex items-center gap-1 text-[11px]">
            Crafted by <a href="https://myself-murali.vercel.app/" target="_blank" rel="noopener noreferrer" className="hover:text-rose-600 dark:hover:text-rose-400 text-rose-600 dark:text-rose-400 font-bold">Murali</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
