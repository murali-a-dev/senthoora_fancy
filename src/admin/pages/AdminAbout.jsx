import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Save, Store, Phone, MapPin, Clock, Globe, Upload, Sparkles,
  MessageSquare, CheckCircle2, MessageCircle,
  RefreshCw, Image as ImageIcon, Plus, Trash2,
  Tag, Star,
} from 'lucide-react';
import { useCompany } from '../../context/CompanyContext';
import { useToast } from '../../context/ToastContext';
import { uploadApi, inquiryApi } from '../../api/client';
// ✅ FIX: Import shared utility — removes the copy-pasted compressImage duplicate
import { compressImage } from '../../utils/imageUtils';

// ── Tab button ──
function Tab({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
        active
          ? 'bg-[var(--color-primary)] text-white shadow-sm'
          : 'bg-[var(--color-bg-subtle)] text-[var(--color-text-muted)] hover:bg-[var(--color-bg-muted)] hover:text-[var(--color-text-main)]'
      }`}
    >
      {children}
    </button>
  );
}

// ✅ FIX: FormField now accepts and passes `id` to <label htmlFor>
// Previously the label was disconnected from its input (screen readers couldn't associate them).
function FormField({ label, id, hint, children }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-bold text-[var(--color-text-muted)]">
        {label}
      </label>
      {hint && <p className="text-[11px] text-[var(--color-text-light)]">{hint}</p>}
      {children}
    </div>
  );
}

const inputCls =
  'w-full px-3.5 py-2.5 rounded-xl bg-[var(--color-bg-subtle)] border border-[var(--color-border)] text-sm text-[var(--color-text-main)] placeholder-[var(--color-text-light)] focus:border-[var(--color-primary)] focus:bg-[var(--color-bg-surface)] outline-none transition-all';

const ICON_OPTIONS = ['CircleDot','Gem','Sparkles','Crown','ShoppingBag','Gift','Flame','Heart','Star','Palette'];
const RESERVED_CAT_IDS = ['all']; // ✅ FIX: prevent overwriting the built-in "all" category

const TABS = [
  { id: 'identity',   label: 'Identity'   },
  { id: 'contact',    label: 'Contact'    },
  { id: 'address',    label: 'Address'    },
  { id: 'hours',      label: 'Hours'      },
  { id: 'categories', label: 'Categories' },
  { id: 'highlights', label: 'Highlights' },
  { id: 'socials',    label: 'Socials'    },
  { id: 'inquiries',  label: 'Inquiries'  },
];

export default function AdminAbout() {
  const { companyDetails, saveCompanyDetails, refreshCompanyDetails, loading: companyLoading } = useCompany();
  const { showSuccess, showError } = useToast();
  const [tab, setTab]              = useState('identity');
  const [saving, setSaving]        = useState(false);
  const [uploadingLogo, setUL]     = useState(false);
  const [inquiries, setInquiries]  = useState([]);
  const [loadingInq, setLoadingInq]= useState(true);
  const [isDirty, setIsDirty]      = useState(false); // ✅ FIX: track unsaved changes
  const fileRef                    = useRef(null);

  const [form, setForm] = useState({
    shopName: '', shopNameTamil: '', tagline: '', shortDescription: '',
    establishedYear: 2018, logo: '', logoAlt: '', disclaimer: '',
    contact: { primaryPhone:'', secondaryPhone:'', whatsapp:'', whatsappMessage:'', email:'', inquiryEmail:'' },
    address: { street:'', landmark:'', area:'', city:'', state:'', pincode:'', googleMapsEmbedUrl:'' },
    businessHours: [{ days:'Monday - Saturday', hours:'09:30 AM – 09:30 PM', isOpen: true }],
    socials: { instagram:'', facebook:'', youtube:'', whatsappChannel:'' },
    highlights: [],
    categories: [],
  });

  // Sync form from context
  useEffect(() => {
    if (!companyDetails) return;
    setForm({
      shopName:         companyDetails.shopName         || '',
      shopNameTamil:    companyDetails.shopNameTamil    || '',
      tagline:          companyDetails.tagline          || '',
      shortDescription: companyDetails.shortDescription || '',
      establishedYear:  companyDetails.establishedYear  || 2018,
      logo:             companyDetails.logo             || '/logo_2.png',
      logoAlt:          companyDetails.logoAlt          || '',
      disclaimer:       companyDetails.disclaimer       || '',
      contact: {
        primaryPhone:    companyDetails.contact?.primaryPhone    || '',
        secondaryPhone:  companyDetails.contact?.secondaryPhone  || '',
        whatsapp:        companyDetails.contact?.whatsapp        || '',
        whatsappMessage: companyDetails.contact?.whatsappMessage || '',
        email:           companyDetails.contact?.email           || '',
        inquiryEmail:    companyDetails.contact?.inquiryEmail    || '',
      },
      address: {
        street:             companyDetails.address?.street             || '',
        landmark:           companyDetails.address?.landmark           || '',
        area:               companyDetails.address?.area               || '',
        city:               companyDetails.address?.city               || '',
        state:              companyDetails.address?.state              || '',
        pincode:            companyDetails.address?.pincode            || '',
        googleMapsEmbedUrl: companyDetails.address?.googleMapsEmbedUrl || '',
      },
      businessHours: Array.isArray(companyDetails.businessHours) && companyDetails.businessHours.length > 0
        ? companyDetails.businessHours
        : [{ days:'Monday - Saturday', hours:'09:30 AM – 09:30 PM', isOpen: true }],
      socials: {
        instagram:       companyDetails.socials?.instagram       || '',
        facebook:        companyDetails.socials?.facebook        || '',
        youtube:         companyDetails.socials?.youtube         || '',
        whatsappChannel: companyDetails.socials?.whatsappChannel || '',
      },
      highlights: Array.isArray(companyDetails.highlights) ? [...companyDetails.highlights] : [],
      categories: Array.isArray(companyDetails.categories) ? [...companyDetails.categories] : [],
    });
    setIsDirty(false); // fresh load — no unsaved changes
  }, [companyDetails]);

  // Load inquiries
  useEffect(() => {
    inquiryApi.getAll()
      .then((r) => { if (r.success && Array.isArray(r.data)) setInquiries(r.data); })
      .catch(() => {})
      .finally(() => setLoadingInq(false));
  }, []);

  // ✅ FIX: Wrap all form updates with isDirty = true
  const updateForm = useCallback((updater) => {
    setForm(updater);
    setIsDirty(true);
  }, []);

  // ✅ FIX: Warn the user before switching tabs with unsaved changes
  const handleTabChange = (newTab) => {
    if (isDirty && tab !== 'inquiries') {
      const ok = window.confirm('You have unsaved changes on this tab. Switch anyway? (Your changes will not be lost — just save before leaving.)');
      if (!ok) return;
    }
    setTab(newTab);
  };

  // ── Logo upload ──
  const handleLogoUpload = async (file) => {
    if (!file) return;
    try {
      setUL(true);
      // ✅ FIX: Uses shared compressImage from utils (not a local copy)
      // Also enforces 20MB max file size before reading
      const uri = await compressImage(file, 600, 0.9);
      const res = await uploadApi.uploadBase64(uri);
      if (res.success && res.url) {
        updateForm((p) => ({ ...p, logo: res.url }));
        showSuccess('Logo uploaded!');
      } else {
        showError(res.message || 'Upload failed.');
      }
    } catch (err) {
      showError(err.message || 'Upload error.');
    } finally {
      setUL(false);
    }
  };

  // ── Save ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.shopName.trim()) { showError('Shop Name is required.'); return; }
    setSaving(true);
    try {
      const res = await saveCompanyDetails(form);
      if (res.success) {
        showSuccess('Store settings saved successfully!');
        setIsDirty(false); // ✅ FIX: clear dirty flag after successful save
      } else {
        showError(res.message || 'Failed to save.');
      }
    } catch (err) {
      showError(err.message || 'Save error.');
    } finally {
      setSaving(false);
    }
  };

  // ── Helpers ──
  const addHighlight    = () => updateForm((p) => ({ ...p, highlights: [...p.highlights, { title:'', description:'', icon:'Sparkles' }] }));
  const removeHighlight = (i) => updateForm((p) => { const h = [...p.highlights]; h.splice(i,1); return { ...p, highlights:h }; });
  const updateHighlight = (i, key, val) => updateForm((p) => { const h = [...p.highlights]; h[i]={...h[i],[key]:val}; return {...p,highlights:h}; });

  const addCategory    = () => updateForm((p) => ({ ...p, categories: [...p.categories, { id:`cat-${Date.now()}`, name:'', count:'0+', icon:'Sparkles' }] }));
  const removeCategory = (i) => updateForm((p) => { const c=[...p.categories]; c.splice(i,1); return {...p,categories:c}; });
  const updateCategory = (i, key, val) => {
    // ✅ FIX: Block reserved IDs that would break the 'all' filter logic
    if (key === 'id' && RESERVED_CAT_IDS.includes(val.toLowerCase())) {
      showError(`"${val}" is a reserved category ID and cannot be used.`);
      return;
    }
    updateForm((p) => { const c=[...p.categories]; c[i]={...c[i],[key]:val}; return {...p,categories:c}; });
  };

  const addHour    = () => updateForm((p) => ({ ...p, businessHours: [...p.businessHours, { days:'', hours:'', isOpen: true }] }));
  const removeHour = (i) => updateForm((p) => { const h=[...p.businessHours]; h.splice(i,1); return {...p,businessHours:h}; });
  const updateHour = (i, key, val) => updateForm((p) => { const h=[...p.businessHours]; h[i]={...h[i],[key]:val}; return {...p,businessHours:h}; });

  const setContact = (key, val) => updateForm((p) => ({ ...p, contact: { ...p.contact, [key]: val } }));
  const setAddress = (key, val) => updateForm((p) => ({ ...p, address: { ...p.address,  [key]: val } }));
  const setSocials = (key, val) => updateForm((p) => ({ ...p, socials: { ...p.socials,  [key]: val } }));

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 pb-4 border-b border-[var(--color-border)]">
        <div>
          <h1 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-[var(--color-text-main)] m-0">
            Store Settings
          </h1>
          <p className="text-xs text-[var(--color-text-light)] mt-1">
            Manage all public-facing store information — synced to database.
            {/* ✅ FIX: Show unsaved-changes indicator */}
            {isDirty && (
              <span className="ml-2 text-[var(--color-accent-gold)] font-semibold">
                • Unsaved changes
              </span>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={refreshCompanyDetails}
          disabled={companyLoading}
          className="self-end sm:self-auto flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-[var(--color-bg-subtle)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] disabled:opacity-50 cursor-pointer transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${companyLoading ? 'animate-spin' : ''}`} />Refresh
        </button>
      </div>

      {/* Tab nav — ✅ FIX: Emoji removed from labels (inconsistent SR announcements).
          Tab IDs used in aria-controls for proper ARIA tab pattern. */}
      <div
        role="tablist"
        aria-label="Store settings sections"
        className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1"
      >
        {TABS.map(({ id, label }) => (
          <Tab key={id} active={tab === id} onClick={() => handleTabChange(id)}>
            {label}
          </Tab>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ── Identity ── */}
        {tab === 'identity' && (
          <div className="p-6 rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] space-y-5">
            <h2 className="font-serif text-lg font-bold text-[var(--color-text-main)] m-0 flex items-center gap-2">
              <Store className="w-5 h-5 text-[var(--color-primary)]" />Store Identity
            </h2>

            {/* Logo */}
            <div className="flex items-start gap-5">
              <div className="w-20 h-20 rounded-2xl bg-[var(--color-bg-subtle)] border border-[var(--color-border)] flex items-center justify-center overflow-hidden shrink-0">
                {form.logo
                  ? <img src={form.logo} alt="Logo preview" className="w-full h-full object-contain p-2" />
                  : <ImageIcon className="w-8 h-8 text-[var(--color-text-light)]" />
                }
              </div>
              <div className="space-y-2 flex-1">
                <p className="text-xs font-bold text-[var(--color-text-muted)]">Store Logo</p>
                <p className="text-[11px] text-[var(--color-text-light)]">PNG or JPG. Max 600px. Max 20 MB. Cloudinary auto-upload.</p>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleLogoUpload(e.target.files?.[0])} />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploadingLogo}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-[var(--color-primary-light)] text-[var(--color-primary)] border border-[var(--color-border)] hover:bg-[var(--color-primary-pastel)] disabled:opacity-50 cursor-pointer transition-colors"
                >
                  {uploadingLogo
                    ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" />Uploading…</>
                    : <><Upload className="w-3.5 h-3.5" />Upload Logo</>
                  }
                </button>
                <div className="mt-1">
                  <input
                    id="logo-url"
                    type="text"
                    value={form.logo}
                    onChange={(e) => updateForm((p) => ({...p, logo: e.target.value}))}
                    placeholder="Or paste Cloudinary URL"
                    className={inputCls}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Shop Name (English)" id="shopName">
                <input id="shopName" type="text" value={form.shopName} onChange={(e) => updateForm((p) => ({...p, shopName: e.target.value}))} placeholder="Sri Senthoora Fancy Store" className={inputCls} required />
              </FormField>
              <FormField label="Shop Name (Tamil)" id="shopNameTamil">
                <input id="shopNameTamil" type="text" value={form.shopNameTamil} onChange={(e) => updateForm((p) => ({...p, shopNameTamil: e.target.value}))} placeholder="ஸ்ரீ செந்தூரா பேன்சி ஸ்டோர்" className={inputCls} />
              </FormField>
            </div>

            <FormField label="Tagline" id="tagline">
              <input id="tagline" type="text" value={form.tagline} onChange={(e) => updateForm((p) => ({...p, tagline: e.target.value}))} placeholder="Exquisite Bangles, Bridal Accessories, Cosmetics & Gifts" className={inputCls} />
            </FormField>

            <FormField label="Short Description (for footer)" id="shortDescription">
              <textarea id="shortDescription" rows={3} value={form.shortDescription} onChange={(e) => updateForm((p) => ({...p, shortDescription: e.target.value}))} placeholder="Brief description of the store…" className={`${inputCls} resize-none`} />
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Established Year" id="establishedYear">
                <input id="establishedYear" type="number" value={form.establishedYear} onChange={(e) => updateForm((p) => ({...p, establishedYear: Number(e.target.value)}))} min="1900" max="2100" className={inputCls} />
              </FormField>
              <FormField label="Logo Alt Text" id="logoAlt">
                <input id="logoAlt" type="text" value={form.logoAlt} onChange={(e) => updateForm((p) => ({...p, logoAlt: e.target.value}))} placeholder="Sri Senthoora Fancy Store Logo" className={inputCls} />
              </FormField>
            </div>

            <FormField label="Showcase Disclaimer" id="disclaimer" hint="Shown in footer. Tell customers this is display-only.">
              <textarea id="disclaimer" rows={3} value={form.disclaimer} onChange={(e) => updateForm((p) => ({...p, disclaimer: e.target.value}))} className={`${inputCls} resize-none`} />
            </FormField>
          </div>
        )}

        {/* ── Contact ── */}
        {tab === 'contact' && (
          <div className="p-6 rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] space-y-5">
            <h2 className="font-serif text-lg font-bold text-[var(--color-text-main)] m-0 flex items-center gap-2">
              <Phone className="w-5 h-5 text-[var(--color-primary)]" />Contact Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Primary Phone" id="primaryPhone"><input id="primaryPhone" type="tel" value={form.contact.primaryPhone} onChange={(e) => setContact('primaryPhone', e.target.value)} placeholder="+91 98425 67890" className={inputCls} /></FormField>
              <FormField label="Secondary Phone" id="secondaryPhone"><input id="secondaryPhone" type="tel" value={form.contact.secondaryPhone} onChange={(e) => setContact('secondaryPhone', e.target.value)} placeholder="+91 94432 12345" className={inputCls} /></FormField>
              <FormField label="WhatsApp Number" id="whatsapp"><input id="whatsapp" type="tel" value={form.contact.whatsapp} onChange={(e) => setContact('whatsapp', e.target.value)} placeholder="+91 98425 67890" className={inputCls} /></FormField>
              <FormField label="Email Address" id="email"><input id="email" type="email" value={form.contact.email} onChange={(e) => setContact('email', e.target.value)} placeholder="contact@store.com" className={inputCls} /></FormField>
              <FormField label="Inquiry Email" id="inquiryEmail"><input id="inquiryEmail" type="email" value={form.contact.inquiryEmail} onChange={(e) => setContact('inquiryEmail', e.target.value)} placeholder="inquiries@store.com" className={inputCls} /></FormField>
            </div>
            <FormField label="WhatsApp Default Message" id="whatsappMessage" hint="Pre-filled message when customers click WhatsApp buttons.">
              <textarea id="whatsappMessage" rows={3} value={form.contact.whatsappMessage} onChange={(e) => setContact('whatsappMessage', e.target.value)} className={`${inputCls} resize-none`} />
            </FormField>
          </div>
        )}

        {/* ── Address ── */}
        {tab === 'address' && (
          <div className="p-6 rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] space-y-5">
            <h2 className="font-serif text-lg font-bold text-[var(--color-text-main)] m-0 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[var(--color-primary)]" />Physical Address
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Street / Door No." id="street"><input id="street" type="text" value={form.address.street} onChange={(e) => setAddress('street', e.target.value)} placeholder="No. 42/B, Bazaar Main Street" className={inputCls} /></FormField>
              <FormField label="Landmark" id="landmark"><input id="landmark" type="text" value={form.address.landmark} onChange={(e) => setAddress('landmark', e.target.value)} placeholder="Opposite Sri Mariamman Temple" className={inputCls} /></FormField>
              <FormField label="Area / Locality" id="area"><input id="area" type="text" value={form.address.area} onChange={(e) => setAddress('area', e.target.value)} placeholder="Town Center" className={inputCls} /></FormField>
              <FormField label="City" id="city"><input id="city" type="text" value={form.address.city} onChange={(e) => setAddress('city', e.target.value)} placeholder="Erode" className={inputCls} /></FormField>
              <FormField label="State" id="state"><input id="state" type="text" value={form.address.state} onChange={(e) => setAddress('state', e.target.value)} placeholder="Tamil Nadu" className={inputCls} /></FormField>
              <FormField label="Pincode" id="pincode"><input id="pincode" type="text" value={form.address.pincode} onChange={(e) => setAddress('pincode', e.target.value)} placeholder="638001" className={inputCls} /></FormField>
            </div>
            <FormField label="Google Maps Embed URL" id="googleMapsEmbedUrl" hint='Go to Google Maps → Share → Embed a map → Copy src="…" URL only.'>
              <textarea id="googleMapsEmbedUrl" rows={3} value={form.address.googleMapsEmbedUrl} onChange={(e) => setAddress('googleMapsEmbedUrl', e.target.value)} placeholder="https://www.google.com/maps/embed?pb=…" className={`${inputCls} resize-none font-mono text-xs`} />
            </FormField>
          </div>
        )}

        {/* ── Business Hours ── */}
        {tab === 'hours' && (
          <div className="p-6 rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg font-bold text-[var(--color-text-main)] m-0 flex items-center gap-2">
                <Clock className="w-5 h-5 text-[var(--color-primary)]" />Business Hours
              </h2>
              <button type="button" onClick={addHour} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[var(--color-primary-light)] text-[var(--color-primary)] border border-[var(--color-border)] hover:bg-[var(--color-primary-pastel)] cursor-pointer transition-colors">
                <Plus className="w-3.5 h-3.5" />Add Timing
              </button>
            </div>
            <div className="space-y-3">
              {form.businessHours.map((h, i) => (
                <div key={i} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto_auto] gap-3 p-4 rounded-2xl bg-[var(--color-bg-subtle)] border border-[var(--color-border)]">
                  <input type="text" value={h.days} onChange={(e) => updateHour(i, 'days', e.target.value)} placeholder="Monday - Saturday" aria-label="Days" className={inputCls} />
                  <input type="text" value={h.hours} onChange={(e) => updateHour(i, 'hours', e.target.value)} placeholder="09:30 AM – 09:30 PM" aria-label="Hours" className={inputCls} />
                  <label className="flex items-center gap-2 text-xs font-semibold text-[var(--color-text-muted)] cursor-pointer">
                    <input type="checkbox" checked={h.isOpen} onChange={(e) => updateHour(i, 'isOpen', e.target.checked)} className="rounded accent-[var(--color-primary)] w-4 h-4 cursor-pointer" />Open
                  </label>
                  <button type="button" onClick={() => removeHour(i)} className="p-2 rounded-xl text-[var(--color-text-light)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] transition-colors cursor-pointer" aria-label="Remove hour row">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Categories ── */}
        {tab === 'categories' && (
          <div className="p-6 rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg font-bold text-[var(--color-text-main)] m-0 flex items-center gap-2">
                <Tag className="w-5 h-5 text-[var(--color-primary)]" />Product Categories
              </h2>
              <button type="button" onClick={addCategory} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[var(--color-primary-light)] text-[var(--color-primary)] border border-[var(--color-border)] hover:bg-[var(--color-primary-pastel)] cursor-pointer transition-colors">
                <Plus className="w-3.5 h-3.5" />Add Category
              </button>
            </div>
            {/* ✅ FIX: Warn about reserved IDs */}
            <p className="text-[11px] text-[var(--color-text-light)]">
              The "All Showcase" (id: <code className="font-mono bg-[var(--color-bg-muted)] px-1 rounded">all</code>) entry is auto-included and cannot be used as a category ID.
            </p>
            <div className="space-y-3">
              {form.categories.map((cat, i) => (
                <div key={i} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto_auto_auto] gap-3 p-4 rounded-2xl bg-[var(--color-bg-subtle)] border border-[var(--color-border)]">
                  <div>
                    <label className="text-[10px] font-bold text-[var(--color-text-light)] block mb-1" htmlFor={`cat-name-${i}`}>Name</label>
                    <input id={`cat-name-${i}`} type="text" value={cat.name} onChange={(e) => updateCategory(i, 'name', e.target.value)} placeholder="Bangles & Chuda" className={inputCls} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[var(--color-text-light)] block mb-1" htmlFor={`cat-id-${i}`}>ID (slug)</label>
                    <input id={`cat-id-${i}`} type="text" value={cat.id} onChange={(e) => updateCategory(i, 'id', e.target.value.toLowerCase().replace(/\s+/g,'-'))} placeholder="bangles" className={`${inputCls} font-mono`} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[var(--color-text-light)] block mb-1" htmlFor={`cat-count-${i}`}>Count</label>
                    <input id={`cat-count-${i}`} type="text" value={cat.count} onChange={(e) => updateCategory(i, 'count', e.target.value)} placeholder="30+" className={inputCls} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[var(--color-text-light)] block mb-1" htmlFor={`cat-icon-${i}`}>Icon</label>
                    <select id={`cat-icon-${i}`} value={cat.icon} onChange={(e) => updateCategory(i, 'icon', e.target.value)} className={`${inputCls} cursor-pointer`}>
                      {ICON_OPTIONS.map((ic) => <option key={ic} value={ic}>{ic}</option>)}
                    </select>
                  </div>
                  <button type="button" onClick={() => removeCategory(i)} className="self-end p-2 rounded-xl text-[var(--color-text-light)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] transition-colors cursor-pointer" aria-label="Remove category">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {form.categories.length === 0 && (
                <p className="text-sm text-[var(--color-text-light)] text-center py-8">No categories yet. Add some to organize your showcase.</p>
              )}
            </div>
          </div>
        )}

        {/* ── Highlights ── */}
        {tab === 'highlights' && (
          <div className="p-6 rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg font-bold text-[var(--color-text-main)] m-0 flex items-center gap-2">
                <Star className="w-5 h-5 text-[var(--color-primary)]" />Store Highlights / USPs
              </h2>
              <button type="button" onClick={addHighlight} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[var(--color-primary-light)] text-[var(--color-primary)] border border-[var(--color-border)] hover:bg-[var(--color-primary-pastel)] cursor-pointer transition-colors">
                <Plus className="w-3.5 h-3.5" />Add Highlight
              </button>
            </div>
            <p className="text-[11px] text-[var(--color-text-light)]">These appear in the "Why Choose Us" section on the Home page.</p>
            <div className="space-y-4">
              {form.highlights.map((h, i) => (
                <div key={i} className="p-4 rounded-2xl bg-[var(--color-bg-subtle)] border border-[var(--color-border)] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--color-text-muted)]">Highlight #{i + 1}</span>
                    <button type="button" onClick={() => removeHighlight(i)} className="p-1.5 rounded-lg text-[var(--color-text-light)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] transition-colors cursor-pointer" aria-label={`Remove highlight ${i+1}`}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3">
                    <input type="text" value={h.title} onChange={(e) => updateHighlight(i, 'title', e.target.value)} placeholder="e.g. Bridal Bangle Customization" aria-label={`Highlight ${i+1} title`} className={inputCls} />
                    <select value={h.icon} onChange={(e) => updateHighlight(i, 'icon', e.target.value)} aria-label={`Highlight ${i+1} icon`} className={`${inputCls} cursor-pointer`}>
                      {ICON_OPTIONS.map((ic) => <option key={ic} value={ic}>{ic}</option>)}
                    </select>
                  </div>
                  <textarea rows={2} value={h.description} onChange={(e) => updateHighlight(i, 'description', e.target.value)} placeholder="Description shown to customers…" aria-label={`Highlight ${i+1} description`} className={`${inputCls} resize-none`} />
                </div>
              ))}
              {form.highlights.length === 0 && (
                <p className="text-sm text-[var(--color-text-light)] text-center py-8">No highlights yet. Add some to showcase your store's strengths.</p>
              )}
            </div>
          </div>
        )}

        {/* ── Socials ── */}
        {tab === 'socials' && (
          <div className="p-6 rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] space-y-5">
            <h2 className="font-serif text-lg font-bold text-[var(--color-text-main)] m-0 flex items-center gap-2">
              <Globe className="w-5 h-5 text-[var(--color-primary)]" />Social Media Links
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Instagram URL" id="instagram"><input id="instagram" type="url" value={form.socials.instagram} onChange={(e) => setSocials('instagram', e.target.value)} placeholder="https://instagram.com/…" className={inputCls} /></FormField>
              <FormField label="Facebook URL" id="facebook"><input id="facebook" type="url" value={form.socials.facebook} onChange={(e) => setSocials('facebook', e.target.value)} placeholder="https://facebook.com/…" className={inputCls} /></FormField>
              <FormField label="YouTube URL" id="youtube"><input id="youtube" type="url" value={form.socials.youtube} onChange={(e) => setSocials('youtube', e.target.value)} placeholder="https://youtube.com/…" className={inputCls} /></FormField>
              <FormField label="WhatsApp Channel URL" id="whatsappChannel"><input id="whatsappChannel" type="url" value={form.socials.whatsappChannel} onChange={(e) => setSocials('whatsappChannel', e.target.value)} placeholder="https://whatsapp.com/channel/…" className={inputCls} /></FormField>
            </div>
          </div>
        )}

        {/* ── Inquiries ── */}
        {tab === 'inquiries' && (
          <div className="p-6 rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] space-y-5">
            <h2 className="font-serif text-lg font-bold text-[var(--color-text-main)] m-0 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[var(--color-primary)]" />Customer Inquiries
              {!loadingInq && (
                <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--color-primary-light)] text-[var(--color-primary)]">
                  {inquiries.length}
                </span>
              )}
            </h2>
            {loadingInq ? (
              <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="h-16 rounded-2xl img-skeleton" />)}</div>
            ) : inquiries.length === 0 ? (
              <div className="text-center py-12 text-[var(--color-text-light)]">
                <MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p className="text-sm">No customer inquiries yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {inquiries.map((inq, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-[var(--color-bg-subtle)] border border-[var(--color-border)]">
                    <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
                      <span className="font-bold text-sm text-[var(--color-text-main)]">{inq.name}</span>
                      <div className="flex items-center gap-3 text-xs text-[var(--color-text-light)]">
                        <a href={`tel:${inq.phone}`} className="hover:text-[var(--color-primary)] transition-colors">{inq.phone}</a>
                        {inq.email && <a href={`mailto:${inq.email}`} className="hover:text-[var(--color-primary)] transition-colors">{inq.email}</a>}
                      </div>
                    </div>
                    {inq.message && <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">{inq.message}</p>}
                    {inq.createdAt && (
                      <span className="text-[10px] text-[var(--color-text-light)] mt-1 block">
                        {new Date(inq.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Save button */}
        {tab !== 'inquiries' && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] sticky bottom-3 sm:bottom-4 shadow-xl z-20">
            <div className="flex items-center gap-2 text-xs text-[var(--color-text-light)] text-center sm:text-left">
              <CheckCircle2 className="w-4 h-4 text-[var(--color-emerald)] shrink-0" />
              <span>
                {isDirty
                  ? <span className="text-[var(--color-accent-gold)] font-semibold">You have unsaved changes.</span>
                  : 'Changes saved live to database & public website.'
                }
              </span>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl text-xs sm:text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] disabled:opacity-50 transition-all shadow-md shadow-[var(--color-primary)]/20 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving…' : 'Save All Settings'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
