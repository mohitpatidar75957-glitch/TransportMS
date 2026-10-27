import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdAdd, MdSearch, MdVisibility, MdEdit, MdDelete } from 'react-icons/md';
import './Vehicles.css'; 
import { useModal } from '../context/ModalContext';


const Drivers = () => {
  const { showAlert, showConfirm } = useModal();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [dbDrivers, setDbDrivers] = useState([]);
  
  const [drivers, setDrivers] = useState([]);

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const response = await fetch('/api/v1/fleet/drivers');
        if (response.ok) {
          const data = await response.json();
          setDbDrivers(data);
        }
      } catch (error) {
        console.error('Failed to fetch drivers from database:', error);
      }
    };
    fetchDrivers();
  }, []);


  const getDateStatus = (dateStr) => {
    if (!dateStr || dateStr === 'N/A') return 'none';
    try {
      const cleanDate = typeof dateStr === 'string' && dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
      const target = new Date(cleanDate);
      const now = new Date();
      now.setHours(0,0,0,0);
      const diffDays = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
      if (diffDays < 0) return 'invalid';
      if (diffDays <= 30) return 'expiring-soon';
      return 'valid';
    } catch(e) {
      return 'none';
    }
  };

  // Use only real database drivers
  const allDrivers = dbDrivers.map(d => ({
    id: `db-${d.id}`,
    displayId: d.id,
    dbId: d.id,
    name: d.name,
    mobile: d.phone || 'N/A',
    license: d.licenseNumber || 'N/A',
    licenseExpiry: d.licenseExpiry || 'N/A',
    licenseStatus: getDateStatus(d.licenseExpiry),
    aadhar: d.aadharNumber || 'N/A',
    assignedVehicle: d.assignedVehicle ? (d.assignedVehicle.registrationNumber || d.assignedVehicle.name || 'Assigned') : 'None',
    status: d.status || 'Active',
    joinDate: d.joinedDate || 'Unknown',
    isReal: true
  }));

  const handleDelete = async (id, isReal, dbId) => {
    if (await showConfirm('Are you sure you want to delete this driver?')) {
      try {
        const response = await fetch(`/api/v1/fleet/drivers/${dbId}`, { method: 'DELETE' });
        if (response.ok) {
          setDbDrivers(prev => prev.filter(d => d.id !== dbId));
        } else {
          const errorText = await response.text();
          showAlert(errorText || 'Failed to delete from database.');
        }
      } catch (error) {
        console.error(error);
        showAlert('Network error connecting to database.');
      }
    }
  };

  const filteredDrivers = allDrivers.filter(d => {
    const nameStr = String(d.name || '');
    const mobileStr = String(d.mobile || '');
    const searchStr = String(searchTerm || '').toLowerCase();
    
    return nameStr.toLowerCase().includes(searchStr) || mobileStr.includes(searchStr);
  });

  return (
    <div className="vehicles-container">
      {deleteModal.show && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this driver? This action cannot be undone.</p>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setDeleteModal({ show: false, id: null, isReal: false, dbId: null })}>Cancel</button>
              <button className="delete-btn" onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

      <div className="page-header">
        <div className="header-text">
          <h2>Driver Management</h2>
          <p>Manage your fleet drivers and staff</p>
        </div>
        <button className="primary-btn" onClick={() => navigate('/drivers/create')}>
          <MdAdd size={20} />
          Add Driver
        </button>
      </div>

      <div className="filter-section panel">
        <div className="search-box" style={{ flex: 1, maxWidth: '400px' }}>
          <input 
            type="text" 
            placeholder="Search by name or mobile..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <button className="search-btn">
          <MdSearch size={20} />
          Search
        </button>
        
        <button className="reset-btn" onClick={() => setSearchTerm('')}>
          Reset
        </button>
      </div>

      <div className="table-container panel">
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>DRIVER NAME</th>
              <th>MOBILE</th>
              <th>LICENSE NO</th>
              <th>LICENSE EXPIRY</th>
              <th>AADHAR</th>
              <th>ASSIGNED VEHICLE</th>
              <th>STATUS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredDrivers.length === 0 ? (
              <tr>
                <td colSpan="9" style={{textAlign: 'center', padding: '20px'}}>No drivers found.</td>
              </tr>
            ) : (
              filteredDrivers.map((d) => (
              <tr key={d.id}>
                <td>{d.displayId || d.id}</td>
                <td>
                  <div className="vehicle-info">
                    <span className="vehicle-num">{d.name}</span>
                    <span className="vehicle-name">Joined: {d.joinDate}</span>
                  </div>
                </td>
                <td>{d.mobile}</td>
                <td>{d.license}</td>
                <td>
                  <span className={`date-badge ${d.licenseStatus}`}>
                    {d.licenseExpiry}
                  </span>
                </td>
                <td>{d.aadhar}</td>
                <td>{d.assignedVehicle}</td>
                <td>
                  <span className={`status-badge ${(d.status || 'Active').toLowerCase().replace(' ', '-')}`}>
                    {d.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="action-icon view" title="View" onClick={() => navigate(`/drivers/${d.id}`)}><MdVisibility /></button>
                    <button className="action-icon edit" title="Edit" onClick={() => navigate(`/drivers/${d.id}/edit`)}><MdEdit /></button>
                    <button className="action-icon delete" title="Delete" onClick={() => handleDelete(d.id, d.isReal, d.dbId)}><MdDelete /></button>
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

export default Drivers;


