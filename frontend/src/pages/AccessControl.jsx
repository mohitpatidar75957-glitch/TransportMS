import React, { useState, useEffect } from 'react';
import { MdSecurity, MdPeople } from 'react-icons/md';
import './Vehicles.css'; // Reusing panel styles
import { useModal } from '../context/ModalContext';
import { useAuth } from '../context/AuthContext';

const ALL_MODULES = [
  { path: '/new-trip', label: 'New Trip' },
  { path: '/driver-portal', label: 'Driver App' },
  { path: '/orders', label: 'Orders' },
  { path: '/vehicles', label: 'Vehicles' },
  { path: '/drivers', label: 'Drivers' },
  { path: '/trips', label: 'Trips' },
  { path: '/lr', label: 'LR / Bilty' },
  { path: '/tracking', label: 'Live Tracking' },
  { path: '/fastag', label: 'FASTag & Tolls' },
  { path: '/whatsapp', label: 'WhatsApp Int.' },
  { path: '/billing', label: 'Billing / Invoices' },
  { path: '/expenses', label: 'Expenses' },
  { path: '/profit-loss', label: 'Profit & Loss' },
  { path: '/gst', label: 'GST' },
  { path: '/loans', label: 'Loans / EMI' },
  { path: '/cash-bank', label: 'Cash / Bank' },
  { path: '/fuel', label: 'Fuel Management' },
  { path: '/vendors', label: 'Vendors' },
  { path: '/inventory', label: 'Inventory' },
  { path: '/attendance', label: 'Attendance' },
  { path: '/payroll', label: 'Salary / Payroll' },
  { path: '/staff', label: 'Staff & Labor' },
  { path: '/documents', label: 'Documents' },
  { path: '/reports', label: 'Reports' },
  { path: '/contact-messages', label: 'Contact Inquiries' },
  { path: '/users', label: 'Users Management' },
  { path: '/access-control', label: 'Access Control' },
  { path: '/audit-logs', label: 'Audit Logs' },
  { path: '/appearance', label: 'Appearance' },
  { path: '/profile', label: 'Profile' },
  { path: '/settings', label: 'Settings' }
];

const AccessControl = () => {
  const { showAlert } = useModal();
  const { currentUser, roleKey } = useAuth();
  
  const [users, setUsers] = useState([]);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userPerms, setUserPerms] = useState(['/']);

  useEffect(() => {
    if (roleKey === 'SUPER_ADMIN') {
      fetch('/api/users')
        .then(res => res.json())
        .then(data => {
          // Filter to show configurable roles for Super Admin
          const configurableUsers = data.filter(u => ['MANAGER', 'DRIVER', 'CLIENT', 'CUSTOMER', 'DISPATCHER', 'HR', 'ACCOUNTANT'].includes(u.role));
          setUsers(configurableUsers);
        })
        .catch(err => console.error("Failed to load users", err));
    }
  }, [roleKey]);

  const handleSelectUser = (e) => {
    const userId = e.target.value;
    if (!userId) {
      setSelectedUser(null);
      setUserPerms(['/']);
      return;
    }
    const user = users.find(u => String(u.id) === String(userId));
    setSelectedUser(user);
    if (user && user.allowedPaths) {
      setUserPerms(user.allowedPaths.split(','));
    } else {
      // Default basic paths if nothing is set
      setUserPerms(['/', '/profile']);
    }
  };

  const handleTogglePerm = (path) => {
    setUserPerms(prev => 
      prev.includes(path) ? prev.filter(p => p !== path) : [...prev, path]
    );
  };

  const savePermissions = () => {
    if (!selectedUser) return;
    
    const pathsToSave = userPerms.join(',');
    
    // We send a PUT request to update the user with their new allowedPaths
    const updatedUser = {
      ...selectedUser,
      allowedPaths: pathsToSave
    };

    fetch(`/api/users/${selectedUser.id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'X-User-Role': 'SUPER_ADMIN' // Required by backend
      },
      body: JSON.stringify(updatedUser)
    })
    .then(res => {
      if (res.ok) {
        showAlert(`Permissions updated for ${selectedUser.name}!`);
        // Update local state
        setUsers(users.map(u => String(u.id) === String(selectedUser.id) ? updatedUser : u));
        
        // Reset selection so the user feels it's 'done'
        setSelectedUser(null);
        setSelectedRoleFilter('');
        setUserPerms(['/']);
      } else {
        showAlert('Failed to update permissions.');
      }
    })
    .catch(err => console.error('Failed to save permissions:', err));
  };

  if (roleKey !== 'SUPER_ADMIN') {
    return (
      <div className="page-container" style={{ padding: '24px' }}>
        <h2>Unauthorized</h2>
        <p>You do not have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ padding: '0 0 24px 0', width: '100%' }}>
      <div className="panel" style={{ width: '100%', margin: '0', padding: '0', overflow: 'hidden' }}>
        
        {/* Panel Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <MdSecurity size={22} style={{ color: 'var(--accent-color, #2563eb)' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>User Access Control</h3>
        </div>

        <div style={{ padding: '24px 28px' }}>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
            Select a specific user (Manager, HR, Accountant, Driver, Client, or Dispatcher) to configure their unique module permissions.
          </p>
          
          <div style={{ display: 'flex', gap: '24px', marginBottom: '32px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '8px' }}>
                1. Select Role
              </label>
              <select 
                value={selectedRoleFilter}
                onChange={(e) => {
                  setSelectedRoleFilter(e.target.value);
                  setSelectedUser(null);
                  setUserPerms(['/']);
                }}
                style={{ width: '100%', padding: '12px 14px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--panel-bg)', color: 'var(--text-primary)', fontSize: '14px', outline: 'none' }}
              >
                <option value="">-- Choose Role --</option>
                <option value="MANAGER">Manager</option>
                <option value="HR">HR Executive</option>
                <option value="ACCOUNTANT">Accountant</option>
                <option value="DRIVER">Driver</option>
                <option value="CLIENT">Client / Customer</option>
                <option value="DISPATCHER">Dispatcher</option>
              </select>
            </div>

            <div className="form-group" style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '8px' }}>
                2. Select User
              </label>
              <select 
                onChange={handleSelectUser}
                value={selectedUser ? selectedUser.id : ''}
                disabled={!selectedRoleFilter}
                style={{ width: '100%', padding: '12px 14px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--panel-bg)', color: 'var(--text-primary)', fontSize: '14px', outline: 'none', opacity: !selectedRoleFilter ? 0.6 : 1 }}
              >
                <option value="">-- Choose User --</option>
                {users.filter(u => u.role === selectedRoleFilter || (selectedRoleFilter === 'CLIENT' && u.role === 'CUSTOMER')).map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                ))}
              </select>
            </div>
          </div>

          {selectedUser && (
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '24px' }}>
              <h4 style={{ fontSize: '16px', color: 'var(--text-primary)', fontWeight: 500, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MdPeople size={18} /> Configure permissions for {selectedUser.name}
              </h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '14px', marginBottom: '32px' }}>
                {ALL_MODULES.map((mod, idx) => (
                  <label key={idx} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px', 
                    cursor: 'pointer', 
                    fontSize: '14px', 
                    color: 'var(--text-primary)',
                    background: 'var(--bg-primary, #f8fafc)',
                    border: '1px solid var(--border-color, #e2e8f0)',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    transition: 'all 0.15s ease'
                  }}>
                    <input 
                      type="checkbox" 
                      checked={userPerms.includes(mod.path)} 
                      onChange={() => handleTogglePerm(mod.path)}
                      style={{ accentColor: 'var(--accent-color, #2563eb)', width: '17px', height: '17px', cursor: 'pointer' }}
                    />
                    <span style={{ fontWeight: userPerms.includes(mod.path) ? 600 : 400 }}>{mod.label}</span>
                  </label>
                ))}
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px', paddingBottom: '10px' }}>
                <button 
                  onClick={savePermissions}
                  className="save-btn-active-feel"
                  style={{ backgroundColor: '#2ed573', color: 'white', border: 'none', padding: '14px 40px', borderRadius: '8px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(46, 213, 115, 0.3)', transition: 'transform 0.1s ease, box-shadow 0.1s ease' }}
                  onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.95)'; e.currentTarget.style.boxShadow = '0 2px 5px rgba(46, 213, 115, 0.3)'; }}
                  onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(46, 213, 115, 0.3)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(46, 213, 115, 0.3)'; }}
                >
                  Save Permissions for {selectedUser.name}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AccessControl;


