import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdAdd, MdSearch, MdVisibility, MdEdit, MdDelete, MdPictureAsPdf } from 'react-icons/md';
import './Vehicles.css'; // Reusing common table styles
import { useModal } from '../context/ModalContext';
import { useAuth } from '../context/AuthContext';


const LRList = () => {
  const { showAlert, showConfirm } = useModal();
  const { roleKey, userRole } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [dbLrs, setDbLrs] = useState([]);
  
  const [lrs, setLrs] = useState([]);

  useEffect(() => {
    const fetchLrs = async () => {
      try {
        const response = await fetch('/api/v1/fleet/lr');
        if (response.ok) {
          const data = await response.json();
          setDbLrs(data);
        }
      } catch (error) {
        console.error('Failed to fetch LRs:', error);
      }
    };
    fetchLrs();
  }, []);

  const allLrs = [
    ...dbLrs.filter(lr => !lr.downloaded).map(lr => ({
      id: lr.lrNumber || `DB-LR-${lr.id}`,
      dbId: lr.id,
      date: lr.createdAt ? new Date(lr.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Unknown Date',
      consignor: lr.consignor || 'Unknown',
      consignee: lr.consignee || 'Unknown',
      source: lr.fromLocation || 'Unknown',
      destination: lr.toLocation || 'Unknown',
      weight: `${lr.weight || 0} ${lr.weightUnit || 'Kg'}`,
      freight: `₹${(lr.amount || 0) + (lr.gstAmount || (lr.trip ? lr.trip.gstAmount : 0) || 0) + (lr.biltyCharge || 0) + (lr.loadingCharge || 0)}`,
      status: lr.status || 'In Transit',
      podStatus: lr.podStatus || 'Pending',
      ewayBillNumber: lr.ewayBillNumber || lr.trip?.ewayBillNumber || '',
      isReal: true
    }))
  ];

  const handleDelete = async (id, isReal, dbId) => {
    if (await showConfirm('Are you sure you want to delete this Lorry Receipt?')) {
      if (isReal) {
        try {
          const response = await fetch(`/api/v1/fleet/lr/${dbId}`, { method: 'DELETE' });
          if (response.ok) {
            setDbLrs(dbLrs.filter(lr => lr.id !== dbId));
          } else {
            showAlert('Failed to delete from database.');
          }
        } catch (error) {
          console.error(error);
        }
      } else {
        setLrs(lrs.filter(lr => lr.id !== id));
      }
    }
  };

  const filteredLrs = allLrs.filter(lr => {
    // If CUSTOMER, only show LRs where consignor or consignee matches their name
    if (roleKey === 'CUSTOMER') {
      const clientName = (userRole?.companyName || userRole?.name || '').toLowerCase();
      const consignorName = (lr.consignor || '').toLowerCase();
      const consigneeName = (lr.consignee || '').toLowerCase();
      if (!consignorName.includes(clientName) && !consigneeName.includes(clientName)) {
        return false;
      }
    }

    const searchLower = String(searchTerm || '').toLowerCase();
    const matchesSearch = 
      String(lr.id || '').toLowerCase().includes(searchLower) || 
      String(lr.consignor || '').toLowerCase().includes(searchLower) ||
      String(lr.consignee || '').toLowerCase().includes(searchLower) ||
      String(lr.ewayBillNumber || '').toLowerCase().includes(searchLower);
    
    const matchesStatus = statusFilter === 'All Status' || lr.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="vehicles-container">
      <div className="page-header">
        <div className="header-text">
          <h2>Lorry Receipts (LR)</h2>
          <p>Manage and print Bilty/LR records</p>
        </div>
        <button className="primary-btn" onClick={() => navigate('/lr/create')}>
          <MdAdd size={20} />
          Create New LR
        </button>
      </div>

      <div className="filter-section panel">
        <div className="search-box" style={{ flex: 1, maxWidth: '400px' }}>
          <input 
            type="text" 
            placeholder="Search LR #, Consignor, Consignee..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select 
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All Status">All Status</option>
          <option value="Pending">Pending</option>
          <option value="In Transit">In Transit</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>

        <button className="search-btn">
          <MdSearch size={20} />
          Search
        </button>
        
        <button className="reset-btn" onClick={() => {
          setSearchTerm('');
          setStatusFilter('All Status');
        }}>
          Reset
        </button>
      </div>

      <div className="table-container panel">
        <table className="data-table">
          <thead>
            <tr>
              <th>LR #</th>
              <th>CONSIGNOR / CONSIGNEE</th>
              <th>SOURCE &rarr; DESTINATION</th>
              <th>WEIGHT / CHARGES</th>
              <th>STATUS / POD</th>
              <th style={{textAlign: 'center'}}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredLrs.length === 0 ? (
              <tr>
                <td colSpan="6" style={{textAlign: 'center', padding: '20px'}}>No Lorry Receipts found.</td>
              </tr>
            ) : (
              filteredLrs.map((lr) => (
              <tr key={lr.id}>
                <td>
                  <div className="vehicle-info" style={{ alignItems: 'flex-start' }}>
                    <span className="link-text vehicle-num" onClick={() => navigate(`/lr/${lr.dbId || lr.id}`)}>{lr.id}</span>
                    <span className="vehicle-name" style={{ margin: 0 }}>{lr.date}</span>
                    {lr.ewayBillNumber ? (
                      <span style={{ 
                        fontSize: '11px', 
                        color: '#0284c7', 
                        fontWeight: 700, 
                        background: '#e0f2fe', 
                        border: '1px solid #bae6fd', 
                        padding: '1px 5px', 
                        borderRadius: '3px', 
                        display: 'inline-block', 
                        marginTop: '2px', 
                        marginLeft: 0,
                        lineHeight: '15px'
                      }}>
                        EWB: {lr.ewayBillNumber}
                      </span>
                    ) : null}
                  </div>
                </td>
                <td>
                  <div className="vehicle-info">
                    <span className="vehicle-num">{lr.consignor}</span>
                    <span className="vehicle-name route-text">&rarr; {lr.consignee}</span>
                  </div>
                </td>
                <td>
                  <div className="vehicle-info">
                    <span className="vehicle-num">{lr.source}</span>
                    <span className="vehicle-name route-text">&rarr; {lr.destination}</span>
                  </div>
                </td>
                <td>
                  <div className="vehicle-info">
                    <span className="vehicle-num">{lr.weight}</span>
                    <span className="vehicle-name" style={{color: '#4cd137', fontWeight: 'bold'}}>{lr.freight}</span>
                  </div>
                </td>
                <td>
                  <div style={{display: 'flex', flexDirection: 'column', gap: '6px'}}>
                    <span className={`status-badge ${lr.status.toLowerCase().replace(' ', '-')}`}>
                      {lr.status}
                    </span>
                    <span className={`status-badge ${lr.podStatus.toLowerCase() === 'pending' ? 'inactive' : 'active'}`} style={{fontSize: '10px'}}>
                      POD: {lr.podStatus}
                    </span>
                  </div>
                </td>
                <td>
                  <div className="action-buttons" style={{justifyContent: 'center'}}>
                    <button className="action-icon view" title="View Bilty" style={{color: '#3498db'}} onClick={() => navigate(`/lr/${lr.dbId || lr.id}`)}><MdVisibility /></button>
                    <button className="action-icon view" title="Print / Download Bilty" style={{color: '#e74c3c'}} onClick={() => navigate(`/lr/${lr.dbId || lr.id}`)}><MdPictureAsPdf /></button>
                    <button className="action-icon edit" title="Edit" onClick={() => navigate(`/lr/${lr.dbId || lr.id}/edit`)}><MdEdit /></button>
                    <button className="action-icon delete" title="Delete" onClick={() => handleDelete(lr.id, lr.isReal, lr.dbId)}><MdDelete /></button>
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

export default LRList;


