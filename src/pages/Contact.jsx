import { useState } from 'react';
import { Phone, MessageCircle, Mail, MapPin, Clock, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { useCompany } from '../context/CompanyContext';
import { inquiryApi } from '../api/client';
import { useToast } from '../context/ToastContext';

export default function Contact() {
  const { companyDetails, getWhatsAppUrl } = useCompany();
  const { showSuccess, showError } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Please provide your name.';
    if (!formData.phone.trim()) {
      errs.phone = 'Please provide your phone number.';
    } else if (formData.phone.replace(/[^0-9]/g, '').length < 10) {
      errs.phone = 'Please enter a valid 10-digit phone number.';
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = 'Please enter a valid email address.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      showError('Please check the highlighted form fields.');
      return;
    }

    setLoading(true);
    try {
      const res = await inquiryApi.submit(formData);
      if (res.success) {
        showSuccess('Your inquiry has been submitted! Our showroom team will reach out soon.');
        setSubmitted(true);
        setFormData({ name: '', phone: '', email: '', message: '' });
        setErrors({});
      } else {
        showError(res.message || 'Failed to submit inquiry.');
      }
    } catch (err) {
      console.error('Contact inquiry error:', err);
      showError(err.message || 'Error sending message. Please try WhatsApp or calling directly.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-10 sm:py-14 bg-stone-50/60 dark:bg-stone-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            Showroom Location & Inquiries
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900 dark:text-stone-100">
            Contact Sri Senthoora Fancy Store
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300">
            Have questions about custom bridal bangle sets, 1-gram gold jewelry availability, or return gifts? We are always happy to help!
          </p>
        </div>

        {/* Contact Info Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Card 1: Phone */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-11 h-11 rounded-2xl bg-rose-50 dark:bg-stone-800 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-3.5">
                <Phone className="w-5 h-5" aria-hidden="true" />
              </div>
              <h3 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100 m-0">Call Showroom</h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 mb-4">Immediate store telephone assistance</p>
            </div>
            <div>
              <a
                href={`tel:${companyDetails.contact.primaryPhoneRaw}`}
                className="block text-sm font-bold text-rose-600 dark:text-rose-400 hover:underline"
              >
                {companyDetails.contact.primaryPhone}
              </a>
              <span className="text-[11px] text-stone-500 dark:text-stone-400 block mt-0.5">{companyDetails.contact.secondaryPhone}</span>
            </div>
          </div>

          {/* Card 2: WhatsApp */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-3.5">
                <MessageCircle className="w-5 h-5" aria-hidden="true" />
              </div>
              <h3 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100 m-0">WhatsApp Chat</h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 mb-4">Share saree photos for color matching</p>
            </div>
            <div>
              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800"
              >
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Card 3: Email */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-stone-800 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-3.5">
                <Mail className="w-5 h-5" aria-hidden="true" />
              </div>
              <h3 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100 m-0">Email Inquiries</h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 mb-4">Bulk gifting & showroom queries</p>
            </div>
            <div>
              <a
                href={`mailto:${companyDetails.contact.email}`}
                className="text-xs font-bold text-stone-800 dark:text-stone-200 hover:text-rose-600 dark:hover:text-rose-400 break-all"
              >
                {companyDetails.contact.email}
              </a>
            </div>
          </div>

          {/* Card 4: Store Timings */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-11 h-11 rounded-2xl bg-purple-50 dark:bg-stone-800 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-3.5">
                <Clock className="w-5 h-5" aria-hidden="true" />
              </div>
              <h3 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100 m-0">Store Hours</h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 mb-4">Open 7 days a week</p>
            </div>
            <div className="text-xs text-stone-600 dark:text-stone-400 space-y-1">
              <span className="block font-bold text-stone-800 dark:text-stone-200">Mon - Sat: 9:30 AM - 9:30 PM</span>
              <span className="block text-stone-500 dark:text-stone-400">Sun: 10:00 AM - 8:30 PM</span>
            </div>
          </div>
        </div>

        {/* Main Content: Interactive Form & Map Embed */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Inquiry Form Column */}
          <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-5">
            <div>
              <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100 m-0">
                Send an Inquiry or Feedback
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                Leave us a message about items you'd like to reserve or inquire about in our showroom.
              </p>
            </div>

            {submitted ? (
              <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-3 animate-in fade-in">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100 m-0">Inquiry Sent Successfully!</h3>
                <p className="text-xs text-stone-600 dark:text-stone-300">
                  Thank you for reaching out to Sri Senthoora Fancy Store. We will review your message and connect with you shortly.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div>
                  <label htmlFor="contact-form-name" className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Your Full Name <span className="text-rose-500" aria-hidden="true">*</span>
                  </label>
                  <input
                    id="contact-form-name"
                    name="name"
                    type="text"
                    required
                    autoComplete="name"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      if (errors.name) setErrors({ ...errors, name: null });
                    }}
                    placeholder="e.g. Sangeetha Ramesh"
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? 'contact-name-error' : undefined}
                    className={`w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border text-xs sm:text-sm text-stone-900 dark:text-stone-100 transition-all ${
                      errors.name ? 'border-rose-500' : 'border-stone-200 dark:border-stone-700 focus:border-rose-500'
                    }`}
                  />
                  {errors.name && (
                    <span id="contact-name-error" className="block text-xs text-rose-500 font-semibold mt-1">
                      {errors.name}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact-form-phone" className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      Phone Number <span className="text-rose-500" aria-hidden="true">*</span>
                    </label>
                    <input
                      id="contact-form-phone"
                      name="phone"
                      type="tel"
                      required
                      autoComplete="tel"
                      value={formData.phone}
                      onChange={(e) => {
                        setFormData({ ...formData, phone: e.target.value });
                        if (errors.phone) setErrors({ ...errors, phone: null });
                      }}
                      placeholder="e.g. 98425 67890"
                      aria-invalid={Boolean(errors.phone)}
                      aria-describedby={errors.phone ? 'contact-phone-error' : undefined}
                      className={`w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border text-xs sm:text-sm text-stone-900 dark:text-stone-100 transition-all ${
                        errors.phone ? 'border-rose-500' : 'border-stone-200 dark:border-stone-700 focus:border-rose-500'
                      }`}
                    />
                    {errors.phone && (
                      <span id="contact-phone-error" className="block text-xs text-rose-500 font-semibold mt-1">
                        {errors.phone}
                      </span>
                    )}
                  </div>

                  <div>
                    <label htmlFor="contact-form-email" className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      Email Address <span className="text-stone-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      id="contact-form-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        if (errors.email) setErrors({ ...errors, email: null });
                      }}
                      placeholder="e.g. name@example.com"
                      aria-invalid={Boolean(errors.email)}
                      aria-describedby={errors.email ? 'contact-email-error' : undefined}
                      className={`w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border text-xs sm:text-sm text-stone-900 dark:text-stone-100 transition-all ${
                        errors.email ? 'border-rose-500' : 'border-stone-200 dark:border-stone-700 focus:border-rose-500'
                      }`}
                    />
                    {errors.email && (
                      <span id="contact-email-error" className="block text-xs text-rose-500 font-semibold mt-1">
                        {errors.email}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="contact-form-message" className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Your Message / Product of Interest
                  </label>
                  <textarea
                    id="contact-form-message"
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us what you are looking for (e.g. bridal bangle sizes, antique choker set inquiry, return gift quantities)..."
                    className="w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-stone-900 dark:text-stone-100 focus:border-rose-500 focus:bg-white dark:focus:bg-stone-900 transition-all resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-2xl text-xs sm:text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 transition-all shadow-sm cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{loading ? 'Submitting...' : 'Send Message to Showroom'}</span>
                </button>
              </form>
            )}
          </div>

          {/* Map & Physical Showroom Directions */}
          <div className="lg:col-span-6 space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-2xl bg-rose-50 dark:bg-stone-800 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
                  <MapPin className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100 m-0">
                    Showroom Address
                  </h2>
                  <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 leading-relaxed">
                    <strong>{companyDetails.shopName}</strong> ({companyDetails.shopNameTamil})
                    <br />
                    {companyDetails.address.street}, {companyDetails.address.landmark}
                    <br />
                    {companyDetails.address.area}, {companyDetails.address.city} - {companyDetails.address.pincode}
                    <br />
                    {companyDetails.address.state}, {companyDetails.address.country}
                  </p>
                </div>
              </div>

              {/* Google Maps Embed Frame */}
              <div className="w-full h-64 sm:h-72 rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 shadow-inner">
                <iframe
                  title="Sri Senthoora Fancy Store Location Map"
                  src={companyDetails.address.googleMapsEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>

              <div className="pt-2">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${companyDetails.address.googleMapsQuery}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-stone-800 dark:text-stone-200 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 transition-colors"
                >
                  <MapPin className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  <span>Open in Google Maps for Navigation</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
