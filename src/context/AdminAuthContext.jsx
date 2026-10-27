import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AdminAuthContext = createContext(null);
const TOKEN_KEY = 'senthoora_admin_token';

export function AdminAuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    const saved = typeof window !== 'undefined' ? sessionStorage.getItem(TOKEN_KEY) || '' : '';
    if (saved) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${saved}`;
    }
    return saved;
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(token));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      sessionStorage.setItem(TOKEN_KEY, token);
      setIsAuthenticated(true);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      sessionStorage.removeItem(TOKEN_KEY);
      setIsAuthenticated(false);
      delete axios.defaults.headers.common['Authorization'];
    }

    const handleSessionExpired = () => {
      setToken('');
      setIsAuthenticated(false);
    };

    window.addEventListener('senthoora:session-expired', handleSessionExpired);
    return () => window.removeEventListener('senthoora:session-expired', handleSessionExpired);
  }, [token]);

  const login = async (pin) => {
    setLoading(true);
    try {
      const res = await axios.post('/api/admin/auth', { pin });
      if (res.data.success && res.data.token) {
        setToken(res.data.token);
        setIsAuthenticated(true);
        return { success: true };
      }
      return { success: false, message: res.data.message || 'Authentication failed' };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || err.message || 'Authentication failed',
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken('');
    setIsAuthenticated(false);
  };

  return (
    <AdminAuthContext.Provider value={{ isAuthenticated, login, logout, token, loading }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}

export default AdminAuthContext;
