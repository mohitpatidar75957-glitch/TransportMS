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

// Global API Interceptor: Prevents frontend crashes and injects JWT token
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  let [resource, config] = args;
  
  // Inject JWT Token
  const token = localStorage.getItem('token');
  if (token && typeof resource === 'string' && resource.startsWith('/api/')) {
    config = config || {};
    config.headers = {
      ...config.headers,
      'Authorization': `Bearer ${token}`
    };
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

  // Only intercept failed requests for JSON mock logic
  if (!response.ok) {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const cloned = response.clone();
      response.json = async () => {
        const data = await cloned.json();
        // Detect standard Spring Boot Error JSON
        if (data && typeof data === 'object' && data.status && data.error && data.path) {
          console.warn('[API Interceptor] Caught Spring Boot Error:', data.status, data.error, data.path);
          // If path doesn't end with a number, it's likely a collection fetch (e.g. /api/v1/fleet/vehicles)
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
