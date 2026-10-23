import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdAccountBalance, MdInfoOutline } from 'react-icons/md';
import './AddVehicle.css'; 
import { useModal } from '../context/ModalContext';


const LoanForm = () => {
  const { showAlert, showConfirm } = useModal();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    vehicleId: '',
    bankName: '',
    accountNumber: '',
    loanAmount: '0.00',
    downPayment: '0',
    interestRate: '0',
    interestType: 'Reducing Balance',
    installments: '12',
    emiAmount: '0',
    loanStartDate: '2026-09-02',
    loanEndDate: '',
    emiDeductionDay: '5',
    loanStatus: 'Active'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const payload = {
      bankName: formData.bankName,
      amount: parseFloat(formData.loanAmount) || 0,
      emiAmount: parseFloat(formData.emiAmount) || 0,
      startDate: formData.loanStartDate || null,
      endDate: formData.loanEndDate || null,
      status: formData.loanStatus
    };

    try {
      const response = await fetch('/api/v1/finance/loans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        console.log('Loan saved to database successfully');
        navigate('/loans');
      } else {
        console.error('Failed to save loan');
        showAlert('Failed to save loan to database.');
      }
    } catch (error) {
      console.error('Error saving loan:', error);
      showAlert('Error connecting to backend database.');
    }
  };

  return (
    <div className="add-vehicle-container">
      <div className="form-panel">
        <div className="form-header">
          <MdAccountBalance size={24} className="form-icon" style={{color: '#3498db'}} />
          <h3 style={{color: '#3498db'}}>Register New Vehicle Loan</h3>
        </div>

        <form onSubmit={handleSubmit} className="vehicle-form">
          <div className="form-grid-2-mixed">
             <div className="form-group">
              <label>Vehicle <span className="required">*</span></label>
              <select name="vehicleId" value={formData.vehicleId} onChange={handleChange} required>
                <option value="">-- Select Vehicle --</option>
                <option value="UP-16-BD-9012">UP-16-BD-9012</option>
                <option value="GJ-05-MM-1111">GJ-05-MM-1111</option>
              </select>
            </div>
            <div className="form-group">
              <label>Bank Name <span className="required">*</span></label>
              <input type="text" name="bankName" value={formData.bankName} onChange={handleChange} placeholder="e.g. HDFC Bank" required />
            </div>
          </div>

          <div className="form-grid-3">
            <div className="form-group">
              <label>Account / Loan Number</label>
              <input type="text" name="accountNumber" value={formData.accountNumber} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Loan Amount (₹) <span className="required">*</span></label>
              <input type="number" name="loanAmount" value={formData.loanAmount} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Down Payment (₹) <span className="required">*</span></label>
              <input type="number" name="downPayment" value={formData.downPayment} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-grid-4">
            <div className="form-group">
              <label>Interest Rate (%)</label>
              <input type="number" name="interestRate" value={formData.interestRate} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Interest Type <span className="required">*</span></label>
              <select name="interestType" value={formData.interestType} onChange={handleChange} required>
                <option value="Reducing Balance">Reducing Balance</option>
                <option value="Flat Rate">Flat Rate</option>
              </select>
            </div>
            <div className="form-group">
              <label>Installments (Months) <span className="required">*</span></label>
              <input type="number" name="installments" value={formData.installments} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>EMI Amount (₹) <span className="required">*</span></label>
              <input type="number" name="emiAmount" value={formData.emiAmount} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-grid-2-mixed">
            <div className="form-group">
              <label>Loan Start Date</label>
              <input type="date" name="loanStartDate" value={formData.loanStartDate} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Loan End Date</label>
              <input type="date" name="loanEndDate" value={formData.loanEndDate} onChange={handleChange} />
            </div>
          </div>

          <div className="form-grid-2-mixed">
            <div className="form-group">
              <label>EMI Deduction Day <span className="required">*</span></label>
              <input type="number" name="emiDeductionDay" value={formData.emiDeductionDay} onChange={handleChange} required min="1" max="31" />
            </div>
            <div className="form-group">
              <label>Loan Status <span className="required">*</span></label>
              <select name="loanStatus" value={formData.loanStatus} onChange={handleChange} required>
                <option value="Active">Active</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>

          <div style={{ backgroundColor: '#e1f5fe', color: '#0277bd', padding: '12px 16px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px', fontSize: '13px' }}>
            <MdInfoOutline size={18} />
            <span>EMI payments will be automatically generated based on the total installments.</span>
          </div>

          <div style={{ backgroundColor: '#f9f9f9', border: '1px solid #ddd', borderRadius: '8px', padding: '24px', marginTop: '24px' }}>
            <h4 style={{ margin: '0 0 16px 0', color: '#333' }}>Loan Summary</h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', textAlign: 'center' }}>
              <div style={{ flex: 1, borderRight: '1px solid #ddd' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '8px' }}>Principal Amount</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#3498db' }}>₹ 0</div>
              </div>
              <div style={{ flex: 1, borderRight: '1px solid #ddd' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '8px' }}>Total Interest</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#e74c3c' }}>₹ 0</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '8px' }}>Total Payable</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#2ecc71' }}>₹ 0</div>
              </div>
            </div>
          </div>

          <div className="form-actions" style={{ marginTop: '32px' }}>
            <button type="submit" className="save-btn" style={{ backgroundColor: '#c0392b' }}>Register Loan</button>
            <button type="button" className="cancel-btn" onClick={() => navigate('/loans')}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoanForm;
