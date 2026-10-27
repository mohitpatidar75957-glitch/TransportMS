import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  MdDashboard, MdLocalShipping, MdPeople, MdDirectionsCar, 
  MdReceipt, MdLocationOn, MdAttachMoney, MdAccountBalanceWallet, 
  MdTrendingUp, MdAccountBalance, MdLocalGasStation, MdStore, 
  MdInventory, MdEventAvailable, MdPayments, MdGroups, 
  MdFolder, MdAssessment, MdContactMail, MdSettings, MdColorLens, MdClose, MdMap, MdSecurity, MdHistory, MdListAlt,
  MdSmartphone, MdAddRoad, MdRoute, MdAddCircleOutline, MdAltRoute, MdToll, MdPercent
} from 'react-icons/md';
import { FaWhatsapp } from 'react-icons/fa';
import './Sidebar.css';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { userRole, isPathAllowed, appBranding } = useAuth();

  const handleLinkClick = () => {
    if (isOpen) {
      toggleSidebar();
    }
  };

  const menuItems = [
    {
      title: 'Dashboard',
      icon: <MdDashboard />,
      path: '/'
    },
    {
      title: 'New Trip',
      icon: <MdAddCircleOutline />,
      path: '/new-trip'
    },
    {
      section: 'FLEET & OPERATIONS',
      items: [
        { title: 'Driver App', icon: <MdSmartphone />, path: '/driver-portal', badge: 'MOBILE' },
        { title: 'Orders', icon: <MdListAlt />, path: '/orders' },
        { title: 'Vehicles', icon: <MdLocalShipping />, path: '/vehicles' },
        { title: 'Drivers', icon: <MdPeople />, path: '/drivers' },
        { title: 'Trips', icon: <MdAltRoute />, path: '/trips' },
        { title: 'LR / Bilty', icon: <MdReceipt />, path: '/lr' },
        { title: 'Live Tracking', icon: <MdLocationOn />, path: '/tracking', badge: 'LIVE' },
        { title: 'FASTag & Tolls', icon: <MdToll />, path: '/fastag', badge: 'FAST' },
        { title: 'WhatsApp Int.', icon: <FaWhatsapp />, path: '/whatsapp' },
      ]
    },
    {
      section: 'FINANCE',
      items: [
        { title: 'Billing / Invoices', icon: <MdAttachMoney />, path: '/billing' },
        { title: 'Expenses', icon: <MdAccountBalanceWallet />, path: '/expenses' },
        { title: 'Profit & Loss', icon: <MdTrendingUp />, path: '/profit-loss' },
        { title: 'GST', icon: <MdPercent />, path: '/gst' },
        { title: 'Loans / EMI', icon: <MdAccountBalance />, path: '/loans' },
        { title: 'Cash / Bank', icon: <MdAccountBalance />, path: '/cash-bank' },
      ]
    },
    {
      section: 'RESOURCES',
      items: [
        { title: 'Fuel Management', icon: <MdLocalGasStation />, path: '/fuel' },
        { title: 'Vendors', icon: <MdStore />, path: '/vendors' },
        { title: 'Inventory', icon: <MdInventory />, path: '/inventory' },
      ]
    },
    {
      section: 'HR & PAYROLL',
      items: [
        { title: 'Attendance', icon: <MdEventAvailable />, path: '/attendance' },
        { title: 'Salary / Payroll', icon: <MdPayments />, path: '/payroll' },
        { title: 'Staff & Labor', icon: <MdGroups />, path: '/staff' },
      ]
    },
    {
      section: 'MANAGEMENT',
      items: [
        { title: 'Documents', icon: <MdFolder />, path: '/documents' },
        { title: 'Reports', icon: <MdAssessment />, path: '/reports' },
      ]
    },
    {
      section: 'WEBSITE',
      items: [
        { title: 'Contact Inquiries', icon: <MdContactMail />, path: '/contact-messages' },
      ]
    },
    {
      section: 'SYSTEM',
      items: [
        { title: 'Users Management', icon: <MdPeople />, path: '/users' },
        { title: 'Access Control', icon: <MdSecurity />, path: '/access-control' },
        { title: 'Audit Logs', icon: <MdHistory />, path: '/audit-logs' },
        { title: 'Settings', icon: <MdSettings />, path: '/settings' },
        { title: 'Appearance', icon: <MdColorLens />, path: '/appearance' },
      ]
    }
  ];

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'active' : ''}`} onClick={toggleSidebar}></div>
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-icon-img-wrap">
            <img src="/logo.png" alt="Transport MS Logo" className="brand-logo-img" />
          </div>
          <div className="logo-text">
            <h2>{appBranding?.title || 'TMS by Codervu'}</h2>
            {appBranding?.subtitle ? (
              <p style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>{appBranding.subtitle}</span>
              </p>
            ) : null}
          </div>
          <button className="mobile-close-btn" onClick={toggleSidebar}>
            <MdClose size={24} />
          </button>
        </div>
      
      <div className="sidebar-menu">
        {isPathAllowed('/') && (
          <NavLink to="/" className={({ isActive }) => isActive ? "menu-item active dashboard-item" : "menu-item dashboard-item"} onClick={handleLinkClick}>
            <span className="icon"><MdDashboard /></span>
            <span className="title">Dashboard</span>
          </NavLink>
        )}

        {isPathAllowed('/new-trip') && (
          <NavLink to="/new-trip" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"} onClick={handleLinkClick}>
            <span className="icon"><MdAddRoad /></span>
            <span className="title">New Trip</span>
          </NavLink>
        )}

        {menuItems.slice(2).map((section, index) => {
          // Filter items allowed for this role
          const filteredItems = section.items.filter(item => isPathAllowed(item.path));
          if (filteredItems.length === 0) return null;

          return (
            <div key={index} className="menu-section">
              <h3 className="section-title">{section.section}</h3>
              {filteredItems.map((item, idx) => (
                <NavLink 
                  key={idx} 
                  to={item.path} 
                  className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}
                  onClick={handleLinkClick}
                >
                  <span className="icon">{item.icon}</span>
                  <span className="title">{item.title}</span>
                  {item.badge && <span className="badge">{item.badge}</span>}
                </NavLink>
              ))}
            </div>
          );
        })}
      </div>
      </aside>
    </>
  );
};

export default Sidebar;


