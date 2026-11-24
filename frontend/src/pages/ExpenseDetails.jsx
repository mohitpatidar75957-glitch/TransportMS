import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MdArrowBack, MdEdit, MdDelete, MdWarning, MdCheckCircle } from 'react-icons/md';
import './VehicleDetails.css'; 
import { useModal } from '../context/ModalContext';

const ExpenseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showAlert, showConfirm } = useModal();
  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(true);

  const dbId = id && id.startsWith('EXP-DB-') ? id.replace('EXP-DB-', '') : id;

  useEffect(() => {
    fetch('/api/v1/finance/expenses')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const found = data.find(e => String(e.id) === String(dbId));
          if (found) {
            setExpense({
              id: found.id,
              expenseId: `EXP-DB-${found.id}`,
              date: found.date || 'Unknown',
              title: found.title || `${found.category} Expense`,
              category: found.category || 'General',
              vehicleId: found.vehicle ? found.vehicle.registrationNumber : 'None',
              tripId: found.trip ? (found.trip.tripNumber || `TRP-${found.trip.id}`) : 'None',
              amount: found.amount || 0,
              paidBy: 'Company Account',
              status: 'Approved',
              notes: found.title || 'Recorded in TMS Expense ledger',
              isFlagged: found.isFlagged,
              flagReason: found.flagReason,
              createdBy: 'Accounts Manager'
            });
          }
        }
      })
      .catch(err => console.error('Failed to load expense details', err))
      .finally(() => setLoading(false));
  }, [id, dbId]);

  const handleDelete = async () => {
    if (await showConfirm('Are you sure you want to delete this expense record?')) {
      try {
        const res = await fetch(`/api/v1/finance/expenses/${dbId}`, { method: 'DELETE' });
        if (res.ok) {
          showAlert('Expense deleted successfully.');
          navigate('/expenses');
        } else {
          showAlert('Failed to delete expense.');
        }
      } catch (err) {
        console.error(err);
        showAlert('Error deleting expense.');
      }
    }
  };

  const curExpense = expense || {
    id: dbId,
    expenseId: id || 'EXP-101',
    date: '02 Sep 2026',
    title: 'Fuel at CHINTPURNI FILLING STATION',
    category: 'Fuel',
    vehicleId: 'UP-16-BD-9012',
    tripId: 'TRP-1062',
    amount: 13000,
    paidBy: 'Driver Advance',
    status: 'Approved',
    notes: 'Filled diesel on the way to Mumbai.',
    isFlagged: false,
    flagReason: null,
    createdBy: 'Super Admin'
  };

  return (
    <div className="vehicle-details-container">
      <div className="details-header" style={{ marginBottom: '16px' }}>
        <div className="header-titles" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button className="action-icon" onClick={() => navigate('/expenses')} style={{ padding: '8px', border: 'none', background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer' }}>
            <MdArrowBack size={24} />
          </button>
          <div>
            <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              {curExpense.title}
              {curExpense.isFlagged && (
                <span style={{ fontSize: '13px', backgroundColor: '#ff4757', color: '#fff', padding: '3px 10px', borderRadius: '12px', fontWeight: 'bold' }}>
                  🚨 RED FLAG ANOMALY
                </span>
              )}
            </h2>
            <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>Recorded on {curExpense.date}</div>
          </div>
        </div>
        <div className="header-actions">
          <button className="primary-btn" style={{ backgroundColor: '#fbc531', color: '#333' }} onClick={() => navigate(`/expenses/create`)}>
            <MdEdit size={18} /> New Expense
          </button>
          <button className="primary-btn" style={{ backgroundColor: '#e74c3c' }} onClick={handleDelete}>
            <MdDelete size={18} /> Delete
          </button>
        </div>
      </div>

      {/* Red Flag Warning Box */}
      {curExpense.isFlagged && (
        <div style={{
          backgroundColor: 'rgba(255, 71, 87, 0.12)',
          border: '1.5px solid #ff4757',
          borderRadius: '10px',
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '14px'
        }}>
          <div style={{
            backgroundColor: '#ff4757',
            color: '#fff',
            padding: '8px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <MdWarning size={22} />
          </div>
          <div>
            <div style={{ color: '#ff4757', fontWeight: 'bold', fontSize: '16px' }}>
              Audit Warning: Red Flag Anomaly Detected
            </div>
            <div style={{ color: '#f1f2f6', fontSize: '14px', marginTop: '4px', lineHeight: 1.5 }}>
              {curExpense.flagReason || 'This voucher contains an unusually high amount compared to average thresholds.'}
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '24px' }}>
        
        <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="info-card">
            <h3 className="card-title">General Information</h3>
            <div className="info-grid" style={{ gridTemplateColumns: '1fr' }}>
              <div className="info-item">
                <span className="info-label">Amount</span>
                <span className="info-value" style={{ color: curExpense.isFlagged ? '#ff4757' : '#3498db', fontSize: '24px', fontWeight: 'bold' }}>
                  ₹{Number(curExpense.amount).toLocaleString()}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Category</span>
                <span className="info-value"><span className="category-badge" style={{ display: 'inline-block' }}>{curExpense.category}</span></span>
              </div>
              <div className="info-item">
                <span className="info-label">Paid By</span>
                <span className="info-value">{curExpense.paidBy}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Reference</span>
                <span className="info-value">{curExpense.expenseId}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Audit / Anomaly Status</span>
                <span className="info-value" style={{ color: curExpense.isFlagged ? '#ff4757' : '#2ed573', fontWeight: 600 }}>
                  {curExpense.isFlagged ? '⚠️ Flagged for Audit' : '✅ Normal Verification Passed'}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Notes</span>
                <span className="info-value">{curExpense.notes}</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="info-card">
            <h3 className="card-title">Linked Records</h3>
            <div className="info-grid" style={{ gridTemplateColumns: '1fr' }}>
              <div className="info-item">
                <span className="info-label">Vehicle</span>
                <span className="info-value link-text" onClick={() => navigate('/vehicles')}>{curExpense.vehicleId}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Trip</span>
                <span className="info-value link-text" onClick={() => navigate('/trips')}>{curExpense.tripId}</span>
              </div>
            </div>
          </div>

          <div className="info-card">
            <h3 className="card-title">Audit Log</h3>
            <div className="info-grid" style={{ gridTemplateColumns: '1fr' }}>
              <div className="info-item">
                <span className="info-label">Created By</span>
                <span className="info-value">{curExpense.createdBy}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseDetails;
