import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdAccountBalanceWallet, MdWarning, MdCheckCircle } from 'react-icons/md';
import './AddVehicle.css'; 
import { useModal } from '../context/ModalContext';

const ExpenseForm = () => {
  const { showAlert, showConfirm } = useModal();
  const navigate = useNavigate();
  
  const [vehicles, setVehicles] = useState([]);
  const [trips, setTrips] = useState([]);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    category: 'Fuel',
    vehicleId: '',
    tripId: '',
    amount: '',
    paidBy: 'Company Account',
    status: 'Approved',
    description: ''
  });

  const [anomalyWarning, setAnomalyWarning] = useState(null);
  const [checkingAnomaly, setCheckingAnomaly] = useState(false);

  useEffect(() => {
    // Fetch live vehicles
    fetch('/api/v1/fleet/vehicles')
      .then(res => res.json())
      .then(data => setVehicles(Array.isArray(data) ? data : []))
      .catch(err => console.error('Failed to fetch vehicles', err));

    // Fetch live trips
    fetch('/api/v1/fleet/trips')
      .then(res => res.json())
      .then(data => setTrips(Array.isArray(data) ? data : []))
      .catch(err => console.error('Failed to fetch trips', err));
  }, []);

  // Live anomaly check whenever category, amount, or vehicleId changes
  useEffect(() => {
    const amountVal = parseFloat(formData.amount);
    if (!amountVal || amountVal <= 0) {
      setAnomalyWarning(null);
      return;
    }

    const timer = setTimeout(() => {
      setCheckingAnomaly(true);
      const vehParam = formData.vehicleId ? `&vehicleId=${formData.vehicleId}` : '';
      const tripParam = formData.tripId ? `&tripId=${formData.tripId}` : '';
      fetch(`/api/v1/finance/expenses/check-anomaly?category=${encodeURIComponent(formData.category)}&amount=${amountVal}${vehParam}${tripParam}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.isFlagged) {
            setAnomalyWarning(data);
          } else {
            setAnomalyWarning(null);
          }
        })
        .catch(err => {
          console.error('Anomaly check error:', err);
          setAnomalyWarning(null);
        })
        .finally(() => setCheckingAnomaly(false));
    }, 400);

    return () => clearTimeout(timer);
  }, [formData.category, formData.amount, formData.vehicleId, formData.tripId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // If an anomaly was detected, prompt for confirmation so user is fully aware
    if (anomalyWarning && anomalyWarning.isFlagged) {
      const confirmed = await showConfirm(
        `🚨 UNUSUAL EXPENSE RED FLAG DETECTED!\n\n${anomalyWarning.reason}\n\nDo you still want to proceed and log this flagged expense? A notification will be alerted to the management.`
      );
      if (!confirmed) {
        return;
      }
    }
    
    const payload = {
      date: formData.date,
      title: formData.description || `${formData.category} Expense`,
      category: formData.category,
      amount: parseFloat(formData.amount) || 0
    };

    if (formData.vehicleId) {
      payload.vehicle = { id: parseInt(formData.vehicleId) };
    }
    if (formData.tripId) {
      payload.trip = { id: parseInt(formData.tripId) };
    }

    try {
      const response = await fetch('/api/v1/finance/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const saved = await response.json();
        if (saved.isFlagged) {
          showAlert(`⚠️ Expense saved and RED-FLAGGED for review.\nReason: ${saved.flagReason}`);
        } else {
          showAlert('Expense saved successfully!');
        }
        navigate('/expenses');
      } else {
        console.error('Failed to save expense');
        showAlert('Failed to save expense to database.');
      }
    } catch (error) {
      console.error('Error saving expense:', error);
      showAlert('Error connecting to backend database.');
    }
  };

  return (
    <div className="add-vehicle-container">
      <div className="form-panel" style={{ maxWidth: '850px', margin: '0 auto' }}>
        <div className="form-header" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <MdAccountBalanceWallet size={26} className="form-icon" style={{ color: '#38bdf8' }} />
          <div>
            <h3 style={{ margin: 0 }}>Record New Expense</h3>
            <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
              Automated anomaly & red-flag detection enabled
            </p>
          </div>
        </div>

        {/* Live Anomaly Warning Banner */}
        {anomalyWarning && anomalyWarning.isFlagged && (
          <div style={{
            backgroundColor: 'rgba(255, 71, 87, 0.12)',
            border: '1.5px solid #ff4757',
            borderRadius: '10px',
            padding: '16px 20px',
            margin: '20px 0',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '14px',
            boxShadow: '0 4px 15px rgba(255, 71, 87, 0.15)'
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
              <div style={{ color: '#ff4757', fontWeight: 'bold', fontSize: '15px' }}>
                🚨 Warning: Unusual High Expense (Red Flag Triggered)
              </div>
              <div style={{ color: '#f1f2f6', fontSize: '13px', marginTop: '4px', lineHeight: 1.5 }}>
                {anomalyWarning.reason}
              </div>
              <div style={{ color: '#ffa502', fontSize: '12px', marginTop: '6px', fontWeight: 500 }}>
                ℹ️ Saving this will flag the voucher as 'RED FLAG' and dispatch an alert to management.
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="vehicle-form" style={{ marginTop: '20px' }}>
          <div className="form-grid-3">
            <div className="form-group">
              <label>Date <span className="required">*</span></label>
              <input type="date" name="date" value={formData.date} onChange={handleChange} required />
            </div>
            
            <div className="form-group">
              <label>Expense Category <span className="required">*</span></label>
              <select name="category" value={formData.category} onChange={handleChange} required>
                <option value="Fuel">Fuel / Diesel</option>
                <option value="Toll">Toll Tax / FASTag</option>
                <option value="Maintenance">Maintenance & Repair</option>
                <option value="RTO">RTO & Challan</option>
                <option value="Driver Allowance">Driver Allowance (Bhatta)</option>
                <option value="Office">Office Expense</option>
              </select>
            </div>

            <div className="form-group">
              <label>
                Amount (₹) <span className="required">*</span>
                {checkingAnomaly && (
                  <span style={{ fontSize: '11px', color: '#38bdf8', marginLeft: '6px' }}>Checking...</span>
                )}
              </label>
              <input 
                type="number" 
                name="amount" 
                value={formData.amount} 
                onChange={handleChange} 
                placeholder="e.g. 5000"
                style={anomalyWarning?.isFlagged ? { border: '2px solid #ff4757', backgroundColor: 'rgba(255, 71, 87, 0.05)' } : {}}
                required 
              />
            </div>
          </div>
          
          <div className="section-divider" style={{ marginTop: '24px' }}>
            <h4>Linking to Fleet & Operations</h4>
          </div>

          <div className="form-grid-2-mixed">
             <div className="form-group">
              <label>Link to Vehicle</label>
              <select name="vehicleId" value={formData.vehicleId} onChange={handleChange}>
                <option value="">None / Office Expense</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.registrationNumber} ({v.model || v.vehicleType || 'Truck'})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Link to Trip</label>
              <select name="tripId" value={formData.tripId} onChange={handleChange}>
                <option value="">None</option>
                {trips.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.tripNumber || `TRP-${t.id}`} {t.route ? `(${t.route})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="section-divider" style={{ marginTop: '24px' }}>
            <h4>Payment Details</h4>
          </div>

          <div className="form-grid-2-mixed">
            <div className="form-group">
              <label>Paid By <span className="required">*</span></label>
              <select name="paidBy" value={formData.paidBy} onChange={handleChange} required>
                <option value="Company Account">Company Account (Bank/Cash)</option>
                <option value="Driver Advance">Driver Advance</option>
                <option value="FASTag">FASTag Wallet</option>
                <option value="Credit Card">Credit Card</option>
              </select>
            </div>
            <div className="form-group">
              <label>Status</label>
              <select name="status" value={formData.status} onChange={handleChange}>
                <option value="Approved">Approved</option>
                <option value="Pending">Pending Approval</option>
              </select>
            </div>
          </div>

          <div className="form-group full-width" style={{marginTop: '20px'}}>
            <label>Description / Notes</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows="3" placeholder="Enter reason, bill number, or specific notes..."></textarea>
          </div>

          <div className="form-actions" style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button type="button" className="cancel-btn" onClick={() => navigate('/expenses')}>Cancel</button>
            <button 
              type="submit" 
              className="save-btn"
              style={anomalyWarning?.isFlagged ? { backgroundColor: '#e84118' } : {}}
            >
              {anomalyWarning?.isFlagged ? '⚠️ Submit with Red Flag' : 'Save Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseForm;
