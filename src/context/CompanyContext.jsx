import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import defaultCompanyDetails from '../config/companyDetails';
import { companyApi } from '../api/client';

const CompanyContext = createContext(null);

export function CompanyProvider({ children }) {
  const [companyDetails, setCompanyDetails] = useState(defaultCompanyDetails);
  const [loading, setLoading] = useState(true);
  const [isCustomized, setIsCustomized] = useState(false);
  const [error, setError] = useState(null);

  // Fetch dynamic company details from Firebase / Backend
  const refreshCompanyDetails = useCallback(async () => {
    try {
      const res = await companyApi.get();
      if (res.success && res.data && Object.keys(res.data).length > 0) {
        setCompanyDetails((prev) => ({
          ...prev,
          ...res.data,
          contact: {
            ...prev.contact,
            ...(res.data.contact || {}),
          },
          address: {
            ...prev.address,
            ...(res.data.address || {}),
          },
          businessHours: Array.isArray(res.data.businessHours) && res.data.businessHours.length > 0
            ? res.data.businessHours
            : prev.businessHours,
          socials: {
            ...prev.socials,
            ...(res.data.socials || {}),
          },
        }));
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
      const res = await companyApi.update(newDetails);
      if (res.success) {
        setCompanyDetails((prev) => ({
          ...prev,
          ...newDetails,
          contact: {
            ...prev.contact,
            ...(newDetails.contact || {}),
          },
          address: {
            ...prev.address,
            ...(newDetails.address || {}),
          },
          businessHours: Array.isArray(newDetails.businessHours)
            ? newDetails.businessHours
            : prev.businessHours,
          socials: {
            ...prev.socials,
            ...(newDetails.socials || {}),
          },
        }));
        setIsCustomized(true);
        return { success: true, message: res.message };
      }
      return { success: false, message: res.message || 'Failed to save store details' };
    } catch (err) {
      return { success: false, message: err.message || 'Error saving store details' };
    }
  };

  return (
    <CompanyContext.Provider
      value={{
        companyDetails,
        loading,
        isCustomized,
        error,
        saveCompanyDetails,
        refreshCompanyDetails,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const context = useContext(CompanyContext);
  if (!context) {
    // Graceful fallback if called outside provider
    return {
      companyDetails: defaultCompanyDetails,
      loading: false,
      isCustomized: false,
      error: null,
      saveCompanyDetails: async () => ({ success: false, message: 'No provider' }),
      refreshCompanyDetails: async () => {},
    };
  }
  return context;
}

export default CompanyContext;
