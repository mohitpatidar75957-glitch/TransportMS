import { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('React Error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: 'red', backgroundColor: '#fee', fontSize: '18px' }}>
          <h2>Frontend Application Crashed</h2>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{this.state.error?.toString()}</pre>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{this.state.error?.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

// Minimal smoke test - if you see this red box, React is working
const root = document.getElementById('root');
root.style.minHeight = '100vh';
root.style.background = '#121212';

// In-memory + LocalStorage SWR (Stale-While-Revalidate) Cache for GET /api/*
const apiCache = new Map();

// Global API Interceptor: Prevents frontend crashes, injects JWT token, and provides instant caching
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  let [resource, config] = args;
  
  const apiBase = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/$/, '') : '';
  const isApiReq = typeof resource === 'string' && resource.startsWith('/api/');
  const isGet = !config || !config.method || config.method.toUpperCase() === 'GET';

  if (isApiReq) {
    if (apiBase) {
      resource = `${apiBase}${resource}`;
    }
    // Inject JWT Token
    const token = localStorage.getItem('token');
    if (token) {
      config = config || {};
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${token}`
      };
    }
  }

  // Invalidate cache on mutations (POST, PUT, DELETE, PATCH)
  if (isApiReq && !isGet) {
    apiCache.clear();
  }
  
  const response = await originalFetch(resource, config);
  
  // Handle Session Expiry (401 Unauthorized) globally for fetch
  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userData');
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }

  // Cache successful GET API responses for instant subsequent renders
  if (response.ok && isApiReq && isGet) {
    const cloned = response.clone();
    const cacheKey = typeof resource === 'string' ? resource : '';
    if (cacheKey) {
      cloned.json().then(data => {
        try {
          apiCache.set(cacheKey, data);
          sessionStorage.setItem('tms_cache_' + cacheKey, JSON.stringify(data));
        } catch (e) {}
      }).catch(() => {});
    }
  }

  // Only intercept failed requests for JSON mock logic
  if (!response.ok) {
    // If request failed, try to serve from cache if available
    const cacheKey = typeof resource === 'string' ? resource : '';
    const cachedData = apiCache.get(cacheKey) || (() => {
      try {
        const stored = sessionStorage.getItem('tms_cache_' + cacheKey);
        return stored ? JSON.parse(stored) : null;
      } catch (e) { return null; }
    })();

    if (cachedData) {
      return new Response(JSON.stringify(cachedData), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const cloned = response.clone();
      response.json = async () => {
        const data = await cloned.json();
        // Detect standard Spring Boot Error JSON
        if (data && typeof data === 'object' && data.status && data.error && data.path) {
          console.warn('[API Interceptor] Caught Spring Boot Error:', data.status, data.error, data.path);
          const isCollection = !/\/\d+$/.test(data.path);
          return isCollection ? [] : null;
        }
        return data;
      };
    }
  }
  return response;
};

createRoot(root).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
