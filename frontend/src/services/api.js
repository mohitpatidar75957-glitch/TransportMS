import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api/v1` 
  : '/api/v1';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to inject the JWT token and company_id / tenant_id
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const userStr = localStorage.getItem('userData');
      const activeCompanyId = localStorage.getItem('activeCompanyId');
      if (activeCompanyId) {
        config.headers['X-Company-Id'] = activeCompanyId;
        config.headers['X-Tenant-Id'] = activeCompanyId;
      } else if (userStr) {
        const user = JSON.parse(userStr);
        if (user && (user.tenantId || user.companyId)) {
          const compId = user.tenantId || user.companyId;
          config.headers['X-Company-Id'] = compId;
          config.headers['X-Tenant-Id'] = compId;
        }
      }
    } catch (e) {
      // Ignore JSON parse errors
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle session expiry (401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid, auto logout
      localStorage.removeItem('token');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userData');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
