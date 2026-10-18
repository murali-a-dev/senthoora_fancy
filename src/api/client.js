import axios from 'axios';

// Response interceptor to handle expired or invalid admin sessions
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Discard invalid token and dispatch session-expired event
      sessionStorage.removeItem('senthoora_admin_token');
      delete axios.defaults.headers.common['Authorization'];
      window.dispatchEvent(new CustomEvent('senthoora:session-expired'));
    }
    return Promise.reject(error);
  }
);

// Inventory Endpoints
export const inventoryApi = {
  getAll: async () => {
    const res = await axios.get('/api/inventory');
    return res.data;
  },
  getById: async (id) => {
    const res = await axios.get(`/api/inventory/${id}`);
    return res.data;
  },
  create: async (data) => {
    const res = await axios.post('/api/inventory', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await axios.put(`/api/inventory/${id}`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await axios.delete(`/api/inventory/${id}`);
    return res.data;
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

// Company Details
export const companyApi = {
  get: async () => {
    const res = await axios.get('/api/company');
    return res.data;
  },
  update: async (data) => {
    const res = await axios.put('/api/company', data);
    return res.data;
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
