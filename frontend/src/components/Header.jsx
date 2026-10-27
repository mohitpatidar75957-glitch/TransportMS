import React, { useState, useRef, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { MdNotifications, MdAccountCircle, MdArrowDropDown, MdSettings, MdLogout, MdMenu, MdSwapHoriz, MdCheck, MdArrowBack } from 'react-icons/md';
import './Header.css';
import { useAuth } from '../context/AuthContext';
import SmartCommandBar from './SmartCommandBar';

const Header = ({ toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userRole, roleKey, switchRole, ROLES } = useAuth();
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [docAlerts, setDocAlerts] = useState([]);
  const [sysAlerts, setSysAlerts] = useState([]);
  const [alertCount, setAlertCount] = useState(0);

  const dropdownRef = useRef(null);
  const roleMenuRef = useRef(null);
  const notifRef = useRef(null);
  
  let pageTitle = 'System Administration';
  let breadcrumb = <span className="breadcrumb-text">Home</span>;

  useEffect(() => {
    fetch('/api/notifications/centralized')
      .then(res => res.json())
      .then(data => {
        if (data && typeof data.totalAlerts === 'number') {
          setAlertCount(data.totalAlerts);
          setSysAlerts(data.systemAlerts || []);
          setDocAlerts(data.documentAlerts || []);
        } else {
          setAlertCount(0);
        }
      })
      .catch(() => setAlertCount(0));

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (roleMenuRef.current && !roleMenuRef.current.contains(event.target)) {
        setIsRoleMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRoleChange = (key) => {
    switchRole(key);
    setIsRoleMenuOpen(false);
    setIsDropdownOpen(false);
    if (key === 'DRIVER') {
      navigate('/trips');
    } else if (location.pathname === '/trips' && key !== 'DRIVER') {
      navigate('/');
    }
  };

  const handleLogout = () => {
    setIsDropdownOpen(false);
    localStorage.removeItem('isAuthenticated');
    navigate('/login');
  };

  if (location.pathname === '/vehicles') {
    pageTitle = 'Vehicles';
    breadcrumb = (
      <>
        <Link to="/" className="breadcrumb-link">Home</Link>
        <span className="breadcrumb-separator"> / </span>
        <span className="breadcrumb-text">Vehicles</span>
      </>
    );
  } else if (location.pathname === '/vehicles/create') {
    pageTitle = 'Add Vehicle';
    breadcrumb = (
      <>
        <Link to="/" className="breadcrumb-link">Home</Link>
        <span className="breadcrumb-separator"> / </span>
        <Link to="/vehicles" className="breadcrumb-link">Vehicles</Link>
        <span className="breadcrumb-separator"> / </span>
        <span className="breadcrumb-text">Add Vehicle</span>
      </>
    );
  } else if (location.pathname.startsWith('/vehicles/') && location.pathname.endsWith('/edit')) {
    pageTitle = 'Edit Vehicle';
    breadcrumb = (
      <>
        <Link to="/" className="breadcrumb-link">Home</Link>
        <span className="breadcrumb-separator"> / </span>
        <Link to="/vehicles" className="breadcrumb-link">Vehicles</Link>
        <span className="breadcrumb-separator"> / </span>
        <span className="breadcrumb-text">Edit</span>
      </>
    );
  } else if (location.pathname.startsWith('/vehicles/') && location.pathname !== '/vehicles/create') {
    const vehicleId = location.pathname.split('/')[2];
    const displayId = vehicleId.replace('db-', '');
    pageTitle = 'Vehicle Details';
    breadcrumb = (
      <>
        <Link to="/" className="breadcrumb-link">Home</Link>
        <span className="breadcrumb-separator"> / </span>
        <Link to="/vehicles" className="breadcrumb-link">Vehicles</Link>
        <span className="breadcrumb-separator"> / </span>
        <span className="breadcrumb-text">{displayId}</span>
      </>
    );
  } else if (location.pathname === '/drivers') {
    pageTitle = 'Drivers';
    breadcrumb = (
      <>
        <Link to="/" className="breadcrumb-link">Home</Link>
        <span className="breadcrumb-separator"> / </span>
        <span className="breadcrumb-text">Drivers</span>
      </>
    );
  } else if (location.pathname === '/drivers/create') {
    pageTitle = 'Add Driver';
    breadcrumb = (
      <>
        <Link to="/" className="breadcrumb-link">Home</Link>
        <span className="breadcrumb-separator"> / </span>
        <Link to="/drivers" className="breadcrumb-link">Drivers</Link>
        <span className="breadcrumb-separator"> / </span>
        <span className="breadcrumb-text">Add Driver</span>
      </>
    );
  } else if (location.pathname.startsWith('/drivers/') && location.pathname.endsWith('/edit')) {
    pageTitle = 'Edit Driver';
    breadcrumb = (
      <>
        <Link to="/" className="breadcrumb-link">Home</Link>
        <span className="breadcrumb-separator"> / </span>
        <Link to="/drivers" className="breadcrumb-link">Drivers</Link>
        <span className="breadcrumb-separator"> / </span>
        <span className="breadcrumb-text">Edit</span>
      </>
    );
  } else if (location.pathname.startsWith('/drivers/') && location.pathname !== '/drivers/create') {
    const driverId = location.pathname.split('/')[2];
    const displayId = driverId.replace('db-', '');
    pageTitle = 'Driver Details';
    breadcrumb = (
      <>
        <Link to="/" className="breadcrumb-link">Home</Link>
        <span className="breadcrumb-separator"> / </span>
        <Link to="/drivers" className="breadcrumb-link">Drivers</Link>
        <span className="breadcrumb-separator"> / </span>
        <span className="breadcrumb-text">{displayId}</span>
      </>
    );
  } else if (location.pathname === '/trips') {
    pageTitle = roleKey === 'DRIVER' ? 'My Assigned Trips' : 'Freight Trips';
    breadcrumb = (
      <>
        <Link to="/" className="breadcrumb-link">Home</Link>
        <span className="breadcrumb-separator"> / </span>
        <span className="breadcrumb-text">Trips</span>
      </>
    );
  } else if (location.pathname === '/new-trip' || location.pathname === '/trips/create') {
    pageTitle = 'New Trip';
    breadcrumb = (
      <>
        <Link to="/" className="breadcrumb-link">Home</Link>
        <span className="breadcrumb-separator"> / </span>
        <Link to="/trips" className="breadcrumb-link">Trips</Link>
        <span className="breadcrumb-separator"> / </span>
        <span className="breadcrumb-text">New Trip</span>
      </>
    );
  } else if (location.pathname.startsWith('/trips/') && location.pathname.endsWith('/edit')) {
    const tripId = location.pathname.split('/')[2];
    pageTitle = `Edit Trip — ${tripId}`;
    breadcrumb = (
      <>
        <Link to="/" className="breadcrumb-link">Home</Link>
        <span className="breadcrumb-separator"> / </span>
        <Link to="/trips" className="breadcrumb-link">Trips</Link>
        <span className="breadcrumb-separator"> / </span>
        <span className="breadcrumb-text">Edit</span>
      </>
    );
  } else if (location.pathname.startsWith('/trips/') && !location.pathname.endsWith('/edit')) {
    const tripId = location.pathname.split('/')[2];
    pageTitle = 'Trip Details';
    breadcrumb = (
      <>
        <Link to="/" className="breadcrumb-link">Home</Link>
        <span className="breadcrumb-separator"> / </span>
        <Link to="/trips" className="breadcrumb-link">Trips</Link>
        <span className="breadcrumb-separator"> / </span>
        <span className="breadcrumb-text">{tripId}</span>
      </>
    );
  } else if (location.pathname === '/lr') {
    pageTitle = 'LR / Bilty';
    breadcrumb = (
      <>
        <Link to="/" className="breadcrumb-link">Home</Link>
        <span className="breadcrumb-separator"> / </span>
        <span className="breadcrumb-text">LR / Bilty</span>
      </>
    );
  } else if (location.pathname === '/lr/create') {
    pageTitle = 'Create LR / Bilty';
    breadcrumb = (
      <>
        <Link to="/" className="breadcrumb-link">Home</Link>
        <span className="breadcrumb-separator"> / </span>
        <Link to="/lr" className="breadcrumb-link">LR / Bilty</Link>
        <span className="breadcrumb-separator"> / </span>
        <span className="breadcrumb-text">Create</span>
      </>
    );
  } else if (location.pathname.startsWith('/lr/') && location.pathname.endsWith('/edit')) {
    const lrId = location.pathname.split('/')[2];
    pageTitle = `Edit LR — ${lrId}`;
    breadcrumb = (
      <>
        <Link to="/" className="breadcrumb-link">Home</Link>
        <span className="breadcrumb-separator"> / </span>
        <Link to="/lr" className="breadcrumb-link">LR / Bilty</Link>
        <span className="breadcrumb-separator"> / </span>
        <span className="breadcrumb-text">Edit</span>
      </>
    );
  } else if (location.pathname.startsWith('/lr/') && !location.pathname.endsWith('/edit') && location.pathname !== '/lr/create') {
    const lrId = location.pathname.split('/')[2];
    pageTitle = 'LR Details';
    breadcrumb = (
      <>
        <Link to="/" className="breadcrumb-link">Home</Link>
        <span className="breadcrumb-separator"> / </span>
        <Link to="/lr" className="breadcrumb-link">LR / Bilty</Link>
        <span className="breadcrumb-separator"> / </span>
        <span className="breadcrumb-text">{lrId}</span>
      </>
    );
  } else if (location.pathname === '/attendance') {
    pageTitle = roleKey === 'DRIVER' ? 'My Attendance Record' : 'Attendance';
    breadcrumb = (
      <>
        <Link to="/" className="breadcrumb-link">Home</Link>
        <span className="breadcrumb-separator"> / </span>
        <Link to="/reports" className="breadcrumb-link">Reports</Link>
        <span className="breadcrumb-separator"> / </span>
        <span className="breadcrumb-text">Attendance</span>
      </>
    );
  } else if (location.pathname === '/payroll') {
    pageTitle = roleKey === 'DRIVER' ? 'My Salary & Payout Slip' : 'Payroll';
    breadcrumb = (
      <>
        <Link to="/" className="breadcrumb-link">Home</Link>
        <span className="breadcrumb-separator"> / </span>
        <span className="breadcrumb-text">Payroll</span>
      </>
    );
  } else if (location.pathname === '/settings') {
    pageTitle = 'System Settings';
    breadcrumb = (
      <>
        <Link to="/" className="breadcrumb-link">Home</Link>
        <span className="breadcrumb-separator"> / </span>
        <span className="breadcrumb-text">Settings</span>
      </>
    );
  } else if (location.pathname === '/profit-loss') {
    pageTitle = 'Profit & Loss';
    breadcrumb = (
      <>
        <Link to="/" className="breadcrumb-link">Home</Link>
        <span className="breadcrumb-separator"> / </span>
        <Link to="/reports" className="breadcrumb-link">Reports</Link>
        <span className="breadcrumb-separator"> / </span>
        <span className="breadcrumb-text">Profit & Loss</span>
      </>
    );
  } else if (location.pathname === '/gst') {
    pageTitle = 'GST';
    breadcrumb = (
      <>
        <Link to="/" className="breadcrumb-link">Home</Link>
        <span className="breadcrumb-separator"> / </span>
        <span className="breadcrumb-text">GST</span>
      </>
    );
  } else if (location.pathname === '/billing') {
    pageTitle = 'Billing / Invoices';
    breadcrumb = (
      <>
        <Link to="/" className="breadcrumb-link">Home</Link>
        <span className="breadcrumb-separator"> / </span>
        <span className="breadcrumb-text">Billing</span>
      </>
    );
  } else if (location.pathname === '/billing/create') {
    pageTitle = 'Create Invoice';
    breadcrumb = (
      <>
        <Link to="/" className="breadcrumb-link">Home</Link>
        <span className="breadcrumb-separator"> / </span>
        <Link to="/billing" className="breadcrumb-link">Billing</Link>
        <span className="breadcrumb-separator"> / </span>
        <span className="breadcrumb-text">Create</span>
      </>
    );
  } else if (location.pathname.startsWith('/billing/')) {
    const invoiceId = location.pathname.split('/')[2];
    pageTitle = `Invoice: ${invoiceId}`;
    breadcrumb = (
      <>
        <Link to="/" className="breadcrumb-link">Home</Link>
        <span className="breadcrumb-separator"> / </span>
        <Link to="/billing" className="breadcrumb-link">Billing</Link>
        <span className="breadcrumb-separator"> / </span>
        <span className="breadcrumb-text">{invoiceId}</span>
      </>
    );
  } else if (location.pathname !== '/') {
    const pathParts = location.pathname.split('/').filter(Boolean);
    
    // Format page title from the last part
    let rawTitle = pathParts[pathParts.length - 1] || '';
    if (rawTitle === 'profit-loss') rawTitle = 'Profit & Loss';
    else if (rawTitle === 'cash-bank') rawTitle = 'Cash & Bank';
    
    pageTitle = rawTitle.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

    breadcrumb = (
      <>
        <Link to="/" className="breadcrumb-link">Home</Link>
        {pathParts.map((part, index) => {
          let formattedPart = part;
          if (part === 'profit-loss') formattedPart = 'Profit & Loss';
          else if (part === 'cash-bank') formattedPart = 'Cash & Bank';
          else formattedPart = part.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

          const isLast = index === pathParts.length - 1;
          const pathTo = '/' + pathParts.slice(0, index + 1).join('/');

          return (
            <React.Fragment key={pathTo}>
              <span className="breadcrumb-separator"> / </span>
              {isLast ? (
                <span className="breadcrumb-text">{formattedPart}</span>
              ) : (
                <Link to={pathTo} className="breadcrumb-link">{formattedPart}</Link>
              )}
            </React.Fragment>
          );
        })}
      </>
    );
  }

  return (
    <header className="header">
      <div className="header-left">
        <button className="mobile-menu-btn" onClick={toggleSidebar}>
          <MdMenu size={24} />
        </button>
        {location.pathname !== '/' && (
          <button
            onClick={() => navigate(-1)}
            className="header-back-btn"
            title="Go Back"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'var(--bg-surface, #f8fafc)',
              border: '1px solid var(--border-color, #e2e8f0)',
              color: 'var(--text-primary, #0f172a)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              marginRight: '4px',
              flexShrink: 0
            }}
          >
            <MdArrowBack size={18} />
          </button>
        )}
        <div className="title-breadcrumb">
          <h1 className="page-title">{pageTitle}</h1>
          <div className="breadcrumb">
            {breadcrumb}
            {location.pathname !== '/' && (
              <>
                <span className="breadcrumb-separator"> / </span>
                <span 
                  onClick={() => navigate(-1)} 
                  className="breadcrumb-link"
                  style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}
                  title="Click to go back"
                >
                  Back
                </span>
              </>
            )}
          </div>
        </div>
      </div>
      
      <div className="header-right">
        
        <SmartCommandBar />

        <div className="notification-container" ref={notifRef} style={{ position: 'relative' }}>
          <button 
            className="icon-btn notification-btn" 
            onClick={() => navigate('/notifications')}
            title={`${alertCount} Alert(s)`}
            style={{ position: 'relative' }}
          >
            <MdNotifications size={22} />
            {alertCount > 0 ? (
              <span style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                backgroundColor: '#ff4757',
                color: '#fff',
                fontSize: '10px',
                fontWeight: '700',
                borderRadius: '50%',
                minWidth: '16px',
                height: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 2px'
              }}>
                {alertCount}
              </span>
            ) : null}
          </button>
        </div>
        
        <div className="user-profile-container" ref={dropdownRef}>
          <div className="user-profile" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
            <div className="avatar" style={{ background: userRole.badgeColor, color: 'white', fontWeight: 600, fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ marginTop: '2px' }}>{userRole.initial}</div>
            </div>
            <div className="user-info">
              <span className="user-name">{userRole.name}</span>
              <span className="user-role" style={{ color: userRole.badgeColor, fontWeight: 600 }}>{userRole.label}</span>
            </div>
            <MdArrowDropDown className="dropdown-icon" />
          </div>

          {isDropdownOpen && (
            <div className="profile-dropdown">
              <div className="dropdown-header">
                <div className="dropdown-name">{userRole.name}</div>
                <div className="dropdown-email">{userRole.email}</div>
              </div>
              <div className="dropdown-divider"></div>
              <Link to="/profile" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                <MdAccountCircle size={18} style={{ color: '#0984e3' }} />
                <span>My Profile</span>
              </Link>
              {roleKey === 'SUPER_ADMIN' && (
                <Link to="/settings" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                  <MdSettings size={18} style={{ color: '#636e72' }} />
                  <span>Settings</span>
                </Link>
              )}
              <div className="dropdown-divider"></div>
              <button className="dropdown-item logout-btn" onClick={handleLogout}>
                <MdLogout size={18} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
