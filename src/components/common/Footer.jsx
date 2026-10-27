import { Link } from 'react-router-dom';
import {
  MapPin, Phone, Mail, Clock, ShieldCheck, Heart, Sparkles,
  MessageCircle, Radio,
} from 'lucide-react';
import { useCompany } from '../../context/CompanyContext';

// Brand icons (not provided by lucide-react)
function InstagramIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function FacebookIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function YoutubeIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

// ✅ FIX: current year computed once outside the component — not re-created on every render
const CURRENT_YEAR = new Date().getFullYear();

export default function Footer() {
  const { companyDetails, getWhatsAppUrl } = useCompany();

  return (
    <footer className="bg-[var(--color-bg-surface)] border-t border-[var(--color-border)] transition-colors duration-300">

      {/* Value banner */}
      <div className="border-b border-[var(--color-border-subtle)] py-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-[var(--color-primary-light)] via-[var(--color-bg-subtle)] to-[var(--color-accent-gold-light)]/40">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
          {[
            {
              icon: Sparkles,
              bg: 'bg-[var(--color-primary-light)] text-[var(--color-primary)] border-[var(--color-border)]',
              title: 'Exquisite Collection',
              desc: 'Custom bridal bangles & handpicked festive imitation jewelry',
            },
            {
              icon: ShieldCheck,
              bg: 'bg-[var(--color-accent-gold-light)] text-[var(--color-accent-gold)] border-[var(--color-accent-gold-pastel)]',
              title: 'Trusted Local Retail',
              desc: `Serving our community with authentic quality since ${companyDetails.establishedYear}`,
            },
            {
              icon: Heart,
              bg: 'bg-[var(--color-emerald-light)] text-[var(--color-emerald)] border-[var(--color-emerald)]/20',
              title: 'Personalized Assistance',
              desc: 'Color matching for wedding sarees & festive occasions',
            },
          ].map(({ icon: Icon, bg, title, desc }) => (
            <div key={title} className="flex items-center gap-4 justify-center md:justify-start">
              <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 ${bg}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-[var(--color-text-main)] m-0">{title}</h4>
                <p className="text-xs text-[var(--color-text-muted)] m-0 mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Branding */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary-light)] border border-[var(--color-border)] p-1.5 flex items-center justify-center">
                <img src={companyDetails.logo} alt="Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-[var(--color-text-main)] leading-tight m-0">
                  {companyDetails.shopName}
                </h3>
                <p className="text-xs text-[var(--color-primary)] font-semibold m-0">
                  {companyDetails.shopNameTamil}
                </p>
              </div>
            </div>

            <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
              {companyDetails.shortDescription}
            </p>

            {/* Social links */}
            <div className="flex items-center gap-2 flex-wrap">
              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-[var(--color-emerald)] bg-[var(--color-emerald-light)] border border-[var(--color-emerald)]/20 hover:opacity-80 transition-opacity"
              >
                <MessageCircle className="w-4 h-4" />WhatsApp
              </a>

              {companyDetails.socials?.instagram && (
                <a
                  href={companyDetails.socials.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow us on Instagram"
                  className="p-2 rounded-xl text-[var(--color-text-light)] hover:text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-950/30 transition-colors"
                >
                  <InstagramIcon className="w-4 h-4" />
                </a>
              )}

              {companyDetails.socials?.facebook && (
                <a
                  href={companyDetails.socials.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow us on Facebook"
                  className="p-2 rounded-xl text-[var(--color-text-light)] hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
                >
                  <FacebookIcon className="w-4 h-4" />
                </a>
              )}

              {companyDetails.socials?.youtube && (
                <a
                  href={companyDetails.socials.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Watch us on YouTube"
                  className="p-2 rounded-xl text-[var(--color-text-light)] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                >
                  <YoutubeIcon className="w-4 h-4" />
                </a>
              )}

              {companyDetails.socials?.whatsappChannel && (
                <a
                  href={companyDetails.socials.whatsappChannel}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Join our WhatsApp Channel"
                  className="p-2 rounded-xl text-[var(--color-text-light)] hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors"
                  title="WhatsApp Channel"
                >
                  <Radio className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-serif text-sm font-bold uppercase tracking-wider text-[var(--color-text-main)] mb-4">
              Explore Showcase
            </h4>
            <ul className="space-y-2.5 text-xs">
              {[
                ['/', 'Home'],
                ['/products', 'Product Showcase'],
                ['/about', 'About Our Store'],
                ['/contact', 'Location & Contact'],
              ].map(([to, label]) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
              {/* ✅ FIX: Admin link removed from public footer.
                  Exposing /admin route helps attackers locate the login surface.
                  Admins can navigate directly; the link need not be publicly advertised.
                  If you want it during development only, use: import.meta.env.DEV && (...) */}
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h4 className="font-serif text-sm font-bold uppercase tracking-wider text-[var(--color-text-main)] mb-4 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[var(--color-primary)]" />Showroom Timings
            </h4>
            <div className="space-y-3 text-xs">
              {(companyDetails.businessHours || []).map((item, idx) => (
                <div key={idx} className="border-b border-[var(--color-border-subtle)] pb-2">
                  <span className="block font-semibold text-[var(--color-text-main)]">{item.days}</span>
                  <span className="text-[var(--color-text-muted)] font-mono mt-0.5 block">{item.hours}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Address */}
          <div className="space-y-3 text-xs">
            <h4 className="font-serif text-sm font-bold uppercase tracking-wider text-[var(--color-text-main)] mb-4 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[var(--color-primary)]" />Store Address
            </h4>
            <div className="text-[var(--color-text-muted)] leading-relaxed">
              <p className="font-semibold text-[var(--color-text-main)] m-0">{companyDetails.shopName}</p>
              <p className="m-0 mt-0.5">{companyDetails.address.street}</p>
              <p className="m-0">{companyDetails.address.landmark}</p>
              <p className="m-0">
                {companyDetails.address.area}, {companyDetails.address.city} - {companyDetails.address.pincode}
              </p>
              <p className="m-0">{companyDetails.address.state}, {companyDetails.address.country}</p>
            </div>
            <div className="pt-2 space-y-1.5">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[var(--color-primary)] shrink-0" />
                <a
                  href={`tel:${companyDetails.contact.primaryPhoneRaw}`}
                  className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
                >
                  {companyDetails.contact.primaryPhone}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[var(--color-primary)] shrink-0" />
                <a
                  href={`mailto:${companyDetails.contact.email}`}
                  className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
                >
                  {companyDetails.contact.email}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-10 p-4 rounded-2xl bg-[var(--color-accent-gold-light)] border border-[var(--color-accent-gold-pastel)] text-[var(--color-accent-gold)] text-[11px] leading-relaxed">
          <span className="font-bold uppercase tracking-wider mr-1.5">Showcase Notice:</span>
          {companyDetails.disclaimer}
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-[var(--color-border)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--color-text-light)]">
          <p className="m-0">© {CURRENT_YEAR} {companyDetails.shopName}. All Rights Reserved.</p>
          <p className="m-0 flex items-center gap-1 text-[11px]">
            Crafted by{' '}
            <a
              href="https://myself-murali.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-primary)] font-bold hover:underline"
            >
              Murali
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
