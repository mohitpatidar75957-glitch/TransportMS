import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdAdd, MdSearch, MdVisibility, MdEdit, MdDelete, MdStore } from 'react-icons/md';
import './Vehicles.css'; 
import { useModal } from '../context/ModalContext';


const Vendors = () => {
  const { showAlert, showConfirm } = useModal();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('Active');
  const [dbVendors, setDbVendors] = useState([]);
  
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await fetch('/api/v1/resources/vendors');
        if (response.ok) {
          const data = await response.json();
          setDbVendors(data);
        }
      } catch (error) {
        console.error('Failed to fetch vendors from database:', error);
      }
    };
    fetchVendors();
  }, []);

  const allVendors = [
    ...dbVendors.map(v => ({
      id: `VEN-DB-${v.id}`,
      dbId: v.id,
      name: v.name || 'Unknown',
      contactPerson: v.contactPerson || 'N/A',
      mobile: v.mobileNumber || 'N/A',
      city: v.address ? v.address.split(',')[0] : 'Unknown',
      services: v.services ? v.services.join(', ') : 'None',
      rawBalance: v.balance || 0,
      balance: `₹ ${Math.abs(v.balance || 0)} ${v.balance < 0 ? '(Receivable)' : (v.balance > 0 ? '(Payable)' : '')}`,
      status: v.status || 'Active',
      isReal: true
    }))
  ];

  const handleDelete = async (id, isReal, dbId) => {
    if (await showConfirm('Are you sure you want to delete this vendor?')) {
      if (isReal) {
        try {
          const response = await fetch(`/api/v1/resources/vendors/${dbId}`, { method: 'DELETE' });
          if (response.ok) {
            setDbVendors(dbVendors.filter(v => v.id !== dbId));
          } else {
            const errorText = await response.text();
            if (errorText.includes('foreign key constraint')) {
              showAlert('Cannot delete this vendor because they have active trips, vehicles, or fuel records. Please mark them as Inactive instead.');
            } else {
              showAlert(errorText || 'Failed to delete from database.');
            }
          }
        } catch (error) {
          console.error(error);
          showAlert('Network error connecting to database.');
        }
      }
    }
  };

  const filteredVendors = allVendors.filter(v => {
    const nameStr = String(v.name || '');
    const cityStr = String(v.city || '');
    const searchStr = String(searchTerm || '').toLowerCase();
    
    const matchesSearch = nameStr.toLowerCase().includes(searchStr) || cityStr.toLowerCase().includes(searchStr);
    const matchesTab = v.status.toLowerCase() === activeTab.toLowerCase();
    
    return matchesSearch && matchesTab;
  });

  return (
    <div className="vehicles-container">
      <div className="page-header">
        <div className="header-text">
          <h2>Vendor Management</h2>
          <p>Manage transport, fuel, maintenance, and other vendors</p>
        </div>
        <button className="primary-btn" onClick={() => navigate('/vendors/create')}>
          <MdAdd size={20} />
          Add Vendor
        </button>
      </div>

      <div className="filter-section panel">
        <div className="tabs" style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {[
            { label: 'Active', count: allVendors.filter(v => (v.status || 'Active').toLowerCase() === 'active').length },
            { label: 'Inactive', count: allVendors.filter(v => (v.status || '').toLowerCase() === 'inactive').length },
            { label: 'Blocked', count: allVendors.filter(v => (v.status || '').toLowerCase() === 'blocked').length }
          ].map(tab => {
            const isActive = activeTab.toLowerCase() === tab.label.toLowerCase();
            return (
              <button 
                key={tab.label} 
                className={`tab-btn ${isActive ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.label)}
                style={{ 
                  padding: '10px 20px', 
                  borderRadius: '10px', 
                  border: isActive ? '1px solid #8e44ad' : '1px solid rgba(255, 255, 255, 0.12)', 
                  background: isActive ? 'linear-gradient(135deg, #8e44ad, #6c5ce7)' : 'rgba(255, 255, 255, 0.05)', 
                  color: isActive ? '#ffffff' : 'var(--text-secondary, #a0a0b0)', 
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: isActive ? '0 4px 14px rgba(142, 68, 173, 0.4)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span>{tab.label} Vendors</span>
                <span style={{
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  background: isActive ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.1)',
                  color: isActive ? '#ffffff' : 'var(--text-secondary)'
                }}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
        <div className="search-box" style={{ flex: 1, maxWidth: '400px', display: 'flex', gap: '10px' }}>
          <input 
            type="text" 
            placeholder="Search by Name, City..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: 1 }}
          />
          <button className="search-btn">
            <MdSearch size={20} />
            Search
          </button>
        </div>
      </div>

      <div className="table-container panel">
        <table className="data-table">
          <thead>
            <tr>
              <th>VENDOR NAME</th>
              <th>CONTACT INFO</th>
              <th>SERVICES</th>
              <th>CITY/ADDRESS</th>
              <th style={{ textAlign: 'right' }}>BALANCE</th>
              <th>STATUS</th>
              <th style={{ textAlign: 'center' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredVendors.length === 0 ? (
              <tr>
                <td colSpan="7" style={{textAlign: 'center', padding: '20px'}}>No vendors found.</td>
              </tr>
            ) : (
              filteredVendors.map((vendor) => (
              <tr key={vendor.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MdStore style={{ color: 'var(--text-secondary)' }} size={18} />
                    <span className="vehicle-num" style={{ fontSize: '14px' }}>{vendor.name}</span>
                  </div>
                </td>
                <td>
                  <div className="vehicle-info">
                    <span>{vendor.contactPerson}</span>
                    <span className="vehicle-name">{vendor.mobile}</span>
                  </div>
                </td>
                <td>{vendor.services}</td>
                <td>{vendor.city}</td>
                <td style={{ textAlign: 'right', fontWeight: 'bold', color: vendor.rawBalance < 0 ? '#4cd137' : (vendor.rawBalance > 0 ? '#ff4757' : 'inherit') }}>
                  {vendor.balance}
                </td>
                <td>
                  <span className={`status-badge ${(vendor.status || 'Active').toLowerCase()}`}>
                    {vendor.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons" style={{ justifyContent: 'center' }}>
                    <button className="action-icon view" title="View" onClick={() => navigate(`/vendors/${vendor.dbId}`)}><MdVisibility /></button>
                    <button className="action-icon edit" title="Edit" onClick={() => navigate(`/vendors/edit/${vendor.dbId}`)}><MdEdit /></button>
                    <button className="action-icon delete" title="Delete" onClick={() => handleDelete(vendor.id, vendor.isReal, vendor.dbId)}><MdDelete /></button>
                  </div>
                </td>
              </tr>
            )))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Vendors;



