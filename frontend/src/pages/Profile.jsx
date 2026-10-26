import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import './Vehicles.css';

const Profile = () => {
  const { currentUser, switchRole, userRole, appBranding, updateAppBranding } = useAuth();
  const { showAlert } = useModal();
  const [brandingData, setBrandingData] = useState({
    title: appBranding?.title || 'TMS by Codervu',
    subtitle: appBranding?.subtitle || ''
  });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    companyName: '',
    gstNumber: '',
    address: ''
  });
  const [defaultCompany, setDefaultCompany] = useState({
    name: 'R.K. TRADERS & LOGISTICS',
    gst: '23AADCR1234F1Z5'
  });
  const [loading, setLoading] = useState(false);

  const isSuperAdmin = userRole?.key === 'SUPER_ADMIN' || currentUser?.role === 'SUPER_ADMIN';
  const isCustomer = userRole?.key === 'CUSTOMER' || currentUser?.role === 'CUSTOMER';

  useEffect(() => {
    // 1. Fetch system company settings first
    fetch('/api/v1/management/settings')
      .then(res => res.json())
      .then(data => {
        let loaded = { name: 'R.K. TRADERS & LOGISTICS', gst: '23AADCR1234F1Z5' };
        if (Array.isArray(data)) {
          data.forEach(item => {
            if (item.key === 'companyName' && item.value) loaded.name = item.value;
            if (item.key === 'gstNumber' && item.value) loaded.gst = item.value;
          });
        }
        setDefaultCompany(loaded);

        // 2. Fetch profile data
        if (currentUser?.id) {
          fetch(`/api/users/${currentUser.id}`)
            .then(res => res.json())
            .then(userData => {
              const userIsCustomer = (userData.role === 'CUSTOMER') || isCustomer;
              setFormData({
                name: userData.name || '',
                email: userData.email || '',
                phone: userData.phone || '',
                companyName: userData.companyName || (!userIsCustomer ? loaded.name : ''),
                gstNumber: userData.gstNumber || (!userIsCustomer ? loaded.gst : ''),
                address: userData.address || ''
              });
            })
            .catch(err => console.error('Failed to fetch profile', err));
        }
      })
      .catch(err => {
        console.error('Failed to fetch company settings', err);
        if (currentUser?.id) {
          fetch(`/api/users/${currentUser.id}`)
            .then(res => res.json())
            .then(userData => {
              const userIsCustomer = (userData.role === 'CUSTOMER') || isCustomer;
              setFormData({
                name: userData.name || '',
                email: userData.email || '',
                phone: userData.phone || '',
                companyName: userData.companyName || (!userIsCustomer ? 'R.K. TRADERS & LOGISTICS' : ''),
                gstNumber: userData.gstNumber || (!userIsCustomer ? '23AADCR1234F1Z5' : ''),
                address: userData.address || ''
              });
            })
            .catch(err => console.error('Failed to fetch profile', err));
        }
      });
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'companyName') {
      // Allow letters, numbers, spaces, dots, &
      if (!/^[A-Za-z0-9\s.&-]*$/.test(value)) return;
    }
    
    if (name === 'gstNumber') {
      // Max 15 characters
      if (value.length > 15) return;
    }
    
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // If Super Admin, save Application Header Branding
      if (isSuperAdmin && brandingData.title) {
        updateAppBranding({
          title: brandingData.title.trim(),
          subtitle: (brandingData.subtitle || '').trim()
        });
      }

      const payload = {
        ...currentUser,
        ...formData
      };

      const response = await fetch(`/api/users/${currentUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Role': userRole.key
        },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        showAlert('Profile & Application settings updated successfully!');
        // Update local storage context safely
        const updatedUser = await response.json();
        const stored = JSON.parse(localStorage.getItem('userData') || '{}');
        const newUserData = { ...stored, ...updatedUser };
        localStorage.setItem('userData', JSON.stringify(newUserData));
        // Soft refresh auth state if needed, or window reload
        setTimeout(() => window.location.reload(), 1000);
      } else {
        showAlert('Failed to update profile.');
      }
    } catch (err) {
      showAlert('Network error while updating profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-page-wrapper">
      <div className="settings-card-container">
        
        {/* Header Banner */}
        <div className="settings-header-banner">
          <div className="settings-header-left">
            <h2 className="settings-main-heading">
              User Profile
              <span className="settings-status-pill">{userRole?.label || 'SUPER ADMIN'}</span>
            </h2>
            <span className="settings-breadcrumb">
              Manage your personal account, business credentials & contact details
            </span>
          </div>
        </div>

        <div className="settings-tab-content">
          <form onSubmit={handleSubmit} style={{ maxWidth: '1000px' }}>
            
            {/* User Identity / Avatar Row */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              marginBottom: '32px',
              paddingBottom: '24px',
              borderBottom: '1px solid var(--border-color)'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.75rem',
                fontWeight: 700,
                color: '#ffffff',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
                flexShrink: 0
              }}>
                {formData.name ? formData.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '1.25rem', color: 'var(--text-primary)', fontWeight: 700 }}>
                  {formData.name || 'User'}
                </h3>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span style={{
                    fontSize: '11px',
                    padding: '3px 10px',
                    borderRadius: '20px',
                    background: 'rgba(37, 99, 235, 0.15)',
                    color: '#60a5fa',
                    fontWeight: 700,
                    letterSpacing: '0.4px',
                    textTransform: 'uppercase'
                  }}>
                    {userRole?.label || 'Super Admin'}
                  </span>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {formData.email}
                  </span>
                </div>
              </div>
            </div>

            {/* Profile Fields Section */}
            <div style={{ marginBottom: '32px' }}>
              <h4 style={{ fontSize: '15px', color: 'var(--text-secondary)', fontWeight: 600, margin: '0 0 20px 0', paddingBottom: '10px', borderBottom: '1px solid var(--border-color)' }}>
                Personal & Contact Information
              </h4>

              <div className="flex-row-responsive" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                <div className="form-group">
                  <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '6px' }}>
                    Full Name
                  </label>
                  <input 
                    type="text" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    required 
                    placeholder="Enter full name"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)', outline: 'none' }}
                  />
                </div>
                
                <div className="form-group">
                  <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '6px' }}>
                    Phone Number
                  </label>
                  <input 
                    type="text" 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleChange} 
                    required 
                    placeholder="Enter 10-digit phone number"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)', outline: 'none' }}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '6px' }}>
                  Email Address
                </label>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  required 
                  disabled 
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'rgba(255, 255, 255, 0.03)', color: 'var(--text-secondary)', outline: 'none', cursor: 'not-allowed' }}
                />
                <small style={{ color: '#64748b', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                  Email address is linked to your login credentials and cannot be modified directly.
                </small>
              </div>
            </div>

            {/* Business & Organization Details */}
            <div style={{ marginBottom: '32px' }}>
              <h4 style={{ fontSize: '15px', color: 'var(--text-secondary)', fontWeight: 600, margin: '0 0 20px 0', paddingBottom: '10px', borderBottom: '1px solid var(--border-color)' }}>
                Business & Organization Details
              </h4>

              <div className="flex-row-responsive" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                <div className="form-group">
                  <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '6px' }}>
                    Company / Business Name
                  </label>
                  <input 
                    type="text" 
                    name="companyName" 
                    value={formData.companyName} 
                    onChange={handleChange} 
                    placeholder="e.g. RK Trader & Logistics"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)', outline: 'none' }}
                  />
                </div>

                <div className="form-group">
                  <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '6px' }}>
                    GST Number
                  </label>
                  <input 
                    type="text" 
                    name="gstNumber" 
                    value={formData.gstNumber} 
                    onChange={handleChange} 
                    placeholder="15-digit GSTIN (e.g. 23AADCR1234F1Z5)" 
                    maxLength="15"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)', outline: 'none' }}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '6px' }}>
                  Full Business Address
                </label>
                <textarea 
                  name="address" 
                  value={formData.address} 
                  onChange={handleChange} 
                  rows="3" 
                  placeholder="Enter complete office/transport hub address"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)', outline: 'none', resize: 'vertical' }}
                />
              </div>
            </div>

            {/* Application Branding (Super Admin Exclusive) */}
            {isSuperAdmin && (
              <div style={{ marginBottom: '32px', backgroundColor: 'var(--bg-surface)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <h4 style={{ fontSize: '15px', color: 'var(--text-primary)', fontWeight: 600, margin: '0 0 8px 0' }}>
                  🚀 Application Header Branding (Sidebar)
                </h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 16px 0' }}>
                  Super Admin control to customize the main title and subtitle displayed at the top of the sidebar.
                </p>

                <div className="flex-row-responsive" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '6px' }}>
                      Sidebar Main Title
                    </label>
                    <input 
                      type="text" 
                      value={brandingData.title} 
                      onChange={(e) => setBrandingData({ ...brandingData, title: e.target.value })} 
                      placeholder="Enter main title"
                      required
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontWeight: '600', outline: 'none' }}
                    />
                  </div>

                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '6px' }}>
                      Sidebar Subtitle / Tagline
                    </label>
                    <input 
                      type="text" 
                      value={brandingData.subtitle} 
                      onChange={(e) => setBrandingData({ ...brandingData, subtitle: e.target.value })} 
                      placeholder="Optional subtitle (leave blank if not needed)"
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', outline: 'none' }}
                    />
                  </div>
                </div>
              </div>
            )}
            
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <button 
                type="submit" 
                disabled={loading} 
                style={{ 
                  backgroundColor: '#2563eb', 
                  color: 'white', 
                  border: 'none', 
                  padding: '12px 32px', 
                  borderRadius: '6px', 
                  fontSize: '14px', 
                  fontWeight: 600, 
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s'
                }}
              >
                {loading ? 'Saving Changes...' : 'Save Profile Details'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
