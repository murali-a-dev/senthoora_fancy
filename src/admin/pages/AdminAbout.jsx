import { useState, useEffect, useRef } from 'react';
import {
  Save,
  Store,
  Phone,
  MapPin,
  Clock,
  Globe,
  Upload,
  Sparkles,
  MessageSquare,
  CheckCircle2,
  ExternalLink,
  MessageCircle,
  AlertCircle,
  RefreshCw,
  Image as ImageIcon,
} from 'lucide-react';
import { useCompany } from '../../context/CompanyContext';
import { useToast } from '../../context/ToastContext';
import { uploadApi, inquiryApi } from '../../api/client';
import ImageWithFallback from '../../components/common/ImageWithFallback';

// Reusable canvas compression for logo upload
const compressImage = (file, maxDimension = 600, quality = 0.9) => {
  return new Promise((resolve, reject) => {
    if (!file.type || !file.type.startsWith('image/')) {
      return reject(new Error('Please select an image file (PNG, JPG, WEBP).'));
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to decode image.'));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(e.target.result);
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL(file.type === 'image/png' ? 'image/png' : 'image/jpeg', quality));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};

export default function AdminAbout() {
  const { companyDetails, saveCompanyDetails, refreshCompanyDetails, loading: companyLoading } = useCompany();
  const { showSuccess, showError } = useToast();

  const [activeTab, setActiveTab] = useState('identity'); // 'identity' | 'contact' | 'address' | 'hours' | 'inquiries'
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [inquiries, setInquiries] = useState([]);
  const [loadingInquiries, setLoadingInquiries] = useState(true);
  const fileInputRef = useRef(null);

  // Form State initialized with companyDetails from DB/fallback
  const [formData, setFormData] = useState({
    shopName: '',
    shopNameTamil: '',
    tagline: '',
    shortDescription: '',
    establishedYear: 2018,
    logo: '',
    logoAlt: '',
    contact: {
      primaryPhone: '',
      secondaryPhone: '',
      whatsapp: '',
      whatsappMessage: '',
      email: '',
      inquiryEmail: '',
    },
    address: {
      street: '',
      landmark: '',
      area: '',
      city: '',
      state: '',
      pincode: '',
      googleMapsEmbedUrl: '',
    },
    businessHours: [
      { days: 'Monday - Saturday', hours: '09:30 AM – 09:30 PM', isOpen: true },
      { days: 'Sunday', hours: '10:00 AM – 08:30 PM', isOpen: true },
      { days: 'Festive Days', hours: '09:00 AM – 10:30 PM (Special Timings)', isOpen: true },
    ],
    socials: {
      instagram: '',
      facebook: '',
      youtube: '',
      whatsappChannel: '',
    },
    disclaimer: '',
  });

  // Sync state when companyDetails loads
  useEffect(() => {
    if (companyDetails) {
      setFormData({
        shopName: companyDetails.shopName || '',
        shopNameTamil: companyDetails.shopNameTamil || '',
        tagline: companyDetails.tagline || '',
        shortDescription: companyDetails.shortDescription || '',
        establishedYear: companyDetails.establishedYear || 2018,
        logo: companyDetails.logo || '/logo_2.png',
        logoAlt: companyDetails.logoAlt || 'Sri Senthoora Fancy Store Logo',
        contact: {
          primaryPhone: companyDetails.contact?.primaryPhone || '',
          secondaryPhone: companyDetails.contact?.secondaryPhone || '',
          whatsapp: companyDetails.contact?.whatsapp || '',
          whatsappMessage: companyDetails.contact?.whatsappMessage || '',
          email: companyDetails.contact?.email || '',
          inquiryEmail: companyDetails.contact?.inquiryEmail || '',
        },
        address: {
          street: companyDetails.address?.street || '',
          landmark: companyDetails.address?.landmark || '',
          area: companyDetails.address?.area || '',
          city: companyDetails.address?.city || '',
          state: companyDetails.address?.state || '',
          pincode: companyDetails.address?.pincode || '',
          googleMapsEmbedUrl: companyDetails.address?.googleMapsEmbedUrl || '',
        },
        businessHours: Array.isArray(companyDetails.businessHours) && companyDetails.businessHours.length > 0
          ? companyDetails.businessHours
          : [
              { days: 'Monday - Saturday', hours: '09:30 AM – 09:30 PM', isOpen: true },
              { days: 'Sunday', hours: '10:00 AM – 08:30 PM', isOpen: true },
            ],
        socials: {
          instagram: companyDetails.socials?.instagram || '',
          facebook: companyDetails.socials?.facebook || '',
          youtube: companyDetails.socials?.youtube || '',
          whatsappChannel: companyDetails.socials?.whatsappChannel || '',
        },
        disclaimer: companyDetails.disclaimer || '',
      });
    }
  }, [companyDetails]);

  // Load Customer Inquiries
  useEffect(() => {
    async function loadInquiries() {
      try {
        const res = await inquiryApi.getAll();
        if (res.success && Array.isArray(res.data)) {
          setInquiries(res.data);
        }
      } catch (err) {
        console.warn('Could not load inquiries:', err.message);
      } finally {
        setLoadingInquiries(false);
      }
    }
    loadInquiries();
  }, []);

  // Handle Logo Upload to Cloudinary
  const handleLogoUpload = async (file) => {
    if (!file) return;
    try {
      setUploadingLogo(true);
      const compressedDataUri = await compressImage(file);
      const res = await uploadApi.uploadBase64(compressedDataUri);
      if (res.success && res.url) {
        setFormData((prev) => ({ ...prev, logo: res.url }));
        showSuccess('Store Logo successfully uploaded to Cloudinary!');
      } else {
        showError(res.message || 'Logo upload failed.');
      }
    } catch (err) {
      showError(err.message || 'Failed to upload logo.');
    } finally {
      setUploadingLogo(false);
    }
  };

  // Submit all details to Firebase
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.shopName.trim()) {
      showError('Shop Name is required.');
      return;
    }
    setSaving(true);
    try {
      const res = await saveCompanyDetails(formData);
      if (res.success) {
        showSuccess('All Store & Contact details successfully saved to Firebase Database!');
        refreshCompanyDetails();
      } else {
        showError(res.message || 'Failed to save details to Firebase.');
      }
    } catch (err) {
      showError('Error saving: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'identity', label: 'Store Identity & Branding', icon: Store },
    { id: 'contact', label: 'Contact Details', icon: Phone },
    { id: 'address', label: 'Address & Location', icon: MapPin },
    { id: 'hours', label: 'Timings & Socials', icon: Clock },
    { id: 'inquiries', label: `Customer Inquiries (${inquiries.length})`, icon: MessageSquare },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
        <div>
          <div className="flex items-center gap-2">
            <Store className="w-6 h-6 text-rose-600 dark:text-rose-400" />
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100 m-0">
              Store Details & Brand Manager
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Centrally manage shop information, branding, phone numbers, addresses, and customer inquiries saved in Firebase.
          </p>
        </div>

        <button
          onClick={refreshCompanyDetails}
          className="p-2.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 shadow-2xs transition-colors"
          title="Refresh details from Firebase"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Segmented Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-stone-100 dark:bg-stone-900 overflow-x-auto scrollbar-none border border-stone-200/80 dark:border-stone-800">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === id
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-white/60 dark:hover:bg-stone-800'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Main Settings Form */}
      {activeTab !== 'inquiries' ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-stone-900 border border-rose-100/80 dark:border-stone-800 shadow-2xs space-y-6">
            {/* TAB 1: STORE IDENTITY & BRANDING */}
            {activeTab === 'identity' && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="border-b border-stone-100 dark:border-stone-800 pb-3">
                  <h2 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100 m-0">
                    Store Identity & Story
                  </h2>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    Configure your shop's official trade name, Tamil representation, and logo assets.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="shopNameInput" className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      Shop Name (English) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="shopNameInput"
                      type="text"
                      required
                      value={formData.shopName}
                      onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                      placeholder="Sri Senthoora Fancy Store"
                      className="w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-stone-900 dark:text-stone-100 focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="shopNameTamilInput" className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      Shop Name (Tamil)
                    </label>
                    <input
                      id="shopNameTamilInput"
                      type="text"
                      value={formData.shopNameTamil}
                      onChange={(e) => setFormData({ ...formData, shopNameTamil: e.target.value })}
                      placeholder="ஸ்ரீ செந்தூரா பேன்சி ஸ்டோர்"
                      className="w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-stone-900 dark:text-stone-100 focus:border-rose-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="taglineInput" className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      Brand Tagline
                    </label>
                    <input
                      id="taglineInput"
                      type="text"
                      value={formData.tagline}
                      onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                      placeholder="Exquisite Bangles, Bridal Accessories, Cosmetics & Gifts"
                      className="w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-stone-900 dark:text-stone-100 focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="estYearInput" className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      Established Year
                    </label>
                    <input
                      id="estYearInput"
                      type="number"
                      value={formData.establishedYear}
                      onChange={(e) => setFormData({ ...formData, establishedYear: Number(e.target.value) })}
                      placeholder="2018"
                      className="w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-stone-900 dark:text-stone-100 focus:border-rose-500"
                    />
                  </div>
                </div>

                {/* Logo Uploader / URL Field */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Store Logo (Cloudinary Upload or Image URL)
                  </label>
                  <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
                    <div className="w-16 h-16 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                      {formData.logo ? (
                        <img src={formData.logo} alt="Logo Preview" className="w-full h-full object-contain" />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-stone-400" />
                      )}
                    </div>
                    <div className="flex-1 w-full space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={formData.logo}
                          onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                          placeholder="/logo_2.png or https://res.cloudinary.com/..."
                          className="flex-1 px-4 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingLogo}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-stone-800 dark:text-rose-300 border border-rose-200 dark:border-stone-700 cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>{uploadingLogo ? 'Uploading...' : 'Upload'}</span>
                        </button>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={(e) => handleLogoUpload(e.target.files?.[0])}
                          accept="image/*"
                          className="hidden"
                        />
                      </div>
                      <span className="text-[10px] text-stone-400 block">
                        Changes are reflected across header, footer, brand badges, and about showcase.
                      </span>
                    </div>
                  </div>
                </div>

                {/* About Story & Description */}
                <div>
                  <label htmlFor="storyInput" className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Store Story & Description
                  </label>
                  <textarea
                    id="storyInput"
                    rows={4}
                    value={formData.shortDescription}
                    onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                    placeholder="Sri Senthoora Fancy Store is your premier destination for bridal bangles, imitation jewelry..."
                    className="w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-stone-900 dark:text-stone-100 focus:border-rose-500 resize-none"
                  ></textarea>
                </div>

                {/* Showcase Disclaimer Notice */}
                <div>
                  <label htmlFor="disclaimerInput" className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Showcase Disclaimer Notice (Banner in Footer & Products)
                  </label>
                  <textarea
                    id="disclaimerInput"
                    rows={3}
                    value={formData.disclaimer}
                    onChange={(e) => setFormData({ ...formData, disclaimer: e.target.value })}
                    placeholder="Notice: Prices showcased are for customer reference only. We do not provide online checkout..."
                    className="w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100 focus:border-rose-500 resize-none"
                  ></textarea>
                </div>
              </div>
            )}

            {/* TAB 2: CONTACT DETAILS */}
            {activeTab === 'contact' && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="border-b border-stone-100 dark:border-stone-800 pb-3">
                  <h2 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100 m-0">
                    Contact Information
                  </h2>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    Customer assistance numbers, WhatsApp chat link, and store emails.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="primaryPhoneInput" className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      Primary Phone <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="primaryPhoneInput"
                      type="text"
                      required
                      value={formData.contact.primaryPhone}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contact: { ...formData.contact, primaryPhone: e.target.value },
                        })
                      }
                      placeholder="+91 98425 67890"
                      className="w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-stone-900 dark:text-stone-100 focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="secondaryPhoneInput" className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      Secondary Phone (Optional)
                    </label>
                    <input
                      id="secondaryPhoneInput"
                      type="text"
                      value={formData.contact.secondaryPhone}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contact: { ...formData.contact, secondaryPhone: e.target.value },
                        })
                      }
                      placeholder="+91 94432 12345"
                      className="w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-stone-900 dark:text-stone-100 focus:border-rose-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="whatsappInput" className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      WhatsApp Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="whatsappInput"
                      type="text"
                      required
                      value={formData.contact.whatsapp}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contact: { ...formData.contact, whatsapp: e.target.value },
                        })
                      }
                      placeholder="+91 98425 67890"
                      className="w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-stone-900 dark:text-stone-100 focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="emailInput" className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      Store Email
                    </label>
                    <input
                      id="emailInput"
                      type="email"
                      value={formData.contact.email}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contact: { ...formData.contact, email: e.target.value },
                        })
                      }
                      placeholder="contact@senthoorafancy.com"
                      className="w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-stone-900 dark:text-stone-100 focus:border-rose-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="whatsappMsgInput" className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Default WhatsApp Inquiry Pre-fill Message
                  </label>
                  <input
                    id="whatsappMsgInput"
                    type="text"
                    value={formData.contact.whatsappMessage}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contact: { ...formData.contact, whatsappMessage: e.target.value },
                      })
                    }
                    placeholder="Hello Sri Senthoora Fancy Store, I saw your product showcase and would like to know more details."
                    className="w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100 focus:border-rose-500"
                  />
                </div>
              </div>
            )}

            {/* TAB 3: ADDRESS & LOCATION */}
            {activeTab === 'address' && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="border-b border-stone-100 dark:border-stone-800 pb-3">
                  <h2 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100 m-0">
                    Physical Store Location & Map
                  </h2>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    Showroom address displayed in the footer and Contact page.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="streetInput" className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      Street & Door Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="streetInput"
                      type="text"
                      required
                      value={formData.address.street}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: { ...formData.address, street: e.target.value },
                        })
                      }
                      placeholder="No. 42/B, Bazaar Main Street"
                      className="w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-stone-900 dark:text-stone-100 focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="landmarkInput" className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      Landmark
                    </label>
                    <input
                      id="landmarkInput"
                      type="text"
                      value={formData.address.landmark}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: { ...formData.address, landmark: e.target.value },
                        })
                      }
                      placeholder="Opposite Sri Mariamman Temple Arch"
                      className="w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-stone-900 dark:text-stone-100 focus:border-rose-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="cityInput" className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      City <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="cityInput"
                      type="text"
                      required
                      value={formData.address.city}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: { ...formData.address, city: e.target.value },
                        })
                      }
                      placeholder="Erode"
                      className="w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-stone-900 dark:text-stone-100 focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="stateInput" className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      State
                    </label>
                    <input
                      id="stateInput"
                      type="text"
                      value={formData.address.state}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: { ...formData.address, state: e.target.value },
                        })
                      }
                      placeholder="Tamil Nadu"
                      className="w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-stone-900 dark:text-stone-100 focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="pincodeInput" className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      Pincode
                    </label>
                    <input
                      id="pincodeInput"
                      type="text"
                      value={formData.address.pincode}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: { ...formData.address, pincode: e.target.value },
                        })
                      }
                      placeholder="638001"
                      className="w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-stone-900 dark:text-stone-100 focus:border-rose-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="mapsEmbedInput" className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Google Maps Embed URL
                  </label>
                  <input
                    id="mapsEmbedInput"
                    type="url"
                    value={formData.address.googleMapsEmbedUrl}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address, googleMapsEmbedUrl: e.target.value },
                      })
                    }
                    placeholder="https://www.google.com/maps/embed?pb=..."
                    className="w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100 focus:border-rose-500"
                  />
                </div>
              </div>
            )}

            {/* TAB 4: TIMINGS & SOCIALS */}
            {activeTab === 'hours' && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="border-b border-stone-100 dark:border-stone-800 pb-3">
                  <h2 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100 m-0">
                    Business Hours & Social Profiles
                  </h2>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    Showroom visiting hours and community social channels.
                  </p>
                </div>

                {/* Business Hours List */}
                <div className="space-y-3">
                  <span className="text-xs font-bold text-stone-700 dark:text-stone-300 block">
                    Showroom Opening Hours
                  </span>
                  {formData.businessHours.map((bh, idx) => (
                    <div key={idx} className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-stone-400 block mb-1">Days Label</span>
                        <input
                          type="text"
                          value={bh.days}
                          onChange={(e) => {
                            const updated = [...formData.businessHours];
                            updated[idx].days = e.target.value;
                            setFormData({ ...formData, businessHours: updated });
                          }}
                          className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-xs"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-stone-400 block mb-1">Hours Range</span>
                        <input
                          type="text"
                          value={bh.hours}
                          onChange={(e) => {
                            const updated = [...formData.businessHours];
                            updated[idx].hours = e.target.value;
                            setFormData({ ...formData, businessHours: updated });
                          }}
                          className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Social Links */}
                <div className="pt-2 border-t border-stone-100 dark:border-stone-800 space-y-4">
                  <span className="text-xs font-bold text-stone-700 dark:text-stone-300 block">
                    Social Media Channels
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="instagramInput" className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                        Instagram Profile URL
                      </label>
                      <input
                        id="instagramInput"
                        type="url"
                        value={formData.socials.instagram}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            socials: { ...formData.socials, instagram: e.target.value },
                          })
                        }
                        placeholder="https://instagram.com/sri_senthoora_fancy"
                        className="w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100 focus:border-rose-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="facebookInput" className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                        Facebook Page URL
                      </label>
                      <input
                        id="facebookInput"
                        type="url"
                        value={formData.socials.facebook}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            socials: { ...formData.socials, facebook: e.target.value },
                          })
                        }
                        placeholder="https://facebook.com/srisenthoorafancy"
                        className="w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100 focus:border-rose-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="youtubeInput" className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                        YouTube Channel URL
                      </label>
                      <input
                        id="youtubeInput"
                        type="url"
                        value={formData.socials.youtube}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            socials: { ...formData.socials, youtube: e.target.value },
                          })
                        }
                        placeholder="https://youtube.com/@senthoorafancy"
                        className="w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100 focus:border-rose-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="waChannelInput" className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                        WhatsApp Updates Channel
                      </label>
                      <input
                        id="waChannelInput"
                        type="url"
                        value={formData.socials.whatsappChannel}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            socials: { ...formData.socials, whatsappChannel: e.target.value },
                          })
                        }
                        placeholder="https://whatsapp.com/channel/..."
                        className="w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100 focus:border-rose-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="pt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
              <span className="text-[11px] text-stone-400">
                Data is saved directly to your live Firebase database.
              </span>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/20 transition-all cursor-pointer disabled:opacity-50 active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save All Details'}</span>
              </button>
            </div>
          </div>
        </form>
      ) : (
        /* TAB 5: CUSTOMER INQUIRIES */
        <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-rose-100/80 dark:border-stone-800 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
            <h2 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100 m-0">
              Customer Showcase Inquiries ({inquiries.length})
            </h2>
            <span className="text-xs text-stone-500 dark:text-stone-400">
              Direct inquiries from product cards and contact form
            </span>
          </div>

          {loadingInquiries ? (
            <div className="py-8 text-center text-stone-400 text-xs">
              <div className="w-6 h-6 border-2 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              Loading inquiries...
            </div>
          ) : inquiries.length === 0 ? (
            <div className="py-12 text-center text-stone-400 space-y-2">
              <MessageSquare className="w-8 h-8 text-stone-300 dark:text-stone-700 mx-auto" />
              <p className="text-xs">No customer inquiries received yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {inquiries.map((inq) => (
                <div
                  key={inq.id}
                  className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-700/60 space-y-2"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-900 dark:text-stone-100">{inq.name}</span>
                      <a href={`tel:${inq.phone}`} className="font-mono text-rose-600 dark:text-rose-400 hover:underline">
                        {inq.phone}
                      </a>
                      {inq.email && <span className="text-stone-400">({inq.email})</span>}
                    </div>
                    <span className="text-[11px] text-stone-400">
                      {new Date(inq.createdAt || Date.now()).toLocaleString()}
                    </span>
                  </div>

                  {inq.productName && (
                    <div className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                      Inquiring about: {inq.productName}
                    </div>
                  )}

                  <p className="text-xs text-stone-600 dark:text-stone-300 m-0 leading-relaxed">
                    "{inq.message || 'Customer requested contact via phone.'}"
                  </p>

                  <div className="pt-2 flex items-center gap-2">
                    <a
                      href={`https://wa.me/${inq.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                        `Hello ${inq.name}, thank you for contacting ${companyDetails.shopName} regarding your inquiry.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                    >
                      <MessageCircle className="w-3 h-3" />
                      <span>Reply on WhatsApp</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
