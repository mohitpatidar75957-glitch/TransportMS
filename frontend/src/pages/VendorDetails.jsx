import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MdEdit, MdDelete, MdAdd, MdStore, MdAccountBalanceWallet, MdDirectionsCar, MdOutlineDescription } from 'react-icons/md';
import './VehicleDetails.css'; 

const VendorDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [dbVendor, setDbVendor] = useState(null);
  const [activeTab, setActiveTab] = useState('Overview');

  useEffect(() => {
    const fetchVendor = async () => {
      try {
        const res = await fetch(`/api/v1/resources/vendors/${id}`);
        if (res.ok) {
          const data = await res.json();
          setDbVendor(data);
        }
      } catch (err) {
        console.error('Failed to fetch vendor', err);
      }
    };
    fetchVendor();
  }, [id]);

  if (!dbVendor) {
    return <div style={{ padding: '24px' }}>Loading...</div>;
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Overview':
        return (
          <div className="panel" style={{ padding: '24px', display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
            <div style={{ flex: '1 1 45%', minWidth: '300px' }}>
              <h4 style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Company Details</h4>
              <div style={{ marginBottom: '8px' }}>
                <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)' }}>Company Name</span>
                <span style={{ fontWeight: 'bold' }}>{dbVendor.name}</span>
              </div>
              <div style={{ marginBottom: '8px' }}>
                <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)' }}>Contact Person</span>
                <span>{dbVendor.contactPerson}</span>
              </div>
              <div style={{ marginBottom: '8px' }}>
                <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)' }}>Mobile</span>
                <span>{dbVendor.mobileNumber}</span>
              </div>
              <div style={{ marginBottom: '8px' }}>
                <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)' }}>Email</span>
                <span>{dbVendor.email || 'N/A'}</span>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)' }}>Address</span>
                <span>{dbVendor.address}</span>
              </div>
            </div>

            <div style={{ flex: '1 1 45%', minWidth: '300px' }}>
              <h4 style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Financial & Compliance</h4>
              <div style={{ marginBottom: '8px' }}>
                <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)' }}>GSTIN</span>
                <span>{dbVendor.gstin || 'N/A'}</span>
              </div>
              <div style={{ marginBottom: '8px' }}>
                <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)' }}>PAN</span>
                <span>{dbVendor.pan || 'N/A'}</span>
              </div>
              <div style={{ marginBottom: '8px' }}>
                <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)' }}>Bank Details</span>
                <span>{dbVendor.bankDetails || 'N/A'}</span>
              </div>
              <div style={{ marginBottom: '8px' }}>
                <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)' }}>Services Provided</span>
                <span>{dbVendor.services?.join(', ') || 'None'}</span>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)' }}>Current Balance</span>
                <span style={{ fontWeight: 'bold', color: dbVendor.balance < 0 ? '#4cd137' : (dbVendor.balance > 0 ? '#ff4757' : 'inherit'), fontSize: '16px' }}>
                  ₹ {Math.abs(dbVendor.balance || 0)} {dbVendor.balance < 0 ? '(Receivable)' : (dbVendor.balance > 0 ? '(Payable)' : '')}
                </span>
              </div>
            </div>
          </div>
        );
      case 'Vehicles':
        return (
          <div className="panel" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, fontSize: '16px' }}>Vendor Vehicles</h3>
            </div>
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No vehicles found for this vendor.
            </div>
          </div>
        );
      case 'Trips':
        return (
          <div className="panel" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, fontSize: '16px' }}>Vendor Trips</h3>
            </div>
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No trips found for this vendor.
            </div>
          </div>
        );
      case 'Payments':
        return (
          <div className="panel" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, fontSize: '16px' }}>Payment History</h3>
              <button className="primary-btn" style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MdAdd /> Add Payment
              </button>
            </div>
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No payment transactions found.
            </div>
          </div>
        );
      case 'Documents':
        return (
          <div className="panel" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, fontSize: '16px' }}>Vendor Documents</h3>
              <button className="primary-btn" style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MdAdd /> Upload Document
              </button>
            </div>
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No documents uploaded yet.
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="vehicle-details-container" style={{ padding: '24px' }}>
      <div className="details-header" style={{ marginBottom: '24px' }}>
        <div className="header-titles">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <MdStore size={28} color="var(--primary-color)" />
            <h2 style={{ margin: 0 }}>{dbVendor.name}</h2>
            <span className={`status-badge ${(dbVendor.status || 'Active').toLowerCase()}`} style={{ marginLeft: '12px' }}>
              {dbVendor.status}
            </span>
          </div>
        </div>
        <div className="header-actions">
          <button className="action-btn edit-btn" onClick={() => navigate(`/vendors/edit/${id}`)}>
            <MdEdit /> Edit Vendor
          </button>
          <button className="action-btn delete-btn">
            <MdDelete /> Delete
          </button>
        </div>
      </div>

      <div className="tabs" style={{ display: 'flex', gap: '10px', marginBottom: '24px', borderBottom: '1px solid var(--border-color)' }}>
        {['Overview', 'Vehicles', 'Trips', 'Payments', 'Documents'].map(tab => (
          <button 
            key={tab} 
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
            style={{ 
              padding: '12px 24px', 
              border: 'none', 
              background: 'transparent', 
              color: activeTab === tab ? 'var(--primary-color)' : 'var(--text-secondary)', 
              borderBottom: activeTab === tab ? '3px solid var(--primary-color)' : '3px solid transparent',
              cursor: 'pointer',
              fontWeight: activeTab === tab ? 'bold' : 'normal',
              fontSize: '15px'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {renderTabContent()}

    </div>
  );
};

export default VendorDetails;


