import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff, MdLocalShipping, MdArrowForward } from 'react-icons/md';
import { FaTruckMoving, FaRoute, FaShieldAlt, FaChartLine } from 'react-icons/fa';
import './Login.css';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [mounted, setMounted] = useState(false);

  const { switchRole } = useAuth();

  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    const cleanEmail = (email || '').trim();

    if (!cleanEmail) {
      setErrorMsg('Please enter your registered email address.');
      setIsLoading(false);
      return;
    }

    if (!password) {
      setErrorMsg('Password cannot be empty.');
      setIsLoading(false);
      return;
    }

    if (password.includes(' ')) {
      setErrorMsg('Incorrect password. Password cannot contain spaces.');
      setIsLoading(false);
      return;
    }

    try {
      const apiBase = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/$/, '') : '';
      const response = await fetch(`${apiBase}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: cleanEmail, password: password })
      });

      let data;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (response.ok) {
        if (data && data.requires2FA) {
          setStep(2);
        } else if (data) {
          completeLogin(data.token, data.user);
        }
      } else {
        let message = '';
        if (data && typeof data === 'object' && data.message) {
          message = data.message;
        } else if (typeof data === 'string' && data.trim()) {
          message = data;
        } else if (response.status === 401) {
          message = 'Incorrect email or password. Please check your credentials.';
        } else if (response.status === 404) {
          message = 'Email not registered. Please check your email.';
        } else if (response.status === 500) {
          message = 'Server encountered an issue. Please make sure backend is running.';
        } else {
          message = 'Login failed. Please check credentials.';
        }
        setErrorMsg(message);
      }
    } catch (err) {
      if (!navigator.onLine) {
        setErrorMsg('No internet connection. Please check your network.');
      } else {
        setErrorMsg('Server unreachable or backend service is starting. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      const apiBase = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/$/, '') : '';
      const response = await fetch(`${apiBase}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });

      let data;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (response.ok && data) {
        completeLogin(data.token, data.user);
      } else {
        const message = data?.message || (typeof data === 'string' ? data : null) || 'Invalid OTP. Please enter the correct OTP.';
        setErrorMsg(message);
      }
    } catch (err) {
      if (!navigator.onLine) {
        setErrorMsg('No internet connection. Please check your network.');
      } else {
        setErrorMsg('Network error or server unreachable. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const completeLogin = (token, user) => {
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('token', token);
    const userData = {
      id: user.id,
      name: user.name,
      companyName: user.companyName,
      companyId: user.tenantId || 1,
      tenantId: user.tenantId || 1,
      email: user.email,
      role: user.role,
      allowedPaths: user.allowedPaths
    };
    localStorage.setItem('userData', JSON.stringify(userData));
    localStorage.setItem('activeCompanyId', String(user.tenantId || 1));
    switchRole(user.role, userData);
    if (user.role === 'DRIVER' || user.role === 'DISPATCHER') {
      navigate('/trips');
    } else if (user.role === 'CUSTOMER') {
      navigate('/');
    } else {
      navigate('/');
    }
  };

  return (
    <div className={`login-page ${mounted ? 'mounted' : ''}`}>
      {/* Animated Background */}
      <div className="login-bg-animation">
        <div className="bg-gradient-orb orb-1"></div>
        <div className="bg-gradient-orb orb-2"></div>
        <div className="bg-gradient-orb orb-3"></div>
        <div className="bg-grid-overlay"></div>
      </div>

      <div className="login-wrapper">
        {/* Left Brand Panel */}
        <div className="login-brand-panel">
          <div className="brand-content">
            {/* Animated Truck Icon */}
            <div className="brand-icon-wrapper">
              <div className="brand-icon-glow"></div>
              <div className="brand-icon" style={{ backgroundColor: '#ffffff', padding: '6px' }}>
                <img src="/logo.png" alt="TransportMS" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
            </div>

            <h1 className="brand-title">
              Transport<span className="brand-highlight">MS</span>
            </h1>
            <p className="brand-tagline">Fleet & Transport Management System</p>

            <div className="brand-divider"></div>

            {/* Feature Cards */}
            <div className="feature-list">
              <div className="feature-item">
                <div className="feature-icon">
                  <FaRoute size={18} />
                </div>
                <div className="feature-text">
                  <h4>Real-Time Tracking</h4>
                  <p>Monitor your entire fleet with live GPS tracking</p>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">
                  <FaChartLine size={18} />
                </div>
                <div className="feature-text">
                  <h4>Smart Analytics</h4>
                  <p>Data-driven insights for better decisions</p>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">
                  <FaShieldAlt size={18} />
                </div>
                <div className="feature-text">
                  <h4>Secure & Reliable</h4>
                  <p>Enterprise-grade security for your data</p>
                </div>
              </div>
            </div>

            {/* Stats Row */}
            <div className="brand-stats">
              <div className="stat-item">
                <span className="stat-number">500+</span>
                <span className="stat-label">Active Fleets</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-number">10K+</span>
                <span className="stat-label">Trips Managed</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-number">99.9%</span>
                <span className="stat-label">Uptime</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Login Form Panel */}
        <div className="login-form-panel">
          <div className="login-card">
            {/* Logo for mobile */}
            <div className="mobile-logo" style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
              <div style={{ width: '36px', height: '36px', backgroundColor: '#ffffff', borderRadius: '8px', padding: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src="/logo.png" alt="TransportMS" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
              <span>TransportMS</span>
            </div>

            <div className="login-card-header">
              <h2>Welcome Back</h2>
              <p>Sign in to your dashboard</p>
            </div>

            {errorMsg && (
              <div className="login-error">
                <span className="error-icon">!</span>
                {errorMsg}
              </div>
            )}

            {step === 1 ? (
              <form className="login-form" onSubmit={handleLogin}>
                <div className="form-field">
                  <label htmlFor="login-email">Email Address</label>
                  <div className="field-input-wrap">
                    <MdEmail className="field-icon" size={20} />
                    <input
                      id="login-email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label htmlFor="login-password">Password</label>
                  <div className="field-input-wrap">
                    <MdLock className="field-icon" size={20} />
                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onKeyDown={(e) => {
                        if (e.key === ' ') {
                          e.preventDefault();
                          setErrorMsg('Password cannot contain spaces.');
                        }
                      }}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val.includes(' ')) {
                          setErrorMsg('Password cannot contain spaces.');
                          return;
                        }
                        setPassword(val);
                        if (errorMsg) setErrorMsg('');
                      }}
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="pwd-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      {showPassword ? <MdVisibilityOff size={20} /> : <MdVisibility size={20} />}
                    </button>
                  </div>
                </div>

                <div className="form-meta">
                  <label className="custom-checkbox">
                    <input type="checkbox" />
                    <span className="checkmark"></span>
                    <span className="cb-label">Remember me</span>
                  </label>
                  <a href="#" className="forgot-link">Forgot password?</a>
                </div>

                <button type="submit" className="btn-signin" disabled={isLoading}>
                  {isLoading ? (
                    <div className="btn-loader">
                      <div className="loader-spinner"></div>
                      <span>Authenticating...</span>
                    </div>
                  ) : (
                    <div className="btn-content">
                      <span>Sign In</span>
                      <MdArrowForward size={20} />
                    </div>
                  )}
                </button>
              </form>
            ) : (
              <form className="login-form" onSubmit={handleOtpSubmit}>
                <div className="form-field">
                  <label htmlFor="login-otp">Enter 6-Digit OTP</label>
                  <div className="field-input-wrap">
                    <MdLock className="field-icon" size={20} />
                    <input
                      id="login-otp"
                      type="text"
                      className="otp-input-field"
                      placeholder="• • • • • •"
                      value={otp}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setOtp(val);
                      }}
                      required
                      maxLength="6"
                      autoComplete="one-time-code"
                    />
                  </div>
                </div>
                <button type="submit" className="btn-signin" disabled={isLoading}>
                  {isLoading ? (
                    <div className="btn-loader">
                      <div className="loader-spinner"></div>
                      <span>Verifying...</span>
                    </div>
                  ) : (
                    <div className="btn-content">
                      <span>Verify OTP</span>
                      <MdArrowForward size={20} />
                    </div>
                  )}
                </button>
                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                  <a href="#" onClick={() => setStep(1)} className="forgot-link">Back to Login</a>
                </div>
              </form>
            )}

            <div className="login-card-footer">
              <p>© 2026 TransportMS. All rights reserved.</p>
            </div>
          </div>
        </div>

        {/* Decorative Road Line Across Full Container */}
        <div className="road-decoration">
          <div className="road-line"></div>
          <div className="road-dash"></div>
        </div>
      </div>
    </div>
  );
};

export default Login;

