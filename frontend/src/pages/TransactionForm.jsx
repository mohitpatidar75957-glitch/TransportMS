import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdAdd } from 'react-icons/md';
import './AddVehicle.css'; 
import { useModal } from '../context/ModalContext';


const TransactionForm = () => {
  const { showAlert, showConfirm } = useModal();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '0.00',
    account: 'Cash',
    transactionType: 'Income',
    referenceNumber: '',
    description: ''
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
    
    // Type needs to map to Credit / Debit, but frontend has Income / Expense / Transfer
    let finalType = formData.transactionType === 'Income' ? 'Credit' : 'Debit';
    let desc = formData.description;
    if (formData.account) desc = `[${formData.account}] ${desc}`;
    if (formData.referenceNumber) desc = `${desc} (Ref: ${formData.referenceNumber})`;

    const payload = {
      date: formData.date || null,
      type: finalType,
      amount: parseFloat(formData.amount) || 0,
      description: desc
    };

    try {
      const response = await fetch('/api/v1/finance/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        console.log('Transaction saved to database successfully');
        navigate('/cash-bank');
      } else {
        console.error('Failed to save transaction');
        showAlert('Failed to save transaction to database.');
      }
    } catch (error) {
      console.error('Error saving transaction:', error);
      showAlert('Error connecting to backend database.');
    }
  };

  return (
    <div className="add-vehicle-container">
      <div className="form-panel" style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
        <div className="form-header" style={{ borderBottom: '1px solid #ddd', paddingBottom: '8px', marginBottom: '16px' }}>
          <h3 style={{ color: '#3498db', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <MdAdd size={24} /> Record New Transaction
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="vehicle-form">
          <div className="form-grid-2-mixed">
            <div className="form-group">
              <label>Date <span className="required">*</span></label>
              <input type="date" name="date" value={formData.date} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Amount (₹) <span className="required">*</span></label>
              <input type="number" name="amount" value={formData.amount} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-grid-2-mixed">
            <div className="form-group">
              <label>Account <span className="required">*</span></label>
              <select name="account" value={formData.account} onChange={handleChange} required>
                <option value="Cash">Cash</option>
                <option value="HDFC Bank">HDFC Bank</option>
                <option value="SBI Bank">SBI Bank</option>
              </select>
            </div>
            <div className="form-group">
              <label>Transaction Type <span className="required">*</span></label>
              <select name="transactionType" value={formData.transactionType} onChange={handleChange} required>
                <option value="Income">Income</option>
                <option value="Expense">Expense</option>
                <option value="Transfer">Transfer</option>
              </select>
            </div>
          </div>

          <div className="form-group full-width">
            <label>Reference Number</label>
            <input type="text" name="referenceNumber" value={formData.referenceNumber} onChange={handleChange} placeholder="e.g. Cheque No, UPI Ref..." />
          </div>

          <div className="form-group full-width" style={{ marginTop: '12px' }}>
            <label>Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows="2" placeholder="Brief details about this transaction..."></textarea>
          </div>

          <div className="form-actions" style={{ marginTop: '16px' }}>
            <button type="submit" className="save-btn" style={{ backgroundColor: '#c0392b' }}>Save Transaction</button>
            <button type="button" className="cancel-btn" onClick={() => navigate('/cash-bank')}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;
