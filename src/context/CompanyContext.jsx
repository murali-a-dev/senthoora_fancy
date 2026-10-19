import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import defaultCompanyDetails from '../config/companyDetails';
import { companyApi } from '../api/client';

const CompanyContext = createContext(null);

/**
 * Normalizes phone numbers to standard international WhatsApp digits format.
 * (e.g. "+91 98425 67890" -> "919842567890", "9842567890" -> "919842567890")
 */
export function formatWhatsappRaw(phone) {
  if (!phone) return '';
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length === 10) return '91' + digits;
  if (digits.length === 11 && digits.startsWith('0')) return '91' + digits.slice(1);
  return digits;
}

/**
 * Strips non-digit characters from phone number for tel: links.
 */
export function formatPhoneRaw(phone) {
  if (!phone) return '';
  return String(phone).replace(/\D/g, '');
}

/**
 * Deeply normalizes company details with defaults and derived raw phone numbers.
 */
export function normalizeCompanyDetails(data, prev = defaultCompanyDetails) {
  const base = {
    ...defaultCompanyDetails,
    ...prev,
    ...(data || {}),
  };

  const contactData = {
    ...defaultCompanyDetails.contact,
    ...(prev.contact || {}),
    ...(data?.contact || {}),
  };

  const shopName = data?.shopName || prev?.shopName || defaultCompanyDetails.shopName;

  // Format and sync raw phone numbers
  const whatsappRaw =
    formatWhatsappRaw(contactData.whatsapp) ||
    contactData.whatsappRaw ||
    defaultCompanyDetails.contact.whatsappRaw;

  const primaryPhoneRaw =
    formatPhoneRaw(contactData.primaryPhone) ||
    contactData.primaryPhoneRaw ||
    defaultCompanyDetails.contact.primaryPhoneRaw;

  const secondaryPhoneRaw = formatPhoneRaw(contactData.secondaryPhone);

  const whatsappMessage =
    contactData.whatsappMessage?.trim() ||
    `Hello ${shopName}, I saw your product showcase and would like to know more details.`;

  return {
    ...base,
    shopName,
    contact: {
      ...contactData,
      whatsappRaw,
      primaryPhoneRaw,
      secondaryPhoneRaw,
      whatsappMessage,
    },
    address: {
      ...defaultCompanyDetails.address,
      ...(prev.address || {}),
      ...(data?.address || {}),
    },
    businessHours:
      Array.isArray(data?.businessHours) && data.businessHours.length > 0
        ? data.businessHours
        : prev.businessHours || defaultCompanyDetails.businessHours,
    socials: {
      ...defaultCompanyDetails.socials,
      ...(prev.socials || {}),
      ...(data?.socials || {}),
    },
  };
}

export function CompanyProvider({ children }) {
  const [companyDetails, setCompanyDetails] = useState(() =>
    normalizeCompanyDetails(defaultCompanyDetails)
  );
  const [loading, setLoading] = useState(true);
  const [isCustomized, setIsCustomized] = useState(false);
  const [error, setError] = useState(null);

  // Sync to window for global access/debugging across app
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.companyDetails = companyDetails;
    }
  }, [companyDetails]);

  // Fetch dynamic company details from Firebase / Backend
  const refreshCompanyDetails = useCallback(async () => {
    try {
      const res = await companyApi.get();
      if (res.success && res.data && Object.keys(res.data).length > 0) {
        setCompanyDetails((prev) => normalizeCompanyDetails(res.data, prev));
        setIsCustomized(true);
      }
    } catch (err) {
      console.warn('Using default store details:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCompanyDetails();
  }, [refreshCompanyDetails]);

  // Save new company details to Firebase and update local state
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

  /**
   * Helper to generate a standardized WhatsApp URL for general inquiries
   */
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

  /**
   * Helper to generate product-specific WhatsApp inquiry URL with live store name & price
   */
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
    const fallbackDetails = normalizeCompanyDetails(defaultCompanyDetails);
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
