import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const ROLES = {
  SUPER_ADMIN: {
    key: 'SUPER_ADMIN',
    label: 'Super Admin',
    name: 'Super Admin',
    email: 'superadmin@tms.com',
    phone: '9040065140',
    address: 'India, indore',
    initial: 'S',
    badgeColor: '#8e44ad',
    allowedPaths: ['*']
  },
  MANAGER: {
    key: 'MANAGER',
    label: 'Manager',
    name: 'Operations Manager',
    email: 'manager@tms.com',
    phone: '+91-9876543210',
    address: '123 Operations Hub, Delhi',
    initial: 'M',
    badgeColor: '#2980b9',
    allowedPaths: [
      '/', '/new-trip', '/vehicles', '/drivers', '/trips', '/lr', '/tracking', '/fastag', '/whatsapp',
      '/fuel', '/vendors', '/inventory', '/attendance', '/payroll', '/staff',
      '/documents', '/reports', '/contact-messages', '/profile'
    ]
  },
  DRIVER: {
    key: 'DRIVER',
    label: 'Driver',
    name: 'Mohit (Driver)',
    email: 'mohit.driver@tms.com',
    phone: '+91-9988776655',
    address: '45 Transport Nagar, Delhi',
    initial: 'D',
    badgeColor: '#27ae60',
    allowedPaths: [
      '/trips', '/tracking', '/whatsapp', '/attendance', '/payroll', '/profile'
    ]
  },
  DISPATCHER: {
    key: 'DISPATCHER',
    label: 'Dispatcher',
    name: 'Operations Dispatcher',
    email: 'dispatcher@tms.com',
    phone: '+91-9988776655',
    address: 'Transport Office',
    initial: 'D',
    badgeColor: '#e67e22',
    allowedPaths: [
      '/', '/new-trip', '/orders', '/vehicles', '/drivers', '/trips', '/lr', '/tracking', '/fastag', '/documents', '/contact-messages', '/profile'
    ]
  },
  CUSTOMER: {
    key: 'CUSTOMER',
    label: 'Customer',
    name: 'Client / Vendor',
    email: 'client@company.com',
    phone: '+91-1122334455',
    address: 'Client Location',
    initial: 'C',
    badgeColor: '#16a085',
    allowedPaths: [
      '/', '/trips', '/lr', '/billing', '/tracking', '/profile'
    ]
  },
  HR: {
    key: 'HR',
    label: 'HR Executive',
    name: 'HR Manager',
    email: 'hr@tms.com',
    phone: '+91-9876500003',
    address: 'Corporate HR Dept',
    initial: 'H',
    badgeColor: '#e056fd',
    allowedPaths: [
      '/', '/attendance', '/payroll', '/staff', '/drivers', '/vehicles', '/documents', '/reports', '/profile'
    ]
  },
  ACCOUNTANT: {
    key: 'ACCOUNTANT',
    label: 'Accountant',
    name: 'Accounts Manager',
    email: 'accountant@tms.com',
    phone: '+91-9876500001',
    address: 'Finance Dept',
    initial: 'A',
    badgeColor: '#00cec9',
    allowedPaths: [
      '/', '/payroll', '/billing', '/gst', '/loans', '/cash-bank', '/reports', '/profile'
    ]
  }
};

export const AuthProvider = ({ children }) => {
  const [currentRoleKey, setCurrentRoleKey] = useState(() => {
    return localStorage.getItem('userRole') || 'SUPER_ADMIN';
  });
  
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('userData');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [activeRole, setActiveRole] = useState(ROLES[currentRoleKey] || ROLES.SUPER_ADMIN);

  useEffect(() => {
    let newActiveRole = { ...(ROLES[currentRoleKey] || ROLES.SUPER_ADMIN) };
    
    if (currentUser) {
      if (currentUser.name) newActiveRole.name = currentUser.name;
      if (currentUser.email) newActiveRole.email = currentUser.email;
      if (currentUser.phone) newActiveRole.phone = currentUser.phone;
      if (currentUser.address) newActiveRole.address = currentUser.address;
      if (currentUser.name) newActiveRole.initial = currentUser.name.charAt(0).toUpperCase();
      
      if (currentUser.allowedPaths) {
        if (currentUser.allowedPaths === '*') {
          newActiveRole.allowedPaths = ['*'];
        } else {
          newActiveRole.allowedPaths = currentUser.allowedPaths.split(',');
        }
      }
      
      // Hard override: Drivers should NEVER see the dashboard, regardless of old database settings
      if (currentRoleKey === 'DRIVER') {
        newActiveRole.allowedPaths = newActiveRole.allowedPaths.filter(p => p !== '/');
      }
    }
    
    setActiveRole(newActiveRole);
  }, [currentRoleKey, currentUser]);

  const switchRole = (roleKey, providedUserData = null) => {
    if (ROLES[roleKey]) {
      setCurrentRoleKey(roleKey);
      localStorage.setItem('userRole', roleKey);
      
      if (providedUserData) {
        setCurrentUser(providedUserData);
        localStorage.setItem('userData', JSON.stringify(providedUserData));
      } else {
        // Fallback: If we only have roleKey but want to fetch latest for current user
        if (currentUser && currentUser.id) {
          fetch(`/api/users/${currentUser.id}`)
            .then(res => res.json())
            .then(matchingUser => {
              if (matchingUser) {
                const newUserData = {
                  id: matchingUser.id,
                  name: matchingUser.name,
                  email: matchingUser.email,
                  role: matchingUser.role,
                  allowedPaths: matchingUser.allowedPaths
                };
                setCurrentUser(newUserData);
                localStorage.setItem('userData', JSON.stringify(newUserData));
              }
            })
            .catch(err => console.error("Failed to fetch user for role switch", err));
        } else {
          // Absolute fallback
          const fakeData = {
            id: 999,
            name: ROLES[roleKey].name,
            email: ROLES[roleKey].email,
            role: roleKey,
            allowedPaths: ROLES[roleKey].allowedPaths.join(',')
          };
          setCurrentUser(fakeData);
          localStorage.setItem('userData', JSON.stringify(fakeData));
        }
      }
    }
  };

  const isPathAllowed = (path) => {
    if (activeRole.allowedPaths.includes('*')) return true;
    
    // Normalize path (e.g., /trips/1/edit -> /trips)
    const basePath = '/' + path.split('/')[1];
    return activeRole.allowedPaths.some(p => p === path || p === basePath);
  };

  return (
    <AuthContext.Provider value={{
      roleKey: currentRoleKey,
      userRole: activeRole,
      currentUser,
      switchRole,
      isPathAllowed,
      ROLES
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


