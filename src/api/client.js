import axios from 'axios';

// Support Render/cloud backend URL when frontend is hosted on Vercel
const API_BASE_URL = import.meta.env.VITE_API_URL || '';
if (API_BASE_URL) {
  axios.defaults.baseURL = API_BASE_URL;
}

// Request interceptor: synchronously attach stored admin session token if available
axios.interceptors.request.use(
  (config) => {
    try {
      const token = sessionStorage.getItem('senthoora_admin_token');
      if (token && !config.headers['Authorization']) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    } catch {
      // Ignore sessionStorage access errors in restricted iframe environments
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle expired or invalid admin sessions
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Do not trigger session expiry when submitting the PIN itself
      const url = error.config?.url || '';
      if (!url.includes('/api/admin/auth')) {
        sessionStorage.removeItem('senthoora_admin_token');
        delete axios.defaults.headers.common['Authorization'];
        window.dispatchEvent(new CustomEvent('senthoora:session-expired'));
      }
    }
    return Promise.reject(error);
  }
);

// Client-side in-memory cache for 0ms instant page navigation
let cachedInventory = null;
let inventoryCacheTimestamp = 0;
let inFlightInventoryPromise = null;
const CLIENT_CACHE_TTL = 3 * 60 * 1000; // 3 minutes

export const inventoryApi = {
  getAll: async (options = {}) => {
    const { forceFresh = false } = options;
    const now = Date.now();

    // 1. Instant return from memory cache if fresh
    if (!forceFresh && cachedInventory && (now - inventoryCacheTimestamp < CLIENT_CACHE_TTL)) {
      return { success: true, count: cachedInventory.length, data: cachedInventory, fromClientCache: true };
    }

    // 2. Request deduplication: reuse in-flight network call if one is already running
    if (inFlightInventoryPromise) {
      return inFlightInventoryPromise;
    }

    inFlightInventoryPromise = (async () => {
      try {
        const res = await axios.get('/api/inventory');
        if (res.data && res.data.success && Array.isArray(res.data.data)) {
          cachedInventory = res.data.data;
          inventoryCacheTimestamp = Date.now();
        }
        return res.data;
      } finally {
        inFlightInventoryPromise = null;
      }
    })();

    return inFlightInventoryPromise;
  },
  getById: async (id) => {
    // Check client cache first
    if (cachedInventory) {
      const found = cachedInventory.find((p) => p.id === id || p.did === id);
      if (found) {
        return { success: true, data: found, fromClientCache: true };
      }
    }
    const res = await axios.get(`/api/inventory/${id}`);
    return res.data;
  },
  create: async (data) => {
    inventoryApi.clearCache();
    const res = await axios.post('/api/inventory', data);
    return res.data;
  },
  update: async (id, data) => {
    inventoryApi.clearCache();
    const res = await axios.put(`/api/inventory/${id}`, data);
    return res.data;
  },
  delete: async (id) => {
    inventoryApi.clearCache();
    const res = await axios.delete(`/api/inventory/${id}`);
    return res.data;
  },
  clearCache: () => {
    cachedInventory = null;
    inventoryCacheTimestamp = 0;
  },
};

// Cloudinary Image Upload
export const uploadApi = {
  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const res = await axios.post('/api/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  uploadBase64: async (base64) => {
    const res = await axios.post('/api/upload', { image: base64 });
    return res.data;
  },
};

// Company Details with client cache & deduping
let cachedCompany = null;
let companyCacheTimestamp = 0;
let inFlightCompanyPromise = null;
const COMPANY_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

export const companyApi = {
  get: async (options = {}) => {
    const { forceFresh = false } = options;
    const now = Date.now();

    if (!forceFresh && cachedCompany && (now - companyCacheTimestamp < COMPANY_CACHE_TTL)) {
      return { success: true, isCustomized: true, data: cachedCompany, fromClientCache: true };
    }

    if (inFlightCompanyPromise) {
      return inFlightCompanyPromise;
    }

    inFlightCompanyPromise = (async () => {
      try {
        const res = await axios.get('/api/company');
        if (res.data && res.data.success && res.data.data) {
          cachedCompany = res.data.data;
          companyCacheTimestamp = Date.now();
        }
        return res.data;
      } finally {
        inFlightCompanyPromise = null;
      }
    })();

    return inFlightCompanyPromise;
  },
  update: async (data) => {
    companyApi.clearCache();
    const res = await axios.put('/api/company', data);
    return res.data;
  },
  clearCache: () => {
    cachedCompany = null;
    companyCacheTimestamp = 0;
  },
};

// Customer Inquiry
export const inquiryApi = {
  submit: async (data) => {
    const res = await axios.post('/api/inquiry', data);
    return res.data;
  },
  getAll: async () => {
    const res = await axios.get('/api/inquiry');
    return res.data;
  },
};

export default {
  inventory: inventoryApi,
  upload: uploadApi,
  company: companyApi,
  inquiry: inquiryApi,
};
