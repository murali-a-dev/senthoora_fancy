import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Phone, MessageCircle, Mail, MapPin, Clock, Send, CheckCircle2 } from 'lucide-react';
import { useCompany } from '../context/CompanyContext';
import { inquiryApi } from '../api/client';
import { useToast } from '../context/ToastContext';
import { usePageMeta } from '../hooks/usePageMeta';

const MESSAGE_MAX = 500;

function Field({ label, id, required, optional, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-bold text-[var(--color-text-muted)] mb-1.5">
        {label}
        {required && <span className="text-[var(--color-primary)] ml-1" aria-hidden="true">*</span>}
        {optional && <span className="font-normal text-[var(--color-text-light)] ml-1">(Optional)</span>}
      </label>
      {children}
      {error && (
        <span role="alert" className="block text-[11px] text-[var(--color-primary)] font-semibold mt-1">
          {error}
        </span>
      )}
    </div>
  );
}

const inputClass = (hasError) =>
  `w-full px-4 py-2.5 rounded-xl bg-[var(--color-bg-subtle)] border text-sm text-[var(--color-text-main)] placeholder-[var(--color-text-light)] focus:bg-[var(--color-bg-surface)] outline-none transition-all ${
    hasError
      ? 'border-[var(--color-primary)]'
      : 'border-[var(--color-border)] focus:border-[var(--color-primary)]'
  }`;

export default function Contact() {
  const { companyDetails, getWhatsAppUrl } = useCompany();
  const { showSuccess, showError } = useToast();
  const location = useLocation();
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  // ✅ FIX: SEO title + meta description
  usePageMeta(
    `Contact Us | ${companyDetails.shopName}`,
    `Get in touch with ${companyDetails.shopName} in ${companyDetails.address?.city || 'Erode'}. Call, WhatsApp, or send an inquiry for bridal bangles and jewelry.`
  );

  // ✅ FIX: Reset submitted state when the user navigates away and comes back
  useEffect(() => {
    setSubmitted(false);
  }, [location.pathname]);

  const set = (key, val) => {
    setFormData((p) => ({ ...p, [key]: val }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: null }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Please provide your name.';

    if (!formData.phone.trim()) {
      errs.phone = 'Please provide your phone number.';
    } else {
      // ✅ FIX: Strip all non-digits, then strip leading 91 (country code) if 12 digits
      const digits = formData.phone.replace(/\D/g, '');
      const localDigits =
        digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : digits;
      if (localDigits.length < 10) {
        errs.phone = 'Enter a valid 10-digit Indian mobile number.';
      }
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = 'Enter a valid email address.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) { showError('Please check the highlighted fields.'); return; }
    setLoading(true);
    try {
      const res = await inquiryApi.submit(formData);
      if (res.success) {
        showSuccess('Inquiry submitted! Our team will reach out soon.');
        setSubmitted(true);
        setFormData({ name: '', phone: '', email: '', message: '' });
      } else {
        showError(res.message || 'Failed to submit.');
      }
    } catch (err) {
      showError(err.message || 'Error sending. Try WhatsApp or call us directly.');
    } finally {
      setLoading(false);
    }
  };

  const iconBg = {
    primary: 'bg-[var(--color-primary-light)] text-[var(--color-primary)]',
    emerald: 'bg-[var(--color-emerald-light)] text-[var(--color-emerald)]',
    gold: 'bg-[var(--color-accent-gold-light)] text-[var(--color-accent-gold)]',
    purple: 'bg-purple-100 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400',
  };

  const infoCards = [
    {
      icon: Phone, color: 'primary', title: 'Call Showroom', sub: 'Immediate assistance',
      content: (
        <>
          <a href={`tel:${companyDetails.contact.primaryPhoneRaw}`} className="text-sm font-bold text-[var(--color-primary)] hover:underline block">
            {companyDetails.contact.primaryPhone}
          </a>
          <span className="text-[11px] text-[var(--color-text-light)] mt-0.5 block">
            {companyDetails.contact.secondaryPhone}
          </span>
        </>
      ),
    },
    {
      icon: MessageCircle, color: 'emerald', title: 'WhatsApp Chat', sub: 'Share saree photos for color matching',
      content: (
        <a href={getWhatsAppUrl()} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-emerald)] bg-[var(--color-emerald-light)] px-3 py-1.5 rounded-xl border border-[var(--color-emerald)]/20 hover:opacity-80 transition-opacity">
          Chat on WhatsApp
        </a>
      ),
    },
    {
      icon: Mail, color: 'gold', title: 'Email Inquiries', sub: 'Bulk & showroom queries',
      content: (
        <a href={`mailto:${companyDetails.contact.email}`}
          className="text-xs font-bold text-[var(--color-text-main)] hover:text-[var(--color-primary)] break-all transition-colors">
          {companyDetails.contact.email}
        </a>
      ),
    },
    {
      icon: Clock, color: 'purple', title: 'Store Hours', sub: 'Open 7 days a week',
      content: (
        <div className="text-xs space-y-1">
          {(companyDetails.businessHours || []).map((h, i) => (
            <div key={i}>
              <span className="font-bold text-[var(--color-text-main)] block">{h.days}</span>
              <span className="text-[var(--color-text-light)]">{h.hours}</span>
            </div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen py-10 sm:py-14 bg-[var(--color-bg-base)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary)]">
            Showroom Location &amp; Inquiries
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--color-text-main)]">
            Contact Us
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-text-muted)]">
            Questions about bridal bangles, custom orders, or return gifts? We're happy to help!
          </p>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {infoCards.map(({ icon: Icon, color, title, sub, content }) => (
            <div key={title} className="p-5 rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] shadow-[var(--color-card-shadow)] flex flex-col justify-between gap-4">
              <div>
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-3.5 ${iconBg[color]}`}>
                  <Icon className="w-5 h-5" aria-hidden="true" />
                </div>
                <h3 className="font-serif text-base font-bold text-[var(--color-text-main)] m-0">{title}</h3>
                <p className="text-xs text-[var(--color-text-light)] mt-0.5 mb-3">{sub}</p>
              </div>
              <div>{content}</div>
            </div>
          ))}
        </div>

        {/* Form + Map */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Form */}
          <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] shadow-sm space-y-5">
            <div>
              <h2 className="font-serif text-2xl font-bold text-[var(--color-text-main)] m-0">
                Send an Inquiry
              </h2>
              <p className="text-xs text-[var(--color-text-light)] mt-1">
                Leave a message about items you'd like to inquire about.
              </p>
            </div>

            {submitted ? (
              <div className="p-6 rounded-2xl bg-[var(--color-emerald-light)] border border-[var(--color-emerald)]/20 text-center space-y-3 animate-fade-in">
                <CheckCircle2 className="w-10 h-10 text-[var(--color-emerald)] mx-auto" />
                <h3 className="font-bold text-sm text-[var(--color-text-main)] m-0">Inquiry Sent!</h3>
                <p className="text-xs text-[var(--color-text-muted)]">
                  Our team will connect with you shortly.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[var(--color-emerald)] text-white hover:opacity-80 cursor-pointer transition-opacity"
                >
                  Send Another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <Field label="Full Name" id="cf-name" required error={errors.name}>
                  <input
                    id="cf-name"
                    type="text"
                    autoComplete="name"
                    value={formData.name}
                    onChange={(e) => set('name', e.target.value)}
                    placeholder="e.g. Sangeetha Ramesh"
                    aria-invalid={Boolean(errors.name)}
                    className={inputClass(errors.name)}
                  />
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Phone Number" id="cf-phone" required error={errors.phone}>
                    <input
                      id="cf-phone"
                      type="tel"
                      autoComplete="tel"
                      value={formData.phone}
                      onChange={(e) => set('phone', e.target.value)}
                      placeholder="e.g. 98425 67890"
                      aria-invalid={Boolean(errors.phone)}
                      className={inputClass(errors.phone)}
                    />
                  </Field>
                  <Field label="Email" id="cf-email" optional error={errors.email}>
                    <input
                      id="cf-email"
                      type="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={(e) => set('email', e.target.value)}
                      placeholder="name@example.com"
                      aria-invalid={Boolean(errors.email)}
                      className={inputClass(errors.email)}
                    />
                  </Field>
                </div>

                {/* ✅ FIX: Added maxLength + visible character counter on the message textarea */}
                <Field label="Message / Product of Interest" id="cf-msg">
                  <textarea
                    id="cf-msg"
                    rows={4}
                    maxLength={MESSAGE_MAX}
                    value={formData.message}
                    onChange={(e) => set('message', e.target.value)}
                    placeholder="Tell us what you're looking for (e.g. bridal bangle sizes, antique choker sets, return gift quantities)…"
                    className={`${inputClass(false)} resize-none`}
                  />
                  <span className={`text-[10px] text-right block mt-0.5 ${
                    formData.message.length >= MESSAGE_MAX
                      ? 'text-[var(--color-primary)] font-bold'
                      : 'text-[var(--color-text-light)]'
                  }`}>
                    {formData.message.length}/{MESSAGE_MAX}
                  </span>
                </Field>

                {/* ✅ Hidden honeypot to deter simple bots */}
                <input
                  type="text"
                  name="_hp_name"
                  autoComplete="off"
                  tabIndex={-1}
                  aria-hidden="true"
                  style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0 }}
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-2xl text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] disabled:opacity-50 transition-all shadow-md shadow-[var(--color-primary)]/25 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  {loading ? 'Submitting…' : 'Send Message to Showroom'}
                </button>
              </form>
            )}
          </div>

          {/* Map */}
          <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] shadow-sm space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-2xl bg-[var(--color-primary-light)] flex items-center justify-center text-[var(--color-primary)] shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-serif text-lg font-bold text-[var(--color-text-main)] m-0">
                  Showroom Address
                </h2>
                <p className="text-xs text-[var(--color-text-muted)] mt-1 leading-relaxed">
                  <strong>{companyDetails.shopName}</strong><br />
                  {companyDetails.address.street}, {companyDetails.address.landmark}<br />
                  {companyDetails.address.area}, {companyDetails.address.city} - {companyDetails.address.pincode}<br />
                  {companyDetails.address.state}, {companyDetails.address.country}
                </p>
              </div>
            </div>

            <div className="w-full h-64 sm:h-72 rounded-2xl overflow-hidden border border-[var(--color-border)] shadow-inner">
              <iframe
                title="Showroom Location Map"
                src={companyDetails.address.googleMapsEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}   // ✅ FIX: JSX boolean prop
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            <a
              href={`https://www.google.com/maps/search/?api=1&query=${companyDetails.address.googleMapsQuery}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-[var(--color-text-muted)] bg-[var(--color-bg-subtle)] hover:bg-[var(--color-bg-muted)] transition-colors border border-[var(--color-border)]"
            >
              <MapPin className="w-4 h-4 text-[var(--color-primary)]" />
              Open in Google Maps
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
