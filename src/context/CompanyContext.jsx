import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { companyApi } from '../api/client';

const CompanyContext = createContext(null);

const DEFAULT_COMPANY_DETAILS = {
  shopName: 'Sri Senthoora Fancy Store',
  shopNameTamil: 'ஸ்ரீ செந்தூரா பேன்சி ஸ்டோர்',
  tagline: 'Exquisite Bangles, Bridal Accessories, Cosmetics & Gifts',
  shortDescription:
    'Sri Senthoora Fancy Store is your premier neighborhood destination for bridal bangles, designer imitation jewelry, beauty cosmetics, hair accessories, luxury handbags, and celebratory gifts.',
  establishedYear: 2018,
  logo: '/logo_2.png',
  logoAlt: 'Sri Senthoora Fancy Store Logo',
  emblemIcon: 'sparkles',
  contact: {
    primaryPhone: '+91 98425 67890',
    primaryPhoneRaw: '9842567890',
    secondaryPhone: '+91 94432 12345',
    secondaryPhoneRaw: '9443212345',
    whatsapp: '+91 98425 67890',
    whatsappRaw: '919842567890',
    whatsappMessage:
      'Hello Sri Senthoora Fancy Store, I saw your product showcase and would like to know more details.',
    email: 'contact@senthoorafancy.com',
    inquiryEmail: 'inquiries@senthoorafancy.com',
  },
  address: {
    street: 'No. 42/B, Bazaar Main Street',
    landmark: 'Opposite Sri Mariamman Temple Arch',
    area: 'Town Center',
    city: 'Erode',
    state: 'Tamil Nadu',
    pincode: '638001',
    country: 'India',
    googleMapsQuery: 'Bazaar+Main+Street+Erode+Tamil+Nadu',
    googleMapsEmbedUrl:
      'https://www.google.com/maps/embed?pb=!4v1792487696725!6m8!1m7!1sFdi7n4M3BwV9t7DxFOPPeg!2m2!1d11.364533459150675!2d77.79088610276027!3f330.60326429923094!4f-0.5009201946951976!5f0.7820865974627469',
  },
  businessHours: [
    { days: 'Monday - Saturday', hours: '09:30 AM – 09:30 PM', isOpen: true },
    { days: 'Sunday', hours: '10:00 AM – 08:30 PM', isOpen: true },
    { days: 'Festive Days', hours: '09:00 AM – 10:30 PM (Special Timings)', isOpen: true },
  ],
  highlights: [
    {
      title: 'Bridal Bangles & Chuda Special',
      description:
        'Custom velvet bangle sets, matching bridal stone bangles, and silk-thread bridal sets tailored to your saree shade.',
      icon: 'Crown',
    },
    {
      title: 'Premium 1-Gram Gold & Antique Jewelry',
      description:
        'Intricately finished temple jewelry, matte gold harams, jhumkas, and chokers for weddings and celebrations.',
      icon: 'Gem',
    },
    {
      title: 'Top-Brand Cosmetics & Skincare',
      description:
        '100% original cosmetics, herbal kajals, nail polishes, mehendi cones, and bridal makeup essentials.',
      icon: 'Sparkles',
    },
    {
      title: 'Handbags, Hair Accessories & Gifts',
      description:
        'Trending clutch purses, stylish tote bags, claw clips, fancy stationery, and ready-to-gift festive sets.',
      icon: 'Gift',
    },
  ],
  categories: [
    { id: 'all', name: 'All Showcase', count: '80+', icon: 'Sparkles' },
    { id: 'bangles', name: 'Bangles & Chuda', count: '30+', icon: 'CircleDot' },
    { id: 'jewelry', name: 'Imitation & Antique Jewelry', count: '25+', icon: 'Gem' },
    { id: 'cosmetics', name: 'Cosmetics & Skincare', count: '20+', icon: 'Sparkles' },
    { id: 'hair-accessories', name: 'Hair Accessories & Clips', count: '18+', icon: 'Crown' },
    { id: 'handbags', name: 'Clutches & Handbags', count: '15+', icon: 'ShoppingBag' },
    { id: 'gifts', name: 'Gift Articles & Toys', count: '16+', icon: 'Gift' },
    { id: 'perfumes', name: 'Perfumes & Attars', count: '12+', icon: 'Flame' },
  ],
  socials: {
    instagram: 'https://instagram.com/sri_senthoora_fancy',
    facebook: 'https://facebook.com/srisenthoorafancy',
    whatsappChannel: 'https://whatsapp.com/channel/senthoorafancy',
    youtube: 'https://youtube.com/@senthoorafancy',
  },
  disclaimer:
    'Notice: Sri Senthoora Fancy Store operates as a physical retail experience. Prices and rates showcased on this website are for customer reference and display purposes only. We do not provide online checkout, cart, or payment transactions. Please visit our store in person or contact us on WhatsApp for product inquiries and in-store availability.',
};

export function formatWhatsappRaw(phone) {
  if (!phone) return '';
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length === 10) return '91' + digits;
  if (digits.length === 11 && digits.startsWith('0')) return '91' + digits.slice(1);
  return digits;
}

export function formatPhoneRaw(phone) {
  if (!phone) return '';
  return String(phone).replace(/\D/g, '');
}

export function normalizeCompanyDetails(data, prev = DEFAULT_COMPANY_DETAILS) {
  const fallback = prev || DEFAULT_COMPANY_DETAILS;
  const base = { ...DEFAULT_COMPANY_DETAILS, ...fallback, ...(data || {}) };

  const contactData = {
    ...DEFAULT_COMPANY_DETAILS.contact,
    ...(fallback.contact || {}),
    ...(data?.contact || {}),
  };

  const shopName = data?.shopName || fallback?.shopName || DEFAULT_COMPANY_DETAILS.shopName;

  const whatsappRaw =
    formatWhatsappRaw(contactData.whatsapp) ||
    contactData.whatsappRaw ||
    DEFAULT_COMPANY_DETAILS.contact.whatsappRaw;

  const primaryPhoneRaw =
    formatPhoneRaw(contactData.primaryPhone) ||
    contactData.primaryPhoneRaw ||
    DEFAULT_COMPANY_DETAILS.contact.primaryPhoneRaw;

  const secondaryPhoneRaw =
    formatPhoneRaw(contactData.secondaryPhone) || contactData.secondaryPhoneRaw || '';

  const whatsappMessage =
    contactData.whatsappMessage?.trim() ||
    `Hello ${shopName}, I saw your product showcase and would like to know more details.`;

  return {
    ...base,
    shopName,
    contact: { ...contactData, whatsappRaw, primaryPhoneRaw, secondaryPhoneRaw, whatsappMessage },
    address: {
      ...DEFAULT_COMPANY_DETAILS.address,
      ...(fallback.address || {}),
      ...(data?.address || {}),
    },
    businessHours:
      Array.isArray(data?.businessHours) && data.businessHours.length > 0
        ? data.businessHours
        : fallback.businessHours || DEFAULT_COMPANY_DETAILS.businessHours,
    categories:
      Array.isArray(data?.categories) && data.categories.length > 0
        ? data.categories
        : fallback.categories || DEFAULT_COMPANY_DETAILS.categories,
    highlights:
      Array.isArray(data?.highlights) && data.highlights.length > 0
        ? data.highlights
        : fallback.highlights || DEFAULT_COMPANY_DETAILS.highlights,
    socials: {
      ...DEFAULT_COMPANY_DETAILS.socials,
      ...(fallback.socials || {}),
      ...(data?.socials || {}),
    },
  };
}

export function CompanyProvider({ children }) {
  const [companyDetails, setCompanyDetails] = useState(() =>
    normalizeCompanyDetails(DEFAULT_COMPANY_DETAILS)
  );
  const [loading, setLoading] = useState(true);
  const [isCustomized, setIsCustomized] = useState(false);
  const [error, setError] = useState(null);

  // ✅ FIX: Removed window.companyDetails — it exposed all store config
  // (phone numbers, WhatsApp keys, internal settings) to any site visitor
  // via the browser DevTools console. Never expose internal state on window in production.

  const refreshCompanyDetails = useCallback(async () => {
    try {
      const res = await companyApi.get();
      if (res.success && res.data && Object.keys(res.data).length > 0) {
        setCompanyDetails((prev) => normalizeCompanyDetails(res.data, prev));
        setIsCustomized(true);
      }
    } catch (err) {
      console.warn('Could not fetch store details from backend:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCompanyDetails();
  }, [refreshCompanyDetails]);

  const saveCompanyDetails = async (newDetails) => {
    try {
      const normalized = normalizeCompanyDetails(newDetails, companyDetails);
      const res = await companyApi.update(normalized);
      if (res.success) {
        setCompanyDetails(normalized);
        setIsCustomized(true);
        return { success: true, message: res.message };
      }
      return { success: false, message: res.message || 'Failed to save store details' };
    } catch (err) {
      return { success: false, message: err.message || 'Error saving store details' };
    }
  };

  const getWhatsAppUrl = useCallback(
    (customMessage) => {
      const raw =
        companyDetails?.contact?.whatsappRaw ||
        formatWhatsappRaw(companyDetails?.contact?.whatsapp) ||
        '919842567890';
      const msg =
        customMessage ||
        companyDetails?.contact?.whatsappMessage ||
        `Hello ${companyDetails?.shopName || 'Sri Senthoora Fancy Store'}, I would like to inquire about your products.`;
      return `https://wa.me/${raw}?text=${encodeURIComponent(msg)}`;
    },
    [companyDetails]
  );

  const getProductInquiryUrl = useCallback(
    (product) => {
      const raw =
        companyDetails?.contact?.whatsappRaw ||
        formatWhatsappRaw(companyDetails?.contact?.whatsapp) ||
        '919842567890';
      const shop = companyDetails?.shopName || 'Sri Senthoora Fancy Store';
      const rateStr =
        product?.rateDisplay ||
        (product?.rate ? `₹${Number(product.rate).toLocaleString('en-IN')}` : 'Price on Request');
      const msg = `Hello ${shop}, I am inquiring about "${product?.name || 'this product'}" showcased at ${rateStr}. Is this currently available in your showroom?`;
      return `https://wa.me/${raw}?text=${encodeURIComponent(msg)}`;
    },
    [companyDetails]
  );

  return (
    <CompanyContext.Provider
      value={{
        companyDetails,
        loading,
        isCustomized,
        error,
        saveCompanyDetails,
        refreshCompanyDetails,
        getWhatsAppUrl,
        getProductInquiryUrl,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const context = useContext(CompanyContext);
  if (!context) {
    const fallbackDetails = normalizeCompanyDetails(DEFAULT_COMPANY_DETAILS);
    return {
      companyDetails: fallbackDetails,
      loading: false,
      isCustomized: false,
      error: null,
      saveCompanyDetails: async () => ({ success: false, message: 'No provider' }),
      refreshCompanyDetails: async () => {},
      getWhatsAppUrl: (msg) =>
        `https://wa.me/${fallbackDetails.contact.whatsappRaw}?text=${encodeURIComponent(
          msg || fallbackDetails.contact.whatsappMessage
        )}`,
      getProductInquiryUrl: (product) => {
        const rateStr =
          product?.rateDisplay ||
          (product?.rate ? `₹${Number(product.rate).toLocaleString('en-IN')}` : 'Price on Request');
        return `https://wa.me/${fallbackDetails.contact.whatsappRaw}?text=${encodeURIComponent(
          `Hello ${fallbackDetails.shopName}, I am inquiring about "${product?.name}" showcased at ${rateStr}. Is this currently available in your showroom?`
        )}`;
      },
    };
  }
  return context;
}

export default CompanyContext;
