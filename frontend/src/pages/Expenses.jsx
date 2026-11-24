import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdAdd, MdSearch, MdVisibility, MdEdit, MdDelete } from 'react-icons/md';
import './Vehicles.css'; 
import { useModal } from '../context/ModalContext';


const Expenses = () => {
  const { showAlert, showConfirm } = useModal();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [dbExpenses, setDbExpenses] = useState([]);
  
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const response = await fetch('/api/v1/finance/expenses');
        if (response.ok) {
          const data = await response.json();
          setDbExpenses(data);
        }
      } catch (error) {
        console.error('Failed to fetch expenses from database:', error);
      }
    };
    fetchExpenses();
  }, []);

  const allExpenses = [
    ...dbExpenses.map(e => ({
      id: `EXP-DB-${e.id}`,
      dbId: e.id,
      date: e.date || 'Unknown',
      category: e.category || 'N/A',
      vehicle: e.vehicle ? e.vehicle.registrationNumber : 'N/A',
      amount: `₹${e.amount || 0}`,
      rawAmount: e.amount || 0,
      paidBy: 'Company Account',
      status: 'Approved',
      isFlagged: e.isFlagged,
      flagReason: e.flagReason,
      isReal: true
    }))
  ];

  const handleDelete = async (id, isReal, dbId) => {
    if (await showConfirm('Are you sure you want to delete this expense?')) {
      if (isReal) {
        try {
          const response = await fetch(`/api/v1/finance/expenses/${dbId}`, { method: 'DELETE' });
          if (response.ok) {
            setDbExpenses(dbExpenses.filter(e => e.id !== dbId));
          } else {
            showAlert('Failed to delete from database.');
          }
        } catch (error) {
          console.error(error);
        }
      } else {
        setExpenses(expenses.filter(e => e.id !== id));
      }
    }
  };

  const filteredExpenses = allExpenses.filter(e => {
    const idStr = String(e.id || '');
    const catStr = String(e.category || '');
    const vehStr = String(e.vehicle || '');
    const searchStr = String(searchTerm || '').toLowerCase();
    
    return idStr.toLowerCase().includes(searchStr) || 
           catStr.toLowerCase().includes(searchStr) ||
           vehStr.toLowerCase().includes(searchStr);
  });

  return (
    <div className="vehicles-container">
      <div className="page-header">
        <div className="header-text">
          <h2>Expenses Management</h2>
          <p>Track all trip, vehicle, and office expenses</p>
        </div>
        <button className="primary-btn" onClick={() => navigate('/expenses/create')}>
          <MdAdd size={20} />
          Record Expense
        </button>
      </div>

      <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
        <div className="panel" style={{ flex: 1, padding: '24px', borderLeft: '4px solid #e74c3c' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: 'var(--text-secondary)' }}>Total Expenses (This Month)</h3>
          <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
            ₹{allExpenses.reduce((sum, e) => sum + (parseFloat(e.rawAmount) || 0), 0).toLocaleString()}
          </p>
        </div>
        <div className="panel" style={{ flex: 1, padding: '24px', borderLeft: '4px solid #ff4757' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: 'var(--text-secondary)' }}>⚠️ Red Flagged Anomalies</h3>
          <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#ff4757' }}>
            {allExpenses.filter(e => e.isFlagged).length}
          </p>
        </div>
        <div className="panel" style={{ flex: 1, padding: '24px', borderLeft: '4px solid #fbc531' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: 'var(--text-secondary)' }}>Pending Approvals</h3>
          <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>0</p>
        </div>
      </div>

      <div className="filter-section panel">
        <div className="search-box" style={{ flex: 1, maxWidth: '400px' }}>
          <input 
            type="text" 
            placeholder="Search by Vehicle, Category..." 
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
              <th>EXPENSE ID</th>
              <th>DATE</th>
              <th>CATEGORY / VEHICLE</th>
              <th style={{ textAlign: 'right' }}>AMOUNT</th>
              <th>PAID BY</th>
              <th>STATUS</th>
              <th style={{ textAlign: 'center' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredExpenses.length === 0 ? (
              <tr>
                <td colSpan="7" style={{textAlign: 'center', padding: '20px'}}>No expenses found.</td>
              </tr>
            ) : (
              filteredExpenses.map((exp) => (
              <tr key={exp.id} style={exp.isFlagged ? { backgroundColor: 'rgba(255, 71, 87, 0.05)' } : {}}>
                <td>
                  <span className="vehicle-num">{exp.id}</span>
                </td>
                <td>{exp.date}</td>
                <td>
                  <div className="vehicle-info">
                    <span className="category-badge">{exp.category}</span>
                    <span className="vehicle-name link-text" style={{marginTop: '4px'}}>{exp.vehicle}</span>
                  </div>
                </td>
                <td style={{ textAlign: 'right', fontWeight: 'bold', color: exp.isFlagged ? '#ff4757' : 'inherit' }}>
                  {exp.isFlagged && (
                    <span 
                      title={exp.flagReason || 'Unusual expense spike detected!'} 
                      style={{ cursor: 'help', marginRight: '6px', fontSize: '14px', backgroundColor: 'rgba(255, 71, 87, 0.2)', padding: '2px 6px', borderRadius: '4px' }}
                    >
                      🚨 RED FLAG
                    </span>
                  )}
                  {exp.amount}
                </td>
                <td>{exp.paidBy}</td>
                <td>
                  <span className={`status-badge ${(exp.status || 'Approved').toLowerCase()}`}>
                    {exp.status}
                  </span>
                  {exp.isFlagged && (
                    <div style={{ fontSize: '11px', color: '#ff4757', marginTop: '4px', fontWeight: 600 }}>
                      ⚠️ Review Required
                    </div>
                  )}
                </td>
                <td>
                  <div className="action-buttons" style={{ justifyContent: 'center' }}>
                    <button className="action-icon view" title="View" onClick={() => navigate(`/expenses/${exp.id}`)}><MdVisibility /></button>
                    <button className="action-icon edit" title="Edit" onClick={() => navigate('/expenses/create')}><MdEdit /></button>
                    <button className="action-icon delete" title="Delete" onClick={() => handleDelete(exp.id, exp.isReal, exp.dbId)}><MdDelete /></button>
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

export default Expenses;


