import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdAdd, MdSearch, MdVisibility, MdEdit, MdDelete, MdLocalGasStation } from 'react-icons/md';
import './Vehicles.css'; 
import { useModal } from '../context/ModalContext';


const FuelList = () => {
  const { showAlert, showConfirm } = useModal();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [dbFuelLogs, setDbFuelLogs] = useState([]);
  
  const [fuelLogs, setFuelLogs] = useState([]);

  useEffect(() => {
    const fetchFuelLogs = async () => {
      try {
        const response = await fetch('/api/v1/resources/fuel');
        if (response.ok) {
          const data = await response.json();
          setDbFuelLogs(data);
        }
      } catch (error) {
        console.error('Failed to fetch fuel logs from database:', error);
      }
    };
    fetchFuelLogs();
  }, []);

  const allFuelLogs = [
    ...dbFuelLogs.map(f => ({
      id: `FUEL-DB-${f.id}`,
      dbId: f.id,
      date: f.date || 'Unknown',
      vehicle: f.vehicle ? f.vehicle.registrationNumber : 'N/A',
      driver: f.driver ? f.driver.name : 'N/A',
      liters: f.liters || 0,
      amount: f.totalAmount || 0,
      pump: f.vendor ? f.vendor.name : 'Unknown Pump',
      status: f.paymentStatus || 'Paid',
      paymentMode: f.paymentMode || 'Cash',
      isFlagged: f.isFlagged,
      flagReason: f.flagReason,
      isReal: true
    }))
  ];

  const handleDelete = async (id, isReal, dbId) => {
    if (await showConfirm('Are you sure you want to delete this fuel record?')) {
      if (isReal) {
        try {
          const response = await fetch(`/api/v1/resources/fuel/${dbId}`, { method: 'DELETE' });
          if (response.ok) {
            setDbFuelLogs(dbFuelLogs.filter(f => f.id !== dbId));
          } else {
            showAlert('Failed to delete from database.');
          }
        } catch (error) {
          console.error(error);
        }
      } else {
        setFuelLogs(fuelLogs.filter(f => f.id !== id));
      }
    }
  };

  const filteredFuelLogs = allFuelLogs.filter(f => {
    const vehStr = String(f.vehicle || '');
    const drvStr = String(f.driver || '');
    const pmpStr = String(f.pump || '');
    const searchStr = String(searchTerm || '').toLowerCase();
    
    return vehStr.toLowerCase().includes(searchStr) || 
           drvStr.toLowerCase().includes(searchStr) ||
           pmpStr.toLowerCase().includes(searchStr);
  });

  const totalLiters = allFuelLogs.reduce((sum, log) => sum + (parseFloat(log.liters) || 0), 0);
  const totalAmount = allFuelLogs.reduce((sum, log) => sum + (parseFloat(log.amount) || 0), 0);

  return (
    <div className="vehicles-container">
      <div className="page-header">
        <div className="header-text">
          <h2>Fuel Management</h2>
          <p>Track all vehicle fuel logs and pump payments</p>
        </div>
        <button className="primary-btn" onClick={() => navigate('/fuel/create')}>
          <MdAdd size={20} />
          Record Fuel
        </button>
      </div>

      <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
        <div className="panel" style={{ flex: 1, padding: '24px', borderLeft: '4px solid #3498db' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: 'var(--text-secondary)' }}>Total Fuel (All Time)</h3>
          <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>{totalLiters.toFixed(2)} Ltrs</p>
        </div>
        <div className="panel" style={{ flex: 1, padding: '24px', borderLeft: '4px solid #e74c3c' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: 'var(--text-secondary)' }}>Total Amount</h3>
          <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#e74c3c' }}>₹{totalAmount.toFixed(2)}</p>
        </div>
      </div>

      <div className="filter-section panel">
        <div className="search-box" style={{ flex: 1, maxWidth: '400px' }}>
          <input 
            type="text" 
            placeholder="Search by Vehicle, Driver, Pump..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="search-btn">
          <MdSearch size={20} />
          Search
        </button>
      </div>

      <div className="table-container panel">
        <table className="data-table">
          <thead>
            <tr>
              <th>DATE</th>
              <th>VEHICLE / DRIVER</th>
              <th style={{ textAlign: 'right' }}>LITERS</th>
              <th style={{ textAlign: 'right' }}>AMOUNT</th>
              <th>PUMP / VENDOR</th>
              <th>STATUS / MODE</th>
              <th style={{ textAlign: 'center' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredFuelLogs.length === 0 ? (
              <tr>
                <td colSpan="7" style={{textAlign: 'center', padding: '20px'}}>No fuel records found.</td>
              </tr>
            ) : (
              filteredFuelLogs.map((log) => (
              <tr key={log.id}>
                <td>{log.date}</td>
                <td>
                  <div className="vehicle-info">
                    <span className="vehicle-num">{log.vehicle}</span>
                    <span className="vehicle-name">{log.driver}</span>
                  </div>
                </td>
                <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                  {log.isFlagged && (
                    <span title={log.flagReason} style={{ cursor: 'help', marginRight: '6px', color: '#e74c3c' }}>⚠️</span>
                  )}
                  {log.liters} L
                </td>
                <td style={{ textAlign: 'right', fontWeight: 'bold', color: '#e74c3c' }}>₹{log.amount}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MdLocalGasStation style={{color: '#fbc531'}} />
                    <span>{log.pump}</span>
                  </div>
                </td>
                <td>
                  <span className={`status-badge ${(log.status || 'Paid').toLowerCase()}`}>
                    {log.status}
                  </span>
                  <div style={{ fontSize: '12px', marginTop: '4px', color: 'var(--text-secondary)' }}>
                    By {log.paymentMode}
                  </div>
                </td>
                <td>
                  <div className="action-buttons" style={{ justifyContent: 'center' }}>
                    <button className="action-icon edit" title="Edit" onClick={() => navigate('/fuel/create')}><MdEdit /></button>
                    <button className="action-icon delete" title="Delete" onClick={() => handleDelete(log.id, log.isReal, log.dbId)}><MdDelete /></button>
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

export default FuelList;


